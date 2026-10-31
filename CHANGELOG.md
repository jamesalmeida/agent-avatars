# Changelog

Releases of agent-avatars. Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
The README documents the current API; this file records what changed in each release.

## 0.6.0

### Added

- `speaking`: the avatar chatters without audio — the body pulses and the eyes bob in syllables and words, e.g. while a reply streams in. Ignored when `level` is set, and off with reduced motion.
- The editor preview gains a speaking control alongside mood and gesture.

## 0.5.1

### Fixed

- Falling asleep closes the eyes to thin lines, slowly from drowsy, instead of switching to arcs; waking springs them open again.

## 0.5.0

### Added

- Twelve new moods — `working`, `searching`, `reading`, `focused`, `love`, `surprised`, `confused`, `sorry`, `dizzy`, `drowsy`, `asleep` and `idle` — for 16 in all, in a shared `MOODS` table.
- Gestures `nod`, `shake`, `wink`, `jump`, `wiggle`, `peek` and `spin` through the `gesture` prop and `useGesture()`; they play once on top of any mood.
- `interactive` (hover gets attention, a poke squashes it, stroking makes it happy) and `sleepAfter` (drowses off when the page is quiet, wakes with a start). Both are off by default.
- `level` / `--aa-level` for speech loudness, `lookAt`, `avatarFromSeed`, `useAgentMood` / `moodForChat` for AI SDK chat status, and `useHappyMoment`.
- `AvatarEditor` gains behaviour options, gesture buttons and a fake **Speak** in its preview; `behaviour={false}` gives a look-only editor.

### Changed

- Avatars on a page start their blink loops at different points, so they no longer blink in unison.
- Prerelease versions publish to npm under the `next` tag, so `npm install` keeps getting the latest stable release.
