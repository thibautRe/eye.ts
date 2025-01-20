import { randomInt } from "crypto"
import { createRouter, type RouterRun } from "./router"
import { isNotNull, translate, type ID } from "core"
import {
  type ApiRouteArgs,
  type ApiRouteKey,
  type ApiRouteResponse,
  type CameraBodyApi,
  type CameraLensApi,
  type PictureApi,
  routes,
} from "api-types"
import { ingestPicture } from "./model/picture/ingest"
import db, {
  type CameraBodies,
  type CameraLenses,
  type CategoryLeaves,
  category_leaves,
  picture_sizes,
  type Pictures,
  pictures,
  q,
} from "db"
import { listPictures } from "./model/picture/list"
import { getCameraBodyByIds } from "./model/cameraBody"
import { getCameraLensByIds } from "./model/cameraLens"
import { getPublicEndpoint } from "./s3Client"
import type { CategoryUntypedApi } from "api-types/src/category"

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
  CATEGORY: async ({ args: { slug } }) => {
    return await toCategoryApi(
      await category_leaves(db).findOneRequired({
        slug: slug.trim().toLowerCase(),
      }),
    )
  },
  PICTURE_UPLOAD: async ({ request }) => {
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
    const pageNumber = parseInt(url.searchParams.get("page") ?? "") || 0
    const pageSize = 20
    const { content, count, hasMore } = await listPictures({
      pageNumber,
      pageSize,
    })
    return {
      info: { count, nextPage: hasMore ? pageNumber + 1 : null },
      items: await toPictureApis(content),
    }
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

const toPictureApi = async (dbPic: Pictures): Promise<PictureApi> =>
  (await toPictureApis([dbPic]))[0]

const toPictureApis = async (dbPics: Pictures[]): Promise<PictureApi[]> => {
  const [sizes, bodies, lenses] = await Promise.all([
    picture_sizes(db)
      .find({ picture_id: q.anyOf(dbPics.map((p) => p.id)) })
      .all(),
    getCameraBodyByIds(
      ...dbPics.map((p) => p.shot_by_camera_body_id).filter(isNotNull),
    ),
    getCameraLensByIds(
      ...dbPics.map((p) => p.shot_by_camera_lens_id).filter(isNotNull),
    ),
  ])

  const bodiesById = new Map(bodies.map((b) => [b.id, b]))
  const lensesById = new Map(lenses.map((l) => [l.id, l]))
  return dbPics.map((dbPic) => {
    const body = dbPic.shot_by_camera_body_id
      ? bodiesById.get(dbPic.shot_by_camera_body_id)
      : null
    const lens = dbPic.shot_by_camera_lens_id
      ? lensesById.get(dbPic.shot_by_camera_lens_id)
      : null
    return {
      id: dbPic.id,
      alt: dbPic.alt,
      blurhash: dbPic.blurhash,
      height: dbPic.original_height,
      width: dbPic.original_width,
      originalUrl: getPublicEndpoint(dbPic.original_s3_key),
      cameraBody: body ? toCameraBodyApi(body) : null,
      cameraLens: lens ? toCameraLensApi(lens) : null,
      exif: dbPic.exif,
      shotAt: dbPic.shot_at?.toString() ?? null,
      sizes: sizes
        .filter((s) => s.picture_id.toString() === dbPic.id.toString())
        .map((s) => ({
          height: s.height,
          width: s.width,
          url: getPublicEndpoint(s.s3_key),
        })),
    }
  })
}

const toCategoryApi = async (
  category: CategoryLeaves,
): Promise<CategoryUntypedApi> => {
  if (!category.slug) {
    throw Object.assign(new Error("Category does not have slug"), { category })
  }
  return {
    type: undefined,
    slug: category.slug,
    name: translate(category.name, "en"),
    directChildren: [], // todo
    directParents: [], // todo
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
    requestId: "-1" as RequestId,
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
