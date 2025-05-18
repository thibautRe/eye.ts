import type { ApiMethod } from "./route"

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

export type ApiPathname<R> = R extends { args: infer A }
  ? ApiPathnameWithArgs<A>
  : ApiPathnameWithoutArgs

export type RouteDefinition<R extends { key: string }> = {
  [key in R["key"]]: ApiPathname<Extract<R, { key: key }>>
}
