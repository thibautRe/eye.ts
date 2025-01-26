<script lang="ts">
  import { makeCategoryUrl } from "$lib/urls"
  import type { CategoryApi } from "api-types"

  let { data: cat }: { data: CategoryApi } = $props()
</script>

<h1>Category {cat.name}</h1>

<h2>Parent categories</h2>
<ul>
  {#each cat.directParents as directParent}
    <li>
      <a href={makeCategoryUrl(directParent.slug)}>{directParent.name}</a>
    </li>
  {/each}
</ul>

<h2>Children categories</h2>
<ul>
  {#each cat.directChildren as directChildren}
    <li>
      <a href={makeCategoryUrl(directChildren.slug)}>{directChildren.name}</a>
    </li>
  {/each}
</ul>
