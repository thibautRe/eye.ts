import type { Slug, PictureId } from "core"
import type {
  CategoryApi,
  PictureApi,
  PictureListZipPreflightResponse,
} from "./models"
import type { PaginatedRoute, Route } from "./route"
import type { ApiPathname, ApiRouteKey } from "./properties"

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
      "PICTURE_LIST_ZIP_PREFLIGHT",
      PictureListZipPreflightResponse,
      { searchParams: PictureListSearchParams }
    >
  | Route<
      "PICTURE_LIST_ZIP",
      unknown,
      { searchParams: PictureListSearchParams }
    >

type PictureListSearchParams = "parent" | "orphan" | "rating"

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
  PICTURE_LIST_ZIP_PREFLIGHT: {
    pathname: `/pictures.zip/preflight`,
    method: "GET",
  },
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
