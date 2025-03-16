<script lang="ts">
  import { apiGetPictures, apiGetPicturesZipRoute } from "$lib/api"
  import PaginatedPictureGrid from "$lib/components/PaginatedPictureGrid.svelte"
  import { PaginatedLoader } from "$lib/PaginatedLoader.svelte"
  import type { PicturesPageData } from "./+page"

  let { data }: { data: PicturesPageData } = $props()
  const picturesParams = $derived(data.picturesParams)
  const loader = new PaginatedLoader((p) =>
    apiGetPictures(p, picturesParams),
  ).fromSerialized(data.pictures)
</script>

<span>
  (<a href={apiGetPicturesZipRoute(picturesParams)} download>.zip</a>)
</span>
<PaginatedPictureGrid {loader} />
