import type { PictureId, Slug } from "core"
import type { PictureApi, PictureListZipPreflightResponse } from "../models"
import type { Route, PaginatedRoute, ApiMethod } from "../route"
import type { ApiPathname, RouteDefinition } from "../properties"

export type PictureListSearchParams = "parent" | "orphan" | "rating" | "deep"

export type PictureRoutes =
  | Route<"PICTURE_UPLOAD", PictureApi>
  | Route<"PICTURE", PictureApi, { args: { id: PictureId } }>
  | Route<"PICTURE_DELETE", boolean, { args: { id: PictureId } }>
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

const makePictureRoute = (method: ApiMethod): ApiPathname<"PICTURE"> => ({
  method,
  stringify: ({ id }) => `/pictures/${id}`,
  parse: (pathname) => {
    const res = /^\/pictures\/(\d+)$/.exec(pathname)
    if (!res) return { ok: false }
    return {
      ok: true,
      args: { id: decodeURIComponent(res[1]!) as PictureId },
    }
  },
})

export const pictureRoutes: RouteDefinition<PictureRoutes> = {
  PICTURE_UPLOAD: { pathname: `/picture/upload`, method: "POST" },
  PICTURE_LIST: { pathname: `/pictures`, method: "GET" },
  PICTURE_LIST_ZIP: { pathname: `/pictures.zip`, method: "GET" },
  PICTURE_LIST_ZIP_PREFLIGHT: {
    pathname: `/pictures.zip/preflight`,
    method: "GET",
  },
  PICTURE: makePictureRoute("GET"),
  PICTURE_DELETE: makePictureRoute("DELETE"),
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
