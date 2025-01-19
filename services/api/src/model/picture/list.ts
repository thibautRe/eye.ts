import db, { pictures, type Pictures } from "db"
import { paginateBySize } from "../../utils/paginate"

export const listPictures = async ({
  pageSize = 10,
  pageNumber = 0,
}: {
  pageSize: number
  pageNumber: number
}) =>
  await paginateBySize<Pictures>(
    pictures(db).find().orderByDesc("shot_at").toSql(),
    pageSize,
    pageNumber,
  )
