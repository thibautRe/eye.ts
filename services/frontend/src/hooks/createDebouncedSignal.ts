import { createEffect, createSignal, on, type Accessor } from "solid-js"

export function createDebouncedSignal<T>(
  signal: Accessor<T>,
  { wait }: { wait?: number },
) {
  const [internalSignal, setInternalSignal] = createSignal(signal())
  let timeoutRef: number | null = null

  const cancel = () => clearTimeout(timeoutRef!)
  createEffect(
    on(signal, () => {
      cancel()
      timeoutRef = setTimeout(() => {
        setInternalSignal((_) => signal())
      }, wait)
    }),
  )

  return internalSignal
}
