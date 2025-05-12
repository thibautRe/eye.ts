import { defineConfig, defineTextStyles } from "@pandacss/dev"

export default defineConfig({
  // Whether to use css reset
  preflight: true,

  // Where to look for your css declarations
  include: ["./src/**/*.{js,jsx,ts,tsx}"],

  exclude: [],
  theme: {
    extend: {
      textStyles: defineTextStyles({
        mainTitle: {
          description: "Main Title for pages",
          value: {
            lineHeight: 1.8,
            fontFamily: "serif",
            fontSize: "5xl",
            fontWeight: "extrabold",
          },
        },
      }),
    },
  },

  // The output directory for your css system
  outdir: "styled-system",
})
