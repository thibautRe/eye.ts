import createConnectionPool from "@databases/pg"

export { sql, type SQLQuery } from "@databases/pg"
export * from "./database"
export * from "./q"

const db = createConnectionPool({
  bigIntMode: "string",
})
export default db
