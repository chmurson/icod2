import { defineConfig, mergeConfig } from "vitest/config";
import viteConfig from "./vite.config";

export default defineConfig((...args) =>
  mergeConfig(
    viteConfig(...args),
    defineConfig({
      test: {},
    }),
  ),
);
