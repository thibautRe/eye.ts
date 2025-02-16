import db, {
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
  args: { parent: string | null },
) => {
  const leafIds = await getPictureLeaves(args.parent)
  return await paginate(
    pictures(db)
      .find({
        ...(leafIds ? { category_leaf_id: q.anyOf(leafIds) } : {}),
      })
      .orderByDesc("shot_at"),
    p,
  )
}
