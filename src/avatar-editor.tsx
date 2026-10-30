import { useState, type CSSProperties, type ReactNode } from "react";
import { AgentAvatar, useGesture } from "./agent-avatar";
import {
  COLORS,
  EYES,
  EYE_COLORS,
  GESTURES,
  MOODS,
  SHAPES,
  colorValue,
  eyeColorValue,
  resolveConfig,
  type AvatarConfig,
  type AvatarGesture,
  type AvatarMood,
} from "./config";

export type AvatarEditorProps = {
  /** The avatar being edited. Missing or unknown options show as the defaults. */
  value: Partial<AvatarConfig>;
  onChange: (next: AvatarConfig) => void;
  /** Show a live preview with mood, gesture and speaking controls above the options. Default true. */
  preview?: boolean;
  /** Preview size in px. Default 140. */
  previewSize?: number;
  /** Passed to the preview avatar. Default true. */
  followPointer?: boolean | number;
  /** Passed to the preview and the shape tiles (see AgentAvatar's `outline`). */
  outline?: boolean | string;
  /**
   * Show the behaviour options (pokes and petting, falling asleep). Default true;
   * false for a look-only editor, e.g. for a still image.
   */
  behaviour?: boolean;
  className?: string;
  style?: CSSProperties;
};


// Theme with CSS variables on the editor or any parent. The defaults work on light
// and dark backgrounds because they mix with the inherited text colour.
const v = {
  text: "var(--aa-editor-text, inherit)",
  muted: "var(--aa-editor-muted, color-mix(in srgb, currentColor 62%, transparent))",
  border: "var(--aa-editor-border, color-mix(in srgb, currentColor 16%, transparent))",
  control: "var(--aa-editor-control, color-mix(in srgb, currentColor 7%, transparent))",
  selected: "var(--aa-editor-selected, color-mix(in srgb, currentColor 14%, transparent))",
  accent: "var(--aa-editor-accent, currentColor)",
  ring: "var(--aa-editor-ring, Canvas)",
};

const entries = <T extends Record<string, { label: string }>>(table: T) =>
  (Object.keys(table) as (keyof T & string)[]).map((id) => ({ id, label: table[id].label }));

function Group({ label, children }: { label: string; children: ReactNode }) {
  return (
    <fieldset style={{ border: 0, margin: 0, padding: 0, minWidth: 0 }}>
      <legend style={{ padding: 0, marginBottom: 10, fontSize: 13, fontWeight: 600, color: v.muted }}>{label}</legend>
      {children}
    </fieldset>
  );
}

