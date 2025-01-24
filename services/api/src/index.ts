import { createRouter, type RouterRun } from "./router"
import { asyncLocalStorage, log } from "backend-logs"
import {
  type ApiRouteArgs,
  type ApiRouteKey,
  type ApiRouteResponse,
  type CameraBodyApi,
  type CameraLensApi,
  type CategoryApi,
  type LinkedCategoryApi,
  type PictureApi,
  routes,
} from "api-types"
import { ingestPicture } from "./model/picture/ingest"
import db, {
  type CameraBodies,
  type CameraLenses,
  type CategoryLeaves,
  type Pictures,
  category_leaves,
  pictures,
} from "db"
import { listPictures } from "./model/picture/list"
import { getCameraBodyById } from "./model/cameraBody"
import { getCameraLensById } from "./model/cameraLens"
import { getPictureSizesForPictureId } from "./model/picture/sizes"
import { getPublicEndpoint } from "./s3Client"
import {
  getDirectChildrenCategories,
  getDirectParentCategories,
} from "./model/category"
import { translate, type I18nContent } from "core"

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
  CATEGORY_CREATE: async ({ request }) => {
    const {
      name,
      slug,
      exifTag,
    }: { name: I18nContent; slug: string; exifTag: string } =
      await request.json()
    const [inserted] = await category_leaves(db).insert({
      type: undefined,
      name,
      slug,
      exif_tag: exifTag,
    })
    return await toCategoryApi(inserted)
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
  return { name: dbCameraLens.name }
}

const toCameraBodyApi = (dbCameraBody: CameraBodies): CameraBodyApi => {
  return { name: dbCameraBody.name }
}

const toPictureApi = async (dbPic: Pictures): Promise<PictureApi> => {
  return {
    id: dbPic.id,
    alt: dbPic.alt,
    blurhash: dbPic.blurhash,
    height: dbPic.original_height,
    width: dbPic.original_width,
    originalUrl: getPublicEndpoint(dbPic.original_s3_key),
    cameraBody: dbPic.shot_by_camera_body_id
      ? toCameraBodyApi(await getCameraBodyById(dbPic.shot_by_camera_body_id))
      : null,
    cameraLens: dbPic.shot_by_camera_lens_id
      ? toCameraLensApi(await getCameraLensById(dbPic.shot_by_camera_lens_id))
      : null,
    exif: dbPic.exif,
    shotAt: dbPic.shot_at?.toString() ?? null,
    sizes: (await getPictureSizesForPictureId(dbPic.id)).map((s) => ({
      height: s.height,
      width: s.width,
      url: getPublicEndpoint(s.s3_key),
    })),
    directParents: toLinkedCategoryApi(
      await getDirectParentCategories(dbPic.category_leaf_id),
    ),
  }
}

const toPictureApis = async (dbPics: Pictures[]) =>
  await Promise.all(dbPics.map(toPictureApi))

const toCategoryApi = async (
  category: CategoryLeaves,
): Promise<CategoryApi> => {
  return {
    name: translate(category.name, "en"),
    directChildren: toLinkedCategoryApi(
      await getDirectChildrenCategories(category.id),
    ),
    directParents: toLinkedCategoryApi(
      await getDirectParentCategories(category.id),
    ),
  }
}

const toLinkedCategoryApi = (
  categories: CategoryLeaves[],
): LinkedCategoryApi[] =>
  categories.flatMap((l) =>
    l.slug ? [{ name: translate(l.name, "en"), slug: l.slug }] : [],
  )

interface Context {
  requestStart: Date
}
const router = createRouter<Context>()
  .withPreMiddleware(({ request }) => {
    log(`--> ${request.url}`)
    return { requestStart: new Date() }
  })
  .withPostMiddleware(({ request, response, context }) => {
    const ellapsedMs = Date.now() - context.requestStart.getTime()
    const s = asyncLocalStorage.getStore()
    log(
      `<-- ${request.url} (${response.status})\t${ellapsedMs}ms\t${
        s?.dbQueries ?? 0
      } DB queries`,
    )
  })
  .run(runHandlers, { requestStart: new Date() })

const server = Bun.serve({
  port: Bun.env.EYE_API_PORT ?? 3000,
  development: Bun.env.NODE_ENV !== "production",
  fetch: router,
})

log(`Starting server on ${server.url}`)
