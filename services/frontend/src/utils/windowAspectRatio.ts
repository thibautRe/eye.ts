import { createEffect, createSignal } from "solid-js"

const getCurrentTargetAspectRatio = () => {
  return (
    document.documentElement.clientWidth / document.documentElement.clientHeight
  )
}
const [windowAspectRatio, setWindowAspectRatio] = createSignal(
  getCurrentTargetAspectRatio(),
)
createEffect(() => {
  window.addEventListener("resize", () =>
    setWindowAspectRatio(getCurrentTargetAspectRatio()),
  )
})

export { windowAspectRatio }
