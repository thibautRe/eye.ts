import type { CategoryApi, PictureApi } from "api-types"
import { slugify } from "core"
import type { PageLoad } from "./$types"
import { apiGetCategory, apiGetPictures } from "$lib/api"
import {
  getSerializedPaginatedLoader,
  type SerializedPaginatedLoader,
} from "$lib/PaginatedLoader.svelte"

export interface CategoryPageData {
  category: CategoryApi
  pictures: SerializedPaginatedLoader<PictureApi>
}
export const load: PageLoad = async ({ params }): Promise<CategoryPageData> => {
  const slug = slugify(params.slug)
  const category = await apiGetCategory(slug)
  const pictures = await getSerializedPaginatedLoader((p) =>
    apiGetPictures(p, { parent: slug }),
  )
  return { category, pictures }
}
