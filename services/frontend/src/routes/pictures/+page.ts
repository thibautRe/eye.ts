import { apiGetPictures } from "$lib/api"
import type { SerializedPaginatedLoader } from "$lib/PaginatedLoader.svelte"
import { getSerializedPaginatedLoader } from "$lib/PaginatedLoader.svelte"
import type { PageLoad } from "./$types"
import type { PictureApi } from "api-types"

export const load: PageLoad = async (): Promise<
  SerializedPaginatedLoader<PictureApi>
> => {
  return await getSerializedPaginatedLoader(apiGetPictures)
}
