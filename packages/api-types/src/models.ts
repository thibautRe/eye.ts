import type { PictureId, Rating, Slug } from "core"

export interface PictureApi {
  id: PictureId
  alt: string
  blurhash: string
  width: number
  height: number
  originalUrl: string
  shotAt: string | null
  rating: Rating | null
  cameraBody: CameraBodyApi | null
  cameraLens: CameraLensApi | null
  exif: PictureExifApi
  sizes: PictureSizeApi[]
  directParents: LinkedCategoryApi[]
}

export interface PictureExifApi {
  FocalLength?: string
  FNumber?: string
  ISO?: string
  ExposureTime?: string
}

export interface CameraBodyApi {
  name: string
}

export interface CameraLensApi {
  name: string
}

export interface PictureSizeApi {
  width: number
  height: number
  url: string
}

export interface LinkedCategoryApi {
  slug: Slug
  name: string
}
export interface CategoryApi {
  name: string
  slug: Slug
  exifTag: string | null
  directParents: LinkedCategoryApi[]
  directChildren: LinkedCategoryApi[]
}

export interface PictureListZipPreflightResponse {
  pictureAmt: number
  approximateSizeBytes: number
}
