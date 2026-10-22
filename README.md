# agent-avatars

An animated face for your AI agent: a squishy shape with two eyes that blinks, listens, writes and smiles.

<p align="center">
  <a href="https://jamesalmeida.github.io/agent-avatars/"><img src="assets/preview.svg" alt="Seven animated agent avatars in different shapes, colours and moods" width="900"></a>
</p>

<p align="center"><strong><a href="https://jamesalmeida.github.io/agent-avatars/">Try the playground →</a></strong></p>

- **Tiny:** about 3 KB gzipped, no dependencies (React is a peer).
- **Moods:** `idle`, `listening`, `writing`, `happy`.
- **Follows the pointer:** with `followPointer`, the eyes look at the mouse when it comes close.
- **Customisable:** 6 shapes, preset or any hex colours, soft gradient or solid fill, 4 eye styles.
- **Smooth:** shape, colour and eye changes morph with a little spring.
- **Accessible:** respects `prefers-reduced-motion` (each mood keeps a still pose), decorative by default, `label` for an accessible name.
- **SSR friendly:** layout is inline; the animation stylesheet injects itself once on the client. Works in Next.js App Router (ships `"use client"`).

Made for Skaffen, the assistant on [jamesalmeida.me](https://www.jamesalmeida.me).

## Install

```bash
npm install @general-system-ventures/agent-avatars
```

## Use

```tsx
import { AgentAvatar } from "@general-system-ventures/agent-avatars";

<AgentAvatar mood="writing" />;

<AgentAvatar shape="blob" color="#c2410c" eyes="curious" size={40} label="Support bot" />;
```

A chat message avatar that reacts to the conversation:

```tsx
import { AgentAvatar, useHappyMoment } from "@general-system-ventures/agent-avatars";

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
| `followPointer` | `boolean \| number` | `false` | while idle, the eyes follow the mouse within this many px of the avatar (`true` = 240) |
| `label` | `string` | | accessible name; without it the avatar is `aria-hidden` |
| `className`, `style` | | | on the outer element |

Unknown values fall back to the defaults, so a bad setting never breaks rendering.

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

Bump `version` in `package.json`, push, then publish a GitHub release tagged `v<version>`. The Release workflow publishes to npm with provenance (needs the `NPM_TOKEN` secret).

## License

MIT © James Almeida
