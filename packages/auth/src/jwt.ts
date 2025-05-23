import { type AuthRole, AuthRoleSchema } from "./schemas"
import jwt from "jsonwebtoken"

declare module "bun" {
  interface Env {
    JWT_SECRET?: string
  }
}

const getSecret = () => {
  const { JWT_SECRET } = Bun.env
  if (!JWT_SECRET) {
    throw new Error(`Could not find JWT_SECRET environment variable`)
  }
  return JWT_SECRET
}

export const create = (role: AuthRole) => {
  return jwt.sign(role, getSecret())
}
export const validate = (token: string) => {
  const payload = jwt.verify(token, getSecret())
  return AuthRoleSchema.parse(payload)
}
export const validateOrNull = (token: string) => {
  const payload = jwt.verify(token, getSecret())
  const result = AuthRoleSchema.safeParse(payload)
  if (result.success) return result.data
  return null
}
