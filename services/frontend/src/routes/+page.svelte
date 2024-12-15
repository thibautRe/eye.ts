<script>
  import { apiUploadFiles } from "$lib/api"
</script>

<h1>Home</h1>
<input
  type="file"
  multiple
  accept="*.jpg, *.jpeg"
  onchange={async (e) => {
    if (e.target.files) await apiUploadFiles(e.target.files)
  }}
/>
