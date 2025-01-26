// THIS FILE REPRESENTS THE CLIENT'S URL

import type { PictureId } from "core"

export const makeCategoriesUrl = () => `/categories/`
export const makeCategoryUrl = (slug: string) => `/categories/${slug}`

export const makePicturesUrl = () => `/pictures/`
export const makePictureUrl = (id: PictureId) => `/pictures/${id}`
