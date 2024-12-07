import { defineConfig } from "@solidjs/start/config"

export default defineConfig({
  server: {
    devProxy: {
      "/api": "http://localhost:5544/api",
    },
  },
})
