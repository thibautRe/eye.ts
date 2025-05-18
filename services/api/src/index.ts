import { createRouter } from "./utils/router"
import { asyncLocalStorage, log } from "backend-logs"
import archiver from "archiver"
import { Readable } from "stream"
import { ingestPicture } from "./model/picture/ingest"
import db, { category_parents } from "db"
import {
  countPictures,
  listPictures,
  listPicturesPaginate,
} from "./model/picture/list"
import { getS3 } from "./s3Client"
import {
  createCategoryLeaveWithSlug,
  deleteCategoryLeaveWithSlug,
  getCategoryLeaveWithSlug,
  listCategories,
  reindexCategory,
  updateCategoryLeaveWithSlug,
} from "./model/category"
import { buildHandlers, getPaginatedParams } from "./utils/buildHandlers"
import { deletePictureById, getPictureById } from "./model/picture"
import { toCategoryApi, toCategoryApis } from "./controllers/categories"
import { toPictureApi, toPictureApis } from "./controllers/picture"
import { getUnusedXmpTags } from "./model/picture/exif"

const runHandlers = buildHandlers({
  CATEGORY: async ({ args: { slug } }) => {
    return await toCategoryApi(await getCategoryLeaveWithSlug(db, slug))
  },
  CATEGORY_UPDATE: async ({ args: { slug }, json }) => {
    const { name, exifTag, slug: newSlug } = await json()
    return await toCategoryApi(
      await updateCategoryLeaveWithSlug({ slug, name, exifTag, newSlug }),
    )
  },
  CATEGORY_DELETE: async ({ args: { slug } }) => {
    try {
      await deleteCategoryLeaveWithSlug(slug)
      return true
    } catch (err) {
      console.error(`Cannot delete category ${slug}`)
      console.error(err)
      return false
    }
  },
  CATEGORY_CREATE: async ({ json }) => {
    return await toCategoryApi(await createCategoryLeaveWithSlug(await json()))
  },
  CATEGORY_LIST: async ({ searchParams }) => {
    const p = getPaginatedParams(searchParams)
    const { content, hasMore } = await listCategories(p, {
      orphan: searchParams.has("orphan"),
      q: searchParams.get("q"),
    })
    return {
      nextPage: hasMore ? p.pageNumber + 1 : null,
      items: await toCategoryApis(content),
    }
  },
  CATEGORY_PARENT_ADD: async ({ args: { slug }, json }) => {
    const { parentSlug } = await json()
    const [parent, child] = await Promise.all([
      getCategoryLeaveWithSlug(db, parentSlug),
      getCategoryLeaveWithSlug(db, slug),
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
      getCategoryLeaveWithSlug(db, parentSlug),
      getCategoryLeaveWithSlug(db, slug),
    ])
    await category_parents(db).delete({
      parent_id: parent.id,
      child_id: child.id,
    })
    return await toCategoryApi(child)
  },
  CATEGORY_EXIF_REINDEX: async ({ args: { slug } }) => {
    await reindexCategory(slug)
    return true
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
  PICTURE_DELETE: async ({ args: { id } }) => {
    try {
      await deletePictureById(id)
      return true
    } catch (err) {
      console.error(`Cannot delete picture with id ${id}`)
      console.error(err)
      return false
    }
  },
  PICTURE_CATEGORY_ADD: async ({ args: { id }, json }) => {
    const { slug } = await json()
    const picture = await getPictureById(id)
    await category_parents(db).insert({
      parent_id: (await getCategoryLeaveWithSlug(db, slug)).id,
      child_id: picture.category_leaf_id,
    })

    return await toPictureApi(picture)
  },
  PICTURE_CATEGORY_DEL: async ({ args: { id }, json }) => {
    const { slug } = await json()
    const picture = await getPictureById(id)
    await category_parents(db).delete({
      parent_id: (await getCategoryLeaveWithSlug(db, slug)).id,
      child_id: picture.category_leaf_id,
    })

    return await toPictureApi(picture)
  },
  PICTURE_LIST: async ({ searchParams }) => {
    const p = getPaginatedParams(searchParams)
    const { content, hasMore } = await listPicturesPaginate(p, searchParams)
    return {
      nextPage: hasMore ? p.pageNumber + 1 : null,
      items: await toPictureApis(content),
    }
  },
  PICTURE_LIST_ZIP: async ({ searchParams }) => {
    const pictures = await listPictures(searchParams)
    const archive = archiver("zip", { zlib: { level: 4 } })
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
  PICTURE_LIST_ZIP_PREFLIGHT: async ({ searchParams }) => {
    const count = await countPictures(searchParams)
    return { pictureAmt: count, approximateSizeBytes: count * 10_000_000 }
  },
  ADMIN_XMP_UNTRACKED: async () => {
    return await getUnusedXmpTags()
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
