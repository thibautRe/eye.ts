import db, { users } from "db"
import { randomInt } from "crypto"
import { createRouter } from "./router"
import { ID } from "core"
import { ingestPicture } from "./model/picture/ingest"

declare module "bun" {
  interface Env {
    EYE_API_PORT: string
  }
}

const make404 = () => new Response("Not found", { status: 404 })

type RequestId = ID<"request">
interface Context {
  requestId: RequestId
  requestStart: Date
  log: (...content: any[]) => void
}
const router = createRouter<Context>()
  .withPreMiddleware(({ request }) => {
    const requestId = `${randomInt(1e5)}`.padStart(5, "0") as RequestId
    const log = (...content: any[]) =>
      console.log(`[API] <${requestId}>`, ...content)

    log(`--> ${request.url}`)
    return { requestId, requestStart: new Date(), log }
  })
  .withPostMiddleware(({ request, response, context }) => {
    const ellapsedMs = Date.now() - context.requestStart.getTime()
    context.log(`<-- ${request.url} (${response.status}) ${ellapsedMs}ms`)
  })
  .run(
    async ({ request }) => {
      const url = new URL(request.url)
      if (!url.pathname.startsWith("/api/")) {
        return make404()
      }

      if (url.pathname === "/api/upload" && request.method === "POST") {
        const formData = await request.formData()
        // @ts-expect-error
        const file: File = formData.get("file")
        await ingestPicture(file)

        return Response.json({ ok: true })
      }

      return Response.json(
        await users(db).findOneRequired({
          id: parseInt(url.searchParams.get("id") ?? "1"),
        }),
      )
    },
    {
      requestId: -1 as RequestId,
      requestStart: new Date(),
      log: () => {
        throw new Error("No context set")
      },
    },
  )

const server = Bun.serve({
  port: Bun.env.EYE_API_PORT ?? 3000,
  development: Bun.env.NODE_ENV !== "production",
  fetch: router,
})

console.log(`[API]: Starting server on ${server.url}`)
