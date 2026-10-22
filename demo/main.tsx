import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  AgentAvatar,
  COLORS,
  DEFAULT_CONFIG,
  EYES,
  EYE_COLORS,
  SHAPES,
  type AvatarConfig,
  type AvatarMood,
} from "../src";

const MOODS: { id: AvatarMood; label: string }[] = [
  { id: "idle", label: "Waiting" },
  { id: "listening", label: "Listening" },
  { id: "writing", label: "Writing" },
  { id: "happy", label: "Happy" },
];

const seg = (selected: boolean) => ({
  minHeight: 40,
  padding: "0 16px",
  borderRadius: 999,
  border: 0,
  cursor: "pointer",
  background: selected ? "#fff" : "transparent",
  boxShadow: selected ? "0 1px 4px rgba(0,0,0,.15)" : "none",
  color: selected ? "#111" : "rgba(17,17,17,.7)",
});

function Segmented<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { id: T; label: string }[];
  value: T;
  onChange: (id: T) => void;
}) {
  return (
    <fieldset style={{ border: 0, margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 8 }}>
      <legend style={{ fontSize: 13, fontWeight: 600, color: "rgba(17,17,17,.68)", marginBottom: 8 }}>{label}</legend>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 4, padding: 4, borderRadius: 24, background: "#f1eee6", alignSelf: "flex-start" }}>
        {options.map((option) => (
          <button key={option.id} type="button" aria-pressed={option.id === value} onClick={() => onChange(option.id)} style={seg(option.id === value)}>
            {option.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

const entries = <T extends Record<string, { label: string }>>(table: T) =>
  (Object.keys(table) as (keyof T & string)[]).map((id) => ({ id, label: table[id].label }));

function Playground() {
  const [config, setConfig] = useState<AvatarConfig>(DEFAULT_CONFIG);
  const [mood, setMood] = useState<AvatarMood>("idle");
  const set = (patch: Partial<AvatarConfig>) => setConfig((current) => ({ ...current, ...patch }));
  const code = `<AgentAvatar shape="${config.shape}" color="${config.color}" fill="${config.fill}" eyes="${config.eyes}" eyeColor="${config.eyeColor}" mood="${mood}" />`;

  return (
    <main style={{ maxWidth: 1040, margin: "0 auto", padding: "40px 20px 64px", display: "flex", flexDirection: "column", gap: 24 }}>
      <header>
        <h1 style={{ margin: 0, fontSize: 40, fontWeight: 500, letterSpacing: "-0.02em" }}>agent-avatar</h1>
        <p style={{ margin: "4px 0 0", color: "rgba(17,17,17,.68)" }}>An animated face for your AI agent.</p>
      </header>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 24, alignItems: "flex-start" }}>
        <section style={{ flex: "1 1 360px", background: "#fff", borderRadius: 28, padding: 28, display: "flex", flexDirection: "column", gap: 20 }}>
          <Segmented label="Shape" options={entries(SHAPES)} value={config.shape} onChange={(shape) => set({ shape })} />
          <Segmented label="Colour" options={entries(COLORS)} value={config.color as keyof typeof COLORS} onChange={(color) => set({ color })} />
          <label style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14 }}>
            Custom colour
            <input type="color" value={COLORS[config.color as keyof typeof COLORS]?.value ?? config.color} onChange={(event) => set({ color: event.target.value })} />
          </label>
          <Segmented label="Fill" options={[{ id: "gradient", label: "Soft gradient" }, { id: "solid", label: "Solid" }]} value={config.fill} onChange={(fill) => set({ fill })} />
          <Segmented label="Eyes" options={entries(EYES)} value={config.eyes} onChange={(eyes) => set({ eyes })} />
          <Segmented label="Eye colour" options={entries(EYE_COLORS)} value={config.eyeColor as keyof typeof EYE_COLORS} onChange={(eyeColor) => set({ eyeColor })} />
        </section>
        <section style={{ flex: "1 1 420px", background: "#fff", borderRadius: 28, padding: 28, display: "flex", flexDirection: "column", gap: 20 }}>
          <Segmented label="Mood" options={MOODS} value={mood} onChange={setMood} />
          <div style={{ height: 300, borderRadius: 24, background: "#f1eee6", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <AgentAvatar {...config} mood={mood} size={240} label="Agent avatar preview" />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            {[20, 28, 40, 64].map((size) => (
              <AgentAvatar key={size} {...config} mood={mood} size={size} />
            ))}
          </div>
          <pre style={{ margin: 0, padding: 16, borderRadius: 16, background: "#14202a", color: "#f5f5f5", fontSize: 13, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{code}</pre>
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
