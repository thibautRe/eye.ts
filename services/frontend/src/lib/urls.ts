// THIS FILE REPRESENTS THE CLIENT'S URLs

import type { PictureId } from "core"

const optSp = (sp: URLSearchParams) => {
  const spStr = sp.toString()
  if (!spStr) return ""
  return `?${spStr}`
}

// --- Categories

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

// --- Pictures

export const makePicturesUrl = (
  { orphan }: { orphan: boolean } = { orphan: false },
) => {
  const sp = new URLSearchParams()
  if (orphan) sp.set("orphan", "")
  return `/pictures${optSp(sp)}`
}
export const makePictureUrl = (id: PictureId) => `${makePicturesUrl()}/${id}`
