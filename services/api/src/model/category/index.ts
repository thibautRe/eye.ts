import { batch, dedupeAsync } from "@databases/dataloader"
import db, {
  category_leaves,
  category_parents,
  q,
  type CategoryLeaves,
} from "db"
import createCache from "../../utils/createCache"
import { isNotNull } from "core"

export const getCategoryLeavesByXmpTag = dedupeAsync(
  batch<string, CategoryLeaves[]>(async (xmpTags) => {
    const leaves = await category_leaves(db)
      .find({
        exif_tag: q.anyOf(xmpTags),
      })
      .all()
    const map = Map.groupBy(leaves, (l) => l.exif_tag)
    return {
      get: (xmpTag) => map.get(xmpTag) ?? [],
    }
  }),
  { cache: createCache({ name: "categoryLeavesByXmpTag" }) },
)

export const getCategoryLeavesIdByXmpTag = async (xmpTags: string[]) => {
  const leaves = (
    await Promise.all(xmpTags.map(getCategoryLeavesByXmpTag))
  ).flat(1)
  return [...new Set(leaves.map((l) => l.id))]
}

export const getDirectParentCategories = batch<
  CategoryLeaves["id"],
  CategoryLeaves[]
>(async (childIds) => {
  const parents = await category_parents(db)
    .find({ child_id: q.anyOf(childIds) })
    .all()
  const leaves = await category_leaves(db)
    .find({ id: q.anyOf(parents.map((p) => p.parent_id)) })
    .all()

  const parentsMap = Map.groupBy(parents, (p) => p.child_id)
  const leavesMap = new Map(leaves.map((l) => [l.id, l]))
  return {
    get: (childId) =>
      parentsMap
        .get(childId)
        ?.map((p) => leavesMap.get(p.parent_id) ?? null)
        .filter(isNotNull) ?? [],
  }
})

export const getDirectChildrenCategories = batch<
  CategoryLeaves["id"],
  CategoryLeaves[]
>(async (parentIds) => {
  const parents = await category_parents(db)
    .find({ parent_id: q.anyOf(parentIds) })
    .all()
  const leaves = await category_leaves(db)
    .find({ id: q.anyOf(parents.map((p) => p.child_id)) })
    .all()

  const parentsMap = Map.groupBy(parents, (p) => p.parent_id)
  const leavesMap = new Map(leaves.map((l) => [l.id, l]))
  return {
    get: (parentId) =>
      parentsMap
        .get(parentId)
        ?.map((p) => leavesMap.get(p.child_id) ?? null)
        .filter(isNotNull) ?? [],
  }
})
