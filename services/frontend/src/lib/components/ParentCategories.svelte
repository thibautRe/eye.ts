<script lang="ts">
  import { makeCategoryUrl } from "$lib/urls"
  import type { LinkedCategoryApi } from "api-types"

  const props: { parents: LinkedCategoryApi[] } = $props()
</script>

<ul>
  {#each props.parents as parent}
    <li>
      <a href={makeCategoryUrl(parent.slug)}>{parent.name}</a>
    </li>
  {/each}
</ul>
