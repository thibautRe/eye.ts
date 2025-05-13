import db, {
  category_parents,
  count,
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
import { parseRatingFilter, slugify, type RatingFilter } from "core"
import { SearchParams } from "../../utils/buildHandlers"
import { PictureListSearchParams } from "api-types"

const getPictureLeaves = async (
  parent: string | null,
): Promise<CategoryLeaves["id"][] | undefined> => {
  if (!parent) return undefined
  const parentCat = await getCategoryLeaveWithSlug(db, slugify(parent))
  const childrenCats = await getDirectChildrenCategories(parentCat.id)
  return childrenCats.map((c) => c.id)
}

const getPictureListQuery = async (
  params: SearchParams<PictureListSearchParams>,
) => {
  const leafIds = await getPictureLeaves(params.get("parent"))
  return pictures(db)
    .find(
      q.and(
        leafIds ? { category_leaf_id: q.anyOf(leafIds) } : {},
        params.has("orphan")
          ? { category_leaf_id: q.not(category_parents.key("child_id")) }
          : {},
        ratingFilterToCondition(parseRatingFilter(params.get("rating"))),
      ),
    )
    .orderByDesc("shot_at")
}

export const listPicturesPaginate = async (
  p: PaginateOptions,
  params: SearchParams<PictureListSearchParams>,
) => {
  return await paginate(await getPictureListQuery(params), p)
}
export const listPictures = async (
  params: SearchParams<PictureListSearchParams>,
) => await (await getPictureListQuery(params)).all()
export const countPictures = async (
  params: SearchParams<PictureListSearchParams>,
) => await count(await getPictureListQuery(params))

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
