import { type PictureId, type Rating, type Slug } from "core"

type ApiMethod = "GET" | "POST" | "PUT" | "DELETE"
interface RouteOptions {
  args?: unknown
  searchParams?: string
  json?: unknown
}
type Route<K, R, O extends RouteOptions = {}> = {
  key: K
  response: R
} & (O extends { args: infer A } ? { args: A } : {}) &
  (O extends { searchParams: infer S } ? { searchParams: S } : {}) &
  (O extends { json: infer J } ? { json: J } : {})

type PaginatedRoute<K, R, O extends RouteOptions = {}> = Route<
  K,
  PaginatedApi<R>,
  {
    searchParams: O["searchParams"] extends string
      ? O["searchParams"] | PaginatedSearchParam
      : PaginatedSearchParam
  }
>

export type ApiRoutes =
  | Route<"CATEGORY", CategoryApi, { args: { slug: Slug } }>
  | Route<
      "CATEGORY_UPDATE",
      CategoryApi,
      {
        args: { slug: Slug }
        json: { name: string; exifTag: string | null; slug?: string }
      }
    >
  | Route<
      "CATEGORY_CREATE",
      CategoryApi,
      {
        json: {
          slug: string
          name: string
          exifTag?: string
          parentSlug?: Slug
        }
      }
    >
  | PaginatedRoute<"CATEGORY_LIST", CategoryApi, { searchParams: "orphan" }>
  | Route<
      "CATEGORY_PARENT_ADD",
      CategoryApi,
      { args: { slug: Slug }; json: { parentSlug: Slug } }
    >
  | Route<
      "CATEGORY_PARENT_DEL",
      CategoryApi,
      { args: { slug: Slug }; json: { parentSlug: Slug } }
    >
  /** --- */
  | Route<"PICTURE_UPLOAD", PictureApi>
  | Route<"PICTURE", PictureApi, { args: { id: PictureId } }>
  | Route<
      "PICTURE_CATEGORY_ADD",
      PictureApi,
      { args: { id: PictureId }; json: { slug: Slug } }
    >
  | Route<
      "PICTURE_CATEGORY_DEL",
      PictureApi,
      { args: { id: PictureId }; json: { slug: Slug } }
    >
  | PaginatedRoute<
      "PICTURE_LIST",
      PictureApi,
      { searchParams: PictureListSearchParams }
    >
  | Route<
      "PICTURE_LIST_ZIP",
      unknown,
      { searchParams: PictureListSearchParams }
    >

type PictureListSearchParams = "parent" | "orphan" | "rating"

export type ApiRouteKey = ApiRoutes["key"]
export type ApiRoute<K extends ApiRouteKey> = Extract<ApiRoutes, { key: K }>

export type ApiRouteArgs<K extends ApiRouteKey> =
  ApiRoute<K> extends { args: infer A } ? A : null
export type ApiRouteResponse<K extends ApiRouteKey> =
  ApiRoute<K> extends { response: infer R } ? R : null
export type ApiRouteSearchParams<K extends ApiRouteKey> =
  ApiRoute<K> extends { searchParams: infer S }
    ? S extends string
      ? S
      : null
    : null
export type ApiRouteJson<K extends ApiRouteKey> =
  ApiRoute<K> extends { json: infer J } ? J : never

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

type ApiPathname<K extends ApiRouteKey> =
  ApiRoute<K> extends {
    args: infer A
  }
    ? ApiPathnameWithArgs<A>
    : ApiPathnameWithoutArgs

export const routes: { [key in ApiRouteKey]: ApiPathname<key> } = {
  CATEGORY: {
    method: "GET",
    stringify: ({ slug }) => `/categories/${slug}`,
    parse: (pathname) => {
      const res = /^\/categories\/([^\/]+)$/.exec(pathname)
      return res
        ? { ok: true, args: { slug: decodeURIComponent(res[1]!) as Slug } }
        : { ok: false }
    },
  },
  CATEGORY_UPDATE: {
    method: "POST",
    stringify: ({ slug }) => `/categories/${slug}`,
    parse: (pathname) => {
      const res = /^\/categories\/([^\/]+)$/.exec(pathname)
      return res
        ? { ok: true, args: { slug: decodeURIComponent(res[1]!) as Slug } }
        : { ok: false }
    },
  },
  CATEGORY_CREATE: { method: "POST", pathname: `/categories/` },
  CATEGORY_LIST: { method: "GET", pathname: "/categories/" },
  CATEGORY_PARENT_ADD: {
    method: "POST",
    stringify: ({ slug }) => `/categories/${slug}/parentCategory`,
    parse: (pathname) => {
      const res = /^\/categories\/([^\/]+)\/parentCategory$/.exec(pathname)
      return res
        ? { ok: true, args: { slug: decodeURIComponent(res[1]!) as Slug } }
        : { ok: false }
    },
  },
  CATEGORY_PARENT_DEL: {
    method: "DELETE",
    stringify: ({ slug }) => `/categories/${slug}/parentCategory`,
    parse: (pathname) => {
      const res = /^\/categories\/([^\/]+)\/parentCategory$/.exec(pathname)
      return res
        ? { ok: true, args: { slug: decodeURIComponent(res[1]!) as Slug } }
        : { ok: false }
    },
  },

  PICTURE_UPLOAD: { pathname: `/picture/upload`, method: "POST" },
  PICTURE_LIST: { pathname: `/pictures`, method: "GET" },
  PICTURE_LIST_ZIP: { pathname: `/pictures.zip`, method: "GET" },
  PICTURE: {
    method: "GET",
    stringify: ({ id }) => `/pictures/${id}`,
    parse: (pathname) => {
      const res = /^\/pictures\/(\d+)$/.exec(pathname)
      if (!res) return { ok: false }
      return {
        ok: true,
        args: { id: decodeURIComponent(res[1]!) as PictureId },
      }
    },
  },
  PICTURE_CATEGORY_ADD: {
    method: "POST",
    stringify: ({ id }) => `/pictures/${id}/category`,
    parse: (pathname) => {
      const res = /^\/pictures\/(\d+)\/category$/.exec(pathname)
      if (!res) return { ok: false }
      return {
        ok: true,
        args: { id: decodeURIComponent(res[1]!) as PictureId },
      }
    },
  },
  PICTURE_CATEGORY_DEL: {
    method: "DELETE",
    stringify: ({ id }) => `/pictures/${id}/category`,
    parse: (pathname) => {
      const res = /^\/pictures\/(\d+)\/category$/.exec(pathname)
      if (!res) return { ok: false }
      return {
        ok: true,
        args: { id: decodeURIComponent(res[1]!) as PictureId },
      }
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

export interface PaginatedApi<T> {
  items: T[]
  nextPage: number | null
}

export type PaginatedSearchParam = "page" | "size"
