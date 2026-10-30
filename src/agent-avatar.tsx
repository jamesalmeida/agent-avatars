import {
  useCallback,
  useEffect,
  useId,
  useInsertionEffect,
  useRef,
  useState,
  type CSSProperties,
  type RefObject,
} from "react";
import {
  DEFAULT_FOLLOW_RADIUS,
  GESTURES,
  STAGE,
  avatarStyles,
  hashString,
  lookOffset,
  moodForChat,
  resolveConfig,
  type AvatarConfig,
  type AvatarGesture,
  type AvatarMood,
  type ChatStatus,
} from "./config";
import { injectAgentAvatarStyles } from "./styles";

/** Something to look at: an element, a ref to one, or a point in viewport px. */
export type LookTarget = Element | RefObject<Element | null> | { x: number; y: number };

export type AgentAvatarProps = Partial<AvatarConfig> & {
  mood?: AvatarMood;
  /** Set false to hold a still pose, e.g. for avatars on older messages. Default true. */
  animated?: boolean;
  /** Width and height in px. Default 28. */
  size?: number;
  /**
   * While idle, the eyes follow the mouse when it comes within this many px of
   * the avatar's edge. `true` uses 240. Off by default and with reduced motion.
   */
  followPointer?: boolean | number;
  /**
   * While idle, the eyes look at whatever has keyboard focus on the page (an input,
   * a button), until the pointer moves. Off by default and with reduced motion.
   */
  followFocus?: boolean;
  /**
   * While idle, the eyes look at this element (or ref, or point in viewport px),
   * e.g. whoever is speaking in a multi-agent chat. Wins over the pointer and focus.
   * Re-aimed when it changes and on scroll or resize. Off with reduced motion.
   */
  lookAt?: LookTarget | null;
  /**
   * A thin outline around the body, so a dark avatar stays visible on a dark
   * background. `true` uses the `--aa-outline-color` CSS variable (default a soft
   * white), so you can switch it per theme in CSS; a string is any CSS colour.
   */
  outline?: boolean | string;
  /**
   * Each change plays one turn: the face winds up, then spins round, the eyes
   * sliding off one side of the body and back in from the other. A counter
   * works well, e.g. `spin={taps}`. Mounting doesn't spin.
   */
  spin?: number;
  /** How long a turn takes, in ms. Default 1100. */
  spinMs?: number;
  /**
   * Plays a gesture (nod, shake, wink, jump, wiggle, peek, spin) each time `id`
   * changes, on top of the mood. `useGesture()` makes one. Mounting doesn't play.
   */
  gesture?: { name: AvatarGesture; id: number };
  /**
   * Speech loudness, 0 to 1 (e.g. from text-to-speech audio): the body pulses and
   * the eyes bob with it. Or set the `--aa-level` CSS variable on a parent, which
   * skips re-rendering on every frame.
   */
  level?: number;
  /** An accessible name. Without one the avatar is decorative (aria-hidden). */
  label?: string;
  className?: string;
  style?: CSSProperties;
};

const DEFAULT_SPIN_MS = 1100;
/** The outline's width on screen, in px, whatever the avatar's size. */
const OUTLINE_PX = 1.5;

// Scales the body's copy so it shows OUTLINE_PX on each side (the stage is scaled to `size`).
function outlineScale(length: number, size: number): number {
  return 1 + (2 * OUTLINE_PX * (STAGE / size)) / length;
}

const fill = { position: "absolute", inset: 0 } as const;
const center = { display: "flex", alignItems: "center", justifyContent: "center" } as const;
const arcBase = { display: "block", boxSizing: "border-box", width: 32, borderStyle: "solid" } as const;
const HEART = 'path("M15 27 C6 20 0 14.5 0 8.2 C0 3.6 3.6 0 8 0 C11 0 13.6 1.7 15 4.2 C16.4 1.7 19 0 22 0 C26.4 0 30 3.6 30 8.2 C30 14.5 24 20 15 27 Z")';
/** Confused eyes are round whatever the eye style (the stylesheet sizes and swaps them). */
const ROUND_EYE = { width: 24, height: 24, borderRadius: "50%" } as const;
const POKE_MS = 550;

/**
 * An animated face for an AI agent: a shape with two eyes. Shape, colour and
 * eye changes morph; moods animate. Respects prefers-reduced-motion, where each
 * mood keeps a still pose.
 */
