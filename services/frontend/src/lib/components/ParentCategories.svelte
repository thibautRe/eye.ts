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
  let isAdding = $state(false)
</script>

<div class="container">
  <ul class="categories">
    {#each props.parents as parent}
      <li class="category">
        <a href={makeCategoryUrl(parent.slug)}>{parent.name}</a>
        <button
          class="remove"
          onclick={() => {
            if (!confirm(`Delete parent category "${parent.name}"?`)) return
            props.onDel(parent.slug)
          }}>x</button
        >
      </li>
    {/each}
  </ul>
  {#if isAdding}
    <form
      onsubmit={async (e) => {
        e.preventDefault()
        await props.onAdd(slugify(parentCatSlug))
        parentCatSlug = ""
      }}
    >
      <input type="text" bind:value={parentCatSlug} />
      <button type="submit" class="primary" disabled={!parentCatSlug}>+</button>
    </form>
  {:else}
    <button class="primary" onclick={() => (isAdding = true)}>+</button>
  {/if}
</div>

<style>
  .container {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    background-color: oklch(0.95 0.005 var(--hue));
    padding: 6px 10px;
    border-radius: 6px;
  }
  .categories {
    list-style: none;
    padding: 0;
    display: contents;
  }

  .remove {
    visibility: hidden;
  }
  .category {
    &:hover .remove {
      visibility: visible;
    }
  }
</style>
