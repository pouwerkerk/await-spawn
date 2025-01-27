import { defineConfig } from "tsup";

export default defineConfig({
  clean: true,
  entry: ["src/spawn.ts"],
  format: ["cjs", "esm"],
  dts: true,
  target: "node20",
});
