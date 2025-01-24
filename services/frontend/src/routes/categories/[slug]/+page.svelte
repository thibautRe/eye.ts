<script lang="ts">
  import type { CategoryApi } from "api-types"

  let { data: cat }: { data: CategoryApi } = $props()
</script>

<h1>Category {cat.name}</h1>

<h2>Parent categories</h2>
<ul>
  {#each cat.directParents as directParent}
    <li>
      <a href={`/categories/${directParent.slug}`}>{directParent.name}</a>
    </li>
  {/each}
</ul>

<h2>Children categories</h2>
<ul>
  {#each cat.directChildren as directChildren}
    <li>
      <a href={`/categories/${directChildren.slug}`}>{directChildren.name}</a>
    </li>
  {/each}
</ul>
