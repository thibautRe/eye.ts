import { type PictureId } from "core"

type ApiMethod = "GET" | "POST"

export type ApiRoutes =
  | { key: "CATEGORY"; args: { slug: string }; response: CategoryApi }
  | { key: "CATEGORY_CREATE"; response: CategoryApi }
  | { key: "CATEGORY_LIST"; response: PaginatedApi<CategoryApi> }
  /** --- */
  | { key: "PICTURE_UPLOAD"; response: PictureApi }
  | { key: "PICTURE_LIST"; response: PaginatedApi<PictureApi> }
  | { key: "PICTURE"; args: { id: PictureId }; response: PictureApi }

export type ApiRouteKey = ApiRoutes["key"]
export type ApiRoute<K extends ApiRouteKey> = Extract<ApiRoutes, { key: K }>

export type ApiRouteArgs<K extends ApiRouteKey> = ApiRoute<K> extends {
  args: infer A
}
  ? A
  : null
export type ApiRouteResponse<K extends ApiRouteKey> = ApiRoute<K> extends {
  response: infer R
}
  ? R
  : null

export interface ApiPathnameWithArgs<A> {
  method: ApiMethod
  pathname?: undefined
  stringify: (params: A) => string
  parse: (pathname: string) => { ok: true; args: A } | { ok: false }
}

type RoutePath<K extends ApiRouteKey> = ApiRoute<K> extends {
  args: infer A
}
  ? ApiPathnameWithArgs<A>
  : { method: ApiMethod; pathname: string }

export const routes: { [key in ApiRouteKey]: RoutePath<key> } = {
  CATEGORY: {
    method: "GET",
    stringify: ({ slug }) => `/categories/${slug}`,
    parse: (pathname) => {
      const res = /^\/categories\/([^\/]*)$/.exec(pathname)
      return res ? { ok: true, args: { slug: res[1] } } : { ok: false }
    },
  },
  CATEGORY_CREATE: { method: "POST", pathname: `/categories/` },
  CATEGORY_LIST: { method: "GET", pathname: "/categories/" },
  PICTURE_UPLOAD: { pathname: `/picture/upload`, method: "POST" },
  PICTURE_LIST: { pathname: `/pictures`, method: "GET" },
  PICTURE: {
    method: "GET",
    stringify: ({ id }) => `/pictures/${id}`,
    parse: (pathname) => {
      const res = /^\/pictures\/(\d*)$/.exec(pathname)
      if (!res) return { ok: false }
      return { ok: true, args: { id: res[1] as PictureId } }
    },
  },
}

export interface PictureApi {
  id: PictureId
  alt: string
  blurhash: string
  width: number
  height: number
  originalUrl: string
  shotAt: string | null
  cameraBody: CameraBodyApi | null
  cameraLens: CameraLensApi | null
  exif: PictureExifApi
  sizes: PictureSizeApi[]
  directParents: LinkedCategoryApi[]
}

export interface PictureExifApi {}

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
  slug: string
  name: string
}
export interface CategoryApi {
  name: string
  directParents: LinkedCategoryApi[]
  directChildren: LinkedCategoryApi[]
}

export interface PaginatedApi<T> {
  items: T[]
  nextPage: number | null
}
