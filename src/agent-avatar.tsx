import { useEffect, useInsertionEffect, useState, type CSSProperties } from "react";
import { STAGE, avatarStyles, resolveConfig, type AvatarConfig, type AvatarMood } from "./config";
import { injectAgentAvatarStyles } from "./styles";

export type AgentAvatarProps = Partial<AvatarConfig> & {
  mood?: AvatarMood;
  /** Set false to hold a still pose, e.g. for avatars on older messages. Default true. */
  animated?: boolean;
  /** Width and height in px. Default 28. */
  size?: number;
  /** An accessible name. Without one the avatar is decorative (aria-hidden). */
  label?: string;
  className?: string;
  style?: CSSProperties;
};

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
  label,
  className,
  style,
  ...options
}: AgentAvatarProps) {
  useInsertionEffect(() => injectAgentAvatarStyles(), []);

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
      className={className}
      style={{ position: "relative", display: "inline-block", flexShrink: 0, width: size, height: size, ...style }}
    >
      <span
        className={`aa-avatar aa-${mood}${animated ? "" : " aa-still"}`}
        style={{
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
  );
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
