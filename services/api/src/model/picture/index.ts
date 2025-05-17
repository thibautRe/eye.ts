import { batch } from "@databases/dataloader"
import { type PictureId } from "core"
import db, { category_leaves, pictures, q, type Pictures } from "db"

export const getPictureById = batch<PictureId, Pictures>(async (ids) => {
  const pics = await pictures(db)
    .find({ id: q.anyOf(ids) })
    .all()
  const picById = new Map(pics.map((p) => [p.id, p]))
  return {
    get: (id) => {
      if (picById.has(id)) return picById.get(id)!
      throw Object.assign(new Error("Cannot find picture"), { id })
    },
  }
})

export const deletePictureById = async (id: PictureId) => {
  return await db.tx(async (db) => {
    await category_leaves(db).delete({
      id: pictures.key("category_leaf_id", { id }),
    })
    await pictures(db).delete({ id })
  })
}
