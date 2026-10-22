# agent-avatar

An animated face for your AI agent: a squishy shape with two eyes that blinks, listens, writes and smiles.

- **Tiny:** about 3 KB gzipped, no dependencies (React is a peer).
- **Moods:** `idle`, `listening`, `writing`, `happy`.
- **Customisable:** 6 shapes, preset or any hex colours, soft gradient or solid fill, 4 eye styles.
- **Smooth:** shape, colour and eye changes morph with a little spring.
- **Accessible:** respects `prefers-reduced-motion` (each mood keeps a still pose), decorative by default, `label` for an accessible name.
- **SSR friendly:** layout is inline; the animation stylesheet injects itself once on the client. Works in Next.js App Router (ships `"use client"`).

Made for Skaffen, the assistant on [jamesalmeida.me](https://www.jamesalmeida.me).

## Install

```bash
npm install @jamesalmeida/agent-avatar
```

## Use

```tsx
import { AgentAvatar } from "@jamesalmeida/agent-avatar";

<AgentAvatar mood="writing" />;

<AgentAvatar shape="blob" color="#c2410c" eyes="curious" size={40} label="Support bot" />;
```

A chat message avatar that reacts to the conversation:

```tsx
import { AgentAvatar, useHappyMoment } from "@jamesalmeida/agent-avatar";

function ReplyAvatar({ isLatest, isStreaming, userIsTyping, finishedTask }) {
  // Happy for ~3 s when a task finishes, then back to waiting.
  const isHappy = useHappyMoment(isLatest && finishedTask && !isStreaming);
  const mood = isStreaming ? "writing" : isHappy ? "happy" : isLatest && userIsTyping ? "listening" : "idle";

  // Only animate the newest message; older avatars hold still.
  return <AgentAvatar mood={mood} animated={isLatest} />;
}
```

## Props

| Prop | Type | Default | |
| --- | --- | --- | --- |
| `mood` | `"idle" \| "listening" \| "writing" \| "happy"` | `"idle"` | idle blinks and glances; listening looks down; writing looks up and scans; happy squints and hops |
| `shape` | `"circle" \| "squircle" \| "pill" \| "blob" \| "drop" \| "hexagon"` | `"squircle"` | |
| `color` | `"slate" \| "teal" \| "ocean" \| "plum" \| "clay" \| "moss" \| "black"` or a hex colour | `"slate"` | |
| `fill` | `"gradient" \| "solid"` | `"gradient"` | |
| `eyes` | `"round" \| "tall" \| "calm" \| "curious"` | `"tall"` | |
| `eyeColor` | `"white" \| "cream" \| "mint" \| "ink"` or a hex colour | `"white"` | |
| `size` | `number` | `28` | width and height in px |
| `animated` | `boolean` | `true` | `false` holds a still pose |
| `label` | `string` | | accessible name; without it the avatar is `aria-hidden` |
| `className`, `style` | | | on the outer element |

Unknown values fall back to the defaults, so a bad setting never breaks rendering.

### Also exported

- `useHappyMoment(active, ms = 2800)`: true for `ms` after `active` turns on.
- `SHAPES`, `COLORS`, `EYES`, `EYE_COLORS`, `DEFAULT_CONFIG`: the presets, with labels, for building a settings UI.
- `resolveConfig(input)`: validates untrusted settings (e.g. from a CMS or a settings store).
- `agentAvatarCss`, `injectAgentAvatarStyles()`: the stylesheet, if you'd rather render it yourself (e.g. with a strict CSP nonce).

## Develop

```bash
npm install
npm run dev        # playground at http://localhost:5173
npm test
npm run build
```

## Release

Bump `version` in `package.json`, push, then publish a GitHub release tagged `v<version>`. The Release workflow publishes to npm with provenance (needs the `NPM_TOKEN` secret).

## License

MIT © James Almeida
