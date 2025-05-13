export type ApiMethod = "GET" | "POST" | "PUT" | "DELETE"
interface RouteOptions {
  args?: unknown
  searchParams?: string
  json?: unknown
}
export type Route<K, R, O extends RouteOptions = {}> = {
  key: K
  response: R
} & (O extends { args: infer A } ? { args: A } : {}) &
  (O extends { searchParams: infer S } ? { searchParams: S } : {}) &
  (O extends { json: infer J } ? { json: J } : {})

export type PaginatedRoute<K, R, O extends RouteOptions = {}> = Route<
  K,
  PaginatedApi<R>,
  {
    searchParams: O["searchParams"] extends string
      ? O["searchParams"] | PaginatedSearchParam
      : PaginatedSearchParam
  }
>

export interface PaginatedApi<T> {
  items: T[]
  nextPage: number | null
}

export type PaginatedSearchParam = "page" | "size"
