import { useParams, useSearchParams } from "@solidjs/router"
import { parseRatingFilter, slugify, stringifyRatingFilter } from "core"
import { createPaginatedLoader } from "../../hooks/createPaginatedLoader"
import {
  apiCategoryParentAdd,
  apiCategoryParentDel,
  apiGetCategory,
  apiGetPictures,
} from "../../api"
import { createResource, For, Show, type VoidComponent } from "solid-js"
import { MainTitle, PageLayout } from "../PageLayout"
import { RatingFilter } from "../Filters/RatingFilter"
import { PictureGridPaginated } from "../Picture/PictureGridPaginated"
import { stack } from "../../../styled-system/patterns"
import { ParentCategory } from "../Category/ParentCategories"
import type { LinkedCategoryApi } from "api-types"
import { routes } from "."

export default () => {
  const params = useParams<{ slug: string }>()
  const [searchParams, setSearchParams] = useSearchParams<{
    rating: string
  }>()

  const slug = () => slugify(params.slug)

  const [category, { mutate }] = createResource(slug, apiGetCategory)
  const loader = createPaginatedLoader({
    params: () => ({ rating: searchParams.rating, parent: slug() }),
    loader: apiGetPictures,
  })
  return (
    <PageLayout>
      <Show when={category()}>
        {(category) => (
          <div class={stack({ direction: "column" })}>
            <ParentCategory
              parents={category().directParents}
              onAdd={async (parentSlug) => {
                mutate(
                  await apiCategoryParentAdd({ parentSlug, childSlug: slug() }),
                )
              }}
              onDel={async (parentSlug) => {
                mutate(
                  await apiCategoryParentDel({ parentSlug, childSlug: slug() }),
                )
              }}
            />
            <div class={stack({ direction: "column", paddingInline: "2" })}>
              <MainTitle>{category().name}</MainTitle>
              <ChildrenCategory directChildren={category().directChildren} />
              <RatingFilter
                ratingFilter={parseRatingFilter(searchParams.rating ?? "")}
                onRatingFilterChange={(r) =>
                  setSearchParams({
                    rating: r ? stringifyRatingFilter(r) : null,
                  })
                }
              />
              <PictureGridPaginated loader={loader} />
            </div>
          </div>
        )}
      </Show>
    </PageLayout>
  )
}

const ChildrenCategory: VoidComponent<{
  directChildren: LinkedCategoryApi[]
}> = (p) => {
  return (
    <Show when={p.directChildren.length > 0}>
      <h2>Subcategories</h2>
      <ul>
        <For each={p.directChildren}>
          {(directChildren) => (
            <li>
              <a href={routes.Category(directChildren.slug)}>
                {directChildren.name}
              </a>
            </li>
          )}
        </For>
      </ul>
    </Show>
  )
}
