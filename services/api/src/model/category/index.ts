import { batch, dedupeAsync } from "@databases/dataloader"
import db, {
  category_leaves,
  category_parents,
  paginate,
  q,
  sql,
  type CategoryLeaves,
  type PaginateOptions,
  type Queryable,
} from "db"
import createCache from "../../utils/createCache"
import { isNotNull, slugify, type Slug } from "core"
import { getPicturesWithExifTag } from "../picture/exif"

export type CategoryLeavesWithSlug = CategoryLeaves & { slug: string }
export const categoryLeaveHasSlug = (
  cat: CategoryLeaves,
): cat is CategoryLeavesWithSlug => typeof cat.slug === "string"

export const getCategoryLeavesByXmpTag = dedupeAsync(
  batch<string, CategoryLeaves[]>(async (xmpTags) => {
    const leaves = await category_leaves(db)
      .find({ exif_tag: q.anyOf(xmpTags.map((t) => q.caseInsensitive(t))) })
      .all()
    const map = Map.groupBy(leaves, (l) => l.exif_tag?.toLocaleLowerCase())
    return { get: (xmpTag) => map.get(xmpTag.toLocaleLowerCase()) ?? [] }
  }),
  { cache: createCache({ name: "categoryLeavesByXmpTag" }) },
)

export const getCategoryLeaveWithSlug = async (
  db: Queryable,
  slug: Slug,
): Promise<CategoryLeavesWithSlug> =>
  (await category_leaves(db).findOneRequired({
    slug,
  })) as CategoryLeavesWithSlug

export const createCategoryLeaveWithSlug = async ({
  slug,
  name,
  exifTag,
  parentSlug,
  childSlug,
}: {
  slug: string
  name: string
  exifTag?: string
  parentSlug?: Slug
  childSlug?: Slug
}) => {
  return await db.tx(async (db) => {
    const [cat] = await category_leaves(db).insert({
      type: undefined,
      name,
      slug: slugify(slug),
      exif_tag: exifTag,
    })

    const [parent, child] = await Promise.all([
      parentSlug && (await getCategoryLeaveWithSlug(db, parentSlug)),
      childSlug && (await getCategoryLeaveWithSlug(db, childSlug)),
    ])

    if (parent) {
      await category_parents(db).insert({
        parent_id: parent.id,
        child_id: cat.id,
      })
    }
    if (child) {
      await category_parents(db).insert({
        parent_id: cat.id,
        child_id: child.id,
      })
    }

    return cat as CategoryLeavesWithSlug // slug is always defined
  })
}

export const updateCategoryLeaveWithSlug = async ({
  slug,
  name,
  exifTag,
  newSlug,
}: {
  slug: string
  name: string
  exifTag: string | null
  newSlug?: string
}) => {
  const [updated] = await category_leaves(db).update(
    { slug: slugify(slug) },
    {
      name,
      exif_tag: exifTag,
      ...(newSlug ? { slug: slugify(newSlug) } : {}),
    },
  )
  return updated as CategoryLeavesWithSlug
}

export const deleteCategoryLeaveWithSlug = async (slug: Slug) =>
  await category_leaves(db).delete({ slug })

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

export const listCategories = async (
  p: PaginateOptions,
  { orphan, q: searchQuery }: { orphan: boolean; q: string | null },
) => {
  const pattern = searchQuery && `%${searchQuery.toLowerCase().trim()}%`
  return await paginate<CategoryLeavesWithSlug>(
    // @ts-expect-error CategoryLeaves cannot be assigned to CategoryLeavesWithSlug
    category_leaves(db)
      .find(
        q.and<CategoryLeaves>(
          { slug: q.not(null) },
          orphan ? { id: q.not(category_parents.key("child_id")) } : {},
          pattern
            ? q.or<CategoryLeaves>(
                sql`LOWER(slug) LIKE ${pattern}`,
                sql`LOWER(name) LIKE ${pattern}`,
              )
            : {},
        ),
      )
      .orderByAsc("id"),
    p,
  )
}

export const reindexCategory = async (slug: Slug) => {
  const category = await getCategoryLeaveWithSlug(db, slug)
  if (!category.exif_tag) return
  const pictures = await getPicturesWithExifTag(category.exif_tag)
  await category_parents(db).bulkInsertOrIgnore({
    columnsToInsert: ["child_id", "parent_id"],
    records: pictures.map((picture) => ({
      parent_id: category.id,
      child_id: picture.category_leaf_id,
    })),
  })
}
