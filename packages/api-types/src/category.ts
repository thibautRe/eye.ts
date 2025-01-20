import type { PictureApi } from "."

interface CategoryApiBase {
  name: string
  directParents: { slug: string; name: string }[]
  directChildren: { slug: string; name: string }[]
}

export interface CategoryPictureApi extends CategoryApiBase {
  type: "picture"
  picture: PictureApi
  slug: undefined
}
// export interface CategoryPersonApi extends CategoryApiBase {
//   type: "person"
//   slug: string
// }
// export interface CategoryEventApi extends CategoryApiBase {
//   type: "event"
//   slug: string
// }
// export interface CategoryLocationApi extends CategoryApiBase {
//   type: "location"
//   slug: string
// }
export interface CategoryUntypedApi extends CategoryApiBase {
  type: null | undefined
  slug: string
}

export type CategoryApi = CategoryPictureApi | CategoryUntypedApi
// | CategoryPersonApi
// | CategoryEventApi
// | CategoryLocationApi
