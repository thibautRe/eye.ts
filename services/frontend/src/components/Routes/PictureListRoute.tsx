import { parseRatingFilter, stringifyRatingFilter } from "core"
import { useSearchParams } from "@solidjs/router"
import { apiGetPictures } from "../../api"
import { createPaginatedLoader } from "../../hooks/createPaginatedLoader"
import { PageLayout } from "../PageLayout"
import { PictureGridPaginated } from "../Picture/PictureGridPaginated"
import { hstack } from "../../../styled-system/patterns"
import { RatingFilter } from "../Filters/RatingFilter"
import { OrphanFilter } from "../Filters/OrphanFilter"

export default () => {
  const [searchParams, setSearchParams] = useSearchParams<{
    rating: string
    orphan: "true"
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
