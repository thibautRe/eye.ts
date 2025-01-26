import { type PictureId } from "core"

type ApiMethod = "GET" | "POST"
interface RouteOptions {
  args?: unknown
  searchParams?: unknown
}
type Route<K, R, O extends RouteOptions = {}> = {
  key: K
  response: R
} & (O extends { args: infer A } ? { args: A } : {}) &
  (O extends { searchParams: infer S } ? { searchParams: S } : {})
type PaginatedRoute<K, R, O extends RouteOptions = {}> = Route<
  K,
  PaginatedApi<R>,
  { searchParams: O["searchParams"] & PaginatedSearchParam }
>

export type ApiRoutes =
  | Route<"CATEGORY", CategoryApi, { args: { slug: string } }>
  | Route<"CATEGORY_CREATE", CategoryApi>
  | PaginatedRoute<"CATEGORY_LIST", CategoryApi>
  /** --- */
  | Route<"PICTURE_UPLOAD", PictureApi>
  | Route<"PICTURE", PictureApi, { args: { id: PictureId } }>
  | PaginatedRoute<"PICTURE_LIST", PictureApi>

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
export type ApiRouteSearchParams<K extends ApiRouteKey> = ApiRoute<K> extends {
  searchParams: infer S
}
  ? S extends string
    ? S
    : null
  : null

export interface ApiPathnameWithArgs<A> {
  method: ApiMethod
  pathname?: undefined
  stringify: (params: A) => string
  parse: (pathname: string) => { ok: true; args: A } | { ok: false }
}
export interface ApiPathnameWithoutArgs {
  method: ApiMethod
  pathname: string
}

type ApiPathname<K extends ApiRouteKey> = ApiRoute<K> extends {
  args: infer A
}
  ? ApiPathnameWithArgs<A>
  : ApiPathnameWithoutArgs

export const routes: { [key in ApiRouteKey]: ApiPathname<key> } = {
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
  slug: string
  directParents: LinkedCategoryApi[]
  directChildren: LinkedCategoryApi[]
}

export interface PaginatedApi<T> {
  items: T[]
  nextPage: number | null
}

export type PaginatedSearchParam = "page" | "size"
