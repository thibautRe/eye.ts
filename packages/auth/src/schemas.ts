import { z } from "zod"

export const AuthRoleSchema = z.object({
  version: z.literal(1),
  role: z.union([z.literal("admin"), z.literal("user")]),
})

export type AuthRole = z.infer<typeof AuthRoleSchema>
