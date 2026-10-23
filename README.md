# agent-avatars

An animated face for your AI agent: a squishy shape with two eyes that blinks, listens, thinks, writes, smiles and spins.

<p align="center">
  <a href="https://jamesalmeida.github.io/agent-avatars/"><img src="assets/preview.svg" alt="Seven animated agent avatars in different shapes, colours and moods" width="900"></a>
</p>

<p align="center"><strong><a href="https://jamesalmeida.github.io/agent-avatars/">Try the playground →</a></strong></p>

- **Tiny:** about 3 KB gzipped, no dependencies (React is a peer).
- **Moods:** `idle`, `listening`, `thinking`, `writing`, `happy`.
- **Spins:** `spin` turns the face round: the eyes slide off one side and come back from the other.
- **Follows the pointer and focus:** with `followPointer`, the eyes look at the mouse when it comes close; with `followFocus`, at whatever has focus.
- **Settings UI included:** `<AvatarEditor>` gives any app an avatar settings panel with a live preview.
- **Works on dark backgrounds:** `outline` adds a subtle edge so a dark avatar doesn't disappear.
- **Customisable:** 6 shapes, preset or any hex colours, soft gradient or solid fill, 4 eye styles.
- **Smooth:** shape, colour and eye changes morph with a little spring.
- **Accessible:** respects `prefers-reduced-motion` (each mood keeps a still pose), decorative by default, `label` for an accessible name.
- **SSR friendly:** layout is inline; the animation stylesheet injects itself once on the client. Works in Next.js App Router (ships `"use client"`).

