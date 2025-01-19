<script lang="ts">
  import { apiGetPictures } from "$lib/api"
  import PaginatedPictureGrid from "$lib/components/PaginatedPictureGrid.svelte"
  import {
    PaginatedLoader,
    type SerializedPaginatedLoader,
  } from "$lib/PaginatedLoader.svelte"
  import type { PictureApi } from "api-types"

  let { data }: { data: SerializedPaginatedLoader<PictureApi> } = $props()
  const loader = new PaginatedLoader(apiGetPictures).fromSerialized(data)
</script>

<PaginatedPictureGrid {loader} />
