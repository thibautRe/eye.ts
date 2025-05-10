import type { ParentComponent, VoidComponent } from "solid-js"
import { hstack, vstack } from "../../styled-system/patterns"
import { A } from "@solidjs/router"
import { css } from "../../styled-system/css"

export const PageLayout: ParentComponent = (p) => {
  return (
    <div class={vstack()}>
      <PageHeader />
      <main class={css({ width: "100%" })}>{p.children}</main>
    </div>
  )
}

const PageHeader: VoidComponent = () => {
  return (
    <header class={hstack({ gap: "4", justify: "center" })}>
      <A
        href="/"
        class={css({
          fontSize: "medium",
          fontWeight: "bold",
          letterSpacing: 10,
        })}
      >
        EYE
      </A>
    </header>
  )
}
