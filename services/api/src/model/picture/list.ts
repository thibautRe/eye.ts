import db, { pictures, sql, type SQLQuery } from "db"

const paginate = async (query: SQLQuery, limit: number, offset: number) => {
  const res = await db.query(sql`
    SELECT *, COUNT(*) OVER () FROM (
      ${query}
    ) t LIMIT ${limit} OFFSET ${offset};
   `)
}

export const listPictures = async ({
  pageSize = 10,
  pageNumber = 0,
}: {
  pageSize: number
  pageNumber: number
}) => {
  const paginated = await paginate(
    pictures(db).find().orderByDesc("shot_at").toSql(),
    pageSize,
    pageNumber * pageSize,
  )

  console.log(paginated)
}
