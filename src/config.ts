// Shapes, colours and eyes, and the inline styles they produce. Pure and
// framework-free, so it is easy to test and to reuse (e.g. for a settings UI).
// Geometry is drawn on a 200 px stage and scaled to the requested size.

export const STAGE = 200;

// Every shape clips with the same six points, so a change to or from the
// hexagon morphs instead of snapping.
const FULL_CLIP = "polygon(0% 0%, 100% 0%, 100% 50%, 100% 100%, 0% 100%, 0% 50%)";

type ShapeDef = { label: string; w: number; h: number; radius: string; clip: string; rotate: string; eyeY: number };

export const SHAPES = {
  circle: { label: "Circle", w: 150, h: 150, radius: "50%", clip: FULL_CLIP, rotate: "none", eyeY: 0 },
  squircle: { label: "Squircle", w: 150, h: 150, radius: "38%", clip: FULL_CLIP, rotate: "none", eyeY: 0 },
  pill: { label: "Pill", w: 180, h: 116, radius: "999px", clip: FULL_CLIP, rotate: "none", eyeY: 0 },
  blob: {
    label: "Blob",
    w: 158,
    h: 146,
    radius: "58% 42% 55% 45% / 50% 58% 42% 50%",
    clip: FULL_CLIP,
    rotate: "none",
    eyeY: 2,
  },
  drop: { label: "Drop", w: 120, h: 120, radius: "0 50% 50% 50%", clip: FULL_CLIP, rotate: "rotate(45deg)", eyeY: 10 },
  hexagon: {
    label: "Hexagon",
    w: 162,
    h: 146,
    radius: "0",
    clip: "polygon(25% 3%, 75% 3%, 100% 50%, 75% 97%, 25% 97%, 0% 50%)",
    rotate: "none",
    eyeY: 0,
  },
} as const satisfies Record<string, ShapeDef>;

export const COLORS = {
  slate: { label: "Slate", value: "#2f4858" },
  teal: { label: "Teal", value: "#2f6f6a" },
  ocean: { label: "Ocean", value: "#2c6fb5" },
  plum: { label: "Plum", value: "#5b4a6e" },
  clay: { label: "Clay", value: "#b8664a" },
  moss: { label: "Moss", value: "#4f7a3a" },
  black: { label: "Black", value: "#121212" },
} as const;

export const EYE_COLORS = {
  white: { label: "White", value: "#ffffff" },
  cream: { label: "Cream", value: "#f6efe1" },
  mint: { label: "Mint", value: "#c9f0e0" },
  ink: { label: "Ink", value: "#14202a" },
} as const;

type EyeDot = { w: number; h: number; r: string };

export const EYES = {
  round: { label: "Round", gap: 26, left: { w: 26, h: 26, r: "50%" }, right: { w: 26, h: 26, r: "50%" } },
  tall: { label: "Tall", gap: 26, left: { w: 20, h: 36, r: "10px" }, right: { w: 20, h: 36, r: "10px" } },
  calm: { label: "Calm", gap: 20, left: { w: 30, h: 10, r: "5px" }, right: { w: 30, h: 10, r: "5px" } },
  curious: { label: "Curious", gap: 20, left: { w: 34, h: 34, r: "50%" }, right: { w: 16, h: 16, r: "50%" } },
} as const satisfies Record<string, { label: string; gap: number; left: EyeDot; right: EyeDot }>;

export type AvatarShape = keyof typeof SHAPES;
export type AvatarEyes = keyof typeof EYES;
export type AvatarFill = "gradient" | "solid";
/** A preset name, or any hex colour like "#ff8800". */
export type AvatarColor = keyof typeof COLORS | (string & {});
/** A preset name, or any hex colour. */
export type AvatarEyeColor = keyof typeof EYE_COLORS | (string & {});

/**
 * idle: blinks with a little squish and glances around.
 * listening: looks down, e.g. while the user types.
 * thinking: looks up and ponders, tilting side to side, e.g. before a reply starts.
 * working: the eyes circle like a loading spinner, e.g. while a tool runs.
 * searching: sweeps from side to side, leaning in, e.g. during a web or file search.
 * reading: skims down a page line by line, e.g. while it reads a file or a link.
 * writing: looks down and scans like it's writing a line, e.g. while a reply streams.
 * focused: narrows its eyes and leans in, e.g. on a hard step like running tests.
 * happy: a squint and a hop, e.g. when a task is done.
 * love: heart eyes that beat, e.g. when the user says thanks.
 * surprised: jumps, eyes wide, e.g. at an unexpected result.
 * confused: tilts its head; the eyes go round and askew and keep swapping sizes.
 * sorry: droopy eyes looking down, sagging, e.g. when a task fails.
 * dizzy: spinning × eyes and a wobble, e.g. on an error.
 * drowsy: heavy eyelids, nodding off.
 * asleep: eyes closed, breathing slowly, e.g. when the chat has been quiet a while.
 */
