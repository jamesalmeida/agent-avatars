import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  dts: true,
  clean: true,
  sourcemap: true,
  external: ["react"],
  // The component uses hooks, so React Server Components must treat it as client code.
  banner: { js: '"use client";' },
});
