<script lang="ts">
  import type { PictureApi } from "api-types"
  import type { HTMLImgAttributes } from "svelte/elements"
  import Blurhash from "./Blurhash.svelte"

  export interface PictureProps
    extends Omit<
      HTMLImgAttributes,
      "alt" | "srcset" | "src" | "width" | "height" | "loading"
    > {
    pic: PictureApi
  }
  const { pic, style: styleProps, ...rest }: PictureProps = $props()
  const srcset = pic.sizes.map((s) => `${s.url} ${s.width}w`).join(",")
  const { alt, width, height } = pic
</script>

<div class="wrapper" style="aspect-ratio: {width / height};">
  <Blurhash blurhash={pic.blurhash} />
  <img {srcset} {alt} {width} {height} loading="lazy" {...rest} />
</div>

<style>
  .wrapper {
    position: relative;

    :global(canvas) {
      position: absolute;
      width: 100%;
      height: 100%;
    }
  }

  img {
    display: block;
    position: relative;
    height: 100%;
    width: 100%;
  }
</style>
