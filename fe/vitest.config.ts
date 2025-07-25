import { defineConfig, mergeConfig } from "vitest/config";
import viteConfig from "./vite.config";

export default defineConfig((...args) =>
  mergeConfig(
    viteConfig(...args),
    defineConfig({
      test: {
        environment: "jsdom",
        setupFiles: ["./src/test/setup.ts"],
        globals: true,
      },
    }),
  ),
);
