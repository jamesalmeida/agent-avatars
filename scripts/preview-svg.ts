// Builds assets/preview.svg, the animated row of avatars at the top of the README.
// GitHub strips JavaScript from READMEs but plays CSS animation inside SVG images,
// so this redraws the component's shapes as SVG from the package's own presets.
// Run: npm run preview:svg (CI fails if the committed file is out of date).

import { writeFileSync, mkdirSync } from "node:fs";
import { COLORS, EYES, EYE_COLORS, SHAPES, STAGE, type AvatarConfig, type AvatarMood } from "../src/config.ts";

type Tile = AvatarConfig & { mood: AvatarMood };

const TILES: Tile[] = [
  { shape: "squircle", color: "slate", fill: "gradient", eyes: "tall", eyeColor: "white", mood: "idle" },
  { shape: "blob", color: "clay", fill: "gradient", eyes: "curious", eyeColor: "white", mood: "idle" },
  { shape: "circle", color: "ocean", fill: "gradient", eyes: "round", eyeColor: "white", mood: "writing" },
  { shape: "drop", color: "plum", fill: "gradient", eyes: "tall", eyeColor: "cream", mood: "listening" },
  { shape: "pill", color: "teal", fill: "gradient", eyes: "calm", eyeColor: "mint", mood: "idle" },
  { shape: "hexagon", color: "moss", fill: "gradient", eyes: "round", eyeColor: "white", mood: "happy" },
  { shape: "squircle", color: "black", fill: "gradient", eyes: "round", eyeColor: "white", mood: "thinking" },
];

const TILE = 120;
const GAP = 12;
const SCALE = 0.55;
const n = (value: number) => Number(value.toFixed(2));

// "58% 42% 55% 45% / 50% 58% 42% 50%" → per-corner radii (TL, TR, BR, BL), clamped like CSS does.
function cornerRadii(radius: string, w: number, h: number) {
  const [horizontal, vertical = horizontal] = radius.split("/").map((part) => part.trim().split(/\s+/));
  const expand = (values: string[]) => {
    const [a, b = a, c = a, d = b] = values;
    return [a, b, c, d];
  };
  const toPx = (value: string, size: number) => (value.endsWith("%") ? (parseFloat(value) / 100) * size : parseFloat(value));
  const rx = expand(horizontal).map((value) => toPx(value, w));
  const ry = expand(vertical).map((value) => toPx(value, h));
  const f = Math.min(1, w / (rx[0] + rx[1]), w / (rx[3] + rx[2]), h / (ry[0] + ry[3]), h / (ry[1] + ry[2]));
  return { rx: rx.map((r) => r * f), ry: ry.map((r) => r * f) };
}

function roundedRectPath(w: number, h: number, radius: string) {
  const x = (STAGE - w) / 2;
  const y = (STAGE - h) / 2;
  const { rx, ry } = cornerRadii(radius, w, h);
  return [
    `M${n(x + rx[0])} ${n(y)}`,
    `H${n(x + w - rx[1])}`,
    `A${n(rx[1])} ${n(ry[1])} 0 0 1 ${n(x + w)} ${n(y + ry[1])}`,
    `V${n(y + h - ry[2])}`,
    `A${n(rx[2])} ${n(ry[2])} 0 0 1 ${n(x + w - rx[2])} ${n(y + h)}`,
    `H${n(x + rx[3])}`,
    `A${n(rx[3])} ${n(ry[3])} 0 0 1 ${n(x)} ${n(y + h - ry[3])}`,
    `V${n(y + ry[0])}`,
    `A${n(rx[0])} ${n(ry[0])} 0 0 1 ${n(x + rx[0])} ${n(y)}`,
    "Z",
  ].join(" ");
}

function polygonPath(w: number, h: number, clip: string) {
  const x = (STAGE - w) / 2;
  const y = (STAGE - h) / 2;
  const points = clip
    .replace(/^polygon\(|\)$/g, "")
    .split(",")
    .map((point) => point.trim().split(/\s+/).map((v) => parseFloat(v) / 100));
  return `M${points.map(([px, py]) => `${n(x + px * w)} ${n(y + py * h)}`).join(" L")} Z`;
}

function bodyPath(shape: (typeof SHAPES)[keyof typeof SHAPES]) {
  const isFullClip = shape.clip.startsWith("polygon(0% 0%, 100% 0%");
  return isFullClip ? roundedRectPath(shape.w, shape.h, shape.radius) : polygonPath(shape.w, shape.h, shape.clip);
}

function colour(table: Record<string, { value: string }>, key: string) {
  return table[key]?.value ?? key;
}

