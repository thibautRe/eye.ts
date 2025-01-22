import { batch, dedupeAsync } from "@databases/dataloader"
import db, { category_leaves, q, type CategoryLeaves } from "db"
import createCache from "../../utils/createCache"

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
