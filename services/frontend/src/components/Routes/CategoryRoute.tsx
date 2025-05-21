import { A, useParams, useSearchParams } from "@solidjs/router"
import { parseRatingFilter, slugify, stringifyRatingFilter } from "core"
import { createPaginatedLoader } from "../../hooks/createPaginatedLoader"
import {
  apiCategoryParentAdd,
  apiCategoryParentDel,
  apiCreateCategory,
  apiGetCategory,
  apiGetPictures,
  type ApiGetPicturesParams,
} from "../../api"
import {
  createResource,
  createSignal,
  For,
  Show,
  type Accessor,
  type VoidComponent,
} from "solid-js"
import { MainTitle, PageLayout } from "../PageLayout"
import { RatingFilter } from "../Filters/RatingFilter"
import { PictureGridPaginated } from "../Picture/PictureGridPaginated"
import { hstack, stack, vstack } from "../../../styled-system/patterns"
import { ParentCategory } from "../Category/ParentCategories"
import type { CategoryApi, LinkedCategoryApi } from "api-types"
import { routes } from "."
import { css } from "../../../styled-system/css"
import { downloadPicturesZip } from "../../utils/downloadPicturesZip"
import { DeepFilter } from "../Filters/DeepFilter"
import { MultiselectContextProvider } from "../../contexts/MultiselectContext"
import { SelectMultipleControl } from "../Picture/SelectMultipleControl"
import { TextButton } from "../Form/Button"
import { CategoryCombobox } from "../Category/CategoryCombobox"

export default () => {
  const params = useParams<{ slug: string }>()
  const [searchParams, setSearchParams] = useSearchParams<{
    rating: string
    deep: "true"
  }>()

  const slug = () => slugify(decodeURIComponent(params.slug))

  const [category, { mutate }] = createResource(slug, apiGetCategory)
  const picturesParams: Accessor<ApiGetPicturesParams> = () => ({
    parent: slug(),
    rating: searchParams.rating,
    deep: searchParams.deep === "true",
  })
  const loader = createPaginatedLoader({
    params: picturesParams,
    loader: apiGetPictures,
  })
  return (
    <PageLayout>
      <Show when={category()}>
        {(category) => (
          <div class={stack({ direction: "column" })}>
            <ParentCategory
              parents={category().directParents}
              onCreate={async (name) => {
                const parentCat = await apiCreateCategory({
                  name: name,
                  slug: slugify(name),
                  childSlug: category().slug,
                })
                mutate({
                  ...category(),
                  directParents: [...category().directParents, parentCat],
                })
              }}
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
              <div class={hstack({ alignItems: "center" })}>
                <MainTitle>{category().name}</MainTitle>
                <A href={routes.CategoryEdit(category().slug)}>Edit</A>
              </div>
              <ChildrenCategory
                directChildren={category().directChildren}
                onCreateChild={async (name) => {
                  const cat = await apiCreateCategory({
                    name,
                    slug: slugify(name),
                    parentSlug: category().slug,
                  })
                  mutate({
                    ...category(),
                    directChildren: [...category().directChildren, cat],
                  })
                }}
                onAddChild={async (cat) => {
                  await apiCategoryParentAdd({
                    childSlug: cat.slug,
                    parentSlug: category().slug,
                  })
                  mutate({
                    ...category(),
                    directChildren: [...category().directChildren, cat],
                  })
                }}
              />
              <div class={hstack()}>
                <RatingFilter
                  ratingFilter={parseRatingFilter(searchParams.rating ?? "")}
                  onRatingFilterChange={(r) =>
                    setSearchParams({
                      rating: r ? stringifyRatingFilter(r) : null,
                    })
                  }
                />
                <DeepFilter
                  isDeep={searchParams.deep === "true"}
                  onIsDeepChange={(d) =>
                    setSearchParams({ deep: d ? "true" : null })
                  }
                />
                <TextButton
                  onclick={async () => {
                    await downloadPicturesZip(picturesParams())
                  }}
                >
                  .zip
                </TextButton>
              </div>
              <MultiselectContextProvider pictures={loader.data().items}>
                <SelectMultipleControl />
                <PictureGridPaginated loader={loader} />
              </MultiselectContextProvider>
            </div>
          </div>
        )}
      </Show>
    </PageLayout>
  )
}

const ChildrenCategory: VoidComponent<{
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
        <TextButton onClick={() => setIsEditing(true)}>Edit</TextButton>
      }
    >
      <CategoryCombobox onSelect={p.onAddChild} onCreate={p.onCreateChild} />
    </Show>
  )
}
