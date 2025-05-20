import type { LinkedCategoryApi } from "api-types"
import { type Slug } from "core"
import { createSignal, For, Show, type VoidComponent } from "solid-js"
import { routes } from "../Routes"
import { hstack } from "../../../styled-system/patterns"
import { css } from "../../../styled-system/css"

import { CategoryCombobox } from "./CategoryCombobox"
import { Button } from "../Form/Button"

export const ParentCategory: VoidComponent<{
  parents: LinkedCategoryApi[]
  onAdd: (slug: Slug) => Promise<void>
  onDel: (slug: Slug) => Promise<void>
}> = (p) => {
  const [isEditing, setIsEditing] = createSignal(false)
  return (
    <nav class={hstack({ gap: "2", p: "2", flexWrap: "wrap", bg: "gray.300" })}>
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
                <Button
                  onclick={() => {
                    if (!confirm(`Delete parent category "${parent.name}"?`))
                      return
                    p.onDel(parent.slug)
                  }}
                >
                  x
                </Button>
              </Show>
            </li>
          )}
        </For>
      </ul>
      <Show
        when={isEditing()}
        fallback={<Button onclick={() => setIsEditing(true)}>Edit</Button>}
      >
        <CategoryCombobox onSelect={(cat) => p.onAdd(cat.slug)} />
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
