import { type VoidComponent, type JSX, useContext } from "solid-js"
import { css } from "../../../styled-system/css"
import { FormFieldContext } from "./FormFieldContext"

type InputProps = JSX.InputHTMLAttributes<HTMLInputElement>
export const Input: VoidComponent<InputProps> = (p) => {
  const context = useContext(FormFieldContext)
  return (
    <input
      id={context?.id}
      class={css({
        bg: "white",
        borderRadius: "md",
        paddingInline: "2",
        paddingBlock: "1",
      })}
      {...p}
    />
  )
}
