import type { VoidComponent } from "solid-js"
import { FormFieldInline } from "../Form"
import { Checkbox } from "../Form/Checkbox"

export const DeepFilter: VoidComponent<{
  isDeep: boolean
  onIsDeepChange: (o: boolean) => void
}> = (p) => (
  <FormFieldInline label="Deep">
    <Checkbox checked={p.isDeep} onCheckedChange={p.onIsDeepChange} />
  </FormFieldInline>
)
