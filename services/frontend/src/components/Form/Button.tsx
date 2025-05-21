import { type JSX, type ParentComponent } from "solid-js"
import { css } from "../../../styled-system/css"

interface TextButtonProps extends JSX.ButtonHTMLAttributes<HTMLButtonElement> {}
export const TextButton: ParentComponent<TextButtonProps> = (p) => {
  return <button class={button} {...p} />
}

export const button = css({
  bg: "gray.100",
  border: "1px solid",
  borderColor: "InactiveBorder",
  borderRadius: "md",
  paddingInline: "2",
  paddingBlock: "1",
  minWidth: "32px",
  cursor: "pointer",

  height: "InteractiveMd",

  "&:hover": {
    bg: "gray.200",
    borderColor: "gray.300",
  },
})
