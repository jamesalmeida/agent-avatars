import { StrictMode, useState, type CSSProperties, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import {
  AgentAvatar,
  COLORS,
  DEFAULT_CONFIG,
  EYES,
  EYE_COLORS,
  SHAPES,
  colorValue,
  eyeColorValue,
  type AvatarConfig,
  type AvatarMood,
} from "../src";

const ACCENT = "#2f4858";
const MUTED = "rgba(17,17,17,.68)";

const MOODS: { id: AvatarMood; label: string }[] = [
  { id: "idle", label: "Waiting" },
  { id: "listening", label: "Listening" },
  { id: "writing", label: "Writing" },
  { id: "happy", label: "Happy" },
];

const entries = <T extends Record<string, { label: string }>>(table: T) =>
  (Object.keys(table) as (keyof T & string)[]).map((id) => ({ id, label: table[id].label }));

const card: CSSProperties = {
  background: "#fff",
  borderRadius: 28,
  padding: 28,
  display: "flex",
  flexDirection: "column",
  gap: 24,
  minWidth: 0,
};

function Group({ label, children }: { label: string; children: ReactNode }) {
  return (
    <fieldset style={{ border: 0, margin: 0, padding: 0, minWidth: 0 }}>
      <legend style={{ padding: 0, marginBottom: 10, fontSize: 13, fontWeight: 600, color: MUTED }}>{label}</legend>
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
    <div style={{ display: "inline-flex", flexWrap: "wrap", gap: 4, padding: 4, borderRadius: 999, background: "#f1eee6" }}>
      {options.map((option) => {
        const selected = option.id === value;
        return (
          <button
            key={option.id}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(option.id)}
            style={{
              minHeight: 40,
              padding: "0 16px",
              borderRadius: 999,
              border: 0,
              cursor: "pointer",
              whiteSpace: "nowrap",
              background: selected ? "#fff" : "transparent",
              boxShadow: selected ? "0 1px 4px rgba(0,0,0,.15)" : "none",
              color: selected ? "#111" : MUTED,
            }}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

function Swatch({
  label,
  color,
  selected,
  size,
  onClick,
}: {
  label: string;
  color: string;
  selected: boolean;
  size: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      aria-pressed={selected}
      onClick={onClick}
      style={{
        width: size,
        height: size,
        padding: 0,
        borderRadius: "50%",
        cursor: "pointer",
        background: color,
        border: "1px solid rgba(17,17,17,.18)",
        boxShadow: selected ? `0 0 0 3px #fff, 0 0 0 5px ${ACCENT}` : "none",
      }}
    />
  );
}

// A rainbow swatch over a hidden native colour picker.
function CustomSwatch({
  label,
  value,
  selected,
  size,
  onChange,
}: {
  label: string;
  value: string;
  selected: boolean;
  size: number;
  onChange: (color: string) => void;
}) {
  return (
    <label
      title={label}
      style={{
        position: "relative",
        width: size,
        height: size,
        borderRadius: "50%",
        cursor: "pointer",
        background: "conic-gradient(#e66, #ec6, #6c6, #6ce, #66e, #c6e, #e66)",
        boxShadow: selected ? `0 0 0 3px #fff, 0 0 0 5px ${ACCENT}` : "none",
      }}
    >
      <span style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>{label}</span>
      <input
        type="color"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0, cursor: "pointer" }}
      />
    </label>
  );
}

function Playground() {
  const [config, setConfig] = useState<AvatarConfig>(DEFAULT_CONFIG);
  const [mood, setMood] = useState<AvatarMood>("idle");
  const [follow, setFollow] = useState(true);
  const set = (patch: Partial<AvatarConfig>) => setConfig((current) => ({ ...current, ...patch }));
  const isCustomColor = !(config.color in COLORS);
  const isCustomEyeColor = !(config.eyeColor in EYE_COLORS);

  const code = [
    "<AgentAvatar",
    `  shape="${config.shape}"`,
    `  color="${config.color}"`,
    `  fill="${config.fill}"`,
    `  eyes="${config.eyes}"`,
    `  eyeColor="${config.eyeColor}"`,
    `  mood="${mood}"`,
    ...(follow ? ["  followPointer"] : []),
    "/>",
  ].join("\n");

  return (
    <main style={{ maxWidth: 1080, margin: "0 auto", padding: "40px 16px 64px", display: "flex", flexDirection: "column", gap: 24 }}>
      <header style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <h1 style={{ margin: 0, fontSize: 40, fontWeight: 500, letterSpacing: "-0.02em" }}>agent-avatars</h1>
        <p style={{ margin: 0, color: MUTED }}>
          An animated face for your AI agent.{" "}
          <a href="https://github.com/jamesalmeida/agent-avatars" style={{ color: ACCENT }}>
            GitHub
          </a>
        </p>
        <code style={{ fontSize: 14 }}>npm install @general-systems-ventures/agent-avatars</code>
      </header>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 24, alignItems: "flex-start" }}>
        <section aria-label="Options" style={{ ...card, flex: "1 1 380px" }}>
          <Group label="Shape">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 8 }}>
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
                      fontSize: 13,
                      color: "#111",
                      border: `1px solid ${selected ? ACCENT : "rgba(17,17,17,.12)"}`,
                      boxShadow: selected ? `inset 0 0 0 1px ${ACCENT}` : "none",
                      background: selected ? "#f1eee6" : "#fff",
                    }}
                  >
                    <AgentAvatar {...config} shape={shape.id} size={40} animated={false} />
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
                  size={40}
                  onClick={() => set({ color: color.id })}
                />
              ))}
              <CustomSwatch
                label="Custom colour"
                value={colorValue(config.color)}
                selected={isCustomColor}
                size={40}
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
                  size={36}
                  onClick={() => set({ eyeColor: color.id })}
                />
              ))}
              <CustomSwatch
                label="Custom eye colour"
                value={eyeColorValue(config.eyeColor)}
                selected={isCustomEyeColor}
                size={36}
                onChange={(eyeColor) => set({ eyeColor })}
              />
            </div>
          </Group>
        </section>

        <section aria-label="Preview" style={{ ...card, flex: "1 1 440px", gap: 20 }}>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <Segmented options={MOODS} value={mood} onChange={setMood} />
            <label style={{ display: "flex", alignItems: "center", gap: 8, minHeight: 44, fontSize: 14, color: MUTED, cursor: "pointer" }}>
              <input type="checkbox" checked={follow} onChange={() => setFollow(!follow)} style={{ width: 18, height: 18, accentColor: ACCENT }} />
              Follow pointer
            </label>
          </div>
          <div style={{ height: 320, borderRadius: 24, background: "#f1eee6", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <AgentAvatar {...config} mood={mood} size={240} followPointer={follow} label="Agent avatar preview" />
          </div>
          <p style={{ margin: "-8px 0 0", fontSize: 14, color: MUTED }}>
            {follow && mood === "idle" ? "Move your mouse near the avatar: its eyes follow while it's waiting." : " "}
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            {[20, 28, 40, 64].map((size) => (
              <AgentAvatar key={size} {...config} mood={mood} size={size} followPointer={follow} />
            ))}
          </div>
          <pre style={{ margin: 0, padding: 16, borderRadius: 16, background: "#14202a", color: "#f5f5f5", fontSize: 13, overflowX: "auto" }}>
            {code}
          </pre>
        </section>
      </div>
    </main>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Playground />
  </StrictMode>,
);
