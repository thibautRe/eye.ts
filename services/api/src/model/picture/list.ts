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
  const parentCat = await getCategoryLeaveWithSlug(db, slugify(parent))
  const childrenCats = await getDirectChildrenCategories(parentCat.id)
  return childrenCats.map((c) => c.id)
}

interface PictureListParams {
  parent: string | null
  orphan: boolean
  rating: RatingFilter | null
}

const getPictureListQuery = async ({
  parent,
  orphan,
  rating,
}: PictureListParams) => {
  const leafIds = await getPictureLeaves(parent)
  return pictures(db)
    .find(
      q.and(
        leafIds ? { category_leaf_id: q.anyOf(leafIds) } : {},
        orphan
          ? { category_leaf_id: q.not(category_parents.key("child_id")) }
          : {},
        ratingFilterToCondition(rating),
      ),
    )
    .orderByDesc("shot_at")
}

export const listPicturesPaginate = async (
  p: PaginateOptions,
  params: PictureListParams,
) => {
  return await paginate(await getPictureListQuery(params), p)
}
export const listPictures = async (params: PictureListParams) =>
  await (await getPictureListQuery(params)).all()

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
