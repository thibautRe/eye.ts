import db, { users } from "db"
import { createRouter } from "./router"

declare module "bun" {
  interface Env {
    EYE_API_PORT: string
  }
}

const make404 = () => new Response("Not found", { status: 404 })

const router = createRouter()
  .withPostMiddleware(({ response }) => {
    response.headers.append("allow-origin", "*")
    return response
  })
  .run(async ({ request }) => {
    const url = new URL(request.url)
    if (!url.pathname.startsWith("/api/")) {
      return make404()
    }

    return Response.json(
      await users(db).findOneRequired({
        id: parseInt(url.searchParams.get("id") ?? "1"),
      }),
    )
  }, {})

const server = Bun.serve({
  port: Bun.env.EYE_API_PORT ?? 3000,
  development: Bun.env.NODE_ENV !== "production",
  fetch: router,
})

console.log(`[API]: Starting server on ${server.url}`)
