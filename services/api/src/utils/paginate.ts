import db, { type SQLQuery, sql } from "db"

const paginateByLimitOffset = async <T = unknown>(
  query: SQLQuery,
  limit: number,
  offset: number,
) => {
  const res = (await db.query(sql`
    SELECT *, COUNT(*) OVER () FROM (
      ${query}
    ) t LIMIT ${limit + 1} OFFSET ${offset};
   `)) as (T & { count: number })[]

  const count = res.at(0)?.count ?? 0
  const items = res.map(({ count, ...r }) => r)

  return {
    content: items.slice(0, limit),
    count,
    hasMore: items.length === limit + 1,
  }
}

export const paginateBySize = async <T = unknown>(
  query: SQLQuery,
  pageSize: number,
  pageNumber: number,
) => paginateByLimitOffset<T>(query, pageSize, pageNumber * pageSize)
