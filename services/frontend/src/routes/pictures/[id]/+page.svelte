<script lang="ts">
  import Picture from "$lib/components/Picture.svelte"
  import type { PictureApi } from "api-types"

  let { data: pic }: { data: PictureApi } = $props()
</script>

<div class="wrapper">
  <h1>{pic.id}</h1>
  <Picture {pic} sizes="60vw" />
  <div>{pic.shotAt}</div>

  <h4>EXIF</h4>
  <table>
    <thead>
      <tr>
        <th>Name</th>
        <th>Value</th>
      </tr>
    </thead>
    <tbody>
      {#each Object.entries(pic.exif) as row}
        <tr>
          <td>{row[0]}</td>
          <td>{row[1]}</td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>

<style>
  .wrapper {
    display: flex;
    flex-direction: column;
    gap: 8px;
    width: 80vw;
  }
</style>
