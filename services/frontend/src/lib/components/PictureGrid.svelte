<script lang="ts">
  import type { PictureApi } from "api-types"
  import Picture from "./Picture.svelte"
  import { makePictureUrl } from "$lib/urls"
  import { splitInLines } from "$lib/splitInLines"

  const { pics }: { pics: PictureApi[] } = $props()
  const lines = $derived(splitInLines(pics))
</script>

<div class="wrapper">
  {#each lines as line}
    <div class="line" style="aspect-ratio: {line.aspectRatio};">
      {#each line.pictures as pic}
        <a class="link" href={makePictureUrl(pic.id)}>
          <Picture {pic} sizes="23vw" />
        </a>
      {/each}
    </div>
  {/each}
</div>

<style>
  .wrapper {
    display: flex;
    flex-direction: column;

    --gap: 8px;
    gap: var(--gap);
  }

  .line {
    display: flex;
    gap: var(--gap);
  }

  .link {
    display: contents;

    :global(> *) {
      border-radius: 6px;
      overflow: hidden;
    }
  }
</style>
