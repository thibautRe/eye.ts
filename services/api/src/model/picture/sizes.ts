import { batch } from "@databases/dataloader"
import db, { picture_sizes, q, type Pictures, type PictureSizes } from "db"

export const getPictureSizesForPictureId = batch<
  Pictures["id"],
  PictureSizes[]
>(async (ids) => {
  const data = await picture_sizes(db)
    .find({ picture_id: q.anyOf(ids) })
    .all()
  const map = Map.groupBy(data, (p) => p.picture_id)
  return { get: (id) => (map.has(id) ? map.get(id)! : []) }
})
