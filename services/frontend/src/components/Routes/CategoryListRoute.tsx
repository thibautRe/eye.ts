import { A, useNavigate, useSearchParams } from "@solidjs/router"
import {
  createPaginatedLoader,
  type PaginatedLoader,
} from "../../hooks/createPaginatedLoader"
import { apiGetCategories } from "../../api"
import { MainTitle, PageLayout } from "../PageLayout"
import { For, Show, type VoidComponent } from "solid-js"
import type { CategoryApi } from "api-types"
import { OrphanFilter } from "../Filters/OrphanFilter"
import { routes } from "."
import { hstack, stack } from "../../../styled-system/patterns"
import { TextButton } from "../Form/Button"
import { FormField, FormFieldInline } from "../Form"
import { CategoryCombobox } from "../Category/CategoryCombobox"
import { Checkbox } from "../Form/Checkbox"

export default () => {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams<{
    orphan: "true"
    empty: "true"
  }>()
  const loader = createPaginatedLoader({
    loader: apiGetCategories,
    params: () => ({
      orphan: searchParams.orphan === "true",
      empty: searchParams.empty === "true",
    }),
  })
  return (
    <PageLayout>
      <div class={stack({ direction: "column", paddingInline: "2" })}>
        <MainTitle>Categories</MainTitle>
        <FormField label="Search">
          <CategoryCombobox
            onSelect={(cat) => navigate(routes.Category(cat.slug))}
          />
        </FormField>
        <div class={hstack()}>
          <OrphanFilter
            isOrphan={searchParams.orphan === "true"}
            onIsOrphanChange={(o) =>
              setSearchParams({ orphan: o ? "true" : null })
            }
          />
          <FormFieldInline label="Empty">
            <Checkbox
              checked={searchParams.empty === "true"}
              onCheckedChange={(c) =>
                setSearchParams({ empty: c ? "true" : null })
              }
            />
          </FormFieldInline>
        </div>
        <PaginatedCategories loader={loader} />
      </div>
    </PageLayout>
  )
}

const PaginatedCategories: VoidComponent<{
  loader: PaginatedLoader<CategoryApi>
}> = (p) => {
  const hasMore = () => p.loader.data().nextPage !== null
  return (
    <>
      <Show when={p.loader.data().items.length > 0}>
        <ul>
          <For each={p.loader.data().items}>
            {(category) => (
              <li>
                <A href={routes.Category(category.slug)}>{category.name}</A>
              </li>
            )}
          </For>
        </ul>
      </Show>
      <Show when={hasMore()}>
        <TextButton onClick={p.loader.onLoadNext}>Show more</TextButton>
      </Show>
    </>
  )
}
