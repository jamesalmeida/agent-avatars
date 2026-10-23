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
  usePointerFollow(rootRef, stageRef, trackRef, animated && mood === "idle" && radius > 0 ? radius : 0);
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

// Moves the eyes toward the pointer while it is within `radius` px of the avatar.
// Writes styles directly (once per frame) instead of re-rendering.
function usePointerFollow(
  rootRef: RefObject<HTMLSpanElement | null>,
  stageRef: RefObject<HTMLSpanElement | null>,
  trackRef: RefObject<HTMLSpanElement | null>,
  radius: number,
) {
  useEffect(() => {
    const root = rootRef.current;
    const stage = stageRef.current;
    const track = trackRef.current;
    if (!radius || !root || !stage || !track) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    let pointer: { x: number; y: number } | null = null;

    const pose = (offset: { x: number; y: number } | null) => {
      track.style.transform = offset ? `translate(${offset.x.toFixed(2)}px, ${offset.y.toFixed(2)}px)` : "";
      if (offset) stage.dataset.tracking = "";
      else delete stage.dataset.tracking;
    };
    const update = () => {
      frame = 0;
      if (!pointer) return pose(null);
      const rect = root.getBoundingClientRect();
      pose(lookOffset(pointer.x - (rect.left + rect.width / 2), pointer.y - (rect.top + rect.height / 2), rect.width, radius));
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const onMove = (event: PointerEvent) => {
      pointer = { x: event.clientX, y: event.clientY };
      schedule();
    };
    const onLeave = (event: PointerEvent) => {
      if (event.relatedTarget) return;
      pointer = null;
      schedule();
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerout", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerout", onLeave);
      cancelAnimationFrame(frame);
      pose(null);
    };
  }, [rootRef, stageRef, trackRef, radius]);
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
