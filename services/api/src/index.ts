import { createRouter } from "./utils/router"
import { asyncLocalStorage, log } from "backend-logs"
import archiver from "archiver"
import { Readable } from "stream"
import { ingestPicture } from "./model/picture/ingest"
import db, { category_parents } from "db"
import { listPictures, listPicturesPaginate } from "./model/picture/list"
import { getS3 } from "./s3Client"
import {
  createCategoryLeaveWithSlug,
  getCategoryLeaveWithSlug,
  listCategories,
  updateCategoryLeaveWithSlug,
} from "./model/category"
import { buildHandlers, getPaginatedParams } from "./utils/buildHandlers"
import { getPictureById } from "./model/picture"
import { parseRatingFilter } from "core"
import { toCategoryApi, toCategoryApis } from "./controllers/categories"
import { toPictureApi, toPictureApis } from "./controllers/picture"

const runHandlers = buildHandlers({
  CATEGORY: async ({ args: { slug } }) => {
    return await toCategoryApi(await getCategoryLeaveWithSlug(slug))
  },
  CATEGORY_UPDATE: async ({ args: { slug }, json }) => {
    const { name, exifTag } = await json()
    return await toCategoryApi(
      await updateCategoryLeaveWithSlug({ slug, name, exifTag }),
    )
  },
  CATEGORY_CREATE: async ({ json }) => {
    const { name, slug, exifTag } = await json()
    return await toCategoryApi(
      await createCategoryLeaveWithSlug({ slug, name, exifTag }),
    )
  },
  CATEGORY_LIST: async ({ searchParams }) => {
    const p = getPaginatedParams(searchParams, { defaultPageSize: 10 })
    const { content, hasMore } = await listCategories(p, {
      orphan: searchParams.has("orphan"),
    })
    return {
      nextPage: hasMore ? p.pageNumber + 1 : null,
      items: await toCategoryApis(content),
    }
  },
  CATEGORY_PARENT_ADD: async ({ args: { slug }, json }) => {
    const { parentSlug } = await json()
    const [parent, child] = await Promise.all([
      getCategoryLeaveWithSlug(parentSlug),
      getCategoryLeaveWithSlug(slug),
    ])
    await category_parents(db).insert({
      parent_id: parent.id,
      child_id: child.id,
    })
    return await toCategoryApi(child)
  },
  CATEGORY_PARENT_DEL: async ({ args: { slug }, json }) => {
    const { parentSlug } = await json()
    const [parent, child] = await Promise.all([
      getCategoryLeaveWithSlug(parentSlug),
      getCategoryLeaveWithSlug(slug),
    ])
    await category_parents(db).delete({
      parent_id: parent.id,
      child_id: child.id,
    })
    return await toCategoryApi(child)
  },
  PICTURE_UPLOAD: async ({ request }) => {
    const formData = await request.formData()
    // @ts-expect-error
    const file: File = formData.get("file")
    const picture = await ingestPicture(file)
    return await toPictureApi(picture)
  },
  PICTURE: async ({ args: { id } }) => {
    return await toPictureApi(await getPictureById(id))
  },
  PICTURE_CATEGORY_ADD: async ({ args: { id }, json }) => {
    const { slug } = await json()
    const picture = await getPictureById(id)
    await category_parents(db).insert({
      parent_id: (await getCategoryLeaveWithSlug(slug)).id,
      child_id: picture.category_leaf_id,
    })

    return await toPictureApi(picture)
  },
  PICTURE_CATEGORY_DEL: async ({ args: { id }, json }) => {
    const { slug } = await json()
    const picture = await getPictureById(id)
    await category_parents(db).delete({
      parent_id: (await getCategoryLeaveWithSlug(slug)).id,
      child_id: picture.category_leaf_id,
    })

    return await toPictureApi(picture)
  },
  PICTURE_LIST: async ({ searchParams }) => {
    const p = getPaginatedParams(searchParams)
    const { content, hasMore } = await listPicturesPaginate(p, {
      parent: searchParams.get("parent"),
      orphan: searchParams.has("orphan"),
      rating: parseRatingFilter(searchParams.get("rating")),
    })
    return {
      nextPage: hasMore ? p.pageNumber + 1 : null,
      items: await toPictureApis(content),
    }
  },
  PICTURE_LIST_ZIP: async ({ searchParams }) => {
    const pictures = await listPictures({
      parent: searchParams.get("parent"),
      orphan: searchParams.has("orphan"),
      rating: parseRatingFilter(searchParams.get("rating")),
    })
    const archive = archiver("zip", {
      zlib: { level: 4 },
    })
    return new Response(
      new ReadableStream({
        async start(controller) {
          archive.on("data", (chunk: unknown) => controller.enqueue(chunk))
          archive.on("end", () => controller.close())
          archive.on("error", (err: unknown) => console.error(err))

          for (const picture of pictures) {
            const response = await getS3({ Key: picture.original_s3_key })
            if (response.Body instanceof Readable) {
              archive.append(response.Body, {
                name: picture.original_file_name,
              })
            } else {
              throw new Error("Unexpected response from S3")
            }
          }

          // Finalize the archive
          archive.finalize()
        },
      }),
      {
        headers: new Headers({
          "Content-Type": "application/zip",
          "Content-Disposition": 'attachment; filename="eye.thibaut.re.zip"',
        }),
      },
    )
  },
})

const router = createRouter()
  .withPreMiddleware(({ request }) => {
    log(`--> ${request.url}`)
  })
  .withPostMiddleware(({ request, response }) => {
    const s = asyncLocalStorage.getStore()
    const ellapsedMs = Date.now() - (s?.requestStart.getTime() ?? NaN)
    log(
      `<-- ${request.url} (${response.status})\t${ellapsedMs}ms\t${
        s?.dbQueries ?? 0
      } DB queries`,
    )
  })
  .run(runHandlers, null)

declare module "bun" {
  interface Env {
    EYE_API_PORT: string
  }
}
const server = Bun.serve({
  port: Bun.env.EYE_API_PORT ?? 3000,
  development: Bun.env.NODE_ENV !== "production",
  fetch: router,
})

log(`Starting server on ${server.url}`)
