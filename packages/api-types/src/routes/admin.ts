import type { Route } from "../route"
import type { RouteDefinition } from "../types"

export type AdminRoutes = Route<"ADMIN_XMP_UNTRACKED", string[]>

export const adminRoutes: RouteDefinition<AdminRoutes> = {
  ADMIN_XMP_UNTRACKED: { method: "GET", pathname: "/admin/xmp/untracked" },
}
