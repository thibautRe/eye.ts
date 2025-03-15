import db, {
  category_parents,
  paginate,
  pictures,
  q,
  sql,
  type CategoryLeaves,
  type PaginateOptions,
  type Pictures,
  type WhereCondition,
} from "db"
import {
  getCategoryLeaveWithSlug,
  getDirectChildrenCategories,
} from "../category"
import { slugify, type RatingFilter } from "core"

const getPictureLeaves = async (
  parent: string | null,
): Promise<CategoryLeaves["id"][] | undefined> => {
  if (!parent) return undefined
  const parentCat = await getCategoryLeaveWithSlug(slugify(parent))
  const childrenCats = await getDirectChildrenCategories(parentCat.id)
  return childrenCats.map((c) => c.id)
}

export const listPictures = async (
  p: PaginateOptions,
  {
    parent,
    orphan,
    rating,
  }: { parent: string | null; orphan: boolean; rating: RatingFilter | null },
) => {
  const leafIds = await getPictureLeaves(parent)
  return await paginate(
    pictures(db)
      .find(
        q.and(
          leafIds ? { category_leaf_id: q.anyOf(leafIds) } : {},
          orphan
            ? { category_leaf_id: q.not(category_parents.key("child_id")) }
            : {},
          ratingFilterToCondition(rating),
        ),
      )
      .orderByDesc("shot_at"),
    p,
  )
}

function ratingFilterToCondition(
  r: RatingFilter | null,
): WhereCondition<Pictures> {
  if (!r) return {}
  switch (r.type) {
    case "eq":
      return { rating: r.rating }
    case "neq":
      return sql`rating IS DISTINCT FROM ${r.rating}` // https://stackoverflow.com/questions/36508815/not-equal-and-null-in-postgres
    case "lteq":
      return q.or({ rating: r.rating }, { rating: q.lessThan(r.rating) })
    case "gteq":
      return q.or({ rating: r.rating }, { rating: q.greaterThan(r.rating) })
    default:
      return r satisfies never
  }
}
