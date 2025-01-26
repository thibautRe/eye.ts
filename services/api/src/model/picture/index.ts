import { batch } from "@databases/dataloader"
import { type PictureId } from "core"
import db, { pictures, q, type Pictures } from "db"

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
