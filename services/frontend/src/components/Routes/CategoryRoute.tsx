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
import type { LinkedCategoryApi } from "api-types"
import { routes } from "."
import { css } from "../../../styled-system/css"
import { Input } from "../Form"
import { downloadPicturesZip } from "../../utils/downloadPicturesZip"
import { DeepFilter } from "../Filters/DeepFilter"

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
                onNew={async (name) => {
                  const childCat = await apiCreateCategory({
                    name: name,
                    slug: slugify(name),
                    parentSlug: category().slug,
                  })
                  mutate({
                    ...category(),
                    directChildren: [...category().directChildren, childCat],
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
                <button
                  onclick={async () => {
                    await downloadPicturesZip(picturesParams())
                  }}
                >
                  .zip
                </button>
              </div>
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
  onNew: (name: string) => Promise<void>
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
      <CreateNewCategory onNew={p.onNew} />
    </div>
  )
}

const CreateNewCategory: VoidComponent<{
  onNew: (name: string) => Promise<unknown>
}> = (p) => {
  const [tmpCategoryName, setTmpCategoryName] = createSignal("")
  const [isCreating, setIsCreating] = createSignal(false)
  const [isSubmiting, setIsSubmiting] = createSignal(false)
  return (
    <Show
      when={isCreating()}
      fallback={<button onClick={() => setIsCreating(true)}>Create new</button>}
    >
      <form
        class={hstack()}
        onsubmit={async (e) => {
          e.preventDefault()
          try {
            setIsSubmiting(true)
            await p.onNew(tmpCategoryName())
            setTmpCategoryName("")
          } finally {
            setIsSubmiting(false)
          }
        }}
      >
        <Input
          ref={(e) => requestAnimationFrame(() => e.focus())}
          value={tmpCategoryName()}
          onchange={(e) => setTmpCategoryName(e.target.value)}
        />
        <button disabled={isSubmiting()} type="submit">
          +
        </button>
      </form>
    </Show>
  )
}