Made for Skaffen, the assistant on [jamesalmeida.me](https://www.jamesalmeida.me).

## Install

```bash
npm install @jamesalmeida/agent-avatars
```

## Use

```tsx
import { AgentAvatar } from "@jamesalmeida/agent-avatars";

<AgentAvatar mood="writing" />;

<AgentAvatar shape="blob" color="#c2410c" eyes="curious" size={40} label="Support bot" />;
```

A chat message avatar that reacts to the conversation:

```tsx
import { AgentAvatar, useHappyMoment } from "@jamesalmeida/agent-avatars";

function ReplyAvatar({ isLatest, isWaiting, isStreaming, userIsTyping, finishedTask }) {
  // Happy for ~3 s when a task finishes, then back to waiting.
  const isHappy = useHappyMoment(isLatest && finishedTask && !isStreaming);
  const mood = isWaiting
    ? "thinking" // sent, no tokens yet
    : isStreaming
      ? "writing"
      : isHappy
        ? "happy"
        : isLatest && userIsTyping
          ? "listening"
          : "idle";

  // Only animate the newest message; older avatars hold still.
  return <AgentAvatar mood={mood} animated={isLatest} />;
}
```

## Props

| Prop | Type | Default | |
| --- | --- | --- | --- |
| `mood` | `"idle" \| "listening" \| "thinking" \| "writing" \| "happy"` | `"idle"` | idle blinks and glances; listening looks down; thinking looks up and ponders, tilting side to side; writing looks down and scans like it's writing a line; happy squints and hops |
| `shape` | `"circle" \| "squircle" \| "pill" \| "blob" \| "drop" \| "hexagon"` | `"squircle"` | |
| `color` | `"slate" \| "teal" \| "ocean" \| "plum" \| "clay" \| "moss" \| "black"` or a hex colour | `"slate"` | |
| `fill` | `"gradient" \| "solid"` | `"gradient"` | |
| `eyes` | `"round" \| "tall" \| "calm" \| "curious"` | `"tall"` | |
| `eyeColor` | `"white" \| "cream" \| "mint" \| "ink"` or a hex colour | `"white"` | |
| `size` | `number` | `28` | width and height in px |
| `animated` | `boolean` | `true` | `false` holds a still pose |
| `followPointer` | `boolean \| number` | `false` | while idle, the eyes follow the mouse within this many px of the avatar (`true` = 240) |
| `followFocus` | `boolean` | `false` | while idle, the eyes look at whatever has keyboard focus (an input, a button) until the pointer moves |
| `outline` | `boolean \| string` | `false` | a thin outline around the body for dark backgrounds; `true` uses the `--aa-outline-color` CSS variable (default a soft white), a string is any CSS colour |
| `spin` | `number` | | each change plays one turn (a little wind-up, the eyes slide off one side and back in from the other); a counter works well, e.g. `spin={taps}`. Mounting doesn't spin |
| `spinMs` | `number` | `1100` | how long a turn takes |
| `label` | `string` | | accessible name; without it the avatar is `aria-hidden` |
| `className`, `style` | | | on the outer element |

Unknown values fall back to the defaults, so a bad setting never breaks rendering.

### Avatar settings

`<AvatarEditor>` is a ready-made settings panel: shape, colour (presets or any colour), fill, eyes and eye colour, with an optional live preview and mood switcher. It is controlled, so you save what it gives you.

```tsx
import { AgentAvatar, AvatarEditor, type AvatarConfig } from "@jamesalmeida/agent-avatars";

function AvatarSettings({ saved, onSave }: { saved: AvatarConfig; onSave: (config: AvatarConfig) => void }) {
  const [draft, setDraft] = useState(saved);
  return (
    <>
      <AvatarEditor value={draft} onChange={setDraft} />
      <button onClick={() => onSave(draft)}>Save</button>
    </>
  );
}
```

| Prop | Type | Default | |
| --- | --- | --- | --- |
| `value` | `Partial<AvatarConfig>` | | the avatar being edited |
| `onChange` | `(next: AvatarConfig) => void` | | called with the full config on every change |
| `preview` | `boolean` | `true` | a live preview with a mood switcher above the options |
| `previewSize` | `number` | `140` | |
| `followPointer` | `boolean \| number` | `true` | for the preview |
| `outline` | `boolean \| string` | | for the preview and the shape tiles |
| `className`, `style` | | | on the outer element |

It inherits your font and text colour. Theme the rest with CSS variables on it or any parent: `--aa-editor-accent` (selected outlines), `--aa-editor-text`, `--aa-editor-muted`, `--aa-editor-border`, `--aa-editor-control` (tracks and tiles), `--aa-editor-selected` (selected pill) and `--aa-editor-ring` (the gap around a selected swatch; your background colour).

### Dark backgrounds

`outline` draws a thin edge around the body. With `outline={true}` the colour comes from `--aa-outline-color`, so one CSS rule can show it only in dark mode:

```css
:root { --aa-outline-color: transparent; }
.dark { --aa-outline-color: rgba(255, 255, 255, 0.28); }
```

### Also exported

- `useHappyMoment(active, ms = 2800)`: true for `ms` after `active` turns on.
- `lookOffset(dx, dy, size, radius)`: where the eyes look for a pointer offset (used by `followPointer`).
- `SHAPES`, `COLORS`, `EYES`, `EYE_COLORS`, `DEFAULT_CONFIG`: the presets, with labels, for building a settings UI.
- `resolveConfig(input)`: validates untrusted settings (e.g. from a CMS or a settings store).
- `agentAvatarCss`, `injectAgentAvatarStyles()`: the stylesheet, if you'd rather render it yourself (e.g. with a strict CSP nonce).

## Develop

```bash
npm install
npm run dev          # playground at http://localhost:5173
npm test
npm run preview:svg  # regenerate assets/preview.svg after changing presets
npm run build
```

The playground deploys to GitHub Pages on every push to `main` (the Pages workflow).

## Release

Bump `version` in `package.json`, push, then publish a GitHub release tagged with that version (`0.2.0` or `v0.2.0`), or run the Release workflow by hand from the Actions tab. The Release workflow publishes to npm with provenance, using npm Trusted Publishing (no token).

## License

MIT © James Almeida
