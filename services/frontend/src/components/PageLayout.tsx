import type { ParentComponent, VoidComponent } from "solid-js"
import { flex, vstack } from "../../styled-system/patterns"
import { A } from "@solidjs/router"
import { css } from "../../styled-system/css"
import { routes } from "./Routes"
import { AdminFence } from "./AdminFence"

export const PageLayout: ParentComponent = (p) => {
  return (
    <div
      class={flex({
        direction: { base: "column", sm: "row" },
        sm: { alignItems: "stretch" },
      })}
    >
      <PageHeader />
      <main class={css({ sm: { flex: 1 } })}>{p.children}</main>
    </div>
  )
}

export const MainTitle: ParentComponent = (p) => (
  <h1 class={css({ textStyle: "mainTitle" })}>{p.children}</h1>
)

const PageHeader: VoidComponent = () => {
  return (
    <header
      class={vstack({
        gap: { base: "0", sm: "4" },
        bg: "gray.950",
        sm: { minHeight: "100vh" },
      })}
    >
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
      <ul
        class={flex({
          direction: { base: "row", sm: "column" },
          gap: "0",
          marginBottom: { base: "1", sm: "0" },
        })}
      >
        <HeaderLink href={routes.PictureList}>Pictures</HeaderLink>
        <HeaderLink href={routes.CategoryList}>Categories</HeaderLink>
        <AdminFence>
          <HeaderLink href={routes.PictureUpload}>Upload</HeaderLink>
        </AdminFence>
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
