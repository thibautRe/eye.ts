<script lang="ts">
  import { apiUploadFiles } from "$lib/api"
  import { makeCategoriesUrl, makePicturesUrl } from "$lib/urls"
</script>

<h1>Home</h1>
<input
  type="file"
  multiple
  accept="*.jpg, *.jpeg"
  onchange={async (e) => {
    const files = (e.target as HTMLInputElement | null)?.files
    if (files) await apiUploadFiles(files)
  }}
/>

<h2>Links</h2>
<ul>
  <li>
    <a href={makePicturesUrl()}>Pictures</a>
    (<a href={makePicturesUrl({ orphan: true })}>Orphans</a>)
  </li>
  <li>
    <a href={makeCategoriesUrl()}>Categories</a>
    (<a href={makeCategoriesUrl({ orphan: true })}>Orphans</a>)
  </li>
</ul>
