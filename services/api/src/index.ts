import db, { users } from "db"

declare module "bun" {
  interface Env {
    EYE_API_PORT: string
  }
}

const server = Bun.serve({
  port: Bun.env.EYE_API_PORT ?? 3000,
  development: Bun.env.NODE_ENV !== "production",
  async fetch(request) {
    const param = new URL(request.url)
    return Response.json(
      await users(db).findOneRequired({
        id: parseInt(param.searchParams.get("id") ?? "1"),
      }),
    )
  },
})

console.log(`[API]: Starting server on ${server.url}`)
