import createConnectionPool from "@databases/pg"
import { asyncLocalStorage, log, error } from "backend-logs"

export { sql, type SQLQuery } from "@databases/pg"
export * from "./database"
export * from "./q"

const db = createConnectionPool({
  bigIntMode: "string",
  onQueryStart: (_q, { text }) => {
    const s = asyncLocalStorage.getStore()
    if (s) s.dbQueries++
    log(`🗄️  Query: ${text}`)
  },
  onQueryError(_q, _f, err) {
    error(`Query error!`, err)
  },
})
export default db
