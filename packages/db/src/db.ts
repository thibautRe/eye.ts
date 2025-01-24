import createConnectionPool from "@databases/pg"
import { asyncLocalStorage, log, error } from "backend-logs"

export const db = createConnectionPool({
  bigIntMode: "string",
  queryTimeoutMilliseconds: 10_000,
  onQueryStart: (_q, { text }) => {
    const s = asyncLocalStorage.getStore()
    if (s) s.dbQueries++
    log(`🗄️  Query: ${text}`)
  },
  onQueryError(_q, _f, err) {
    error(`Query error!`, err)
  },
})
