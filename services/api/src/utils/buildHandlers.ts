import {
  type ApiPathname,
  type ApiRouteKey,
  type ApiRouteSearchParams,
  type ApiRouteArgs,
  type ApiRouteResponse,
  routes,
  type PaginatedSearchParam,
  type ApiRouteJson,
} from "api-types"
import type { RouterRun } from "./router"
import type { PaginateOptions } from "db"
import { log } from "backend-logs"

export const make401 = () => new Response("Unauthorized", { status: 401 })
export const make403 = () => new Response("Forbidden", { status: 403 })
export const make404 = () => new Response("Not found", { status: 404 })

const getRoutePathnameArgs = (
  route: ApiPathname<any>,
  pathname: string,
): { args: unknown } | null => {
  if (typeof route.pathname === "undefined") {
    const r = route.parse(pathname)
    if (!r.ok) return null
    return { args: r.args }
  }
  return route.pathname === pathname ? { args: null } : null
}

export type SearchParams<T> = {
  get: (param: T) => string | null
  has: (params: T) => boolean
}

type Handler<K extends ApiRouteKey, TContext> = (params: {
  request: Request
  url: URL
  context: TContext
  args: ApiRouteArgs<K>
  searchParams: SearchParams<ApiRouteSearchParams<K>>
  json: () => Promise<ApiRouteJson<K>>
}) => Promise<ApiRouteResponse<K> | Response>

export const buildHandlers =
  <TContext>(handlers: {
    [key in ApiRouteKey]: Handler<key, TContext>
  }): RouterRun<TContext> =>
  async ({ request, context }) => {
    const url = new URL(request.url)

    for (const k of Object.keys(routes)) {
      const key = k as ApiRouteKey
      const route = routes[key]
      if (route.method !== request.method) continue
      // @ts-expect-error
      const res = getRoutePathnameArgs(route, url.pathname)
      if (!res) continue

      log(`Matched handler: ${k}`)

      const searchParams: SearchParams<ApiRouteSearchParams<ApiRouteKey>> = {
        get: (k) => {
          // @ts-expect-error
          const param = url.searchParams.get(k)
          return param && decodeURIComponent(param)
        },
        // @ts-expect-error
        has: (k) => url.searchParams.has(k),
      }
      const json: () => Promise<ApiRouteJson<ApiRouteKey>> = () =>
        // @ts-expect-error
        request.json()

      // @ts-expect-error Handler<"A"> | Handler<"B"> is not assignable to Handler<"A" | "B">
      const handler: Handler<ApiRouteKey, unknown> = handlers[key]
      const handlerRes = await handler({
        request,
        context,
        args: res.args as ApiRouteArgs<ApiRouteKey>,
        url,
        searchParams,
        json,
      })
      if (handlerRes instanceof Response) return handlerRes
      return Response.json(handlerRes)
    }
    return make404()
  }

export const getPaginatedParams = (
  params: SearchParams<PaginatedSearchParam>,
  {
    maxPageSize = 50,
    defaultPageSize = 50,
  }: { maxPageSize?: number; defaultPageSize?: number } = {},
): PaginateOptions => {
  const pageNumber = parseInt(params.get("page") ?? "0") || 0
  const pageSize = Math.min(
    parseInt(params.get("size") ?? "0") || defaultPageSize,
    maxPageSize,
  )
  return { pageNumber, pageSize }
}
