import db, {
  category_parents,
  paginate,
  pictures,
  q,
  type CategoryLeaves,
  type PaginateOptions,
} from "db"
import {
  getCategoryLeaveWithSlug,
  getDirectChildrenCategories,
} from "../category"
import { slugify } from "core"

const getPictureLeaves = async (
  parent: string | null,
): Promise<CategoryLeaves["id"][] | undefined> => {
  if (!parent) return undefined
  const parentCat = await getCategoryLeaveWithSlug(slugify(parent))
  const childrenCats = await getDirectChildrenCategories(parentCat.id)
  console.log(childrenCats)
  return childrenCats.map((c) => c.id)
}

export const listPictures = async (
  p: PaginateOptions,
  { parent, orphan }: { parent: string | null; orphan: boolean },
) => {
  const leafIds = await getPictureLeaves(parent)
  return await paginate(
    pictures(db)
      .find(
        q.and(
          ...[
            ...(leafIds ? [{ category_leaf_id: q.anyOf(leafIds) }] : []),
            ...(orphan
              ? [{ category_leaf_id: q.not(category_parents.key("child_id")) }]
              : []),
          ],
        ),
      )
      .orderByDesc("shot_at"),
    p,
  )
}
