<script lang="ts">
  import type { PictureApi } from "api-types"
  import Picture from "./Picture.svelte"

  const { pics }: { pics: PictureApi[] } = $props()
</script>

<div class="wrapper">
  {#each pics as pic}
    <a class="link" href={`/pictures/${pic.id}`}>
      <Picture {pic} sizes="23vw" />
    </a>
  {/each}
</div>

<style>
  .wrapper {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 8px;
  }

  .link {
    display: contents;

    :global(> *) {
      border-radius: 6px;
      overflow: hidden;
    }
  }
</style>
