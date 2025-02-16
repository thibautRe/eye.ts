<script lang="ts">
  import { goto } from "$app/navigation"
  import { apiCreateCategory, apiGetCategories } from "$lib/api"
  import {
    PaginatedLoader,
    type SerializedPaginatedLoader,
  } from "$lib/PaginatedLoader.svelte"
  import { makeCategoryUrl } from "$lib/urls"
  import type { CategoryApi } from "api-types"

  const onsubmit = async (e: SubmitEvent) => {
    e.preventDefault()
    const input = (
      e.currentTarget as HTMLFormElement | null
    )?.querySelector<HTMLInputElement>("input#catname")
    if (!input) throw new Error("Cannot find input")
    const name = input.value
    const cat = await apiCreateCategory({ name, slug: name })
    goto(makeCategoryUrl(cat.slug))
  }

  let { data }: { data: SerializedPaginatedLoader<CategoryApi> } = $props()
  const loader = new PaginatedLoader(apiGetCategories).fromSerialized(data)
</script>

<form {onsubmit}>
  <h2>New category</h2>
  <label>
    name
    <input id="catname" type="text" />
  </label>
</form>

<h2>All categories</h2>
<ul>
  {#each loader.items as category}
    <li>
      <a href={makeCategoryUrl(category.slug)}>{category.name}</a>
    </li>
  {/each}
</ul>
{#if loader.nextPage !== null}
  <button onclick={loader.onLoadNext}>Load next</button>
{/if}
