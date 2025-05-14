import type { VoidComponent } from "solid-js"
import { hstack } from "../../../styled-system/patterns"

export const DeepFilter: VoidComponent<{
  isDeep: boolean
  onIsDeepChange: (o: boolean) => void
}> = (p) => (
  <label class={hstack({ gap: "1" })}>
    <input
      type="checkbox"
      checked={p.isDeep}
      onchange={(e) => p.onIsDeepChange(e.target.checked)}
    />
    <span>Deep</span>
  </label>
)
