import db, { picture_sizes, pictures } from "db"
import imageSize from "image-size"
import sharp from "sharp"
import { putS3Picture } from "../../s3Client"

import { encode as blurhashEncode } from "blurhash"
import type { PictureId } from "core"
import { getPictureDataInExif } from "./exif"

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

  const dataInExif = await getPictureDataInExif(arrayBuffer)

  const size = imageSize(new Uint8Array(arrayBuffer))
  if (!size || !size.width || !size.height)
    throw new Error("No image size detected")

  await putS3Picture({
    Key: s3key,
    Body: Buffer.from(arrayBuffer),
    Metadata: { pictureType: "RESIZED", width: size.width.toString() },
  })
  const [picture] = await pictures(db).insert({
    alt: "",
    original_height: size.height,
    original_width: size.width,
    original_s3_key: s3key,
    original_file_name: file.name,
    blurhash: "",
    name: file.name,
    ...dataInExif,
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

  return (await pictures(db).update({ id: picture.id }, { blurhash }))[0]
}
