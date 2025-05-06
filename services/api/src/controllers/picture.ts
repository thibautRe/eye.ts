import type { CameraBodyApi, CameraLensApi, PictureApi } from "api-types"
import type { CameraBodies, CameraLenses, Pictures } from "db"
import { getCameraBodyById } from "../model/cameraBody"
import { getCameraLensById } from "../model/cameraLens"
import { getDirectParentCategories } from "../model/category"
import { getPictureSizesForPictureId } from "../model/picture/sizes"
import { getPublicEndpoint } from "../s3Client"
import { toLinkedCategoryApi } from "./categories"

const toCameraLensApi = (dbCameraLens: CameraLenses): CameraLensApi => {
  return { name: dbCameraLens.name }
}

const toCameraBodyApi = (dbCameraBody: CameraBodies): CameraBodyApi => {
  return { name: dbCameraBody.name }
}

export const toPictureApi = async (dbPic: Pictures): Promise<PictureApi> => {
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

export const toPictureApis = async (dbPics: Pictures[]) =>
  await Promise.all(dbPics.map(toPictureApi))
