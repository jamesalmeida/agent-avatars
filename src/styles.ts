// Animations and transitions. Layout is inline on the elements, so the avatar
// renders correctly (just still) before this stylesheet is injected, e.g. in SSR.

export const STYLE_ELEMENT_ID = "agent-avatars-styles";

export const agentAvatarCss = `
.aa-avatar { --aa-spring: cubic-bezier(0.34, 1.56, 0.64, 1); }
.aa-frame { transform-origin: 50% 90%; transition: width .6s var(--aa-spring), height .6s var(--aa-spring); }
.aa-body { transition: background-color .5s ease, border-radius .6s var(--aa-spring), clip-path .6s var(--aa-spring), transform .6s var(--aa-spring); }
.aa-shine { transition: opacity .45s ease; }
.aa-outline { transition: border-radius .6s var(--aa-spring), clip-path .6s var(--aa-spring), transform .6s var(--aa-spring), background-color .5s ease; }
.aa-face, .aa-unrotate { transition: border-radius .6s var(--aa-spring), transform .6s var(--aa-spring); }
.aa-track { transition: transform .25s ease-out; }
.aa-avatar[data-tracking] .aa-look { animation: none; }
.aa-look { transition: gap .45s var(--aa-spring), margin-top .6s var(--aa-spring), transform .6s var(--aa-spring); }
.aa-eye { transform-origin: 50% 50%; transition: width .45s var(--aa-spring), height .45s var(--aa-spring), border-radius .45s ease, background-color .45s ease; animation: aa-blink 4.6s ease-in-out infinite; }
.aa-listening .aa-look { transform: translate(-3px, 10px); }
.aa-thinking .aa-look { transform: translate(8px, -11px); }
.aa-writing .aa-look { transform: translate(-10px, 6px); }
.aa-idle .aa-frame, .aa-listening .aa-frame { animation: aa-squish 4.6s ease-in-out infinite; }
.aa-idle .aa-look { animation: aa-glance 9s ease-in-out infinite; }
.aa-listening .aa-look { animation: aa-listen 2.4s ease-in-out infinite; }
.aa-thinking .aa-frame { animation: aa-tilt 3.6s ease-in-out infinite; }
.aa-thinking .aa-look { animation: aa-ponder 3.6s ease-in-out infinite; }
.aa-writing .aa-frame { animation: aa-bob 1.4s ease-in-out infinite; }
.aa-writing .aa-look { animation: aa-write 1.8s ease-in-out infinite; }
.aa-happy .aa-frame { animation: aa-hop 1.4s ease-out 2; }
.aa-turn-0 .aa-spin { animation: aa-turn-0 var(--aa-spin, 1.1s) linear; }
.aa-turn-1 .aa-spin { animation: aa-turn-1 var(--aa-spin, 1.1s) linear; }
.aa-turning .aa-frame { animation: aa-turn-body var(--aa-spin, 1.1s) ease-in-out; }
.aa-avatar.aa-still * { animation: none; transition: none; }
@media (prefers-reduced-motion: reduce) { .aa-avatar * { animation: none !important; transition: none !important; } }
@keyframes aa-blink { 0%, 90%, 96%, 100% { transform: scaleY(1); } 93% { transform: scaleY(.1); } }
@keyframes aa-squish { 0%, 89%, 100% { transform: scale(1, 1); } 92% { transform: scale(1.05, .94); } 95% { transform: scale(.98, 1.03); } }
@keyframes aa-glance { 0%, 28%, 78%, 100% { transform: translate(0, 0); } 34%, 50% { transform: translate(-8px, 1px); } 56%, 72% { transform: translate(7px, -3px); } }
@keyframes aa-listen { 0%, 100% { transform: translate(-3px, 10px); } 50% { transform: translate(-1px, 12px); } }
@keyframes aa-ponder { 0%, 36%, 100% { transform: translate(8px, -11px); } 50%, 86% { transform: translate(-8px, -11px); } }
@keyframes aa-tilt { 0%, 36%, 100% { transform: rotate(4deg) scale(1); } 18% { transform: rotate(4deg) scale(1.03); } 50%, 86% { transform: rotate(-4deg) scale(1); } 68% { transform: rotate(-4deg) scale(1.03); } }
@keyframes aa-write { 0% { transform: translate(-10px, 6px); } 78% { transform: translate(10px, 6px); } 100% { transform: translate(-10px, 6px); } }
@keyframes aa-bob { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-3px); } }
@keyframes aa-turn-0 { 0% { transform: translateX(0) scaleX(1); animation-timing-function: ease-out; } 16% { transform: translateX(-12px) scaleX(.94); animation-timing-function: ease-in; } 48% { transform: translateX(150px) scaleX(.4); animation-timing-function: step-end; } 48.01% { transform: translateX(-150px) scaleX(.4); animation-timing-function: ease-out; } 84% { transform: translateX(8px) scaleX(1.04); animation-timing-function: ease-in-out; } 100% { transform: translateX(0) scaleX(1); } }
@keyframes aa-turn-1 { 0% { transform: translateX(0) scaleX(1); animation-timing-function: ease-out; } 16% { transform: translateX(-12px) scaleX(.94); animation-timing-function: ease-in; } 48% { transform: translateX(150px) scaleX(.4); animation-timing-function: step-end; } 48.01% { transform: translateX(-150px) scaleX(.4); animation-timing-function: ease-out; } 84% { transform: translateX(8px) scaleX(1.04); animation-timing-function: ease-in-out; } 100% { transform: translateX(0) scaleX(1); } }
@keyframes aa-turn-body { 0%, 100% { transform: scale(1, 1); } 16% { transform: scale(1.03, .96); } 48% { transform: scale(.93, 1.02); } 84% { transform: scale(1.02, .99); } }
@keyframes aa-hop { 0%, 60%, 100% { transform: translateY(0) scale(1, 1); } 10% { transform: translateY(2px) scale(1.08, .9); } 25% { transform: translateY(-12px) scale(.95, 1.06); } 40% { transform: translateY(0) scale(1.04, .96); } }
`;

/** Adds the stylesheet to the document once. Safe to call many times; a no-op without a DOM. */
export function injectAgentAvatarStyles(doc: Document | undefined = typeof document === "undefined" ? undefined : document) {
  if (!doc || doc.getElementById(STYLE_ELEMENT_ID)) return;
  const style = doc.createElement("style");
  style.id = STYLE_ELEMENT_ID;
  style.textContent = agentAvatarCss;
  doc.head.appendChild(style);
}
