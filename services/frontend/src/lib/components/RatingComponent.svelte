<script lang="ts">
  import type { Rating } from "core"

  const { rating }: { rating: Rating | null } = $props()
</script>

<div>
  {#if rating === null}
    (unset)
  {:else}
    {new Array(rating).fill("★").join("")}{new Array(5 - rating)
      .fill("☆")
      .join("")}
  {/if}
</div>
