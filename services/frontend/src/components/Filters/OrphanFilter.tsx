import type { VoidComponent } from "solid-js"
import { FormFieldInline } from "../Form"
import { Checkbox } from "../Form/Checkbox"

export const OrphanFilter: VoidComponent<{
  isOrphan: boolean
  onIsOrphanChange: (o: boolean) => void
}> = (p) => (
  <FormFieldInline label="Orphan">
    <Checkbox checked={p.isOrphan} onCheckedChange={p.onIsOrphanChange} />
  </FormFieldInline>
)
