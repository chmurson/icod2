import { join, parse, relative, sep } from "node:path";
import { fileURLToPath, URL } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { visualizer } from "rollup-plugin-visualizer";
import { defineConfig, type UserConfig } from "vite";

const namedFacades: Record<string, string> = {
  "src/components/Box/sub-pages/RestoreBoxes/LockedBox.tsx": "open-locked-box",
  "src/components/Box/sub-pages/CreationBoxes/index.ts": "lock-box",
};

const __dirname = fileURLToPath(new URL(".", import.meta.url));

// https://vite.dev/config/
export default defineConfig(() => {
  return {
    server: {
      allowedHosts: ["marcus-publication-declared-guardian.trycloudflare.com"],
    },
    plugins: [
      react(),
      tailwindcss(),
      visualizer({
        template: "flamegraph",
        gzipSize: true,
        projectRoot: join(__dirname, ".."),
      }),
    ],
    resolve: {
      alias: {
        "@/ui": fileURLToPath(new URL("./src/components/ui", import.meta.url)),
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            react: ["react", "react-dom", "react-dom/client"],
            // zustand: ["zustand"],
            // zod: ["zod"],
          },
          chunkFileNames: (chunkInfo) => {
            // 1) exact control for *facade* chunks (usual case for dynamic imports)
            if (chunkInfo.facadeModuleId) {
              const rel = relative(process.cwd(), chunkInfo.facadeModuleId)
                .split(sep)
                .join("/");
              const custom = namedFacades[rel];
              if (custom) return `assets/${custom}-[hash].js`;

              // fallback: use the file basename as name
              const base = parse(rel).name; // e.g., LoginModal -> assets/LoginModal-xxxx.js
              return `assets/${base}-[hash].js`;
            }

            // 2) control *shared* chunks (no facade) by inspecting included modules
            if (
              chunkInfo.moduleIds.some((id) => {
                return id.includes("/node_modules/libp2p/");
              })
            ) {
              return "assets/heavy-commons-[hash].js";
            }

            // fallback
            return "assets/[name]-[hash].js";
          },
        },
      },
    },
  } satisfies UserConfig;
});
