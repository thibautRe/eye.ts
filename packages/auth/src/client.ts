import { jwtDecode } from "jwt-decode"
import { AuthRoleSchema } from "./schemas"

export * from "./schemas"

export function decode(jwt: string) {
  const token = jwtDecode(jwt)
  return AuthRoleSchema.parse(token)
}
