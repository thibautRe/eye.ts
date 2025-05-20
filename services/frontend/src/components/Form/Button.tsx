import { type JSX, type ParentComponent } from "solid-js"
import { css } from "../../../styled-system/css"

type ButtonProps = JSX.ButtonHTMLAttributes<HTMLButtonElement>
export const Button: ParentComponent<ButtonProps> = (p) => {
  return <button class={button} {...p} />
}

export const button = css({
  bg: "gray.300",
  borderRadius: "md",
  paddingInline: "2",
  paddingBlock: "1",
  minWidth: "32px",
})
