<script lang="ts">
  import { apiCategoryParentAdd, apiCategoryParentDel } from "$lib/api"
  import ParentCategories from "$lib/components/ParentCategories.svelte"
  import { makeCategoryUrl } from "$lib/urls"
  import type { CategoryApi } from "api-types"

  let { data: cat }: { data: CategoryApi } = $props()
</script>

<h1>Category {cat.name}</h1>

<h2>Parent categories</h2>
<ParentCategories
  parents={cat.directParents}
  onAdd={async (parentSlug) => {
    cat = await apiCategoryParentAdd({ childSlug: cat.slug, parentSlug })
  }}
  onDel={async (parentSlug) => {
    cat = await apiCategoryParentDel({ childSlug: cat.slug, parentSlug })
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
