import type { VoidComponent } from "solid-js"
import { hstack } from "../../../styled-system/patterns"

export const OrphanFilter: VoidComponent<{
  isOrphan: boolean
  onIsOrphanChange: (o: boolean) => void
}> = (p) => (
  <label class={hstack({ gap: "1" })}>
    <input
      type="checkbox"
      checked={p.isOrphan}
      onchange={(e) => p.onIsOrphanChange(e.target.checked)}
    />
    <span>Orphan</span>
  </label>
)
