<script lang="ts">
  import { apiCreateCategory } from "$lib/api"
  import { slugify } from "core"

  const onsubmit = async (e: SubmitEvent) => {
    e.preventDefault()
    const input = (
      e.currentTarget as HTMLFormElement | null
    )?.querySelector<HTMLInputElement>("input#catname")
    if (!input) throw new Error("Cannot find input")
    const name = input.value
    const slug = slugify(name)
    await apiCreateCategory({ name: { en: name }, slug })
  }
</script>

<form {onsubmit}>
  <h2>New category</h2>
  <label>
    name
    <input id="catname" type="text" />
  </label>
</form>
