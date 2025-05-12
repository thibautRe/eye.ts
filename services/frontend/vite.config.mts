import { defineConfig } from "vite"
import solidPlugin from "vite-plugin-solid"

export default defineConfig({
  // @ts-expect-error
  plugins: [solidPlugin()],
  build: { target: "esnext" },
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:5544/",
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
})
