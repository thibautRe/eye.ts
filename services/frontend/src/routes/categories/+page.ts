import type { CategoryApi } from "api-types"
import type { PageLoad } from "./$types"
import { apiGetCategories } from "$lib/api"
import {
  getSerializedPaginatedLoader,
  type SerializedPaginatedLoader,
} from "$lib/PaginatedLoader.svelte"

export const load: PageLoad = async ({
  url,
}): Promise<SerializedPaginatedLoader<CategoryApi>> => {
  const orphan = url.searchParams.get("orphan")
  return await getSerializedPaginatedLoader((p) =>
    apiGetCategories(p, { orphan: orphan ? "true" : undefined }),
  )
}
