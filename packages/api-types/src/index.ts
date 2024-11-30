import { type ID } from "core"

export interface PictureApi {
  id: ID<"picture">
  blurhash: string
  width: number
  height: number
}
