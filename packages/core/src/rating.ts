export type Rating = 1 | 2 | 3 | 4 | 5

export const parseRating = (r: unknown): Rating | null => {
  const v =
    typeof r === "number" ? r : typeof r === "string" ? parseInt(r, 10) : null
  if (v === 1 || v === 2 || v === 3 || v === 4 || v === 5) {
    return v
  }
  return null
}

export type RatingFilter =
  | {
      type: "eq" | "neq"
      rating: Rating | null
    }
  | {
      type: "gteq" | "lteq"
      rating: Rating
    }

export function parseRatingFilter(f: string | null): RatingFilter | null {
  if (!f) return null
  const [type, r] = f.split(":")
  const rating = parseRating(r)
  if (type === "eq" || type === "neq") return { type, rating }
  if ((type === "gteq" || type === "lteq") && rating !== null)
    return { type, rating }
  return null
}

export function stringifyRatingFilter(ratingFilter: RatingFilter): string {
  return `${ratingFilter.type}:${ratingFilter.rating}`
}
