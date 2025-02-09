<script lang="ts">
  import { makeCategoryUrl } from "$lib/urls"
  import type { LinkedCategoryApi } from "api-types"

  const props: {
    parents: LinkedCategoryApi[]
    onAdd: (slug: string) => Promise<void>
    onDel: (slug: string) => Promise<void>
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
    await props.onAdd(parentCatSlug)
    parentCatSlug = ""
  }}
>
  <input type="text" bind:value={parentCatSlug} />
  <button type="submit" disabled={!parentCatSlug}>+</button>
</form>
