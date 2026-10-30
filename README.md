# agent-avatars

An animated face for your AI agent: a squishy shape with two eyes that blinks, listens, thinks, works, reads, writes, smiles, startles, puzzles, nods, winks, dozes off and spins.

<p align="center">
  <a href="https://jamesalmeida.github.io/agent-avatars/"><img src="assets/preview.svg" alt="Seven animated agent avatars in different shapes, colours and moods" width="900"></a>
</p>

<p align="center"><strong><a href="https://jamesalmeida.github.io/agent-avatars/">Try the playground →</a></strong></p>

- **Small:** about 10 KB minified and gzipped, settings panel included; no dependencies (React is a peer).
- **16 moods:** `idle`, `listening`, `thinking`, `working`, `searching`, `reading`, `writing`, `focused`, `happy`, `love`, `surprised`, `confused`, `sorry`, `dizzy`, `drowsy`, `asleep`.
- **Gestures:** `nod`, `shake`, `wink`, `jump`, `wiggle`, `peek` and `spin` play once, on top of any mood.
- **Feels alive:** avatars on a page blink out of step; with `interactive` a poke startles it and stroking it makes it happy; with `sleepAfter` it dozes off when the page is quiet and wakes with a start.
- **Talks:** `level` (or the `--aa-level` CSS variable) makes it pulse with speech loudness.
- **Looks around:** with `followPointer`, the eyes look at the mouse when it comes close; with `followFocus`, at whatever has focus; with `lookAt`, at any element or point.
- **Chat-ready:** `useAgentMood(status)` picks the mood from an AI SDK chat status.
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

A chat avatar that reacts to the conversation (AI SDK `useChat`):

```tsx
import { AgentAvatar, useAgentMood } from "@jamesalmeida/agent-avatars";

function ChatAvatar({ status, input }) {
  // thinking → writing → happy for ~3 s when the reply finishes → idle;
  // listening while the user types; sorry on an error.
  const mood = useAgentMood(status, { isTyping: input.length > 0 });
  return <AgentAvatar mood={mood} interactive sleepAfter={60_000} followPointer />;
}
```

Gestures play once, on top of the mood:

```tsx
import { AgentAvatar, useGesture } from "@jamesalmeida/agent-avatars";

function Confirm() {
  const [gesture, play] = useGesture();
  return (
    <>
      <AgentAvatar gesture={gesture} />
      <button onClick={() => play("nod")}>Yes</button>
      <button onClick={() => play("shake")}>No</button>
    </>
  );
}
```

On older messages, `animated={false}` holds a still pose.

## Props

