import { type PaginatedApi } from "api-types"
import { makeCachedGet, withParams } from "./utils"

export interface PaginatedLoaderProps {
  readonly page: number
}

export type PaginatedApiLoader<T, P> = (
  loaderProps?: PaginatedLoaderProps,
  extraProps?: P,
) => Promise<PaginatedApi<T>>

export const makeCachedPaginatedApi = <
  T,
  P extends Record<string, number | string> = {},
>(
  route: string,
): PaginatedApiLoader<T, P> => {
  const [getCached] = makeCachedGet<PaginatedApi<T>>()
  return async (loaderProps, extraProps) => {
    return await getCached(withParams(route, { ...loaderProps, ...extraProps }))
  }
}
