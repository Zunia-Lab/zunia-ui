import { defineConfig } from "tsup";

/**
 * Built file-per-file instead of bundled.
 *
 * A single bundled entry loses the per-file `"use client"` directives, which
 * makes every component look like a server module to a React Server Components
 * consumer and crashes on the first `createContext` call. Keeping the file
 * structure keeps each boundary where the source put it, and leaves `lib/cn.ts`
 * usable from a server component.
 */
export default defineConfig({
  entry: ["src/**/*.ts", "src/**/*.tsx"],
  format: ["esm"],
  bundle: false,
  dts: false,
  clean: true,
  outDir: "dist",
  target: "es2022",
  sourcemap: false,
});
