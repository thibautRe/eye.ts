<script lang="ts">
  import { apiUploadFiles } from "$lib/api"
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
    <a href="/pictures/">Pictures</a>
  </li>
  <li>
    <a href="/categories/">Categories</a>
  </li>
</ul>
