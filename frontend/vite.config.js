import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  server: {
    port: 5173,
    // Proxy /api calls to the Express backend during development.
    // In production, configure your reverse-proxy (nginx / Caddy) similarly.
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },

  build: {
    outDir: "dist",
    sourcemap: false,
    // Warn if any single chunk exceeds 800 kB
    chunkSizeWarningLimit: 800,
  },
});
