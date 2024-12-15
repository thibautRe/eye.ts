import { apiGetPicture } from "$lib/api"
import type { PictureId } from "core"
import type { PageLoad } from "./$types"
import type { PictureApi } from "api-types"

export const load: PageLoad = async ({ params }): Promise<PictureApi> => {
  return await apiGetPicture(params.id as PictureId)
}
