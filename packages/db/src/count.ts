import { sql } from "@databases/pg"
import { db } from "./db"
import type { PartialSelectQuery } from "@databases/pg-typed"

type PaginatableQuery<T> = PartialSelectQuery<T, "toSql">

export const count = async <T = unknown>(
  query: PaginatableQuery<T>,
): Promise<number> => {
  const [{ count }] = await db.query(sql`
    SELECT count(*) FROM (${query.toSql()});
   `)

  return count
}
