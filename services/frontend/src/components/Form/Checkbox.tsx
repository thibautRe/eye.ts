import { type VoidComponent } from "solid-js"
import { useFormFieldContext } from "./FormFieldContext"

export const Checkbox: VoidComponent<{
  checked: boolean
  onCheckedChange: (checked: boolean) => void
}> = (p) => {
  const c = useFormFieldContext()
  return (
    <input
      id={c?.id}
      type="checkbox"
      checked={p.checked}
      onchange={(e) => p.onCheckedChange(e.currentTarget.checked)}
    />
  )
}
