import type { PictureApi } from "api-types"
import { type VoidComponent } from "solid-js"
import { PictureBlurhash } from "./PictureBlurhash"
import { css } from "../../../styled-system/css"

export interface PictureProps {
  picture: PictureApi
  sizes: string
}
export const Picture: VoidComponent<PictureProps> = (p) => {
  const srcset = () =>
    p.picture.sizes.map((s) => `${s.url} ${s.width}w`).join(",")
  return (
    <div
      class={wrapper}
      style={{ "aspect-ratio": p.picture.width / p.picture.height }}
    >
      <PictureBlurhash blurhash={p.picture.blurhash} />
      <img
        class={img}
        srcset={srcset()}
        sizes={p.sizes}
        width={p.picture.width}
        height={p.picture.height}
        alt={p.picture.alt}
        loading="lazy"
      />
    </div>
  )
}

const wrapper = css({
  position: "relative",

  "& canvas": {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
})
const img = css({
  display: "block",
  position: "relative",
  height: "100%",
  width: "100%",
  objectFit: "cover",
})
