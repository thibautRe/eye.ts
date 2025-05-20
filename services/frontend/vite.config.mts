import { defineConfig } from "vite"
import solidPlugin from "vite-plugin-solid"
import devtools from "solid-devtools/vite"

export default defineConfig({
  // @ts-expect-error
  plugins: [devtools({ autoname: true }), solidPlugin()],
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
