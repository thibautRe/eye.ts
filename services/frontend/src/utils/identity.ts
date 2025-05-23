import { createSignal } from "solid-js"
import { decode, type AuthRole } from "@local/auth/src/client"
import { LSKeys } from "./localStorage"
import { setApiClientJwt } from "../api/client"

const [identity, setIdentity] = createSignal<AuthRole>()
export { identity }

const updateIdentityX = (jwt: string) => {
  const payload = decode(jwt)
  setApiClientJwt(jwt)
  setIdentity(payload)
}

export function initIdentity() {
  const url = new URL(window.location.href)
  const hashParams = new URLSearchParams(url.hash.slice(1))
  const jwt = hashParams.get("jwt")
  if (jwt) {
    hashParams.delete("jwt")
    window.location.hash = hashParams.toString()
    updateIdentityX(jwt)
    localStorage.setItem(LSKeys.JWT, jwt)
    return
  }

  const jwtLs = localStorage.getItem(LSKeys.JWT)
  if (jwtLs) {
    updateIdentityX(jwtLs)
  }
}
