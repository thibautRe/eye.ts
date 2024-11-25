import createConnectionPool from "@databases/pg"

export { sql } from "@databases/pg"
export * from "./database"

const db = createConnectionPool({
  bigIntMode: "string",
})
export default db
