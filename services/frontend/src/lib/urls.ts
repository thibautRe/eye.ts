// THIS FILE REPRESENTS THE CLIENT'S URLs

import type { PictureId } from "core"

const optSp = (sp: URLSearchParams) => {
  const spStr = sp.toString()
  if (!spStr) return ""
  return `?${spStr}`
}

export const makeCategoriesUrl = (
  { orphan }: { orphan: boolean } = { orphan: false },
) => {
  const sp = new URLSearchParams()
  if (orphan) sp.set("orphan", "")
  return `/categories${optSp(sp)}`
}
export const makeCategoryUrl = (slug: string) =>
  `${makeCategoriesUrl()}/${slug}`
export const makeCategoryEditUrl = (slug: string) =>
  `${makeCategoryUrl(slug)}/edit`

export const makePicturesUrl = () => `/pictures/`
export const makePictureUrl = (id: PictureId) => `/pictures/${id}`
