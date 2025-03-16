import type { CategoryApi, PictureApi } from "api-types"
import { slugify } from "core"
import type { PageLoad } from "./$types"
import {
  apiGetCategory,
  apiGetPictures,
  type ApiGetPicturesParams,
} from "$lib/api"
import {
  getSerializedPaginatedLoader,
  type SerializedPaginatedLoader,
} from "$lib/PaginatedLoader.svelte"

export interface CategoryPageData {
  category: CategoryApi
  pictures: SerializedPaginatedLoader<PictureApi>
  picturesParams: ApiGetPicturesParams
}
export const load: PageLoad = async ({ params }): Promise<CategoryPageData> => {
  const slug = slugify(params.slug)
  const picturesParams: ApiGetPicturesParams = { parent: slug }
  const category = await apiGetCategory(slug)
  const pictures = await getSerializedPaginatedLoader((p) =>
    apiGetPictures(p, picturesParams),
  )
  return { category, pictures, picturesParams }
}
