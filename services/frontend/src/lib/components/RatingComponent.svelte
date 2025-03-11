<script lang="ts">
  import type { Rating } from "core"

  const { rating }: { rating: Rating | null } = $props()
  const r = $derived(rating === null ? 0 : rating)
</script>

<div>
  {new Array(r).fill("★").join("")}{new Array(5 - r).fill("☆").join("")}
</div>

<style>
  div {
    display: flex;
  }
</style>
