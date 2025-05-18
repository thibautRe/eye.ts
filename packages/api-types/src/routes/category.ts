import type { Slug } from "core"
import type { CategoryApi } from "../models"
import type { ApiMethod, PaginatedRoute, Route } from "../route"
import type { ApiPathnameWithArgs, RouteDefinition } from "../types"

export type CategoryRoutes =
  | Route<"CATEGORY", CategoryApi, { args: { slug: Slug } }>
  | Route<"CATEGORY_DELETE", boolean, { args: { slug: Slug } }>
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
  | PaginatedRoute<
      "CATEGORY_LIST",
      CategoryApi,
      { searchParams: "orphan" | "q" }
    >
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
  | Route<"CATEGORY_EXIF_REINDEX", boolean, { args: { slug: Slug } }>

const makeCategoryRoute = (
  method: ApiMethod,
  suffix = "",
): ApiPathnameWithArgs<{ slug: Slug }> => {
  const regex = new RegExp(`^\\\/categories\\\/([^\\\/]+)${suffix}$`)
  return {
    method,
    stringify: ({ slug }) => `/categories/${slug}${suffix}`,
    parse: (pathname) => {
      const res = regex.exec(pathname)
      return res
        ? { ok: true, args: { slug: decodeURIComponent(res[1]!) as Slug } }
        : { ok: false }
    },
  }
}

export const categoryRoutes: RouteDefinition<CategoryRoutes> = {
  CATEGORY: makeCategoryRoute("GET"),
  CATEGORY_DELETE: makeCategoryRoute("DELETE"),
  CATEGORY_UPDATE: makeCategoryRoute("POST"),
  CATEGORY_CREATE: { method: "POST", pathname: `/categories/` },
  CATEGORY_LIST: { method: "GET", pathname: "/categories/" },
  CATEGORY_PARENT_ADD: makeCategoryRoute("POST", "/parentCategory"),
  CATEGORY_PARENT_DEL: makeCategoryRoute("DELETE", "/parentCategory"),
  CATEGORY_EXIF_REINDEX: makeCategoryRoute("POST", "/exif/reindex"),
}
