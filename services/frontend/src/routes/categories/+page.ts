import type { CategoryApi } from "api-types"
import type { PageLoad } from "./$types"
import { apiGetCategories } from "$lib/api"
import {
  getSerializedPaginatedLoader,
  type SerializedPaginatedLoader,
} from "$lib/PaginatedLoader.svelte"

export const load: PageLoad = async (): Promise<
  SerializedPaginatedLoader<CategoryApi>
> => {
  return await getSerializedPaginatedLoader(apiGetCategories)
}
