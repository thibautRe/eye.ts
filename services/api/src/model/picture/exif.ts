import type { Pictures } from "db"
import { parse } from "exifr"

import { getCameraBodyByName } from "../cameraBody"
import { getCameraLensByName } from "../cameraLens"

export const getPictureDataInExif = async (
  arrayBuffer: ArrayBuffer,
): Promise<{
  pictureData: Pick<
    Pictures,
    "shot_at" | "shot_by_camera_body_id" | "shot_by_camera_lens_id" | "exif"
  >
  xmpTags: string[]
}> => {
  const exif = await parse(arrayBuffer, { xmp: true })
  const [cameraBody, cameraLens] = await Promise.all([
    getCameraBodyByName(exif.Model),
    getCameraLensByName(exif.LensModel),
  ])

  // this seems to be the darktable history - unnecessarily big, can drop
  if ("history" in exif) delete exif.history

  return {
    pictureData: {
      shot_at: (exif.DateTimeOriginal as Date) || null,
      shot_by_camera_body_id: cameraBody?.id ?? null,
      shot_by_camera_lens_id: cameraLens?.id ?? null,
      exif,
    },
    xmpTags: getXmpTags(exif.subject),
  }
}

const getXmpTags = (subject: unknown): string[] => {
  const parseArr = (subArr: string[]) =>
    subArr.map((t) => t.trim().toLowerCase())
  if (typeof subject === "string") return parseArr(subject.split(","))
  if (Array.isArray(subject)) return parseArr(subject)
  return []
}
