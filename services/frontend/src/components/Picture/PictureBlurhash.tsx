import { decode } from "blurhash"
import { onMount, type VoidComponent } from "solid-js"

const resolution = 32

export interface PictureBlurhashProps {
  blurhash: string
}
export const PictureBlurhash: VoidComponent<PictureBlurhashProps> = (p) => {
  let canvasElt: HTMLCanvasElement | undefined
  onMount(() => {
    canvasElt
      ?.getContext("2d")
      ?.putImageData(getData(p.blurhash, resolution), 0, 0)
  })
  return (
    <canvas
      ref={(canvas) => (canvasElt = canvas)}
      width={resolution}
      height={resolution}
    />
  )
}

const getData = (h: string, r: number) => new ImageData(decode(h, r, r), r, r)
