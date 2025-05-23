import { HttpError } from "../utils/errors"
import { apiClientHeaders } from "./client"

const assert_ok = (res: Response) => {
  if (!res.ok) throw new HttpError(res)
  return res
}
const jsonHeader = { "Content-Type": "application/json" }

export const rootUrl = `/api`

/** small override of fetch */
const f = (r: string, init: RequestInit = {}) => {
  const headers = new Headers(init.headers)
  if (apiClientHeaders.Authorization)
    headers.append("Authorization", apiClientHeaders.Authorization)
  return fetch(`${rootUrl}${r}`, { ...init, headers })
}

export const get = async (r: string) => assert_ok(await f(r))
export const post = async <T>(r: string, data?: T) =>
  assert_ok(
    await f(r, {
      headers: data instanceof FormData ? undefined : jsonHeader,
      method: "POST",
      body: data instanceof FormData ? data : data && JSON.stringify(data),
    }),
  )
export const put = async <T>(r: string, data?: T) =>
  assert_ok(
    await f(r, {
      headers: jsonHeader,
      method: "PUT",
      body: data && JSON.stringify(data),
    }),
  )
export const delete_http = async <T>(r: string, data?: T) =>
  assert_ok(
    await f(r, {
      headers: jsonHeader,
      method: "DELETE",
      body: JSON.stringify(data),
    }),
  )
export const get_json = async <T>(r: string): Promise<T> =>
  (await (await get(r)).json()) as T
export const post_json = async <T, D = unknown>(
  r: string,
  data?: D,
): Promise<T> => (await (await post(r, data)).json()) as T
export const put_json = async <T, D = unknown>(
  r: string,
  data?: D,
): Promise<T> => (await (await put(r, data)).json()) as T
export const delete_json = async <T, D = unknown>(
  r: string,
  data?: D,
): Promise<T> => (await (await delete_http(r, data)).json()) as T

export const makeCachedGet = <T>() => {
  const cache = new Map<string, T>()
  return [
    async (r: string) => {
      if (cache.has(r)) return cache.get(r)!
      const val = await get_json<T>(r)
      cache.set(r, val)
      return val
    },
    { cache: { clear: cache.clear } },
  ] as const
}

type URLSearchParamsLike = Record<string, string | number | boolean | undefined>
export const withParams = (r: string, params: URLSearchParamsLike) => {
  // @ts-expect-error URLSearchParamsLike is not assignable to URLSearchParams
  const sp = new URLSearchParams(filterParams(params)).toString()
  return sp ? `${r}?${sp}` : r
}

// Removes some parameters from URL search param that generally rely on presence (e.g. booleans and "false", or undefined)
const filterParams = (params: URLSearchParamsLike): URLSearchParamsLike => {
  return Object.fromEntries(
    Object.entries(params).flatMap(([k, v]) => {
      if (v === false || v === undefined) return []
      return [[k, v]]
    }),
  )
}
