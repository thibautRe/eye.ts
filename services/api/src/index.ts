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
import {
  buildHandlers,
  getPaginatedParams,
  make401,
  make403,
} from "./utils/buildHandlers"
import { deletePictureById, getPictureById } from "./model/picture"
import { toCategoryApi, toCategoryApis } from "./controllers/categories"
import { toPictureApi, toPictureApis } from "./controllers/picture"
import { getUnusedXmpTags } from "./model/picture/exif"
import {
  createCategoryLink,
  createPicturesCategoryLink,
  deleteCategoryLink,
  deletePicturesCategoryLink,
} from "./model/category/parents"
import {
  AuthRole,
  createZipToken,
  validateOrNull,
  validateZipToken,
} from "@local/auth"

const runHandlers = buildHandlers<RouterContext>({
  CATEGORY: async ({ args: { slug }, context }) => {
    if (!context.role) return make401()
    return await toCategoryApi(await getCategoryLeaveWithSlug(db, slug))
  },
  CATEGORY_UPDATE: async ({ args: { slug }, json, context }) => {
    if (context.role?.role !== "admin") return make403()
    const { name, exifTag, slug: newSlug } = await json()
    return await toCategoryApi(
      await updateCategoryLeaveWithSlug({ slug, name, exifTag, newSlug }),
    )
  },
  CATEGORY_DELETE: async ({ args: { slug }, context }) => {
    if (context.role?.role !== "admin") return make403()
    try {
      await deleteCategoryLeaveWithSlug(slug)
      return true
    } catch (err) {
      console.error(`Cannot delete category ${slug}`)
      console.error(err)
      return false
    }
  },
  CATEGORY_CREATE: async ({ json, context }) => {
    if (context.role?.role !== "admin") return make403()
    return await toCategoryApi(await createCategoryLeaveWithSlug(await json()))
  },
  CATEGORY_LIST: async ({ searchParams, context }) => {
    if (!context.role) return make401()
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
  CATEGORY_PARENT_ADD: async ({ args: { slug }, json, context }) => {
    if (context.role?.role !== "admin") return make403()
    const { parentSlug } = await json()
    const { child } = await createCategoryLink({ parentSlug, childSlug: slug })
    return await toCategoryApi(child)
  },
  CATEGORY_PARENT_DEL: async ({ args: { slug }, json, context }) => {
    if (context.role?.role !== "admin") return make403()
    const { parentSlug } = await json()
    const { child } = await deleteCategoryLink({ childSlug: slug, parentSlug })
    return await toCategoryApi(child)
  },
  CATEGORY_EXIF_REINDEX: async ({ args: { slug }, context }) => {
    if (context.role?.role !== "admin") return make403()
    await reindexCategory(slug)
    return true
  },
  CATEGORY_BULK_PICTURE_ADD: async ({ args: { slug }, json, context }) => {
    if (context.role?.role !== "admin") return make403()
    const { pictureIds } = await json()
    await createPicturesCategoryLink({ slug, pictureIds })
    return true
  },
  CATEGORY_BULK_PICTURE_DEL: async ({ args: { slug }, json, context }) => {
    if (context.role?.role !== "admin") return make403()
    const { pictureIds } = await json()
    await deletePicturesCategoryLink({ slug, pictureIds })
    return true
  },
  PICTURE_UPLOAD: async ({ request, context }) => {
    if (context.role?.role !== "admin") return make403()
    const formData = await request.formData()
    // @ts-expect-error
    const file: File = formData.get("file")
    const picture = await ingestPicture(file)
    return await toPictureApi(picture)
  },
  PICTURE: async ({ args: { id }, context }) => {
    if (!context.role) return make401()
    return await toPictureApi(await getPictureById(id))
  },
  PICTURE_DELETE: async ({ args: { id }, context }) => {
    if (context.role?.role !== "admin") return make403()
    try {
      await deletePictureById(id)
      return true
    } catch (err) {
      console.error(`Cannot delete picture with id ${id}`)
      console.error(err)
      return false
    }
  },
  PICTURE_CATEGORY_ADD: async ({ args: { id }, json, context }) => {
    if (context.role?.role !== "admin") return make403()
    const { slug } = await json()
    const picture = await getPictureById(id)
    await category_parents(db).insert({
      parent_id: (await getCategoryLeaveWithSlug(db, slug)).id,
      child_id: picture.category_leaf_id,
    })

    return await toPictureApi(picture)
  },
  PICTURE_CATEGORY_DEL: async ({ args: { id }, json, context }) => {
    if (context.role?.role !== "admin") return make403()
    const { slug } = await json()
    const picture = await getPictureById(id)
    await category_parents(db).delete({
      parent_id: (await getCategoryLeaveWithSlug(db, slug)).id,
      child_id: picture.category_leaf_id,
    })

    return await toPictureApi(picture)
  },
  PICTURE_LIST: async ({ searchParams, context }) => {
    if (!context.role) return make401()
    const p = getPaginatedParams(searchParams)
    const { content, hasMore } = await listPicturesPaginate(p, searchParams)
    return {
      nextPage: hasMore ? p.pageNumber + 1 : null,
      items: await toPictureApis(content),
    }
  },
  PICTURE_LIST_ZIP: async ({ searchParams }) => {
    try {
      validateZipToken(searchParams.get("jwt") ?? "")
    } catch (err) {
      return make403()
    }

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
  PICTURE_LIST_ZIP_PREFLIGHT: async ({ searchParams, context }) => {
    if (!context.role) return make401()
    const count = await countPictures(searchParams)
    return {
      pictureAmt: count,
      approximateSizeBytes: count * 10_000_000,
      jwt: createZipToken(),
    }
  },
  ADMIN_XMP_UNTRACKED: async ({ context }) => {
    if (context.role?.role !== "admin") return make403()
    return await getUnusedXmpTags()
  },
})

type RouterContext = { role: AuthRole | null }
const router = createRouter<RouterContext>()
  .withPreMiddleware(({ request }) => {
    log(`--> ${request.url}`)
  })
  .withPreMiddleware(({ request, context }) => {
    const jwt = request.headers.get("Authorization")
    const role = jwt ? validateOrNull(jwt) : null
    return { ...context, role }
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
  .run(runHandlers, { role: null })

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
