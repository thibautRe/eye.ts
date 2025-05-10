import { useSearchParams } from "@solidjs/router"
import { apiGetPictures } from "../../api"
import { createPaginatedLoader } from "../../hooks/createPaginatedLoader"
import { PageLayout } from "../PageLayout"
import { PictureGridPaginated } from "../Picture/PictureGridPaginated"
import {
  parseRatingFilter,
  stringifyRatingFilter,
  type Rating,
  type RatingFilter,
} from "core"
import { For, type VoidComponent } from "solid-js"
import { hstack } from "../../../styled-system/patterns"

export default () => {
  const [searchParams, setSearchParams] = useSearchParams<{
    rating: string
    orphan?: "true"
  }>()
  const loader = createPaginatedLoader({
    params: () => ({
      rating: searchParams.rating,
      orphan: searchParams.orphan === "true",
    }),
    loader: apiGetPictures,
  })
  return (
    <PageLayout>
      <div class={hstack({ gap: "4" })}>
        <RatingFilter
          ratingFilter={parseRatingFilter(searchParams.rating ?? "")}
          onRatingFilterChange={(r) =>
            setSearchParams({ rating: r ? stringifyRatingFilter(r) : null })
          }
        />
        <OrphanFilter
          isOrphan={searchParams.orphan === "true"}
          onIsOrphanChange={(o) =>
            setSearchParams({ orphan: o ? "true" : null })
          }
        />
      </div>
      <PictureGridPaginated loader={loader} />
    </PageLayout>
  )
}

const OrphanFilter: VoidComponent<{
  isOrphan: boolean
  onIsOrphanChange: (o: boolean) => void
}> = (p) => (
  <button onClick={() => p.onIsOrphanChange(!p.isOrphan)}>Orphan</button>
)

const RatingFilter: VoidComponent<{
  ratingFilter: RatingFilter | null
  onRatingFilterChange: (ratingFilter: RatingFilter | null) => void
}> = (p) => {
  return (
    <div class={hstack({ gap: "1" })}>
      <For each={new Array(5).fill(null).map((_, i) => (i + 1) as Rating)}>
        {(rating) => (
          <button
            onClick={() => {
              if (
                p.ratingFilter?.type === "gteq" &&
                p.ratingFilter.rating === rating
              ) {
                p.onRatingFilterChange(null)
              } else {
                p.onRatingFilterChange({ type: "gteq", rating })
              }
            }}
          >
            {p.ratingFilter && p.ratingFilter.type === "gteq"
              ? rating <= p.ratingFilter.rating
                ? "★"
                : "☆"
              : "☆"}
          </button>
        )}
      </For>
    </div>
  )
}
