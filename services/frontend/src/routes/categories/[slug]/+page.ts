import type { CategoryApi } from "api-types"
import type { PageLoad } from "./$types"
import { apiGetCategory } from "$lib/api"

export const load: PageLoad = async ({ params }): Promise<CategoryApi> => {
  return await apiGetCategory(params.slug)
}
