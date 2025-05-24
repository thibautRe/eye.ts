import { type LinkedCategoryApi, type CategoryApi } from "api-types"
import { type VoidComponent, Show, For, createSignal } from "solid-js"
import { css } from "../../../styled-system/css"
import { vstack } from "../../../styled-system/patterns"
import { TextButton } from "../Form/Button"
import { CategoryCombobox } from "./CategoryCombobox"
import { routes } from "../Routes"
import { AdminFence } from "../AdminFence"

export const ChildrenCategories: VoidComponent<{
  directChildren: LinkedCategoryApi[]
  onAddChild: (cat: CategoryApi) => Promise<void>
  onCreateChild: (name: string) => Promise<void>
}> = (p) => {
  return (
    <div class={vstack({ alignItems: "flex-start" })}>
      <h2>Subcategories</h2>
      <Show when={p.directChildren.length > 0}>
        <ul>
          <For each={p.directChildren}>
            {(directChildren) => (
              <li>
                <a
                  href={routes.Category(directChildren.slug)}
                  class={css({ textDecoration: "underline" })}
                >
                  {directChildren.name}
                </a>
              </li>
            )}
          </For>
        </ul>
      </Show>
      <AddChildCategory
        onAddChild={p.onAddChild}
        onCreateChild={p.onCreateChild}
      />
    </div>
  )
}

const AddChildCategory: VoidComponent<{
  onAddChild: (cat: CategoryApi) => Promise<void>
  onCreateChild: (name: string) => Promise<void>
}> = (p) => {
  const [isEditing, setIsEditing] = createSignal(false)
  return (
    <Show
      when={isEditing()}
      fallback={
        <AdminFence>
          <TextButton onClick={() => setIsEditing(true)}>Edit</TextButton>
        </AdminFence>
      }
    >
      <CategoryCombobox onSelect={p.onAddChild} onCreate={p.onCreateChild} />
    </Show>
  )
}
