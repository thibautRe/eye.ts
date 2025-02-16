import createConnectionPool from "@databases/pg"
import { asyncLocalStorage, log, error } from "backend-logs"

declare global {
  var db: any
}

// if there's already a connection pool, destroy it. This can happen
// in development when Bun hot reloads
if (globalThis.db) {
  globalThis.db.dispose()
}

export const db = (globalThis.db = createConnectionPool({
  bigIntMode: "string",
  onConnectionOpened: () => {
    log("DB Connection opened")
  },
  onError: error,
  queryTimeoutMilliseconds: 10_000,
  onQueryStart: (_q, { text }) => {
    const s = asyncLocalStorage.getStore()
    if (s) s.dbQueries++
    log(`🗄️  Query: ${text}`)
  },
  onQueryError(_q, _f, err) {
    error(`Query error!`, err)
  },
}))
