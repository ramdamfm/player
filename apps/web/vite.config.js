import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5173,
    proxy: {
      "/api/nowplaying": {
        target: "https://azuracast.ramdam.fm",
        changeOrigin: true,
        secure: true,
      },
      "/api/cover": {
        target: "https://itunes.apple.com",
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api\/cover/, "/search"),
      },
    },
  },
});
