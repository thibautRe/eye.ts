import { batch, dedupeAsync } from "@databases/dataloader"
import db, {
  category_leaves,
  category_parents,
  paginate,
  q,
  type CategoryLeaves,
  type PaginateOptions,
} from "db"
import createCache from "../../utils/createCache"
import { isNotNull } from "core"

export type CategoryLeavesWithSlug = CategoryLeaves & { slug: string }
export const categoryLeaveHasSlug = (
  cat: CategoryLeaves,
): cat is CategoryLeavesWithSlug => typeof cat.slug === "string"

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

export const getCategoryLeaveWithSlug = async (
  slug: string,
): Promise<CategoryLeavesWithSlug> =>
  (await category_leaves(db).findOneRequired({
    slug: slug.trim().toLowerCase(),
  })) as CategoryLeavesWithSlug

export const createCategoryLeaveWithSlug = async ({
  slug,
  name,
  exifTag,
}: {
  slug: string
  name: string
  exifTag: string
}) =>
  (
    await category_leaves(db).insert({
      type: undefined,
      name,
      slug,
      exif_tag: exifTag,
    })
  )[0] as CategoryLeavesWithSlug

export const getCategoryLeavesIdByXmpTag = async (xmpTags: string[]) => {
  const leaves = (
    await Promise.all(xmpTags.map(getCategoryLeavesByXmpTag))
  ).flat(1)
  return [...new Set(leaves.map((l) => l.id))]
}

export const getDirectParentCategories = batch<
  CategoryLeaves["id"],
  CategoryLeavesWithSlug[]
>(async (childIds) => {
  const parents = await category_parents(db)
    .find({ child_id: q.anyOf(childIds) })
    .all()
  const leaves = (await category_leaves(db)
    .find({ id: q.anyOf(parents.map((p) => p.parent_id)) })
    .andWhere({ slug: q.not(null) })
    .all()) as CategoryLeavesWithSlug[]

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

export const listCategories = async (p: PaginateOptions) => {
  return await paginate<CategoryLeavesWithSlug>(
    // @ts-expect-error CategoryLeaves cannot be assigned to CategoryLeavesWithSlug
    category_leaves(db)
      .find({ slug: q.not(null) })
      .orderByAsc("id"),
    p,
  )
}
