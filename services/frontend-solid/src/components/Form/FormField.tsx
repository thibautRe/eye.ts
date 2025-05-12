import { useContext, type ParentComponent } from "solid-js"
import { hstack, vstack } from "../../../styled-system/patterns"
import { FormFieldContext, FormFieldContextProvider } from "./FormFieldContext"
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
  const context = useContext(FormFieldContext)
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
  gap: "2",
  alignItems: "flex-start",
  flexDirection: "row-reverse",
})

const label = css({
  paddingInline: "2",
  fontWeight: "medium",
})
