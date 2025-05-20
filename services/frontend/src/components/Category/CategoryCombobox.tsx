import {
  createMemo,
  createResource,
  createSignal,
  createUniqueId,
  For,
  Suspense,
  type VoidComponent,
} from "solid-js"
import * as combobox from "@zag-js/combobox"
import { mergeProps, normalizeProps, useMachine } from "@zag-js/solid"
import { apiGetCategories } from "../../api"
import { createDebouncedSignal } from "../../hooks/createDebouncedSignal"
import { input } from "../Form"
import { vstack } from "../../../styled-system/patterns"
import { css } from "../../../styled-system/css"
import type { CategoryApi } from "api-types"

type CategoryCollectionItem =
  | {
      type: "category"
      category: CategoryApi
    }
  | {
      type: "special"
      special: "new"
    }

const specialNewItem: CategoryCollectionItem = {
  type: "special",
  special: "new",
}

export const CategoryCombobox: VoidComponent<{
  onSelect: (category: CategoryApi) => void
  onCreate: (name: string) => Promise<void>
}> = (p) => {
  const [query, setQuery] = createSignal("")
  const debouncedQuery = createDebouncedSignal(query, { wait: 300 })
  const [categories] = createResource(
    debouncedQuery,
    async (query) =>
      query?.length > 2
        ? (await apiGetCategories({ page: 0 }, { q: query })).items
        : [],
    { initialValue: [] },
  )

  const collection = createMemo(() =>
    combobox.collection<CategoryCollectionItem>({
      items: [
        ...categories.latest.map(
          (category): CategoryCollectionItem => ({
            type: "category",
            category,
          }),
        ),
        {
          type: "special",
          special: "new",
        },
      ],
      itemToValue: (item) =>
        item.type === "category"
          ? item.category.slug
          : `special/${item.special}`,
      itemToString: (item) =>
        item.type === "category" ? item.category.name : item.special,
    }),
  )

  const service = useMachine(
    combobox.machine as combobox.Machine<CategoryCollectionItem>,
    {
      id: createUniqueId(),
      inputBehavior: "autohighlight",
      autoFocus: true,
      get collection() {
        return collection()
      },
      selectionBehavior: "clear",
      onSelect({ itemValue }) {
        const item = collection().find(itemValue)
        if (item?.type === "category") {
          p.onSelect(item.category)
        } else if (item?.type === "special" && item.special === "new") {
          p.onCreate(query())
        }
      },
      onInputValueChange({ inputValue }) {
        setQuery(inputValue)
      },
    },
  )
  const api = createMemo(() => combobox.connect(service, normalizeProps))

  return (
    <div>
      <div {...api().getRootProps()}>
        <div {...api().getControlProps()}>
          <input class={input} {...api().getInputProps()} />
        </div>
      </div>
      <div
        {...mergeProps(api().getPositionerProps, { style: { "z-index": 100 } })}
      >
        <Suspense>
          <ul {...api().getContentProps()} class={content}>
            <For each={categories()}>
              {(i) => (
                <li
                  {...api().getItemProps({ item: collection().find(i.slug) })}
                  class={item}
                >
                  {i.name}
                </li>
              )}
            </For>
            <div {...api().getItemProps({ item: specialNewItem })} class={item}>
              Create "{query()}"
            </div>
          </ul>
        </Suspense>
      </div>
    </div>
  )
}

const content = vstack({
  alignItems: "stretch",
  gap: 0,
  p: "0.5",
  bg: "white",
  borderRadius: "md",
  overflow: "hidden",
  boxShadow: "md",
})
const item = css({
  paddingInline: "2",
  paddingBlock: "1",
  borderRadius: "md",
  "&[data-highlighted]": {
    bg: "Highlight",
    color: "HighlightText",
  },
})
