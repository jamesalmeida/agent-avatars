// Animations and transitions. Layout is inline on the elements, so the avatar
// renders correctly (just still) before this stylesheet is injected, e.g. in SSR.

export const STYLE_ELEMENT_ID = "agent-avatars-styles";

// Looping animations start this far in (a per-avatar negative delay), so avatars
// on the same page don't blink and glance in unison.
const D = "var(--aa-delay, 0s)";

// Gestures: [gesture, element, timing, keyframes]. Each gets two identical copies
// (phase 0 and 1); a repeat switches phase, which restarts the animation.
const GESTURE_FRAMES: [string, string, string, string][] = [
  ["nod", ".aa-act", "ease-in-out", "0%, 100% { transform: translateY(0) scale(1, 1); } 22%, 62% { transform: translateY(5px) scale(1.03, .95); } 42%, 82% { transform: translateY(-2px) scale(.99, 1.02); }"],
  ["nod", ".aa-spin", "ease-in-out", "0%, 100% { transform: translateY(0); } 22%, 62% { transform: translateY(13px); } 42%, 82% { transform: translateY(-3px); }"],
  ["shake", ".aa-act", "ease-in-out", "0%, 100% { transform: rotate(0); } 15% { transform: rotate(-7deg); } 35% { transform: rotate(7deg); } 55% { transform: rotate(-5deg); } 75% { transform: rotate(3deg); }"],
  ["shake", ".aa-spin", "ease-in-out", "0%, 100% { transform: translateX(0); } 15% { transform: translateX(-14px); } 35% { transform: translateX(14px); } 55% { transform: translateX(-10px); } 75% { transform: translateX(6px); }"],
  ["wink", ".aa-act", "ease-in-out", "0%, 100% { transform: rotate(0) translateY(0); } 25%, 70% { transform: rotate(-6deg) translateY(-2px); }"],
  ["wink", ".aa-eye:last-child", "ease-in-out", "0%, 100% { transform: scaleY(1); } 20%, 70% { transform: scaleY(.12); }"],
  ["jump", ".aa-act", "ease-in-out", "0%, 100% { transform: translateY(0) scale(1, 1); } 15% { transform: translateY(3px) scale(1.12, .85); } 40% { transform: translateY(-30px) scale(.92, 1.1); } 62% { transform: translateY(0) scale(1.1, .88); } 80% { transform: translateY(-4px) scale(.98, 1.03); }"],
  ["jump", ".aa-spin", "ease-in-out", "0%, 100% { transform: translateY(0); } 15% { transform: translateY(4px); } 40% { transform: translateY(-6px); } 62% { transform: translateY(5px); }"],
  ["wiggle", ".aa-act", "ease-in-out", "0%, 100% { transform: rotate(0) scale(1); } 12% { transform: rotate(-10deg) scale(1.04); } 26% { transform: rotate(9deg) scale(1.04); } 40% { transform: rotate(-8deg); } 54% { transform: rotate(6deg); } 68% { transform: rotate(-4deg); } 82% { transform: rotate(2deg); }"],
  ["peek", ".aa-act", "ease-in-out", "0%, 100% { transform: translateY(0) scale(1, 1); } 22%, 48% { transform: translateY(22px) scale(1.12, .55); } 60% { transform: translateY(-6px) scale(.95, 1.06); } 70% { transform: translateY(0) scale(1, 1); }"],
  ["peek", ".aa-spin", "ease-in-out", "0%, 18%, 100% { transform: translate(0, 0) scaleY(1); } 24%, 48% { transform: translate(0, 4px) scaleY(.1); } 60%, 64% { transform: translate(0, 0) scaleY(1); } 72%, 80% { transform: translate(-13px, 0) scaleY(1); } 86%, 93% { transform: translate(13px, 0) scaleY(1); }"],
  ["spin", ".aa-spin", "linear", "0% { transform: translateX(0) scaleX(1); animation-timing-function: ease-out; } 16% { transform: translateX(-12px) scaleX(.94); animation-timing-function: ease-in; } 48% { transform: translateX(150px) scaleX(.4); animation-timing-function: step-end; } 48.01% { transform: translateX(-150px) scaleX(.4); animation-timing-function: ease-out; } 84% { transform: translateX(8px) scaleX(1.04); animation-timing-function: ease-in-out; } 100% { transform: translateX(0) scaleX(1); }"],
  ["spin", ".aa-frame", "ease-in-out", "0%, 100% { transform: scale(1, 1); } 16% { transform: scale(1.03, .96); } 48% { transform: scale(.93, 1.02); } 84% { transform: scale(1.02, .99); }"],
  // A poke (the `interactive` option): squashed, eyes squeezed shut.
  ["boop", ".aa-act", "ease-out", "0%, 100% { transform: scale(1, 1); } 18% { transform: scale(1.1, .86); } 45% { transform: scale(.95, 1.06); } 70% { transform: scale(1.02, .98); }"],
  ["boop", ".aa-spin", "ease-out", "0%, 100% { transform: scale(1, 1); } 15%, 35% { transform: scale(1.1, .25); }"],
];

