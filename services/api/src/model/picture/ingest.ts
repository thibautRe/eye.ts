import db, {
  category_leaves,
  category_parents,
  picture_sizes,
  pictures,
} from "db"
import imageSize from "image-size"
import sharp from "sharp"
import { putS3Picture } from "../../s3Client"

import { encode as blurhashEncode } from "blurhash"
import { parseRating, type PictureId } from "core"
import { getPictureDataInExif } from "./exif"
import { getCategoryLeavesIdByXmpTag } from "../category"

const processSize = async ({
  arrayBuffer,
  width,
  key,
  id,
}: {
  arrayBuffer: ArrayBuffer
  key: string
  width: number
  id: PictureId
}) => {
  const resizer = sharp(arrayBuffer).resize(width)
  const { data, info } = await resizer
    .keepMetadata()
    .jpeg()
    .toBuffer({ resolveWithObject: true })
  const s3Key = `${key}-${width}`
  await putS3Picture({
    Key: `${key}-${width}`,
    Body: data,
    Metadata: { pictureType: "ORIGINAL" },
  })
  await picture_sizes(db).insert({
    height: info.height,
    width: info.width,
    picture_id: id,
    s3_key: s3Key,
  })
  return async () =>
    await resizer.raw().ensureAlpha().toBuffer({ resolveWithObject: true })
}

export const ingestPicture = async (file: File) => {
  const arrayBuffer = await file.arrayBuffer()
  const s3key = Bun.randomUUIDv7("base64")

  const { pictureData, xmpTags } = await getPictureDataInExif(arrayBuffer)

  const size = imageSize(new Uint8Array(arrayBuffer))
  if (!size || !size.width || !size.height)
    throw new Error("No image size detected")

  // image-size claims to swap orientation but this doesn't seem to work. So re-swapping as that seems to help
  if (
    pictureData.exif.Orientation.includes("270") ||
    pictureData.exif.Orientation.includes("90")
  ) {
    ;[size.height, size.width] = [size.width, size.height]
  }

  await putS3Picture({
    Key: s3key,
    Body: Buffer.from(arrayBuffer),
    Metadata: { pictureType: "RESIZED", width: size.width.toString() },
  })
  const [category] = await category_leaves(db).insert({
    name: file.name,
    type: "picture",
  })

  // auto-add parents based on XMP tags
  const parentCats = await getCategoryLeavesIdByXmpTag(xmpTags)
  await category_parents(db).insert(
    ...parentCats.map((parentId) => ({
      child_id: category.id,
      parent_id: parentId,
    })),
  )
  const [picture] = await pictures(db).insert({
    category_leaf_id: category.id,
    alt: "",
    original_height: size.height,
    original_width: size.width,
    original_s3_key: s3key,
    original_file_name: file.name,
    blurhash: "",
    version: 1,
    rating: parseRating(
      pictureData.exif["rating"] || pictureData.exif["Rating"],
    ),
    ...pictureData,
  })

  const [getPixels] = await Promise.all([
    processSize({
      arrayBuffer,
      id: picture.id,
      key: picture.original_s3_key,
      width: 400,
    }),
    processSize({
      arrayBuffer,
      id: picture.id,
      key: picture.original_s3_key,
      width: 1200,
    }),
    processSize({
      arrayBuffer,
      id: picture.id,
      key: picture.original_s3_key,
      width: 2500,
    }),
  ])

  const { data, info } = await getPixels()
  const blurhash = blurhashEncode(
    new Uint8ClampedArray(data),
    info.width,
    info.height,
    4,
    3,
  )

  const [p] = await pictures(db).update({ id: picture.id }, { blurhash })
  if (!p) {
    throw new Error("Could not update picture")
  }

  return p
}
