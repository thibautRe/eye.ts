import { sql, SQLQuery } from "@databases/pg"
import { db } from "./db"

export const count = async (query: SQLQuery): Promise<number> => {
  const [{ count }] = await db.query(sql`
    SELECT count(*) FROM (${query});
   `)
  return count
}
