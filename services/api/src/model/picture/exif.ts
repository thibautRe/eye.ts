import type { Pictures } from "db"
import { parse } from "exifr"

import { getCameraBodyByName } from "../cameraBody"
import { getCameraLensByName } from "../cameraLens"

export const getPictureDataInExif = async (
  arrayBuffer: ArrayBuffer,
): Promise<
  Pick<
    Pictures,
    "shot_at" | "shot_by_camera_body_id" | "shot_by_camera_lens_id" | "exif"
  >
> => {
  const exif = await parse(arrayBuffer)
  const [cameraBody, cameraLens] = await Promise.all([
    getCameraBodyByName(exif.Model),
    getCameraLensByName(exif.LensModel),
  ])

  return {
    shot_at: (exif.DateTimeOriginal as Date) || null,
    shot_by_camera_body_id: cameraBody?.id ?? null,
    shot_by_camera_lens_id: cameraLens?.id ?? null,
    exif,
  }
}
