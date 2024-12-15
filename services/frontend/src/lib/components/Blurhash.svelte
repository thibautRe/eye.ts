<script module>
  import { decode } from "blurhash"
  const getData = (h: string, r: number) => new ImageData(decode(h, r, r), r, r)
</script>

<script lang="ts">
  import type { HTMLCanvasAttributes } from "svelte/elements"

  interface BlurhashProps
    extends Omit<HTMLCanvasAttributes, "width" | "height"> {
    blurhash: string
    resolution?: number
  }
  const { blurhash, resolution = 32, ...rest }: BlurhashProps = $props()
  let canvas: HTMLCanvasElement

  $effect(() => {
    canvas.getContext("2d")?.putImageData(getData(blurhash, resolution), 0, 0)
  })

  const className = rest.class
  export { className as class }
</script>

<canvas bind:this={canvas} width={resolution} height={resolution} {...rest}
></canvas>
