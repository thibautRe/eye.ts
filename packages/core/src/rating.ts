export type Rating = 1 | 2 | 3 | 4 | 5

export const parseRating = (r: unknown): Rating | null => {
  const v =
    typeof r === "number" ? r : typeof r === "string" ? parseInt(r, 10) : null
  if (v === 1 || v === 2 || v === 3 || v === 4 || v === 5) {
    return v
  }
  return null
}
