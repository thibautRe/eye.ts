import type { ParentComponent, VoidComponent } from "solid-js"
import { flex, vstack } from "../../styled-system/patterns"
import { A } from "@solidjs/router"
import { css } from "../../styled-system/css"
import { routes } from "./Routes"

export const PageLayout: ParentComponent = (p) => {
  return (
    <div class={flex({ alignItems: "stretch" })}>
      <PageHeader />
      <main class={css({ flex: 1 })}>{p.children}</main>
    </div>
  )
}

export const MainTitle: ParentComponent = (p) => (
  <h1 class={css({ textStyle: "mainTitle" })}>{p.children}</h1>
)

const PageHeader: VoidComponent = () => {
  return (
    <header class={vstack({ gap: "4", bg: "gray.950", minHeight: "100vh" })}>
      <A
        href="/"
        class={css({
          p: "2",
          fontSize: "medium",
          fontWeight: "bold",
          color: "gray.300",
        })}
      >
        EYE
      </A>
      <ul class={vstack({ gap: "0" })}>
        <HeaderLink href={routes.PictureList}>Pictures</HeaderLink>
        <HeaderLink href={routes.CategoryList}>Categories</HeaderLink>
        <HeaderLink href={routes.PictureUpload}>Upload</HeaderLink>
      </ul>
    </header>
  )
}

const HeaderLink: ParentComponent<{ href: string }> = (p) => (
  <li>
    <A
      href={p.href}
      class={css({
        p: "2",
        fontSize: "xs",
        color: "gray.400",
        _hover: { color: "gray.300" },
      })}
    >
      {p.children}
    </A>
  </li>
)