export function AgentAvatar({
  mood = "idle",
  animated = true,
  size = 28,
  followPointer = false,
  followFocus = false,
  lookAt = null,
  outline = false,
  spin,
  spinMs = DEFAULT_SPIN_MS,
  gesture,
  level,
  label,
  className,
  style,
  ...options
}: AgentAvatarProps) {
  useInsertionEffect(() => injectAgentAvatarStyles(), []);
  const rootRef = useRef<HTMLSpanElement>(null);
  const stageRef = useRef<HTMLSpanElement>(null);
  const trackRef = useRef<HTMLSpanElement>(null);
  const config = resolveConfig(options);
  const delay = useLoopDelay();

  const { act, play } = useAct(animated);
  usePlayOnChange(spin, () => play("spin", spinMs));
  usePlayOnChange(gesture?.id, () => {
    if (!gesture || !Object.prototype.hasOwnProperty.call(GESTURES, gesture.name)) return;
    play(gesture.name, gesture.name === "spin" ? spinMs : GESTURES[gesture.name].ms);
  });
  const { hover, petting } = useReactions(rootRef, animated && config.interactive, play);
  const doze = useDoze(animated && mood === "idle" ? config.sleepAfter : 0);
  // Petting wins, then dozing (only ever while the mood is idle), then the mood.
  const shown: AvatarMood = petting ? "happy" : doze === "waking" ? "surprised" : (doze ?? mood);

  const radius = followPointer === true ? DEFAULT_FOLLOW_RADIUS : followPointer || 0;
  const isIdle = animated && shown === "idle";
  useLookAround(rootRef, stageRef, trackRef, isIdle && radius > 0 ? radius : 0, isIdle && followFocus, isIdle ? lookAt : null);

  const s = avatarStyles(config);
  // Happy squints (^ ^): arcs instead of eyes.
  const arc: CSSProperties | null =
    shown === "happy"
      ? { ...arcBase, height: 17, borderColor: s.eyeColor, borderWidth: "7px 7px 0", borderRadius: "32px 32px 0 0" }
      : null;
  const bar = (angle: number): CSSProperties => ({
    position: "absolute",
    left: 0,
    top: 10,
    width: 26,
    height: 6,
    borderRadius: 3,
    backgroundColor: s.eyeColor,
    transform: `rotate(${angle}deg)`,
  });
  const heart: CSSProperties = { display: "block", width: 30, height: 27, backgroundColor: s.eyeColor, clipPath: HEART };
  const cross = (
    <span className="aa-x" style={{ position: "relative", display: "block", width: 26, height: 26 }}>
      <span style={bar(45)} />
      <span style={bar(-45)} />
    </span>
  );
  // Asleep shuts the eyes to thin lines. They stay the same elements, so drowsy's
  // heavy lids close the rest of the way (the stylesheet slows that transition).
  const shut = { width: Math.max(24, Math.min(s.leftEye.width, s.rightEye.width)), height: 5, borderRadius: "3px" };
  const eyeShape = shown === "confused" ? ROUND_EYE : shown === "asleep" ? shut : null;
  const isTurning = act?.name === "spin";
  const a11y = label ? { role: "img", "aria-label": label } : { "aria-hidden": true };
  const classes = [
    "aa-avatar",
    `aa-${shown}`,
    animated ? "" : "aa-still",
    act ? `aa-g-${act.name} aa-p${act.phase}` : "",
    hover ? "aa-hover" : "",
  ];

  return (
    <span
      {...a11y}
      ref={rootRef}
      className={className}
      style={{ position: "relative", display: "inline-block", flexShrink: 0, width: size, height: size, ...style }}
    >
      <span
        ref={stageRef}
        className={classes.filter(Boolean).join(" ")}
        style={{
          ["--aa-delay" as string]: `${delay}s`,
          ...(act ? { ["--aa-gesture" as string]: `${act.ms}ms` } : {}),
          ...(level === undefined ? {} : { ["--aa-level" as string]: Math.min(1, Math.max(0, level || 0)) }),
          ...center,
          position: "absolute",
          top: 0,
          left: 0,
          width: STAGE,
          height: STAGE,
          transform: `scale(${size / STAGE})`,
          transformOrigin: "0 0",
        }}
      >
        <span className="aa-act" style={{ ...center, position: "relative" }}>
          <span className="aa-frame" style={{ ...center, position: "relative", ...s.frame }}>
            {outline ? (
              // A copy of the body in the outline colour, a few px bigger on each side.
              <span
                className="aa-outline"
                aria-hidden
                style={{
                  ...fill,
                  backgroundColor: outline === true ? "var(--aa-outline-color, rgba(255, 255, 255, 0.28))" : outline,
                  borderRadius: s.body.borderRadius,
                  clipPath: s.body.clipPath,
                  transform: `${s.body.transform === "none" ? "" : s.body.transform} scale(${outlineScale(s.frame.width, size)}, ${outlineScale(s.frame.height, size)})`,
                }}
              />
            ) : null}
            <span className="aa-body" style={{ ...fill, overflow: "hidden", ...s.body }}>
              <span
                className="aa-shine"
                style={{
                  ...fill,
                  opacity: s.shineOpacity,
                  background:
                    "radial-gradient(120% 120% at 28% 22%, rgba(255,255,255,.3) 0%, rgba(255,255,255,0) 50%, rgba(0,0,0,.34) 100%)",
                }}
              />
            </span>
            {/* Clipped to the body while turning, so the eyes slide out of sight round its edge. */}
            <span
              className="aa-face"
              style={{
                ...fill,
                borderRadius: s.body.borderRadius,
                transform: s.body.transform,
                ...(isTurning ? { overflow: "hidden", clipPath: s.body.clipPath } : {}),
              }}
            >
              <span className="aa-unrotate" style={{ ...fill, ...center, transform: s.unrotate }}>
                <span className="aa-spin" style={{ ...center, position: "relative" }}>
                  <span ref={trackRef} className="aa-track" style={{ ...center, position: "relative" }}>
                    <span className="aa-look" style={{ ...center, position: "relative", ...s.look }}>
                      {arc ? (
                        <>
                          <span style={arc} />
                          <span style={arc} />
                        </>
                      ) : shown === "love" ? (
                        <>
                          <span className="aa-heart" style={heart} />
                          <span className="aa-heart" style={heart} />
                        </>
                      ) : shown === "dizzy" ? (
                        <>
                          {cross}
                          {cross}
                        </>
                      ) : (
                        <>
                          <span className="aa-eye" style={{ display: "block", flexShrink: 0, ...s.leftEye, ...eyeShape }} />
                          <span className="aa-eye" style={{ display: "block", flexShrink: 0, ...s.rightEye, ...eyeShape }} />
                        </>
                      )}
                    </span>
                  </span>
                </span>
              </span>
            </span>
          </span>
        </span>
      </span>
    </span>
  );
}