export const MOODS = {
  idle: { label: "Waiting" },
  listening: { label: "Listening" },
  thinking: { label: "Thinking" },
  working: { label: "Working" },
  searching: { label: "Searching" },
  reading: { label: "Reading" },
  writing: { label: "Writing" },
  focused: { label: "Focused" },
  happy: { label: "Happy" },
  love: { label: "Love" },
  surprised: { label: "Surprised" },
  confused: { label: "Confused" },
  sorry: { label: "Sorry" },
  dizzy: { label: "Dizzy" },
  drowsy: { label: "Drowsy" },
  asleep: { label: "Asleep" },
} as const;

export type AvatarMood = keyof typeof MOODS;

/**
 * One-shot moves, played on top of any mood (see AgentAvatar's `gesture`).
 * `ms` is how long each takes; spin uses `spinMs`.
 */
export const GESTURES = {
  nod: { label: "Nod", ms: 900 },
  shake: { label: "Shake", ms: 900 },
  wink: { label: "Wink", ms: 750 },
  jump: { label: "Jump", ms: 850 },
  wiggle: { label: "Wiggle", ms: 900 },
  peek: { label: "Peek", ms: 1500 },
  spin: { label: "Spin", ms: 1100 },
} as const;

export type AvatarGesture = keyof typeof GESTURES;

/** The longest `sleepAfter` accepted: an hour. */
export const MAX_SLEEP_AFTER = 3_600_000;

export type AvatarConfig = {
  shape: AvatarShape;
  color: AvatarColor;
  fill: AvatarFill;
  eyes: AvatarEyes;
  eyeColor: AvatarEyeColor;
  /** Reacts to the pointer: a poke startles it, hovering gets its attention, stroking it back and forth makes it happy. */
  interactive: boolean;
  /** While idle, dozes off (drowsy, then asleep) after this many ms with no activity on the page. 0 = never. */
  sleepAfter: number;
};

export const DEFAULT_CONFIG: AvatarConfig = {
  shape: "squircle",
  color: "slate",
  fill: "gradient",
  eyes: "tall",
  eyeColor: "white",
  interactive: false,
  sleepAfter: 0,
};

const HEX = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i;

const has = <T extends object>(table: T, key: unknown): key is keyof T =>
  typeof key === "string" && Object.prototype.hasOwnProperty.call(table, key);

const isColor = (table: object, value: unknown): value is string =>
  has(table, value) || (typeof value === "string" && HEX.test(value));

/** Fills unknown or missing options from DEFAULT_CONFIG, so bad input never breaks rendering. */
export function resolveConfig(input: Partial<Record<keyof AvatarConfig, unknown>> = {}): AvatarConfig {
  const sleepAfter = input.sleepAfter;
  return {
    shape: has(SHAPES, input.shape) ? input.shape : DEFAULT_CONFIG.shape,
    color: isColor(COLORS, input.color) ? input.color : DEFAULT_CONFIG.color,
    fill: input.fill === "solid" || input.fill === "gradient" ? input.fill : DEFAULT_CONFIG.fill,
    eyes: has(EYES, input.eyes) ? input.eyes : DEFAULT_CONFIG.eyes,
    eyeColor: isColor(EYE_COLORS, input.eyeColor) ? input.eyeColor : DEFAULT_CONFIG.eyeColor,
    interactive: typeof input.interactive === "boolean" ? input.interactive : DEFAULT_CONFIG.interactive,
    sleepAfter:
      typeof sleepAfter === "number" && Number.isFinite(sleepAfter) && sleepAfter >= 0 && sleepAfter <= MAX_SLEEP_AFTER
        ? sleepAfter
        : DEFAULT_CONFIG.sleepAfter,
  };
}