function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { id: T; label: string }[];
  value: T;
  onChange: (id: T) => void;
}) {
  return (
    <div style={{ display: "inline-flex", flexWrap: "wrap", gap: 4, padding: 4, borderRadius: 22, background: v.control }}>
      {options.map((option) => {
        const selected = option.id === value;
        return (
          <button
            key={option.id}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(option.id)}
            style={{
              minHeight: 36,
              padding: "0 14px",
              borderRadius: 999,
              border: 0,
              cursor: "pointer",
              whiteSpace: "nowrap",
              font: "inherit",
              fontSize: 14,
              background: selected ? v.selected : "transparent",
              color: selected ? v.text : v.muted,
              fontWeight: selected ? 600 : 400,
            }}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

// A row of buttons that do something (not a choice), styled like Segmented.
function Actions<T extends string>({ options, onClick }: { options: { id: T; label: string }[]; onClick: (id: T) => void }) {
  return (
    <div style={{ display: "inline-flex", flexWrap: "wrap", justifyContent: "center", gap: 4 }}>
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          onClick={() => onClick(option.id)}
          style={{
            minHeight: 32,
            padding: "0 12px",
            borderRadius: 999,
            border: `1px solid ${v.border}`,
            cursor: "pointer",
            whiteSpace: "nowrap",
            font: "inherit",
            fontSize: 13,
            background: "transparent",
            color: v.text,
          }}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

const SLEEP_OPTIONS = [
  { id: "0", label: "Never" },
  { id: "10000", label: "10 s" },
  { id: "30000", label: "30 s" },
  { id: "60000", label: "1 min" },
  { id: "300000", label: "5 min" },
];

const ringShadow = `0 0 0 3px ${v.ring}, 0 0 0 5px ${v.accent}`;

function Swatch({ label, color, selected, onClick }: { label: string; color: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      aria-pressed={selected}
      onClick={onClick}
      style={{
        width: 36,
        height: 36,
        padding: 0,
        borderRadius: "50%",
        cursor: "pointer",
        background: color,
        border: `1px solid ${v.border}`,
        boxShadow: selected ? ringShadow : "none",
      }}
    />
  );
}

// A rainbow swatch over a hidden native colour picker.
function CustomSwatch({
  label,
  value,
  selected,
  onChange,
}: {
  label: string;
  value: string;
  selected: boolean;
  onChange: (color: string) => void;
}) {
  return (
    <label
      title={label}
      style={{
        position: "relative",
        width: 36,
        height: 36,
        borderRadius: "50%",
        cursor: "pointer",
        background: selected ? value : "conic-gradient(#e66, #ec6, #6c6, #6ce, #66e, #c6e, #e66)",
        border: `1px solid ${v.border}`,
        boxSizing: "border-box",
        boxShadow: selected ? ringShadow : "none",
      }}
    >
      <span style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>{label}</span>
      <input
        type="color"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", margin: 0, opacity: 0, cursor: "pointer" }}
      />
    </label>
  );
}

/**
 * Settings for an AgentAvatar: shape, colour, fill, eyes, eye colour, pokes and
 * falling asleep, with an optional live preview. Controlled: pass `value` and save what `onChange` gives you.
 * Styled inline; theme it with the `--aa-editor-*` CSS variables (see the README).
 */
export function AvatarEditor({
  value,
  onChange,
  preview = true,
  previewSize = 140,
  followPointer = true,
  outline,
  behaviour = true,
  className,
  style,
}: AvatarEditorProps) {
  const config = resolveConfig(value);
  const [mood, setMood] = useState<AvatarMood>("idle");
  const [gesture, playGesture] = useGesture();
  const [speaking, setSpeaking] = useState(false);
  const set = (patch: Partial<AvatarConfig>) => onChange({ ...config, ...patch });

  return (
    <div
      className={className}
      style={{ display: "flex", flexDirection: "column", gap: 22, color: v.text, ...style }}
    >
      {preview ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              minHeight: previewSize + 48,
              borderRadius: 24,
              background: v.control,
            }}
          >
            <AgentAvatar
              {...config}
              mood={mood}
              gesture={gesture}
              speaking={speaking}
              size={previewSize}
              followPointer={followPointer}
              outline={outline}
              label="Avatar preview"
            />
          </div>
          <Segmented options={entries(MOODS)} value={mood} onChange={setMood} />
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", alignItems: "center", gap: 8 }}>
            <Actions options={entries(GESTURES) as { id: AvatarGesture; label: string }[]} onClick={playGesture} />
            <button
              type="button"
              aria-pressed={speaking}
              onClick={() => setSpeaking((on) => !on)}
              style={{
                minHeight: 32,
                padding: "0 12px",
                borderRadius: 999,
                border: `1px solid ${speaking ? v.accent : v.border}`,
                cursor: "pointer",
                font: "inherit",
                fontSize: 13,
                background: speaking ? v.selected : "transparent",
                color: v.text,
                fontWeight: speaking ? 600 : 400,
              }}
            >
              {speaking ? "Speaking…" : "Speak"}
            </button>
          </div>
        </div>
      ) : null}

      <Group label="Shape">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(84px, 1fr))", gap: 8 }}>
          {entries(SHAPES).map((shape) => {
            const selected = shape.id === config.shape;
            return (
              <button
                key={shape.id}
                type="button"
                aria-pressed={selected}
                onClick={() => set({ shape: shape.id })}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 6,
                  padding: "12px 6px",
                  borderRadius: 16,
                  cursor: "pointer",
                  font: "inherit",
                  fontSize: 13,
                  color: v.text,
                  border: `1px solid ${selected ? v.accent : v.border}`,
                  boxShadow: selected ? `inset 0 0 0 1px ${v.accent}` : "none",
                  background: selected ? v.control : "transparent",
                }}
              >
                <AgentAvatar {...config} shape={shape.id} size={40} animated={false} outline={outline} />
                {shape.label}
              </button>
            );
          })}
        </div>
      </Group>

      <Group label="Colour">
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12 }}>
          {entries(COLORS).map((color) => (
            <Swatch
              key={color.id}
              label={color.label}
              color={colorValue(color.id)}
              selected={color.id === config.color}
              onClick={() => set({ color: color.id })}
            />
          ))}
          <CustomSwatch
            label="Custom colour"
            value={colorValue(config.color)}
            selected={!(config.color in COLORS)}
            onChange={(color) => set({ color })}
          />
        </div>
      </Group>

      <Group label="Fill">
        <Segmented
          options={[
            { id: "gradient", label: "Soft gradient" },
            { id: "solid", label: "Solid" },
          ]}
          value={config.fill}
          onChange={(fill) => set({ fill })}
        />
      </Group>

      <Group label="Eyes">
        <Segmented options={entries(EYES)} value={config.eyes} onChange={(eyes) => set({ eyes })} />
      </Group>

      <Group label="Eye colour">
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12 }}>
          {entries(EYE_COLORS).map((color) => (
            <Swatch
              key={color.id}
              label={color.label}
              color={eyeColorValue(color.id)}
              selected={color.id === config.eyeColor}
              onClick={() => set({ eyeColor: color.id })}
            />
          ))}
          <CustomSwatch
            label="Custom eye colour"
            value={eyeColorValue(config.eyeColor)}
            selected={!(config.eyeColor in EYE_COLORS)}
            onChange={(eyeColor) => set({ eyeColor })}
          />
        </div>
      </Group>

      {behaviour ? (
        <>
          <Group label="Pokes and petting">
            <Segmented
              options={[
                { id: "off", label: "Ignores them" },
                { id: "on", label: "Reacts" },
              ]}
              value={config.interactive ? "on" : "off"}
              onChange={(id) => set({ interactive: id === "on" })}
            />
          </Group>

          <Group label="Falls asleep when idle after">
            <Segmented
              options={SLEEP_OPTIONS}
              value={String(config.sleepAfter)}
              onChange={(id) => set({ sleepAfter: Number(id) })}
            />
          </Group>
        </>
      ) : null}
    </div>
  );
}
