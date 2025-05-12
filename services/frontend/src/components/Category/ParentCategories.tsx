import type { LinkedCategoryApi } from "api-types"
import { slugify, type Slug } from "core"
import { createSignal, For, Show, type VoidComponent } from "solid-js"
import { routes } from "../Routes"
import { hstack } from "../../../styled-system/patterns"
import { css } from "../../../styled-system/css"
import { Input } from "../Form"

export const ParentCategory: VoidComponent<{
  parents: LinkedCategoryApi[]
  onAdd: (slug: Slug) => Promise<void>
  onDel: (slug: Slug) => Promise<void>
}> = (p) => {
  const [tmpSlug, setTmpSlug] = createSignal("")
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
                <button
                  onclick={() => {
                    if (!confirm(`Delete parent category "${parent.name}"?`))
                      return
                    p.onDel(parent.slug)
                  }}
                >
                  x
                </button>
              </Show>
            </li>
          )}
        </For>
      </ul>
      <Show
        when={isEditing()}
        fallback={<button onclick={() => setIsEditing(true)}>Edit</button>}
      >
        <form
          class={hstack({ gap: "2" })}
          onsubmit={async (e) => {
            e.preventDefault()
            await p.onAdd(slugify(tmpSlug()))
            setTmpSlug("")
          }}
        >
          <Input
            ref={(e) => requestAnimationFrame(() => e.focus())}
            value={tmpSlug()}
            onchange={(e) => setTmpSlug(e.target.value)}
          />
          <button type="submit" disabled={!tmpSlug}>
            +
          </button>
        </form>
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
