import { useState, type CSSProperties, type ReactNode } from "react";
import { AgentAvatar } from "./agent-avatar";
import {
  COLORS,
  EYES,
  EYE_COLORS,
  SHAPES,
  colorValue,
  eyeColorValue,
  resolveConfig,
  type AvatarConfig,
  type AvatarMood,
} from "./config";

export type AvatarEditorProps = {
  /** The avatar being edited. Missing or unknown options show as the defaults. */
  value: Partial<AvatarConfig>;
  onChange: (next: AvatarConfig) => void;
  /** Show a live preview with a mood switcher above the options. Default true. */
  preview?: boolean;
  /** Preview size in px. Default 140. */
  previewSize?: number;
  /** Passed to the preview avatar. Default true. */
  followPointer?: boolean | number;
  /** Passed to the preview and the shape tiles (see AgentAvatar's `outline`). */
  outline?: boolean | string;
  className?: string;
  style?: CSSProperties;
};

const MOODS: { id: AvatarMood; label: string }[] = [
  { id: "idle", label: "Waiting" },
  { id: "listening", label: "Listening" },
  { id: "thinking", label: "Thinking" },
  { id: "writing", label: "Writing" },
  { id: "happy", label: "Happy" },
];

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
    <div style={{ display: "inline-flex", flexWrap: "wrap", gap: 4, padding: 4, borderRadius: 999, background: v.control }}>
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
 * Settings for an AgentAvatar: shape, colour, fill, eyes and eye colour, with an
 * optional live preview. Controlled: pass `value` and save what `onChange` gives you.
 * Styled inline; theme it with the `--aa-editor-*` CSS variables (see the README).
 */
export function AvatarEditor({
  value,
  onChange,
  preview = true,
  previewSize = 140,
  followPointer = true,
  outline,
  className,
  style,
}: AvatarEditorProps) {
  const config = resolveConfig(value);
  const [mood, setMood] = useState<AvatarMood>("idle");
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
            <AgentAvatar {...config} mood={mood} size={previewSize} followPointer={followPointer} outline={outline} label="Avatar preview" />
          </div>
          <Segmented options={MOODS} value={mood} onChange={setMood} />
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
    </div>
  );
}
