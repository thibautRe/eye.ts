<script lang="ts">
  import { goto } from "$app/navigation"
  import { apiCreateCategory } from "$lib/api"
  import { makeCategoryUrl } from "$lib/urls"
  import { slugify } from "core"

  const onsubmit = async (e: SubmitEvent) => {
    e.preventDefault()
    const input = (
      e.currentTarget as HTMLFormElement | null
    )?.querySelector<HTMLInputElement>("input#catname")
    if (!input) throw new Error("Cannot find input")
    const name = input.value
    const slug = slugify(name)
    const cat = await apiCreateCategory({ name, slug })
    goto(makeCategoryUrl(cat.slug))
  }
</script>

<form {onsubmit}>
  <h2>New category</h2>
  <label>
    name
    <input id="catname" type="text" />
  </label>
</form>
