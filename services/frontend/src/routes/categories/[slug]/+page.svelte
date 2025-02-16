<script lang="ts">
  import {
    apiCategoryParentAdd,
    apiCategoryParentDel,
    apiGetPictures,
  } from "$lib/api"
  import PaginatedPictureGrid from "$lib/components/PaginatedPictureGrid.svelte"
  import ParentCategories from "$lib/components/ParentCategories.svelte"
  import { PaginatedLoader } from "$lib/PaginatedLoader.svelte"
  import { makeCategoryUrl } from "$lib/urls"
  import type { CategoryPageData } from "./+page"

  let { data }: { data: CategoryPageData } = $props()

  const cat = $derived(data.category)
  const loader = $derived(
    new PaginatedLoader((p) =>
      apiGetPictures(p, { parent: cat.slug }),
    ).fromSerialized(data.pictures),
  )
  const updateCat = (category: typeof data.category) => {
    data = { ...data, category }
  }
</script>

<h1>Category {cat.name}</h1>

<h2>Parent categories</h2>
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

<h2>Children categories</h2>
<ul>
  {#each cat.directChildren as directChildren}
    <li>
      <a href={makeCategoryUrl(directChildren.slug)}>{directChildren.name}</a>
    </li>
  {/each}
</ul>

<PaginatedPictureGrid {loader} />