const gestureCss = GESTURE_FRAMES.flatMap(([gesture, target, timing, frames], index) =>
  [0, 1].map(
    (phase) =>
      `.aa-g-${gesture}.aa-p${phase} ${target} { animation: aa-${gesture}-${index}-${phase} var(--aa-gesture, 1s) ${timing}; }\n` +
      `@keyframes aa-${gesture}-${index}-${phase} { ${frames} }`,
  ),
).join("\n");

export const agentAvatarCss = `
.aa-avatar { --aa-spring: cubic-bezier(0.34, 1.56, 0.64, 1); }
.aa-act { transform-origin: 50% 90%; }
.aa-frame { transform-origin: 50% 90%; scale: calc(1 + var(--aa-level, 0) * .05) calc(1 + var(--aa-level, 0) * .09); transition: width .6s var(--aa-spring), height .6s var(--aa-spring), rotate .6s var(--aa-spring), scale .12s ease-out; }
.aa-body { transition: background-color .5s ease, border-radius .6s var(--aa-spring), clip-path .6s var(--aa-spring), transform .6s var(--aa-spring); }
.aa-shine { transition: opacity .45s ease; }
.aa-outline { transition: border-radius .6s var(--aa-spring), clip-path .6s var(--aa-spring), transform .6s var(--aa-spring), background-color .5s ease; }
.aa-face, .aa-unrotate { transition: border-radius .6s var(--aa-spring), transform .6s var(--aa-spring); }
.aa-track { transition: transform .25s ease-out; }
.aa-avatar[data-tracking] .aa-look { animation: none; }
.aa-look { translate: 0 calc(var(--aa-level, 0) * -7px); transition: gap .45s var(--aa-spring), margin-top .6s var(--aa-spring), transform .6s var(--aa-spring), scale .3s var(--aa-spring), translate .12s ease-out; }
.aa-hover .aa-look { scale: 1.1; }
.aa-eye { transform-origin: 50% 50%; transition: width .45s var(--aa-spring), height .45s var(--aa-spring), border-radius .45s ease, background-color .45s ease, scale .45s var(--aa-spring), rotate .45s var(--aa-spring), translate .45s var(--aa-spring); animation: aa-blink 4.6s ease-in-out ${D} infinite; }

.aa-idle .aa-frame, .aa-listening .aa-frame, .aa-reading .aa-frame, .aa-confused .aa-frame, .aa-searching .aa-frame { animation: aa-squish 4.6s ease-in-out ${D} infinite; }
.aa-idle .aa-look { animation: aa-glance 9s ease-in-out ${D} infinite; }

.aa-listening .aa-look { transform: translate(-3px, 10px); animation: aa-listen 2.4s ease-in-out ${D} infinite; }

.aa-thinking .aa-frame { animation: aa-tilt 3.6s ease-in-out ${D} infinite; }
.aa-thinking .aa-look { transform: translate(8px, -11px); animation: aa-ponder 3.6s ease-in-out ${D} infinite; }

.aa-working .aa-frame { animation: aa-bob 1.6s ease-in-out ${D} infinite; }
.aa-working .aa-look { transform: translate(6px, -6px); animation: aa-orbit 1.6s linear ${D} infinite; }

.aa-searching .aa-eye { scale: 1 .85; }
.aa-searching .aa-look { transform: translate(-14px, -2px); animation: aa-search 3s ease-in-out ${D} infinite; }

.aa-reading .aa-look { transform: translate(-2px, 6px); animation: aa-read 6s ease-in-out ${D} infinite; }

.aa-writing .aa-frame { animation: aa-bob 1.4s ease-in-out ${D} infinite; }
.aa-writing .aa-look { transform: translate(-10px, 6px); animation: aa-write 1.8s ease-in-out ${D} infinite; }

.aa-focused .aa-frame { animation: aa-lean 3.2s ease-in-out ${D} infinite; }
.aa-focused .aa-look { transform: translate(0, 3px); animation: aa-focus 3.2s ease-in-out ${D} infinite; }
.aa-focused .aa-eye { scale: 1 .6; animation-duration: 6.5s; }

.aa-happy .aa-frame { animation: aa-hop 1.4s ease-out 2; }

.aa-love .aa-frame { animation: aa-sway 3s ease-in-out ${D} infinite; }
.aa-love .aa-look { transform: translate(0, -3px); }
.aa-love .aa-heart { animation: aa-beat 1.1s ease-in-out ${D} infinite; }

.aa-surprised .aa-frame { animation: aa-jolt .7s ease-out; }
.aa-surprised .aa-look { transform: translate(0, -6px); }
.aa-surprised .aa-eye { scale: 1.3; animation: none; }

.aa-confused .aa-frame { rotate: -7deg; }
.aa-confused .aa-look { transform: translate(3px, -3px); }
.aa-confused .aa-eye:first-child { translate: 0 -5px; scale: 1.35; animation: aa-blink 4.6s ease-in-out ${D} infinite, aa-swap-a 4.2s ease-in-out infinite; }
.aa-confused .aa-eye:last-child { translate: 0 5px; scale: .7; animation: aa-blink 4.6s ease-in-out ${D} infinite, aa-swap-b 4.2s ease-in-out infinite; }

.aa-sorry .aa-frame { animation: aa-sag 5s ease-in-out ${D} infinite; }
.aa-sorry .aa-look { transform: translate(0, 9px); }
.aa-sorry .aa-eye { scale: 1 .7; rotate: -16deg; animation-duration: 7s; }
.aa-sorry .aa-eye:last-child { rotate: 16deg; }

.aa-dizzy .aa-frame { animation: aa-wobble 2.4s ease-in-out ${D} infinite; }
.aa-dizzy .aa-look { animation: aa-orbit 2.4s linear ${D} infinite; }
.aa-dizzy .aa-x { animation: aa-whirl 1.2s linear infinite; }
.aa-dizzy .aa-x:last-child { animation-direction: reverse; }

.aa-drowsy .aa-frame { animation: aa-breathe 5.5s ease-in-out ${D} infinite; }
.aa-drowsy .aa-look { transform: translate(0, 6px); animation: aa-nod-off 5.5s ease-in-out ${D} infinite; }
.aa-drowsy .aa-eye { scale: 1 .4; translate: 0 3px; animation: aa-heavy 5.5s ease-in-out ${D} infinite; }

.aa-asleep .aa-frame { animation: aa-breathe 4.4s ease-in-out ${D} infinite; }
.aa-asleep .aa-look { transform: translate(0, 8px); animation: aa-doze 4.4s ease-in-out ${D} infinite; }
.aa-asleep .aa-eye { translate: 0 2px; animation: none; transition: width 1.4s ease-in-out, height 1.4s ease-in-out, border-radius 1.4s ease-in-out, scale 1.4s ease-in-out, translate 1.4s ease-in-out, background-color .45s ease; }

${gestureCss}
.aa-avatar.aa-still * { animation: none; transition: none; }
@media (prefers-reduced-motion: reduce) { .aa-avatar * { animation: none !important; transition: none !important; } }
@keyframes aa-blink { 0%, 90%, 96%, 100% { transform: scaleY(1); } 93% { transform: scaleY(.1); } }
@keyframes aa-squish { 0%, 89%, 100% { transform: scale(1, 1); } 92% { transform: scale(1.05, .94); } 95% { transform: scale(.98, 1.03); } }
@keyframes aa-glance { 0%, 28%, 78%, 100% { transform: translate(0, 0); } 34%, 50% { transform: translate(-8px, 1px); } 56%, 72% { transform: translate(7px, -3px); } }
@keyframes aa-listen { 0%, 100% { transform: translate(-3px, 10px); } 50% { transform: translate(-1px, 12px); } }
@keyframes aa-ponder { 0%, 36%, 100% { transform: translate(8px, -11px); } 50%, 86% { transform: translate(-8px, -11px); } }
@keyframes aa-tilt { 0%, 36%, 100% { transform: rotate(4deg) scale(1); } 18% { transform: rotate(4deg) scale(1.03); } 50%, 86% { transform: rotate(-4deg) scale(1); } 68% { transform: rotate(-4deg) scale(1.03); } }
@keyframes aa-orbit { from { transform: rotate(0deg) translateX(9px) rotate(0deg); } to { transform: rotate(360deg) translateX(9px) rotate(-360deg); } }
@keyframes aa-search { 0%, 12%, 100% { transform: translate(-14px, -2px); } 42%, 58% { transform: translate(14px, -2px); } }
@keyframes aa-read { 0%, 7% { transform: translate(-10px, 2px); } 10%, 17% { transform: translate(-2px, 2px); } 20%, 27% { transform: translate(7px, 2px); } 32%, 39% { transform: translate(-10px, 6px); } 42%, 49% { transform: translate(-2px, 6px); } 52%, 59% { transform: translate(7px, 6px); } 64%, 71% { transform: translate(-10px, 10px); } 74%, 81% { transform: translate(-2px, 10px); } 84%, 91% { transform: translate(7px, 10px); } 100% { transform: translate(-10px, 2px); } }
@keyframes aa-write { 0% { transform: translate(-10px, 6px); } 78% { transform: translate(10px, 6px); } 100% { transform: translate(-10px, 6px); } }
@keyframes aa-bob { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-3px); } }
@keyframes aa-lean { 0%, 100% { transform: translateY(3px) scale(1.04, .98); } 50% { transform: translateY(2px) scale(1.05, .97); } }
@keyframes aa-focus { 0%, 100% { transform: translate(-2px, 3px); } 50% { transform: translate(2px, 3px); } }
@keyframes aa-hop { 0%, 60%, 100% { transform: translateY(0) scale(1, 1); } 10% { transform: translateY(2px) scale(1.08, .9); } 25% { transform: translateY(-12px) scale(.95, 1.06); } 40% { transform: translateY(0) scale(1.04, .96); } }
@keyframes aa-sway { 0%, 100% { transform: rotate(-3deg); } 50% { transform: rotate(3deg); } }
@keyframes aa-beat { 0%, 50%, 100% { transform: scale(1); } 12% { transform: scale(1.2); } 26% { transform: scale(1.04); } 36% { transform: scale(1.14); } }
@keyframes aa-jolt { 0%, 100% { transform: translateY(0) scale(1, 1); } 15% { transform: translateY(-10px) scale(.94, 1.08); } 40% { transform: translateY(0) scale(1.04, .96); } 65% { transform: translateY(0) scale(.99, 1.01); } }
@keyframes aa-swap-a { 0%, 20%, 46%, 56%, 78%, 100% { scale: 1.35; animation-timing-function: cubic-bezier(0.34, 1.56, 0.64, 1); } 26%, 40%, 62%, 72% { scale: .7; animation-timing-function: cubic-bezier(0.34, 1.56, 0.64, 1); } }
@keyframes aa-swap-b { 0%, 20%, 46%, 56%, 78%, 100% { scale: .7; animation-timing-function: cubic-bezier(0.34, 1.56, 0.64, 1); } 26%, 40%, 62%, 72% { scale: 1.35; animation-timing-function: cubic-bezier(0.34, 1.56, 0.64, 1); } }
@keyframes aa-sag { 0%, 100% { transform: translateY(2px) scale(1.02, .97); } 50% { transform: translateY(3px) scale(1.03, .96); } }
@keyframes aa-wobble { 0%, 100% { transform: rotate(-5deg) translateX(-2px); } 25% { transform: rotate(2deg) translateX(1px); } 50% { transform: rotate(5deg) translateX(2px); } 75% { transform: rotate(-2deg) translateX(-1px); } }
@keyframes aa-whirl { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
@keyframes aa-heavy { 0%, 30%, 62%, 100% { transform: scaleY(1); } 40%, 52% { transform: scaleY(.1); } }
@keyframes aa-nod-off { 0%, 100% { transform: translate(0, 5px); } 70% { transform: translate(0, 13px); } 76% { transform: translate(0, 2px); } }
@keyframes aa-breathe { 0%, 100% { transform: scale(1, 1); } 45% { transform: scale(1.03, .96); } }
@keyframes aa-doze { 0%, 100% { transform: translate(0, 8px); } 45% { transform: translate(0, 10px); } }
`;

/** Adds the stylesheet to the document once. Safe to call many times; a no-op without a DOM. */
export function injectAgentAvatarStyles(doc: Document | undefined = typeof document === "undefined" ? undefined : document) {
  if (!doc || doc.getElementById(STYLE_ELEMENT_ID)) return;
  const style = doc.createElement("style");
  style.id = STYLE_ELEMENT_ID;
  style.textContent = agentAvatarCss;
  doc.head.appendChild(style);
}
