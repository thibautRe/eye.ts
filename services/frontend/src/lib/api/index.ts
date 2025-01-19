import { type PictureApi, routes } from "api-types"
import { makeCachedPaginatedApi } from "./pagination"
import { get_json, post } from "./utils"
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
