<script lang="ts">
  import { goto } from "$app/navigation"
  import { apiUpdateCategory } from "$lib/api"
  import { makeCategoryUrl } from "$lib/urls"
  import type { CategoryApi } from "api-types"

  let { data: cat }: { data: CategoryApi } = $props()
</script>

<form
  onsubmit={async (e) => {
    e.preventDefault()
    cat = await apiUpdateCategory(cat)
    goto(makeCategoryUrl(cat.slug))
  }}
>
  <label
    >Name <input
      value={cat.name}
      onchange={(e) => {
        cat.name = e.currentTarget.value
      }}
    /></label
  >
  <label
    >EXIF <input
      value={cat.exifTag}
      onchange={(e) => {
        cat.exifTag = e.currentTarget.value
      }}
    /></label
  >
  <button type="submit">Submit</button>
</form>
