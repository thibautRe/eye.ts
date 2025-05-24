import { PictureId, Slug } from "core"
import { getCategoryLeaveWithSlug } from "."
import { category_parents } from "db"
import { getPictureById } from "../picture"

export const createCategoryLink = async ({
  parentSlug,
  childSlug,
}: {
  parentSlug: Slug
  childSlug: Slug
}) => {
  const [parent, child] = await Promise.all([
    getCategoryLeaveWithSlug(parentSlug),
    getCategoryLeaveWithSlug(childSlug),
  ])
  await category_parents(db).insert({
    parent_id: parent.id,
    child_id: child.id,
  })
  return { parent, child }
}

export const deleteCategoryLink = async ({
  parentSlug,
  childSlug,
}: {
  parentSlug: Slug
  childSlug: Slug
}) => {
  const [parent, child] = await Promise.all([
    getCategoryLeaveWithSlug(parentSlug),
    getCategoryLeaveWithSlug(childSlug),
  ])
  await category_parents(db).delete({
    parent_id: parent.id,
    child_id: child.id,
  })
  return { parent, child }
}

export const createPicturesCategoryLink = async ({
  slug,
  pictureIds,
}: {
  slug: Slug
  pictureIds: PictureId[]
}) => {
  const [category, pictures] = await Promise.all([
    getCategoryLeaveWithSlug(slug),
    await Promise.all(pictureIds.map(getPictureById)),
  ])
  await category_parents(db).bulkInsertOrIgnore({
    columnsToInsert: ["child_id", "parent_id"],
    records: pictures.map((pic) => ({
      child_id: pic.category_leaf_id,
      parent_id: category.id,
    })),
  })
}

export const deletePicturesCategoryLink = async ({
  slug,
  pictureIds,
}: {
  slug: Slug
  pictureIds: PictureId[]
}) => {
  const [category, pictures] = await Promise.all([
    getCategoryLeaveWithSlug(slug),
    await Promise.all(pictureIds.map(getPictureById)),
  ])
  await category_parents(db).bulkDelete({
    whereColumnNames: ["child_id", "parent_id"],
    whereConditions: pictures.map((pic) => ({
      child_id: pic.category_leaf_id,
      parent_id: category.id,
    })),
  })
}
