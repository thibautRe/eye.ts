import {
  createMemo,
  createResource,
  createSignal,
  createUniqueId,
  For,
  Show,
  Suspense,
  type VoidComponent,
} from "solid-js"
import * as combobox from "@zag-js/combobox"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { apiGetCategories } from "../../api"
import { createDebouncedSignal } from "../../hooks/createDebouncedSignal"
import { input } from "../Form"
import { vstack } from "../../../styled-system/patterns"
import { css } from "../../../styled-system/css"
import type { CategoryApi } from "api-types"

export const CategoryCombobox: VoidComponent<{
  onSelect: (category: CategoryApi) => void
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
    combobox.collection({
      items: categories.latest,
      itemToValue: (item) => item.slug,
      itemToString: (item) => item.name,
    }),
  )

  const service = useMachine(
    combobox.machine as combobox.Machine<CategoryApi>,
    {
      id: createUniqueId(),
      inputBehavior: "autohighlight",
      autoFocus: true,
      get collection() {
        return collection()
      },
      onSelect({ itemValue }) {
        const item = collection().find(itemValue)
        if (item) p.onSelect(item)
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
      <div {...api().getPositionerProps()}>
        <Suspense>
          <Show when={categories().length > 0}>
            <ul {...api().getContentProps()} class={content}>
              <For each={categories()}>
                {(i) => (
                  <li {...api().getItemProps({ item: i })} class={item}>
                    {i.name}
                  </li>
                )}
              </For>
            </ul>
          </Show>
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
  "&[data-highlighted]": {
    bg: "Highlight",
    color: "HighlightText",
  },
})
