import { fileURLToPath, URL } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { visualizer } from "rollup-plugin-visualizer";
import { defineConfig, loadEnv, type UserConfig } from "vite";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());
  const signalingServerUrl = `ws://${env.VITE_SIGNALING_HOSTNAME}:${env.VITE_SIGNALING_PORT}`;
  console.log(`Vite: Frontned calls Signaling Server at: ${signalingServerUrl}
    `);
  return {
    plugins: [
      react(),
      tailwindcss(),
      visualizer({
        filename: "dist/stats.html",
        open: mode === "analyze",
        gzipSize: true,
        brotliSize: true,
      }),
    ],
    resolve: {
      alias: {
        "@/ui": fileURLToPath(new URL("./src/components/ui", import.meta.url)),
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
    build: {
      cssCodeSplit: true,
      sourcemap: false,
      minify: "esbuild",
      rollupOptions: {
        output: {
          manualChunks: undefined,
        },
        treeshake: {
          moduleSideEffects: false,
          propertyReadSideEffects: false,
          unknownGlobalSideEffects: false,
        },
      },
    },
    css: {
      devSourcemap: false,
    },
    optimizeDeps: {
      include: ["react", "react-dom", "@radix-ui/themes"],
      exclude: [],
    },
  } satisfies UserConfig;
});
