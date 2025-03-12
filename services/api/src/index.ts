import { createRouter } from "./utils/router"
import { asyncLocalStorage, log } from "backend-logs"
import {
  type CameraBodyApi,
  type CameraLensApi,
  type CategoryApi,
  type LinkedCategoryApi,
  type PictureApi,
} from "api-types"
import { ingestPicture } from "./model/picture/ingest"
import db, {
  type CameraBodies,
  type CameraLenses,
  category_parents,
  type Pictures,
} from "db"
import { listPictures } from "./model/picture/list"
import { getCameraBodyById } from "./model/cameraBody"
import { getCameraLensById } from "./model/cameraLens"
import { getPictureSizesForPictureId } from "./model/picture/sizes"
import { getPublicEndpoint } from "./s3Client"
import {
  categoryLeaveHasSlug,
  createCategoryLeaveWithSlug,
  getCategoryLeaveWithSlug,
  getDirectChildrenCategories,
  getDirectParentCategories,
  listCategories,
  updateCategoryLeaveWithSlug,
  type CategoryLeavesWithSlug,
} from "./model/category"
import { buildHandlers, getPaginatedParams } from "./utils/buildHandlers"
import { getPictureById } from "./model/picture"

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
    const { content, hasMore } = await listPictures(p, {
      parent: searchParams.get("parent"),
      orphan: searchParams.has("orphan"),
    })
    return {
      nextPage: hasMore ? p.pageNumber + 1 : null,
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
    rating: dbPic.rating,
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
  category: CategoryLeavesWithSlug,
): Promise<CategoryApi> => ({
  slug: category.slug,
  exifTag: category.exif_tag,
  name: category.name,
  directChildren: toLinkedCategoryApi(
    (await getDirectChildrenCategories(category.id)).filter(
      categoryLeaveHasSlug,
    ),
  ),
  directParents: toLinkedCategoryApi(
    await getDirectParentCategories(category.id),
  ),
})

const toCategoryApis = async (
  categories: CategoryLeavesWithSlug[],
): Promise<CategoryApi[]> => await Promise.all(categories.map(toCategoryApi))

const toLinkedCategoryApi = (
  categories: CategoryLeavesWithSlug[],
): LinkedCategoryApi[] =>
  categories.map((l) => ({ name: l.name, slug: l.slug }))

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
