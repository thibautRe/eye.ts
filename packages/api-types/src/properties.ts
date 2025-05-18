import type { ApiRoutes } from "./api"
import type { ApiMethod } from "./route"

export type RouteDefinition<R extends { key: string }> = {
  [key in R["key"]]: ApiPathname<key>
}

export type ApiRoute<K extends string> = Extract<ApiRoutes, { key: K }>

export type ApiRouteArgs<K extends string> =
  ApiRoute<K> extends { args: infer A } ? A : null
export type ApiRouteResponse<K extends string> =
  ApiRoute<K> extends { response: infer R } ? R : null
export type ApiRouteSearchParams<K extends string> =
  ApiRoute<K> extends { searchParams: infer S }
    ? S extends string
      ? S
      : null
    : null
export type ApiRouteJson<K extends string> =
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

export type ApiPathname<K extends string> =
  ApiRoute<K> extends {
    args: infer A
  }
    ? ApiPathnameWithArgs<A>
    : ApiPathnameWithoutArgs
