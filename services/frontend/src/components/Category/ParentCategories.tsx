import type { LinkedCategoryApi } from "api-types"
import { type Slug } from "core"
import { createSignal, For, Show, type VoidComponent } from "solid-js"
import { routes } from "../Routes"
import { hstack } from "../../../styled-system/patterns"
import { css } from "../../../styled-system/css"

import { CategoryCombobox } from "./CategoryCombobox"
import { TextButton } from "../Form/Button"
import { AdminFence } from "../AdminFence"

export const ParentCategory: VoidComponent<{
  parents: LinkedCategoryApi[]
  onCreate: (name: string) => Promise<void>
  onAdd: (slug: Slug) => Promise<void>
  onDel: (slug: Slug) => Promise<void>
}> = (p) => {
  const [isEditing, setIsEditing] = createSignal(false)
  return (
    <nav
      class={hstack({
        gap: "2",
        p: "2",
        flexWrap: "wrap",
        borderBottom: "1px solid",
        borderBottomColor: "InactiveBorder",
      })}
    >
      <strong>Categories:</strong>
      <ul class={css({ display: "contents" })}>
        <For each={p.parents}>
          {(parent) => (
            <li class={category}>
              <a
                class={css({ textDecoration: "underline" })}
                href={routes.Category(parent.slug)}
              >
                {parent.name}
              </a>
              <Show when={isEditing()}>
                <TextButton
                  onclick={() => {
                    if (!confirm(`Delete parent category "${parent.name}"?`))
                      return
                    p.onDel(parent.slug)
                  }}
                >
                  x
                </TextButton>
              </Show>
            </li>
          )}
        </For>
      </ul>
      <Show
        when={isEditing()}
        fallback={
          <AdminFence>
            <TextButton onclick={() => setIsEditing(true)}>Edit</TextButton>
          </AdminFence>
        }
      >
        <CategoryCombobox
          onSelect={(cat) => p.onAdd(cat.slug)}
          onCreate={p.onCreate}
        />
      </Show>
    </nav>
  )
}

const category = css({
  "& button:not(:focus)": {
    opacity: 0,
  },
  "&:hover button": {
    opacity: 1,
  },
})
