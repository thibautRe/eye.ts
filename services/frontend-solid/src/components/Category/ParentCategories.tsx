import type { LinkedCategoryApi } from "api-types"
import { slugify, type Slug } from "core"
import { createSignal, For, Show, type VoidComponent } from "solid-js"
import { routes } from "../Routes"
import { hstack } from "../../../styled-system/patterns"
import { css } from "../../../styled-system/css"

export const ParentCategory: VoidComponent<{
  parents: LinkedCategoryApi[]
  onAdd: (slug: Slug) => Promise<void>
  onDel: (slug: Slug) => Promise<void>
}> = (p) => {
  const [tmpSlug, setTmpSlug] = createSignal("")
  const [isAdding, setIsAdding] = createSignal(false)
  return (
    <div class={hstack({ gap: "2", p: "2", flexWrap: "wrap", bg: "gray.100" })}>
      <ul class={css({ display: "contents" })}>
        <For each={p.parents}>
          {(parent) => (
            <li class={category}>
              <a href={routes.Category(parent.slug)}>{parent.name}</a>
              <button
                onclick={() => {
                  if (!confirm(`Delete parent category "${parent.name}"?`))
                    return
                  p.onDel(parent.slug)
                }}
              >
                x
              </button>
            </li>
          )}
        </For>
      </ul>
      <Show
        when={isAdding()}
        fallback={<button onclick={() => setIsAdding(true)}>+</button>}
      >
        <form
          onsubmit={async (e) => {
            e.preventDefault()
            await p.onAdd(slugify(tmpSlug()))
            setTmpSlug("")
          }}
        >
          <input
            type="text"
            value={tmpSlug()}
            onchange={(e) => setTmpSlug(e.target.value)}
            autofocus
          />
          <button type="submit" disabled={!tmpSlug}>
            +
          </button>
        </form>
      </Show>
    </div>
  )
}

const category = css({
  "& button": {
    visibility: "hidden",
  },
  "&:hover button": {
    visibility: "visible",
  },
})
