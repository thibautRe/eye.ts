<script lang="ts">
  import { apiCategoryParentAdd } from "$lib/api"
  import ParentCategories from "$lib/components/ParentCategories.svelte"
  import { makeCategoryUrl } from "$lib/urls"
  import type { CategoryApi } from "api-types"

  let { data: cat }: { data: CategoryApi } = $props()
  let parentCatSlug = $state("")
</script>

<h1>Category {cat.name}</h1>

<h2>Parent categories</h2>
<ParentCategories parents={cat.directParents} />
<form
  onsubmit={async (e) => {
    e.preventDefault()
    const slug = parentCatSlug
    parentCatSlug = ""
    cat = await apiCategoryParentAdd({
      childSlug: cat.slug,
      parentSlug: slug,
    })
  }}
>
  <input type="text" bind:value={parentCatSlug} />
  <button type="submit" disabled={!parentCatSlug}>+</button>
</form>

<h2>Children categories</h2>
<ul>
  {#each cat.directChildren as directChildren}
    <li>
      <a href={makeCategoryUrl(directChildren.slug)}>{directChildren.name}</a>
    </li>
  {/each}
</ul>
