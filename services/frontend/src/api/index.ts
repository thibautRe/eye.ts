import {
  type ApiRouteJson,
  type CategoryApi,
  type PictureApi,
  type PictureListZipPreflightResponse,
  routes,
} from "api-types"
import { makeCachedPaginatedApi } from "./pagination"
import {
  delete_json,
  get_json,
  makeCachedGet,
  post_json,
  rootUrl,
  withParams,
} from "./utils"
import { type PictureId, type Slug } from "core"

export const apiUploadFile = async (file: File) => {
  const formData = new FormData()
  formData.append("file", file)
  return await post_json<PictureApi>(routes.PICTURE_UPLOAD.pathname, formData)
}

export type ApiGetPicturesParams = {
  parent?: Slug
  orphan?: boolean
  rating?: string
  deep?: boolean
}
export const apiGetPictures = makeCachedPaginatedApi<
  PictureApi,
  ApiGetPicturesParams
>(routes.PICTURE_LIST.pathname)

// zip, not intended to be used with fetch
export const apiGetPicturesZipRoute = (
  params: ApiGetPicturesParams & { jwt: string },
) => `${rootUrl}${withParams(routes.PICTURE_LIST_ZIP.pathname, params)}`
export const apiGetPicturesZipPreflight = (params: ApiGetPicturesParams) =>
  get_json<PictureListZipPreflightResponse>(
    withParams(routes.PICTURE_LIST_ZIP_PREFLIGHT.pathname, params),
  )

export const apiGetPicture = (id: PictureId) =>
  get_json<PictureApi>(routes.PICTURE.stringify({ id }))

export const apiCreateCategory = (data: ApiRouteJson<"CATEGORY_CREATE">) =>
  post_json<CategoryApi>(routes.CATEGORY_CREATE.pathname, data)
export const apiUpdateCategory = (data: {
  slug: Slug
  name: string
  exifTag: string | null
  newSlug?: string
}) =>
  post_json<CategoryApi>(routes.CATEGORY_UPDATE.stringify(data), {
    name: data.name,
    exifTag: data.exifTag,
    slug: data.newSlug,
  })

const [get] = makeCachedGet<CategoryApi>()
export const apiGetCategory = (slug: Slug) =>
  get(routes.CATEGORY.stringify({ slug }))
export const apiGetCategories = makeCachedPaginatedApi<
  CategoryApi,
  { orphan?: boolean; q?: string; empty?: boolean }
>(routes.CATEGORY_LIST.pathname)
export const apiPictureParentAdd = (id: PictureId, slug: Slug) =>
  post_json<PictureApi>(routes.PICTURE_CATEGORY_ADD.stringify({ id }), { slug })
export const apiPictureParentDel = (id: PictureId, slug: Slug) =>
  delete_json<PictureApi>(routes.PICTURE_CATEGORY_DEL.stringify({ id }), {
    slug,
  })
export const apiCategoryParentAdd = (data: {
  childSlug: Slug
  parentSlug: Slug
}) =>
  post_json<CategoryApi>(
    routes.CATEGORY_PARENT_ADD.stringify({ slug: data.childSlug }),
    { parentSlug: data.parentSlug },
  )

export const apiCategoryParentDel = (data: {
  childSlug: Slug
  parentSlug: Slug
}) =>
  delete_json<CategoryApi>(
    routes.CATEGORY_PARENT_ADD.stringify({ slug: data.childSlug }),
    { parentSlug: data.parentSlug },
  )

export const apiCategoryBulkPictureAdd = (data: {
  slug: Slug
  pictureIds: PictureId[]
}) =>
  post_json(routes.CATEGORY_BULK_PICTURE_ADD.stringify({ slug: data.slug }), {
    pictureIds: data.pictureIds,
  })

export const apiCategoryBulkPictureDel = (data: {
  slug: Slug
  pictureIds: PictureId[]
}) =>
  delete_json(routes.CATEGORY_BULK_PICTURE_DEL.stringify({ slug: data.slug }), {
    pictureIds: data.pictureIds,
  })

export const apiCategoryExifReindex = (slug: Slug) =>
  post_json(routes.CATEGORY_EXIF_REINDEX.stringify({ slug }))
