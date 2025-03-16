import { apiGetPictures, type ApiGetPicturesParams } from "$lib/api"
import type { SerializedPaginatedLoader } from "$lib/PaginatedLoader.svelte"
import { getSerializedPaginatedLoader } from "$lib/PaginatedLoader.svelte"
import type { PageLoad } from "./$types"
import type { PictureApi } from "api-types"

export interface PicturesPageData {
  pictures: SerializedPaginatedLoader<PictureApi>
  picturesParams: ApiGetPicturesParams
}
export const load: PageLoad = async ({ url }): Promise<PicturesPageData> => {
  const picturesParams: ApiGetPicturesParams = {
    orphan: url.searchParams.has("orphan"),
    rating: url.searchParams.get("rating") ?? undefined,
  }
  return {
    pictures: await getSerializedPaginatedLoader((p) =>
      apiGetPictures(p, picturesParams),
    ),
    picturesParams,
  }
}
