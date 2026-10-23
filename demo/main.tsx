import { StrictMode, useState, type CSSProperties, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import {
  AgentAvatar,
  AvatarEditor,
  DEFAULT_CONFIG,
  type AvatarConfig,
  type AvatarMood,
} from "../src";

const ACCENT = "#2f4858";
const MUTED = "rgba(17,17,17,.68)";

const MOODS: { id: AvatarMood; label: string }[] = [
  { id: "idle", label: "Waiting" },
  { id: "listening", label: "Listening" },
  { id: "thinking", label: "Thinking" },
  { id: "writing", label: "Writing" },
  { id: "happy", label: "Happy" },
];

const card: CSSProperties = {
  background: "#fff",
  borderRadius: 28,
  padding: 28,
  display: "flex",
  flexDirection: "column",
  gap: 24,
  minWidth: 0,
};

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

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <label style={{ display: "flex", alignItems: "center", gap: 8, minHeight: 40, fontSize: 14, color: MUTED, cursor: "pointer" }}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        style={{ width: 18, height: 18, accentColor: ACCENT }}
      />
      {label}
    </label>
  );
}

function Playground() {
  const [config, setConfig] = useState<AvatarConfig>(DEFAULT_CONFIG);
  const [mood, setMood] = useState<AvatarMood>("idle");
  const [follow, setFollow] = useState(true);
  const [followFocus, setFollowFocus] = useState(true);
  const [outline, setOutline] = useState(false);
  const [dark, setDark] = useState(false);
  const [spins, setSpins] = useState(0);

  const code = [
    "<AgentAvatar",
    `  shape="${config.shape}"`,
    `  color="${config.color}"`,
    `  fill="${config.fill}"`,
    `  eyes="${config.eyes}"`,
    `  eyeColor="${config.eyeColor}"`,
    `  mood="${mood}"`,
    ...(follow ? ["  followPointer"] : []),
    ...(followFocus ? ["  followFocus"] : []),
    ...(outline ? ["  outline"] : []),
    ...(spins ? ["  spin={turns}"] : []),
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
        <code style={{ fontSize: 14 }}>npm install @jamesalmeida/agent-avatars</code>
      </header>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 24, alignItems: "flex-start" }}>
        <section aria-label="Options" style={{ ...card, flex: "1 1 380px", ["--aa-editor-accent" as string]: ACCENT }}>
          <AvatarEditor value={config} onChange={setConfig} preview={false} outline={outline || undefined} />
        </section>

        <section aria-label="Preview" style={{ ...card, flex: "1 1 440px", gap: 20 }}>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <Segmented options={MOODS} value={mood} onChange={setMood} />
            <button
              type="button"
              onClick={() => setSpins((count) => count + 1)}
              style={{ minHeight: 44, padding: "0 18px", borderRadius: 999, border: 0, cursor: "pointer", background: ACCENT, color: "#fff" }}
            >
              Spin
            </button>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0 20px" }}>
            <Toggle label="Follow pointer" checked={follow} onChange={setFollow} />
            <Toggle label="Follow focus" checked={followFocus} onChange={setFollowFocus} />
            <Toggle label="Outline" checked={outline} onChange={setOutline} />
            <Toggle label="Dark background" checked={dark} onChange={setDark} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 20, padding: 20, borderRadius: 24, background: dark ? "#0b0b0b" : "#f1eee6" }}>
            <div style={{ height: 280, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <AgentAvatar
                {...config}
                mood={mood}
                size={240}
                followPointer={follow}
                followFocus={followFocus}
                outline={outline}
                spin={spins}
                label="Agent avatar preview"
              />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              {[20, 28, 40, 64].map((size) => (
                <AgentAvatar key={size} {...config} mood={mood} size={size} followPointer={follow} outline={outline} spin={spins} />
              ))}
            </div>
          </div>
          <p style={{ margin: "-8px 0 0", fontSize: 14, color: MUTED }}>
            {mood === "idle" && (follow || followFocus)
              ? `While it's waiting, its eyes ${[
                  follow ? "follow your mouse when it comes close" : "",
                  followFocus ? "look at whatever has focus (try tabbing)" : "",
                ]
                  .filter(Boolean)
                  .join(" and ")}.`
              : " "}
          </p>
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
