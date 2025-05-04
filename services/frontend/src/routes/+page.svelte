<script lang="ts">
  import { apiUploadFile } from "$lib/api"
  import { makeCategoriesUrl, makePicturesUrl } from "$lib/urls"

  interface FileImportState {
    file: File
    state: "pending" | "uploaded" | "uploading" | "error"
  }
  let fileImportStates = $state<FileImportState[]>([])
</script>

<h1>Home</h1>
<input
  type="file"
  multiple
  accept=".jpg, .jpeg"
  disabled={fileImportStates.some((i) => i.state === "pending")}
  onchange={async (e) => {
    const files = e.currentTarget.files
    e.currentTarget.files = null
    if (!files) return

    fileImportStates = Array.from(files).map(
      (file): FileImportState => ({ file, state: "pending" }),
    )
    for (const fileImport of fileImportStates) {
      if (fileImport.state !== "pending") continue
      try {
        fileImport.state = "uploading"
        await apiUploadFile(fileImport.file)
        fileImport.state = "uploaded"
      } catch (err) {
        console.error(err)
        fileImport.state = "error"
      }
    }
  }}
/>

{#if fileImportStates.length > 0}
  <h2>Upload status</h2>
  <ul>
    {#each fileImportStates as fileImport}
      <li>{fileImport.file.name}: {fileImport.state}</li>
    {/each}
  </ul>
{/if}

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
