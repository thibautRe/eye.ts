import { type CategoryApi, type PictureApi, routes } from "api-types"
import { makeCachedPaginatedApi } from "./pagination"
import { get_json, post, post_json } from "./utils"
import { type PictureId } from "core"

export const apiUploadFiles = async (filelist: FileList) => {
  for (const file of filelist) {
    const formData = new FormData()
    formData.append("file", file)
    await post(routes.PICTURE_UPLOAD.pathname, formData)
  }
}

export const apiGetPictures = makeCachedPaginatedApi<PictureApi>(
  routes.PICTURE_LIST.pathname,
)
export const apiGetPicture = (id: PictureId) =>
  get_json<PictureApi>(routes.PICTURE.stringify({ id }))

export const apiCreateCategory = (data: { slug: string; name: string }) =>
  post_json<CategoryApi>(routes.CATEGORY_CREATE.pathname, data)

export const apiGetCategory = (slug: string) =>
  get_json<CategoryApi>(routes.CATEGORY.stringify({ slug }))
export const apiGetCategories = makeCachedPaginatedApi<CategoryApi>(
  routes.CATEGORY_LIST.pathname,
)
export const apiPictureParentAdd = (id: PictureId, slug: string) =>
  post_json<PictureApi>(routes.PICTURE_CATEGORY_ADD.stringify({ id }), { slug })
export const apiCategoryParentAdd = (data: {
  childSlug: string
  parentSlug: string
}) =>
  post_json<CategoryApi>(
    routes.CATEGORY_PARENT_ADD.stringify({ slug: data.childSlug }),
    { parentSlug: data.parentSlug },
  )
