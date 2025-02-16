<script lang="ts">
  import { makeCategoryUrl } from "$lib/urls"
  import type { LinkedCategoryApi } from "api-types"
  import { slugify, type Slug } from "core"

  const props: {
    parents: LinkedCategoryApi[]
    onAdd: (slug: Slug) => Promise<void>
    onDel: (slug: Slug) => Promise<void>
  } = $props()
  let parentCatSlug = $state("")
</script>

<ul>
  {#each props.parents as parent}
    <li>
      <a href={makeCategoryUrl(parent.slug)}>{parent.name}</a>
      <button onclick={() => props.onDel(parent.slug)}>x</button>
    </li>
  {/each}
</ul>
<form
  onsubmit={async (e) => {
    e.preventDefault()
    await props.onAdd(slugify(parentCatSlug))
    parentCatSlug = ""
  }}
>
  <input type="text" bind:value={parentCatSlug} />
  <button type="submit" disabled={!parentCatSlug}>+</button>
</form>
