<script lang="ts">
  import type { PaginatedLoader } from "$lib/PaginatedLoader.svelte"
  import type { PictureApi } from "api-types"
  import PictureGrid from "./PictureGrid.svelte"

  const props: { loader: PaginatedLoader<PictureApi> } = $props()
</script>

<PictureGrid pics={props.loader.items} />
{#if props.loader.nextPage !== null}
  <button onclick={props.loader.onLoadNext}>Load next</button>
{/if}
