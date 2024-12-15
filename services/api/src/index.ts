import { randomInt } from "crypto"
import { createRouter, type RouterRun } from "./router"
import type { ID } from "core"
import {
  type ApiRouteArgs,
  type ApiRouteKey,
  type ApiRouteResponse,
  type CameraBodyApi,
  type CameraLensApi,
  type PictureApi,
  type PictureExifApi,
  routes,
} from "api-types"
import { ingestPicture } from "./model/picture/ingest"
import db, {
  type CameraBodies,
  type CameraLenses,
  picture_sizes,
  type Pictures,
  pictures,
} from "db"
import { listPictures } from "./model/picture/list"
import { getCameraBodyById } from "./model/cameraBody"
import { getCameraLensById } from "./model/cameraLens"
import { getPublicEndpoint } from "./s3Client"

declare module "bun" {
  interface Env {
    EYE_API_PORT: string
  }
}

const make404 = () => new Response("Not found", { status: 404 })

type Handler<K extends ApiRouteKey> = (params: {
  request: Request
  url: URL
  context: Context
  args: ApiRouteArgs<K>
}) => Promise<ApiRouteResponse<K>>
const buildHandlers =
  (handlers: {
    [key in ApiRouteKey]: Handler<key>
  }): RouterRun<Context> =>
  async ({ request, context }) => {
    const url = new URL(request.url)
    for (const key of Object.keys(routes)) {
      const route = routes[key as ApiRouteKey]
      // @ts-expect-error
      const handler: Handler<typeof key> = handlers[key]
      if (route.method !== request.method) continue
      if (typeof route.pathname === "undefined") {
        const r = route.parse(url.pathname)
        if (!r.ok) continue
        const handlerRes = await handler({
          // @ts-expect-error
          args: r.args,
          request,
          context,
          url,
        })
        return Response.json(handlerRes)
      }
      if (route.pathname === url.pathname) {
        const handlerRes = await handler({ request, context, args: null, url })
        return Response.json(handlerRes)
      }
      continue
    }
    return make404()
  }

const runHandlers = buildHandlers({
  PICTURE_UPLOAD: async ({ request, context }) => {
    const formData = await request.formData()
    // @ts-expect-error
    const file: File = formData.get("file")
    const picture = await ingestPicture(file)
    return await toPictureApi(picture)
  },
  PICTURE: async ({ args: { id } }) => {
    return await toPictureApi(await pictures(db).findOneRequired({ id }))
  },
  PICTURE_LIST: async ({ url }) => {
    const paginated = await listPictures({
      pageNumber: parseInt(url.searchParams.get("pageNumber")) || 0,
      pageSize: 15,
    })
    return null
  },
})

const toCameraLensApi = (dbCameraLens: CameraLenses): CameraLensApi => {
  return {
    name: dbCameraLens.name,
  }
}

const toCameraBodyApi = (dbCameraBody: CameraBodies): CameraBodyApi => {
  return {
    name: dbCameraBody.name,
  }
}

const toPictureApi = async (dbPic: Pictures): Promise<PictureApi> => {
  const [sizes, cameraBody, cameraLens] = await Promise.all([
    await picture_sizes(db).find({ picture_id: dbPic.id }).all(),
    dbPic.shot_by_camera_body_id
      ? getCameraBodyById(dbPic.shot_by_camera_body_id)
      : null,
    dbPic.shot_by_camera_lens_id
      ? getCameraLensById(dbPic.shot_by_camera_lens_id)
      : null,
  ])
  return {
    id: dbPic.id,
    alt: dbPic.alt,
    blurhash: dbPic.blurhash,
    height: dbPic.original_height,
    width: dbPic.original_width,
    originalUrl: getPublicEndpoint(dbPic.original_s3_key),
    cameraBody: cameraBody ? toCameraBodyApi(cameraBody) : null,
    cameraLens: cameraLens ? toCameraLensApi(cameraLens) : null,
    exif: dbPic.exif,
    shotAt: dbPic.shot_at,
    sizes: sizes.map((s) => ({
      height: s.height,
      width: s.width,
      url: getPublicEndpoint(s.s3_key),
    })),
  }
}

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
  .run(runHandlers, {
    requestId: -1 as RequestId,
    requestStart: new Date(),
    log: () => {
      throw new Error("No context set")
    },
  })

const server = Bun.serve({
  port: Bun.env.EYE_API_PORT ?? 3000,
  development: Bun.env.NODE_ENV !== "production",
  fetch: router,
})

console.log(`[API]: Starting server on ${server.url}`)
