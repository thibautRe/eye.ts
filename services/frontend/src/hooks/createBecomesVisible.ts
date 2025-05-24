import { createEffect } from "solid-js"

interface CreateBecomesVisibleProps {
  readonly onBecomesVisible: () => void
  readonly onBecomesInvisible: () => void
}
export const createBecomesVisible = <TElt extends HTMLElement = HTMLDivElement>(
  p: CreateBecomesVisibleProps,
) => {
  let eltRef: TElt | undefined
  const observer = new IntersectionObserver((ev) => {
    if (!ev[0]?.isIntersecting) {
      p.onBecomesInvisible?.()
    } else {
      p.onBecomesVisible?.()
    }
  })
  createEffect(() => eltRef && observer.observe(eltRef))
  return (elt: TElt) => (eltRef = elt)
}
