import { sql, type Pictures } from "db"
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
  // Some XML formatting
  if ("categories" in exif) delete exif.categories

  return {
    pictureData: {
      shot_at: (exif.DateTimeOriginal as Date) || null,
      shot_by_camera_body_id: cameraBody?.id ?? null,
      shot_by_camera_lens_id: cameraLens?.id ?? null,
      exif,
    },
    xmpTags: getXmpTags(exif.TagsList),
  }
}

const getXmpTags = (taglist: unknown): string[] => {
  const parseArr = (subArr: string[]) =>
    subArr.map((t) => t.trim().toLowerCase())
  if (typeof taglist === "string") return parseArr(taglist.split(","))
  if (Array.isArray(taglist)) return parseArr(taglist)
  return []
}

export const getUnusedXmpTags = async (): Promise<string[]> => {
  const tags: { tag: string }[] = await db.query(sql`
    WITH all_picture_tags AS (
      SELECT DISTINCT json_array_elements_text((exif->'TagsList')::json) AS tag
      FROM pictures
      WHERE exif ? 'TagsList'
    )
    SELECT tag FROM all_picture_tags
    WHERE tag NOT IN (
      SELECT exif_tag 
      FROM category_leaves 
      WHERE exif_tag IS NOT NULL
    );
  `)
  return tags.map((t) => t.tag)
}
