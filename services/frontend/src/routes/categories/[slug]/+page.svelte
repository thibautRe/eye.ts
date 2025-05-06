<script lang="ts">
  import {
    apiCategoryParentAdd,
    apiCategoryParentDel,
    apiGetPictures,
    apiGetPicturesZipRoute,
  } from "$lib/api"
  import PaginatedPictureGrid from "$lib/components/PaginatedPictureGrid.svelte"
  import ParentCategories from "$lib/components/ParentCategories.svelte"
  import { PaginatedLoader } from "$lib/PaginatedLoader.svelte"
  import { makeCategoryEditUrl, makeCategoryUrl } from "$lib/urls"
  import type { CategoryPageData } from "./+page"

  let { data }: { data: CategoryPageData } = $props()

  const cat = $derived(data.category)
  const picturesParams = $derived(data.picturesParams)
  const loader = $derived(
    new PaginatedLoader((p) =>
      apiGetPictures(p, picturesParams),
    ).fromSerialized(data.pictures),
  )
  const updateCat = (category: typeof data.category) => {
    data = { ...data, category }
  }
</script>

<div class="header">
  <h1>{cat.name}</h1>
  <a href={makeCategoryEditUrl(cat.slug)}>Edit</a>
  <span>
    (<a href={apiGetPicturesZipRoute(picturesParams)} download>.zip</a>)
  </span>
</div>

<ParentCategories
  parents={cat.directParents}
  onAdd={async (parentSlug) => {
    updateCat(
      await apiCategoryParentAdd({
        childSlug: cat.slug,
        parentSlug,
      }),
    )
  }}
  onDel={async (parentSlug) => {
    updateCat(
      await apiCategoryParentDel({
        childSlug: cat.slug,
        parentSlug,
      }),
    )
  }}
/>

{#if cat.directChildren.length > 0}
  <h2>Children categories</h2>
  <ul>
    {#each cat.directChildren as directChildren}
      <li>
        <a href={makeCategoryUrl(directChildren.slug)}>{directChildren.name}</a>
      </li>
    {/each}
  </ul>
{/if}

<PaginatedPictureGrid {loader} />

<style>
  .header {
    display: flex;
    gap: 16px;
    align-items: baseline;
  }
</style>