/** A 32-bit FNV-1a hash: the same string always gives the same number. */
export function hashString(value: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

/**
 * A look picked from a name (or any string), the same every time, like an identicon:
 * e.g. one avatar per agent without anyone choosing. Behaviour options are the defaults.
 */
export function avatarFromSeed(seed: string): AvatarConfig {
  let state = hashString(seed);
  const pick = <T extends object>(table: T): keyof T => {
    // mulberry32: spreads the hash so each option is picked independently.
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    const keys = Object.keys(table) as (keyof T)[];
    return keys[(((t ^ (t >>> 14)) >>> 0) % keys.length)];
  };
  return {
    ...DEFAULT_CONFIG,
    shape: pick(SHAPES),
    color: pick(COLORS),
    eyes: pick(EYES),
    // Every preset body colour is dark, so a light eye colour.
    eyeColor: pick({ white: 1, cream: 1, mint: 1 }),
  };
}

/** The status of an AI SDK chat (`useChat().status`). */
export type ChatStatus = "submitted" | "streaming" | "ready" | "error";

/**
 * The mood for a chat's status: thinking until the reply starts, writing while it
 * streams, then happy for a moment (`isHappy`), listening while the user types,
 * otherwise idle. An error shows `errorMood` (default sorry).
 */
export function moodForChat({
  status,
  isTyping = false,
  isHappy = false,
  errorMood = "sorry",
}: {
  status: ChatStatus | undefined;
  isTyping?: boolean;
  isHappy?: boolean;
  errorMood?: AvatarMood;
}): AvatarMood {
  if (status === "submitted") return "thinking";
  if (status === "streaming") return "writing";
  if (status === "error") return errorMood;
  if (isHappy) return "happy";
  return isTyping ? "listening" : "idle";
}

/** The CSS colour for a preset name or hex value. */
export function colorValue(color: AvatarColor): string {
  return has(COLORS, color) ? COLORS[color].value : color;
}

export function eyeColorValue(color: AvatarEyeColor): string {
  return has(EYE_COLORS, color) ? EYE_COLORS[color].value : color;
}

export type AvatarStyles = {
  frame: { width: number; height: number };
  body: { backgroundColor: string; borderRadius: string; clipPath: string; transform: string };
  /** Undoes the body's rotation, so a layer clipped to the body can hold upright eyes. */
  unrotate: string;
  shineOpacity: number;
  look: { gap: number; marginTop: number };
  leftEye: { width: number; height: number; borderRadius: string; backgroundColor: string };
  rightEye: { width: number; height: number; borderRadius: string; backgroundColor: string };
  eyeColor: string;
};

export function avatarStyles(config: AvatarConfig): AvatarStyles {
  const shape = SHAPES[config.shape];
  const eyes = EYES[config.eyes];
  const eyeColor = eyeColorValue(config.eyeColor);
  const eye = (dot: EyeDot) => ({ width: dot.w, height: dot.h, borderRadius: dot.r, backgroundColor: eyeColor });

  return {
    frame: { width: shape.w, height: shape.h },
    body: {
      backgroundColor: colorValue(config.color),
      borderRadius: shape.radius,
      clipPath: shape.clip,
      transform: shape.rotate,
    },
    unrotate: shape.rotate === "none" ? "none" : shape.rotate.replace("rotate(", "rotate(-"),
    // The gradient is a light/shade overlay on a flat colour, so colour changes can fade.
    shineOpacity: config.fill === "gradient" ? 1 : 0,
    // Margin moves a flex-centred child by half its value.
    look: { gap: eyes.gap, marginTop: shape.eyeY * 2 },
    leftEye: eye(eyes.left),
    rightEye: eye(eyes.right),
    eyeColor,
  };
}

/** How far the eyes can move toward the pointer, in stage px. */
export const LOOK_RANGE = { x: 14, y: 10 } as const;

/** Default reach of `followPointer`: px beyond the avatar's edge. */
export const DEFAULT_FOLLOW_RADIUS = 240;

/**
 * Where the eyes should look for a pointer at (dx, dy) px from the avatar's
 * centre, or null when it is more than `radius` px beyond the avatar's edge.
 * The eyes point toward the pointer and reach full range one avatar-width away.
 */
export function lookOffset(dx: number, dy: number, size: number, radius: number): { x: number; y: number } | null {
  const distance = Math.hypot(dx, dy);
  if (distance - size / 2 > radius) return null;
  if (distance === 0) return { x: 0, y: 0 };
  const pull = Math.min(1, distance / Math.max(size, 1));
  return { x: (dx / distance) * LOOK_RANGE.x * pull, y: (dy / distance) * LOOK_RANGE.y * pull };
}
