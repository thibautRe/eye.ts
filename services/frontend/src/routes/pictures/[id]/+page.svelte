<script lang="ts">
  import { apiPictureParentAdd, apiPictureParentDel } from "$lib/api"
  import ParentCategories from "$lib/components/ParentCategories.svelte"
  import Picture from "$lib/components/Picture.svelte"
  import RatingComponent from "$lib/components/RatingComponent.svelte"
  import type { PictureApi } from "api-types"

  let { data: pic }: { data: PictureApi } = $props()
</script>

<div class="wrapper">
  <h1>{pic.id}</h1>
  <Picture {pic} sizes="60vw" />
  <div>{pic.shotAt}</div>
  <RatingComponent rating={pic.rating} />
  <ParentCategories
    parents={pic.directParents}
    onAdd={async (slug) => {
      pic = await apiPictureParentAdd(pic.id, slug)
    }}
    onDel={async (slug) => {
      pic = await apiPictureParentDel(pic.id, slug)
    }}
  />

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
