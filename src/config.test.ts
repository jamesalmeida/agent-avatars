import { describe, expect, it } from "vitest";
import {
  COLORS,
  DEFAULT_CONFIG,
  EYES,
  EYE_COLORS,
  GESTURES,
  LOOK_RANGE,
  MAX_SLEEP_AFTER,
  MOODS,
  SHAPES,
  avatarFromSeed,
  avatarStyles,
  lookOffset,
  moodForChat,
  resolveConfig,
} from "./config";
import { STYLE_ELEMENT_ID, agentAvatarCss, injectAgentAvatarStyles } from "./styles";

describe("resolveConfig", () => {
  it("falls back to the default for missing or unknown options", () => {
    expect(resolveConfig()).toEqual(DEFAULT_CONFIG);
    expect(
      resolveConfig({ shape: "triangle", color: 3, fill: "neon", eyes: "toString", eyeColor: "red; x: y" }),
    ).toEqual(DEFAULT_CONFIG);
  });

  it("accepts every preset", () => {
    for (const shape of Object.keys(SHAPES)) expect(resolveConfig({ shape }).shape).toBe(shape);
    for (const color of Object.keys(COLORS)) expect(resolveConfig({ color }).color).toBe(color);
    for (const eyes of Object.keys(EYES)) expect(resolveConfig({ eyes }).eyes).toBe(eyes);
    for (const eyeColor of Object.keys(EYE_COLORS)) expect(resolveConfig({ eyeColor }).eyeColor).toBe(eyeColor);
    expect(resolveConfig({ fill: "solid" }).fill).toBe("solid");
  });

  it("accepts the behaviour options and rejects bad ones", () => {
    expect(resolveConfig({ interactive: true, sleepAfter: 60_000 })).toMatchObject({ interactive: true, sleepAfter: 60_000 });
    for (const sleepAfter of [-1, MAX_SLEEP_AFTER + 1, Number.NaN, Number.POSITIVE_INFINITY, "60000"]) {
      expect(resolveConfig({ sleepAfter }).sleepAfter).toBe(DEFAULT_CONFIG.sleepAfter);
    }
    expect(resolveConfig({ interactive: "yes" }).interactive).toBe(false);
  });

  it("accepts hex colours and rejects other strings", () => {
    expect(resolveConfig({ color: "#ff8800", eyeColor: "#fff" })).toMatchObject({ color: "#ff8800", eyeColor: "#fff" });
    expect(resolveConfig({ color: "url(x)" }).color).toBe(DEFAULT_CONFIG.color);
  });
});

describe("avatarStyles", () => {
  it("maps presets and hex values to colours", () => {
    const styles = avatarStyles({ ...DEFAULT_CONFIG, color: "clay", fill: "solid", eyeColor: "#123456" });
    expect(styles.body.backgroundColor).toBe(COLORS.clay.value);
    expect(styles.shineOpacity).toBe(0);
    expect(styles.leftEye.backgroundColor).toBe("#123456");
  });

  it("gives every shape a six-point clip so shapes can morph into each other", () => {
    for (const shape of Object.keys(SHAPES) as (keyof typeof SHAPES)[]) {
      const { clipPath } = avatarStyles({ ...DEFAULT_CONFIG, shape }).body;
      expect(clipPath.match(/%,|%\)/g)?.length).toBe(6);
    }
  });
});

describe("injectAgentAvatarStyles", () => {
  it("adds the stylesheet once", () => {
    const appended: { id: string; textContent: string }[] = [];
    const doc = {
      getElementById: (id: string) => appended.find((el) => el.id === id) ?? null,
      createElement: () => ({ id: "", textContent: "" }),
      head: { appendChild: (el: { id: string; textContent: string }) => appended.push(el) },
    } as unknown as Document;
    injectAgentAvatarStyles(doc);
    injectAgentAvatarStyles(doc);
    expect(appended).toHaveLength(1);
    expect(appended[0]).toMatchObject({ id: STYLE_ELEMENT_ID, textContent: agentAvatarCss });
  });

  it("animates every mood", () => {
    for (const mood of Object.keys(MOODS)) expect(agentAvatarCss).toContain(`.aa-${mood} .aa-`);
  });

  it("has every gesture", () => {
    for (const gesture of [...Object.keys(GESTURES), "boop"]) expect(agentAvatarCss).toContain(`.aa-g-${gesture}.aa-p0 `);
  });

  it("does nothing without a document", () => {
    expect(() => injectAgentAvatarStyles(undefined)).not.toThrow();
  });
});

describe("lookOffset", () => {
  it("looks toward the pointer, reaching full range one avatar-width away", () => {
    expect(lookOffset(100, 0, 100, 240)).toEqual({ x: LOOK_RANGE.x, y: 0 });
    expect(lookOffset(0, -50, 100, 240)).toEqual({ x: 0, y: -LOOK_RANGE.y / 2 });
  });

  it("stops following beyond the radius from the avatar's edge", () => {
    expect(lookOffset(290, 0, 100, 240)).not.toBeNull();
    expect(lookOffset(291, 0, 100, 240)).toBeNull();
  });

  it("looks straight ahead when the pointer is on the centre", () => {
    expect(lookOffset(0, 0, 100, 240)).toEqual({ x: 0, y: 0 });
  });
});

describe("avatarFromSeed", () => {
  it("gives the same valid look for the same name", () => {
    expect(avatarFromSeed("Skaffen")).toEqual(avatarFromSeed("Skaffen"));
    for (const name of ["Skaffen", "Ada", "", "🦊"]) {
      const config = avatarFromSeed(name);
      expect(resolveConfig(config)).toEqual(config);
    }
  });

  it("spreads names across the options", () => {
    const looks = new Set(Array.from({ length: 40 }, (_, i) => JSON.stringify(avatarFromSeed(`agent-${i}`))));
    const shapes = new Set(Array.from({ length: 40 }, (_, i) => avatarFromSeed(`agent-${i}`).shape));
    expect(looks.size).toBeGreaterThan(30);
    expect(shapes.size).toBe(Object.keys(SHAPES).length);
  });
});

describe("moodForChat", () => {
  it("maps each chat status to a mood", () => {
    expect(moodForChat({ status: "submitted" })).toBe("thinking");
    expect(moodForChat({ status: "streaming", isHappy: true })).toBe("writing");
    expect(moodForChat({ status: "error" })).toBe("sorry");
    expect(moodForChat({ status: "error", errorMood: "dizzy" })).toBe("dizzy");
    expect(moodForChat({ status: "ready", isHappy: true, isTyping: true })).toBe("happy");
    expect(moodForChat({ status: "ready", isTyping: true })).toBe("listening");
    expect(moodForChat({ status: undefined })).toBe("idle");
  });
});
