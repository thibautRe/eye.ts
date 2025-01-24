import db, { paginateBySize, pictures } from "db"

export const listPictures = async ({
  pageSize = 10,
  pageNumber = 0,
}: {
  pageSize: number
  pageNumber: number
}) =>
  await paginateBySize(
    pictures(db).find().orderByDesc("shot_at"),
    pageSize,
    pageNumber,
  )
