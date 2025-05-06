import type { CategoryApi, LinkedCategoryApi } from "api-types"
import {
  type CategoryLeavesWithSlug,
  getDirectChildrenCategories,
  categoryLeaveHasSlug,
  getDirectParentCategories,
} from "../model/category"

export const toCategoryApi = async (
  category: CategoryLeavesWithSlug,
): Promise<CategoryApi> => ({
  slug: category.slug,
  exifTag: category.exif_tag,
  name: category.name,
  directChildren: toLinkedCategoryApi(
    (await getDirectChildrenCategories(category.id)).filter(
      categoryLeaveHasSlug,
    ),
  ),
  directParents: toLinkedCategoryApi(
    await getDirectParentCategories(category.id),
  ),
})

export const toCategoryApis = async (
  categories: CategoryLeavesWithSlug[],
): Promise<CategoryApi[]> => await Promise.all(categories.map(toCategoryApi))

export const toLinkedCategoryApi = (
  categories: CategoryLeavesWithSlug[],
): LinkedCategoryApi[] =>
  categories.map((l) => ({ name: l.name, slug: l.slug }))
