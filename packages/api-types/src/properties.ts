import type { ApiRoutes } from "./api"

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
