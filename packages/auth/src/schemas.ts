import { type infer as i, literal, object, union } from "zod/v4-mini"

export const AuthRoleSchema = object({
  version: literal(1),
  role: union([literal("admin"), literal("user")]),
})

export type AuthRole = i<typeof AuthRoleSchema>
