import { sql } from "@databases/pg"
import { db } from "./db"
import type { PartialSelectQuery } from "@databases/pg-typed"

type PaginatableQuery<T> = PartialSelectQuery<T, "limit" | "toSql">

const paginateByLimitOffset = async <T = unknown>(
  query: PaginatableQuery<T>,
  limit: number,
  offset: number,
) => {
  // https://github.com/ForbesLindesay/atdatabases/issues/234
  const res = (await db.query(sql`
    SELECT * FROM (${query.toSql()}) t LIMIT ${limit + 1} OFFSET ${offset};
   `)) as T[]

  return {
    content: res.slice(0, limit),
    hasMore: res.length === limit + 1,
  }
}

export interface PaginateOptions {
  pageSize: number
  pageNumber: number
}
export const paginate = async <T = unknown>(
  query: PaginatableQuery<T>,
  { pageSize, pageNumber }: PaginateOptions,
) => paginateByLimitOffset<T>(query, pageSize, pageNumber * pageSize)
