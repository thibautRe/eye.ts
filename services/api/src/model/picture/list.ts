import db, {
  category_leaves,
  category_parents,
  count,
  paginate,
  pictures,
  q,
  sql,
  SQLQuery,
  type CategoryLeaves,
  type PaginateOptions,
  type Pictures,
  type WhereCondition,
} from "db"
import {
  getCategoryLeaveWithSlug,
  getDirectChildrenCategories,
} from "../category"
import { parseRatingFilter, Slug, slugify, type RatingFilter } from "core"
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

/**
 * WITH RECURSIVE rec(id) AS (
 *  SELECT child_id FROM category_parents WHERE parent_id = 12345
 *  UNION SELECT p.child_id FROM rec c, category_parents p WHERE c.child_id = p.parent_id
 * )
 * SELECT * from pictures WHERE category_leaf_id IN (SELECT child_id FROM rec);
 *
 */

const getDeepPictureListQuery = async ({
  slug,
  rating,
}: {
  slug: Slug
  rating: string | null
}) => {
  const baseQuery = category_parents(db)
    .find({ parent_id: category_leaves.key("id", { slug }) })
    .select("child_id")
  const pictureSelect = pictures(db)
    .find(
      q.and(
        sql`category_leaf_id IN (SELECT child_id FROM rec)` as WhereCondition<Pictures>,
        ratingFilterToCondition(parseRatingFilter(rating)),
      ),
    )
    .orderByDesc("shot_at")
  return sql`
    WITH RECURSIVE rec(child_id) AS (
      ${baseQuery.toSql()}
      UNION SELECT p.child_id FROM rec c, category_parents p WHERE c.child_id = p.parent_id
    )
    ${pictureSelect.toSql()}
  `
}

const getPictureListQuery = async (
  params: SearchParams<PictureListSearchParams>,
): Promise<SQLQuery> => {
  if (params.has("deep")) {
    const parent = params.get("parent")
    if (!parent) {
      throw new Error("Query with deep must specify parent")
    }
    return getDeepPictureListQuery({
      slug: slugify(parent),
      rating: params.get("rating"),
    })
  }
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
    .toSql()
}

export const listPicturesPaginate = async (
  p: PaginateOptions,
  params: SearchParams<PictureListSearchParams>,
) => {
  return await paginate<Pictures>(await getPictureListQuery(params), p)
}
export const listPictures = async (
  params: SearchParams<PictureListSearchParams>,
) => (await db.query(await getPictureListQuery(params))) as Pictures[]
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
