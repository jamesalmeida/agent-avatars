import { describe, expect, it } from "vitest";
import { COLORS, DEFAULT_CONFIG, EYES, EYE_COLORS, SHAPES, avatarStyles, resolveConfig } from "./config";
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

  it("does nothing without a document", () => {
    expect(() => injectAgentAvatarStyles(undefined)).not.toThrow();
  });
});
