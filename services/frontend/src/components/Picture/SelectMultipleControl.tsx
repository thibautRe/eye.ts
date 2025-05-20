import type { CategoryApi } from "api-types"
import { type VoidComponent, createSignal, Show } from "solid-js"
import { hstack } from "../../../styled-system/patterns"
import { useMultiselectContext } from "../../contexts/MultiselectContext"
import { CategoryCombobox } from "../Category/CategoryCombobox"
import { FormFieldInline } from "../Form"
import { Checkbox } from "../Form/Checkbox"
import { Button } from "../Form/Button"
import { apiCategoryBulkPictureAdd, apiCategoryBulkPictureDel } from "../../api"

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
              <CategoryCombobox onSelect={(cat) => setCategoryForAction(cat)} />
            }
          >
            {(category) => (
              <>
                {category().name}
                <Button onclick={() => setCategoryForAction(null)}>X</Button>

                <div class={hstack()}>
                  <Button
                    onclick={async () =>
                      apiCategoryBulkPictureAdd({
                        slug: category().slug,
                        pictureIds: [...store.selectedIds.values()],
                      })
                    }
                  >
                    +
                  </Button>
                  <Button
                    onclick={async () =>
                      apiCategoryBulkPictureDel({
                        slug: category().slug,
                        pictureIds: [...store.selectedIds.values()],
                      })
                    }
                  >
                    -
                  </Button>
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
