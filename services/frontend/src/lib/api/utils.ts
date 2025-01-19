import { PUBLIC_API_URL } from "$env/static/public"
import { browser } from "$app/environment"
import { apiClientHeaders } from "./client"
import { error } from "@sveltejs/kit"

const assert_ok = (res: Response) => {
  if (!res.ok) error(res.status)
  return res
}
const jsonHeader = { "Content-Type": "application/json" }

const rootUrl = browser ? `/api` : PUBLIC_API_URL

/** small override of fetch */
const f = (r: string, init: RequestInit = {}) => {
  return fetch(`${rootUrl}${r}`, {
    headers: { ...apiClientHeaders, ...init.headers },
    ...init,
  })
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
export const get_json = async <T = unknown>(r: string): Promise<T> =>
  (await (await get(r)).json()) as T
export const put_json = async <TData, T = unknown>(
  r: string,
  data?: TData,
): Promise<T> => (await (await put(r, data)).json()) as T

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

export const withParams = <
  T extends Record<string, string | number | boolean | undefined>,
>(
  r: string,
  params: T,
) => {
  // @ts-expect-error Record<string,number> is not assignable to URLSearchParams
  const sp = new URLSearchParams(params).toString()
  return sp ? `${r}?${sp}` : r
}