| Prop | Type | Default | |
| --- | --- | --- | --- |
| `mood` | see [Moods](#moods) | `"idle"` | |
| `shape` | `"circle" \| "squircle" \| "pill" \| "blob" \| "drop" \| "hexagon"` | `"squircle"` | |
| `color` | `"slate" \| "teal" \| "ocean" \| "plum" \| "clay" \| "moss" \| "black"` or a hex colour | `"slate"` | |
| `fill` | `"gradient" \| "solid"` | `"gradient"` | |
| `eyes` | `"round" \| "tall" \| "calm" \| "curious"` | `"tall"` | |
| `eyeColor` | `"white" \| "cream" \| "mint" \| "ink"` or a hex colour | `"white"` | |
| `interactive` | `boolean` | `false` | reacts to the pointer: hovering gets its attention (the eyes widen a little), a poke squashes and startles it, stroking back and forth over it makes it happy |
| `sleepAfter` | `number` | `0` | while idle, after this many ms with no activity on the page (pointer, keys, scrolling) it gets drowsy, then falls asleep 8 s later; activity wakes it with a start. `0` = never |
| `size` | `number` | `28` | width and height in px |
| `animated` | `boolean` | `true` | `false` holds a still pose |
| `followPointer` | `boolean \| number` | `false` | while idle, the eyes follow the mouse within this many px of the avatar (`true` = 240) |
| `followFocus` | `boolean` | `false` | while idle, the eyes look at whatever has keyboard focus (an input, a button) until the pointer moves |
| `lookAt` | `Element \| RefObject \| { x, y }` | | while idle, the eyes look at this element or point (viewport px), e.g. whoever is speaking in a multi-agent chat; wins over the pointer and focus |
| `outline` | `boolean \| string` | `false` | a thin outline around the body for dark backgrounds; `true` uses the `--aa-outline-color` CSS variable (default a soft white), a string is any CSS colour |
| `spin` | `number` | | each change plays one turn (a little wind-up, the eyes slide off one side and back in from the other); a counter works well, e.g. `spin={taps}`. Mounting doesn't spin |
| `spinMs` | `number` | `1100` | how long a turn takes |
| `gesture` | `{ name, id }` | | plays the gesture `name` (`"nod" \| "shake" \| "wink" \| "jump" \| "wiggle" \| "peek" \| "spin"`) each time `id` changes; `useGesture()` makes one. Mounting doesn't play |
| `level` | `number` | | speech loudness, 0 to 1 (e.g. from text-to-speech audio): the body pulses and the eyes bob. To skip a re-render every frame, set the `--aa-level` CSS variable on a parent instead |
| `label` | `string` | | accessible name; without it the avatar is `aria-hidden` |
| `className`, `style` | | | on the outer element |

Unknown values fall back to the defaults, so a bad setting never breaks rendering. Each avatar starts its blink and glance loops at its own point, so a page full of them doesn't blink in unison.

### Moods

| Mood | Looks like | For example |
| --- | --- | --- |
| `idle` | blinks with a little squish and glances around | waiting |
| `listening` | looks down | the user is typing |
| `thinking` | looks up and ponders, tilting side to side | before a reply starts |
| `working` | the eyes circle like a loading spinner | a tool call or long task |
| `searching` | wide sweeps side to side | a web or file search |
| `reading` | skims down a page line by line | reading a file or a link |
| `writing` | looks down and scans like it's writing a line | a reply is streaming |
| `focused` | narrowed eyes, leaning in | a hard step, like running tests |
| `happy` | squints and hops | a task is done |
| `love` | heart eyes that beat | the user says thanks |
| `surprised` | jumps and stares wide-eyed | an unexpected result |
| `confused` | tilts its head; the eyes go round and askew, then keep swapping sizes | an unclear request |
| `sorry` | droopy eyes looking down, sagging | a task failed |
| `dizzy` | spinning × eyes and a wobble | an error |
| `drowsy` | heavy eyelids, nodding off | the page has been quiet |
| `asleep` | eyes shut to thin lines (from `drowsy` they close slowly), breathing slowly | the page has been quiet a while |

### Avatar settings

`<AvatarEditor>` is a ready-made settings panel: shape, colour (presets or any colour), fill, eyes, eye colour, pokes and petting (`interactive`) and falling asleep (`sleepAfter`), with an optional live preview where you can try every mood and gesture and make it speak. It is controlled, so you save what it gives you.

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
| `preview` | `boolean` | `true` | a live preview with mood, gesture and speaking controls above the options |
| `previewSize` | `number` | `140` | |
| `followPointer` | `boolean \| number` | `true` | for the preview |
| `outline` | `boolean \| string` | | for the preview and the shape tiles |
| `behaviour` | `boolean` | `true` | show the pokes-and-petting and falling-asleep options; `false` for a look-only editor |
| `className`, `style` | | | on the outer element |

It inherits your font and text colour. Theme the rest with CSS variables on it or any parent: `--aa-editor-accent` (selected outlines), `--aa-editor-text`, `--aa-editor-muted`, `--aa-editor-border`, `--aa-editor-control` (tracks and tiles), `--aa-editor-selected` (selected pill) and `--aa-editor-ring` (the gap around a selected swatch; your background colour).

### Dark backgrounds

`outline` draws a thin edge around the body. With `outline={true}` the colour comes from `--aa-outline-color`, so one CSS rule can show it only in dark mode:

```css
:root { --aa-outline-color: transparent; }
.dark { --aa-outline-color: rgba(255, 255, 255, 0.28); }
```

### Also exported

- `useAgentMood(status, { isTyping, happyMs = 2800, errorMood = "sorry" })`: the mood for an AI SDK chat status (`submitted`, `streaming`, `ready`, `error`); `moodForChat(...)` is the same mapping without the happy-moment timer.
- `useGesture()`: `[gesture, play]` for the `gesture` prop.
- `useHappyMoment(active, ms = 2800)`: true for `ms` after `active` turns on.
- `avatarFromSeed(name)`: a look picked from a name, the same every time (like an identicon), e.g. one avatar per agent without anyone choosing.
- `lookOffset(dx, dy, size, radius)`: where the eyes look for a pointer offset (used by `followPointer`).
- `SHAPES`, `COLORS`, `EYES`, `EYE_COLORS`, `MOODS`, `GESTURES`, `DEFAULT_CONFIG`: the presets, with labels, for building a settings UI.
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

A prerelease version (`0.5.0-beta.0`) publishes under the `next` tag, so `npm install` keeps getting the latest stable version; install it with `npm install @jamesalmeida/agent-avatars@next`. To try one before merging, run the Release workflow on the branch.

## License

MIT © James Almeida
