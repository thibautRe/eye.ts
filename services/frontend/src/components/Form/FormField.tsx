import { type ParentComponent } from "solid-js"
import { hstack, vstack } from "../../../styled-system/patterns"
import {
  FormFieldContextProvider,
  useFormFieldContext,
} from "./FormFieldContext"
import { css } from "../../../styled-system/css"

interface FormFieldProps {
  label: string
}
export const FormField: ParentComponent<FormFieldProps> = (p) => (
  <FormFieldContextProvider>
    <div class={wrapper}>
      <FormFieldLabel>{p.label}</FormFieldLabel>
      {p.children}
    </div>
  </FormFieldContextProvider>
)

export const FormFieldInline: ParentComponent<FormFieldProps> = (p) => (
  <FormFieldContextProvider>
    <div class={inlineWrapper}>
      <FormFieldLabel>{p.label}</FormFieldLabel>
      {p.children}
    </div>
  </FormFieldContextProvider>
)

const FormFieldLabel: ParentComponent = (p) => {
  const context = useFormFieldContext()
  return (
    <label class={label} for={context?.id}>
      {p.children}
    </label>
  )
}

const wrapper = vstack({
  gap: "0.5",
  alignItems: "flex-start",
})
const inlineWrapper = hstack({
  gap: "0",
  alignItems: "center",
  flexDirection: "row-reverse",
})

const label = css({
  paddingInline: "2",
  fontWeight: "medium",
})