// How far into their loops this avatar's animations start (negative seconds), so
// avatars on the same page don't blink in unison. From useId, so the server and
// the client agree.
function useLoopDelay() {
  const id = useId();
  return -(hashString(id) % 9000) / 1000;
}

type Act = { name: string; phase: 0 | 1; ms: number };

// The gesture playing now, or null. `phase` alternates so a repeat mid-gesture
// restarts its animation.
function useAct(enabled: boolean) {
  const [act, setAct] = useState<Act | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  const play = useCallback((name: string, ms: number) => {
    setAct((current) => ({ name, ms, phase: current?.phase === 0 ? 1 : 0 }));
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setAct(null), ms);
  }, []);
  return { act: enabled ? act : null, play };
}

// Calls `onChange` when `value` changes, but not on mount.
function usePlayOnChange(value: unknown, onChange: () => void) {
  const last = useRef(value);
  useEffect(() => {
    if (Object.is(value, last.current)) return;
    last.current = value;
    onChange();
    // Only a new value plays; onChange is a fresh closure every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);
}

const PET_STROKES = 3;
const PET_WINDOW_MS = 1200;
const PET_HOLD_MS = 1000;

// The `interactive` option: hovering widens the eyes a little, a poke (pointer
// down) plays a squashed "boop", and stroking back and forth over the avatar
// (three changes of direction within 1.2 s) makes it happy while it lasts.
function useReactions(
  rootRef: RefObject<HTMLSpanElement | null>,
  enabled: boolean,
  play: (name: string, ms: number) => void,
) {
  const [hover, setHover] = useState(false);
  const [petting, setPetting] = useState(false);

  useEffect(() => {
    const root = rootRef.current;
    if (!enabled || !root) return;
    let lastX: number | null = null;
    let direction = 0;
    let travel = 0;
    let strokes: number[] = [];
    let timer: ReturnType<typeof setTimeout> | undefined;

    const onEnter = () => setHover(true);
    const onLeave = () => {
      setHover(false);
      lastX = null;
      direction = 0;
      travel = 0;
      strokes = [];
    };
    const onDown = () => play("boop", POKE_MS);
    const onMove = (event: PointerEvent) => {
      if (lastX !== null) {
        const dx = event.clientX - lastX;
        const next = Math.sign(dx);
        // A stroke counts when it turns back after crossing a fifth of the avatar.
        if (next && next !== direction) {
          if (direction && travel > root.getBoundingClientRect().width * 0.2) {
            const now = performance.now();
            strokes = strokes.filter((time) => now - time < PET_WINDOW_MS);
            strokes.push(now);
            if (strokes.length >= PET_STROKES) {
              setPetting(true);
              clearTimeout(timer);
              timer = setTimeout(() => setPetting(false), PET_HOLD_MS);
            }
          }
          direction = next;
          travel = 0;
        }
        travel += Math.abs(dx);
      }
      lastX = event.clientX;
    };

    root.addEventListener("pointerenter", onEnter);
    root.addEventListener("pointerleave", onLeave);
    root.addEventListener("pointerdown", onDown);
    root.addEventListener("pointermove", onMove);
    return () => {
      root.removeEventListener("pointerenter", onEnter);
      root.removeEventListener("pointerleave", onLeave);
      root.removeEventListener("pointerdown", onDown);
      root.removeEventListener("pointermove", onMove);
      clearTimeout(timer);
      setHover(false);
      setPetting(false);
    };
  }, [rootRef, enabled, play]);

  return { hover: enabled && hover, petting: enabled && petting };
}

type Doze = "drowsy" | "asleep" | "waking" | null;

/** How long it stays drowsy before falling asleep. */
const DROWSY_MS = 8000;
/** How long the start lasts when something wakes it. */
const WAKE_MS = 900;
const ACTIVITY = ["pointermove", "pointerdown", "keydown", "wheel", "touchstart", "focusin"] as const;

// The `sleepAfter` option: after `after` ms with no activity on the page it gets
// drowsy, then falls asleep. Activity perks a drowsy avatar back up, and wakes a
// sleeping one with a start ("waking", shown as surprised).
function useDoze(after: number): Doze {
  const [state, setState] = useState<Doze>(null);

  useEffect(() => {
    if (!after) return;
    let last = Date.now();
    let current: Doze = null;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const set = (next: Doze) => {
      current = next;
      setState(next);
    };
    const check = () => {
      const quiet = Date.now() - last;
      if (quiet < after) {
        timer = setTimeout(check, after - quiet);
      } else if (quiet < after + DROWSY_MS) {
        set("drowsy");
        timer = setTimeout(check, after + DROWSY_MS - quiet);
      } else {
        set("asleep");
      }
    };
    const onActivity = () => {
      last = Date.now();
      if (current !== "drowsy" && current !== "asleep") return;
      clearTimeout(timer);
      if (current === "drowsy") {
        set(null);
        timer = setTimeout(check, after);
        return;
      }
      set("waking");
      timer = setTimeout(() => {
        set(null);
        timer = setTimeout(check, after);
      }, WAKE_MS);
    };

    timer = setTimeout(check, after);
    for (const type of ACTIVITY) window.addEventListener(type, onActivity, { capture: true, passive: true });
    return () => {
      clearTimeout(timer);
      for (const type of ACTIVITY) window.removeEventListener(type, onActivity, { capture: true });
      setState(null);
    };
  }, [after]);

  return after ? state : null;
}

// Moves the eyes toward the pointer while it is within `radius` px of the avatar,
// and, with `followFocus`, toward the focused element. Whichever moved last wins:
// a focus change looks at the new element until the pointer moves again. A
// `lookAt` target wins over both. Writes styles directly (once per frame)
// instead of re-rendering.
function useLookAround(
  rootRef: RefObject<HTMLSpanElement | null>,
  stageRef: RefObject<HTMLSpanElement | null>,
  trackRef: RefObject<HTMLSpanElement | null>,
  radius: number,
  followFocus: boolean,
  lookAt: LookTarget | null,
) {
  // The target is read when posing, so a new one re-aims without re-subscribing.
  const target = useRef(lookAt);
  const refresh = useRef<(() => void) | undefined>(undefined);
  const hasTarget = lookAt != null;
  useEffect(() => {
    target.current = lookAt;
    refresh.current?.();
  }, [lookAt]);

  useEffect(() => {
    const root = rootRef.current;
    const stage = stageRef.current;
    const track = trackRef.current;
    if ((!radius && !followFocus && !hasTarget) || !root || !stage || !track) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    let pointer: { x: number; y: number } | null = null;
    let source: "pointer" | "focus" = "focus";

    const pose = (offset: { x: number; y: number } | null) => {
      track.style.transform = offset ? `translate(${offset.x.toFixed(2)}px, ${offset.y.toFixed(2)}px)` : "";
      if (offset) stage.dataset.tracking = "";
      else delete stage.dataset.tracking;
    };
    const focusTarget = (): { x: number; y: number } | null => {
      const element = document.activeElement;
      if (!followFocus || !element || element === document.body || root.contains(element)) return null;
      const rect = element.getBoundingClientRect();
      if (rect.width === 0 && rect.height === 0) return null;
      return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    };
    const lookTarget = (): { x: number; y: number } | null => {
      const value = target.current;
      if (!value) return null;
      if ("x" in value && "y" in value) return { x: value.x, y: value.y };
      const element = value instanceof Element ? value : "current" in value ? value.current : null;
      if (!element) return null;
      const rect = element.getBoundingClientRect();
      return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    };
    const update = () => {
      frame = 0;
      const rect = root.getBoundingClientRect();
      const look = (point: { x: number; y: number }, reach: number) =>
        lookOffset(point.x - (rect.left + rect.width / 2), point.y - (rect.top + rect.height / 2), rect.width, reach);
      const aim = lookTarget();
      if (aim) return pose(look(aim, Number.POSITIVE_INFINITY));
      const toPointer = radius && pointer ? look(pointer, radius) : null;
      const focus = focusTarget();
      const toFocus = focus ? look(focus, Number.POSITIVE_INFINITY) : null;
      pose(source === "pointer" ? (toPointer ?? toFocus) : (toFocus ?? toPointer));
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const onMove = (event: PointerEvent) => {
      pointer = { x: event.clientX, y: event.clientY };
      source = "pointer";
      schedule();
    };
    const onLeave = (event: PointerEvent) => {
      if (event.relatedTarget) return;
      pointer = null;
      schedule();
    };
    const onFocus = () => {
      source = "focus";
      schedule();
    };

    if (radius) {
      window.addEventListener("pointermove", onMove, { passive: true });
      document.addEventListener("pointerout", onLeave);
    }
    if (followFocus) {
      document.addEventListener("focusin", onFocus);
      document.addEventListener("focusout", onFocus);
    }
    if (followFocus || hasTarget) {
      window.addEventListener("resize", schedule);
      window.addEventListener("scroll", schedule, { capture: true, passive: true });
      schedule();
    }
    refresh.current = schedule;
    return () => {
      refresh.current = undefined;
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerout", onLeave);
      document.removeEventListener("focusin", onFocus);
      document.removeEventListener("focusout", onFocus);
      window.removeEventListener("resize", schedule);
      window.removeEventListener("scroll", schedule, { capture: true });
      cancelAnimationFrame(frame);
      pose(null);
    };
  }, [rootRef, stageRef, trackRef, radius, followFocus, hasTarget]);
}

/**
 * True for `ms` after `active` turns on, then false: a short "happy" moment,
 * e.g. `mood={useHappyMoment(taskJustFinished) ? "happy" : "idle"}`.
 */
export function useHappyMoment(active: boolean, ms = 2800) {
  const [isHappy, setIsHappy] = useState(active);

  useEffect(() => {
    if (!active) return;
    setIsHappy(true);
    const timer = setTimeout(() => setIsHappy(false), ms);
    return () => clearTimeout(timer);
  }, [active, ms]);

  return active && isHappy;
}

/**
 * A gesture to pass to AgentAvatar's `gesture`, and a function that plays one:
 * `const [gesture, play] = useGesture(); <AgentAvatar gesture={gesture} />; play("nod")`.
 */
export function useGesture(): [AgentAvatarProps["gesture"], (name: AvatarGesture) => void] {
  const [gesture, setGesture] = useState<AgentAvatarProps["gesture"]>(undefined);
  const play = useCallback(
    (name: AvatarGesture) => setGesture((current) => ({ name, id: (current?.id ?? 0) + 1 })),
    [],
  );
  return [gesture, play];
}

/**
 * The mood for an AI SDK chat's status (`useChat().status`): thinking until the
 * reply starts, writing while it streams, happy for `happyMs` after it finishes,
 * listening while the user types (`isTyping`), otherwise idle. An error shows
 * `errorMood` (default sorry).
 */
export function useAgentMood(
  status: ChatStatus | undefined,
  { isTyping = false, happyMs = 2800, errorMood = "sorry" }: { isTyping?: boolean; happyMs?: number; errorMood?: AvatarMood } = {},
): AvatarMood {
  // Counts replies that finished (streaming → ready), tracked during render.
  const [previous, setPrevious] = useState(status);
  const [finished, setFinished] = useState(0);
  if (status !== previous) {
    setPrevious(status);
    if (previous === "streaming" && status === "ready") setFinished((count) => count + 1);
  }
  const [isHappy, setIsHappy] = useState(false);
  useEffect(() => {
    if (!finished || !happyMs) return;
    setIsHappy(true);
    const timer = setTimeout(() => setIsHappy(false), happyMs);
    return () => clearTimeout(timer);
  }, [finished, happyMs]);

  return moodForChat({ status, isTyping, isHappy, errorMood });
}
