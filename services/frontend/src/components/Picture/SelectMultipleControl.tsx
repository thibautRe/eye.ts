import type { CategoryApi } from "api-types"
import { type VoidComponent, createSignal, Show } from "solid-js"
import { hstack } from "../../../styled-system/patterns"
import { useMultiselectContext } from "../../contexts/MultiselectContext"
import { CategoryCombobox } from "../Category/CategoryCombobox"
import { FormFieldInline } from "../Form"
import { Checkbox } from "../Form/Checkbox"
import { TextButton } from "../Form/Button"
import {
  apiCategoryBulkPictureAdd,
  apiCategoryBulkPictureDel,
  apiCreateCategory,
} from "../../api"
import { slugify } from "core"

export const SelectMultipleControl: VoidComponent = () => {
  const [store, updater] = useMultiselectContext()
  const [categoryForAction, setCategoryForAction] =
    createSignal<CategoryApi | null>(null)
  return (
    <div class={hstack()}>
      <Show when={store.enabled && store.selectedIds.size > 0}>
        <div class={hstack()}>
          <Show
            when={categoryForAction()}
            fallback={
              <CategoryCombobox
                onSelect={(cat) => setCategoryForAction(cat)}
                onCreate={async (name) => {
                  setCategoryForAction(
                    await apiCreateCategory({ slug: slugify(name), name }),
                  )
                }}
              />
            }
          >
            {(category) => (
              <>
                {category().name}
                <TextButton onclick={() => setCategoryForAction(null)}>
                  X
                </TextButton>

                <div class={hstack()}>
                  <TextButton
                    onclick={async () =>
                      apiCategoryBulkPictureAdd({
                        slug: category().slug,
                        pictureIds: [...store.selectedIds.values()],
                      })
                    }
                  >
                    +
                  </TextButton>
                  <TextButton
                    onclick={async () =>
                      apiCategoryBulkPictureDel({
                        slug: category().slug,
                        pictureIds: [...store.selectedIds.values()],
                      })
                    }
                  >
                    -
                  </TextButton>
                </div>
              </>
            )}
          </Show>
        </div>
      </Show>
      <FormFieldInline label="Multiselect">
        <Checkbox
          checked={store.enabled}
          onCheckedChange={updater.onChangeEnabled}
        />
      </FormFieldInline>
    </div>
  )
}
