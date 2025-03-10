// THIS FILE REPRESENTS THE CLIENT'S URL

import type { PictureId } from "core"

export const makeCategoriesUrl = () => `/categories`
export const makeCategoryUrl = (slug: string) =>
  `${makeCategoriesUrl()}/${slug}`
export const makeCategoryEditUrl = (slug: string) =>
  `${makeCategoryUrl(slug)}/edit`

export const makePicturesUrl = () => `/pictures/`
export const makePictureUrl = (id: PictureId) => `/pictures/${id}`
