import { fileURLToPath, URL } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv, type UserConfig } from "vite";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());
  const signalingServerUrl = `ws://${env.VITE_SIGNALING_HOSTNAME}:${env.VITE_SIGNALING_PORT}`;
  console.log(`Frontned calls Signaling Server at: ${signalingServerUrl}
    `);
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@/ui": fileURLToPath(new URL("./src/components/ui", import.meta.url)),
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
  } satisfies UserConfig;
});
