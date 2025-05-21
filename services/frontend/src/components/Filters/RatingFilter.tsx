import type { Rating, RatingFilter as RF } from "core"
import { For, type VoidComponent } from "solid-js"
import { hstack } from "../../../styled-system/patterns"
import { TextButton } from "../Form/Button"

export const RatingFilter: VoidComponent<{
  ratingFilter: RF | null
  onRatingFilterChange: (ratingFilter: RF | null) => void
}> = (p) => {
  return (
    <div class={hstack({ gap: "1" })}>
      <For each={new Array(5).fill(null).map((_, i) => (i + 1) as Rating)}>
        {(rating) => (
          <TextButton
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
          </TextButton>
        )}
      </For>
    </div>
  )
}