function avatar(tile: Tile, index: number) {
  const shape = SHAPES[tile.shape];
  const eyes = EYES[tile.eyes];
  const eyeColor = colour(EYE_COLORS, tile.eyeColor);
  const path = bodyPath(shape);
  const rotate = shape.rotate === "none" ? "" : ` transform="rotate(${parseFloat(shape.rotate.replace(/[^\d.-]/g, ""))} 100 100)"`;
  const delay = `animation-delay:${n(-index * 1.3)}s`;
  const total = eyes.left.w + eyes.gap + eyes.right.w;
  const cy = STAGE / 2 + shape.eyeY;
  const left = STAGE / 2 - total / 2;
  const right = left + eyes.left.w + eyes.gap;
  const eyeRect = (x: number, dot: { w: number; h: number; r: string }) => {
    const r = dot.r.endsWith("%") ? Math.min(dot.w, dot.h) / 2 : parseFloat(dot.r);
    return `<rect class="eye" style="${delay}" x="${n(x)}" y="${n(cy - dot.h / 2)}" width="${dot.w}" height="${dot.h}" rx="${n(r)}" fill="${eyeColor}"/>`;
  };
  const arc = (x: number) =>
    `<path d="M${n(x + 3.5)} ${n(cy + 5)} A12.5 12.5 0 0 1 ${n(x + 28.5)} ${n(cy + 5)}" fill="none" stroke="${eyeColor}" stroke-width="7"/>`;
  const face =
    tile.mood === "happy"
      ? `${arc(STAGE / 2 - 13 - 32)}${arc(STAGE / 2 + 13)}`
      : `${eyeRect(left, eyes.left)}${eyeRect(right, eyes.right)}`;
  const shine = tile.fill === "gradient" ? `<path d="${path}" fill="url(#shine)"/>` : "";
  const x = index * (TILE + GAP);

  return `<g transform="translate(${x} 0)">
    <rect width="${TILE}" height="${TILE}" rx="28" fill="#8882" />
    <g transform="translate(${n((TILE - STAGE * SCALE) / 2)} ${n((TILE - STAGE * SCALE) / 2)}) scale(${SCALE})">
      <g class="frame ${tile.mood}" style="${delay}">
        <g${rotate}><path d="${path}" fill="${colour(COLORS, tile.color)}"/>${shine}</g>
        <g class="look ${tile.mood}">${face}</g>
      </g>
    </g>
  </g>`;
}

const width = TILES.length * TILE + (TILES.length - 1) * GAP;
const css = `
.frame,.look,.eye{transform-box:fill-box}
.frame{transform-origin:50% 90%}
.eye{transform-origin:50% 50%;animation:blink 4.6s ease-in-out infinite}
.frame.idle,.frame.listening{animation:squish 4.6s ease-in-out infinite}
.look.idle{animation:glance 9s ease-in-out infinite}
.look.listening{transform:translate(-3px,10px);animation:listen 2.4s ease-in-out infinite}
.frame.thinking{animation:tilt 3.6s ease-in-out infinite}
.look.thinking{transform:translate(8px,-11px);animation:ponder 3.6s ease-in-out infinite}
.frame.writing{animation:bob 1.4s ease-in-out infinite}
.look.writing{transform:translate(-10px,6px);animation:write 1.8s ease-in-out infinite}
.frame.happy{animation:hop 2.8s ease-out infinite}
@media (prefers-reduced-motion:reduce){*{animation:none!important}}
@keyframes blink{0%,90%,96%,100%{transform:scaleY(1)}93%{transform:scaleY(.1)}}
@keyframes squish{0%,89%,100%{transform:scale(1,1)}92%{transform:scale(1.05,.94)}95%{transform:scale(.98,1.03)}}
@keyframes glance{0%,28%,78%,100%{transform:translate(0,0)}34%,50%{transform:translate(-8px,1px)}56%,72%{transform:translate(7px,-3px)}}
@keyframes listen{0%,100%{transform:translate(-3px,10px)}50%{transform:translate(-1px,12px)}}
@keyframes ponder{0%,36%,100%{transform:translate(8px,-11px)}50%,86%{transform:translate(-8px,-11px)}}
@keyframes tilt{0%,36%,100%{transform:rotate(4deg) scale(1)}18%{transform:rotate(4deg) scale(1.03)}50%,86%{transform:rotate(-4deg) scale(1)}68%{transform:rotate(-4deg) scale(1.03)}}
@keyframes write{0%{transform:translate(-10px,6px)}78%{transform:translate(10px,6px)}100%{transform:translate(-10px,6px)}}
@keyframes bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-3px)}}
@keyframes hop{0%,30%,100%{transform:translateY(0) scale(1,1)}5%{transform:translateY(2px) scale(1.08,.9)}12%{transform:translateY(-12px) scale(.95,1.06)}20%{transform:translateY(0) scale(1.04,.96)}}
`;

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${TILE}" viewBox="0 0 ${width} ${TILE}" role="img" aria-label="Seven animated agent avatars in different shapes, colours and moods">
  <defs>
    <radialGradient id="shine" cx=".28" cy=".22" r="1.2" gradientUnits="objectBoundingBox">
      <stop offset="0" stop-color="#fff" stop-opacity=".3"/>
      <stop offset=".5" stop-color="#fff" stop-opacity="0"/>
      <stop offset="1" stop-color="#000" stop-opacity=".34"/>
    </radialGradient>
    <style>${css}</style>
  </defs>
  ${TILES.map(avatar).join("\n  ")}
</svg>
`;

mkdirSync(new URL("../assets/", import.meta.url), { recursive: true });
writeFileSync(new URL("../assets/preview.svg", import.meta.url), svg);
console.log(`Wrote assets/preview.svg (${TILES.length} avatars, ${svg.length} bytes)`);
