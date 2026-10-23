import { useEffect, useInsertionEffect, useRef, useState, type CSSProperties, type RefObject } from "react";
import {
  DEFAULT_FOLLOW_RADIUS,
  STAGE,
  avatarStyles,
  lookOffset,
  resolveConfig,
  type AvatarConfig,
  type AvatarMood,
} from "./config";
import { injectAgentAvatarStyles } from "./styles";

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
  outline = false,
  spin,
  spinMs = DEFAULT_SPIN_MS,
  label,
  className,
  style,
  ...options
}: AgentAvatarProps) {
  useInsertionEffect(() => injectAgentAvatarStyles(), []);
  const rootRef = useRef<HTMLSpanElement>(null);
  const stageRef = useRef<HTMLSpanElement>(null);
  const trackRef = useRef<HTMLSpanElement>(null);
  const radius = followPointer === true ? DEFAULT_FOLLOW_RADIUS : followPointer || 0;
  const isIdle = animated && mood === "idle";
  useLookAround(rootRef, stageRef, trackRef, isIdle && radius > 0 ? radius : 0, isIdle && followFocus);
  const turn = useTurn(spin, spinMs);

  const s = avatarStyles(resolveConfig(options));
  const arc: CSSProperties = {
    display: "block",
    boxSizing: "border-box",
    width: 32,
    height: 17,
    border: `7px solid ${s.eyeColor}`,
    borderBottom: 0,
    borderRadius: "32px 32px 0 0",
  };
  const a11y = label ? { role: "img", "aria-label": label } : { "aria-hidden": true };

  return (
    <span
      {...a11y}
      ref={rootRef}
      className={className}
      style={{ position: "relative", display: "inline-block", flexShrink: 0, width: size, height: size, ...style }}
    >
      <span
        ref={stageRef}
        className={`aa-avatar aa-${mood}${animated ? "" : " aa-still"}${turn === null ? "" : ` aa-turning aa-turn-${turn}`}`}
        style={{
          ["--aa-spin" as string]: `${spinMs}ms`,
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
              ...(turn === null ? {} : { overflow: "hidden", clipPath: s.body.clipPath }),
            }}
          >
            <span className="aa-unrotate" style={{ ...fill, ...center, transform: s.unrotate }}>
              <span className="aa-spin" style={{ ...center, position: "relative" }}>
                <span ref={trackRef} className="aa-track" style={{ ...center, position: "relative" }}>
                  <span className="aa-look" style={{ ...center, position: "relative", ...s.look }}>
                    {mood === "happy" ? (
                      <>
                        <span style={arc} />
                        <span style={arc} />
                      </>
                    ) : (
                      <>
                        <span className="aa-eye" style={{ display: "block", flexShrink: 0, ...s.leftEye }} />
                        <span className="aa-eye" style={{ display: "block", flexShrink: 0, ...s.rightEye }} />
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
  );
}

// The turn playing now (0 or 1, alternating so a change mid-turn restarts the
// animation), or null. Ignores the first value, so mounting doesn't spin.
function useTurn(spin: number | undefined, ms: number) {
  const [turn, setTurn] = useState<0 | 1 | null>(null);
  const last = useRef(spin);

  useEffect(() => {
    if (spin === last.current) return;
    last.current = spin;
    setTurn((current) => (current === 0 ? 1 : 0));
    const timer = setTimeout(() => setTurn(null), ms);
    return () => clearTimeout(timer);
  }, [spin, ms]);

  return turn;
}

// Moves the eyes toward the pointer while it is within `radius` px of the avatar,
// and, with `followFocus`, toward the focused element. Whichever moved last wins:
// a focus change looks at the new element until the pointer moves again.
// Writes styles directly (once per frame) instead of re-rendering.
function useLookAround(
  rootRef: RefObject<HTMLSpanElement | null>,
  stageRef: RefObject<HTMLSpanElement | null>,
  trackRef: RefObject<HTMLSpanElement | null>,
  radius: number,
  followFocus: boolean,
) {
  useEffect(() => {
    const root = rootRef.current;
    const stage = stageRef.current;
    const track = trackRef.current;
    if ((!radius && !followFocus) || !root || !stage || !track) return;
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
    const update = () => {
      frame = 0;
      const rect = root.getBoundingClientRect();
      const look = (point: { x: number; y: number }, reach: number) =>
        lookOffset(point.x - (rect.left + rect.width / 2), point.y - (rect.top + rect.height / 2), rect.width, reach);
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
      window.addEventListener("resize", schedule);
      window.addEventListener("scroll", schedule, { capture: true, passive: true });
      schedule();
    }
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerout", onLeave);
      document.removeEventListener("focusin", onFocus);
      document.removeEventListener("focusout", onFocus);
      window.removeEventListener("resize", schedule);
      window.removeEventListener("scroll", schedule, { capture: true });
      cancelAnimationFrame(frame);
      pose(null);
    };
  }, [rootRef, stageRef, trackRef, radius, followFocus]);
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
