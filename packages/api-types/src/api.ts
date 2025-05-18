import { adminRoutes, AdminRoutes } from "./routes/admin"
import { categoryRoutes, type CategoryRoutes } from "./routes/category"
import { pictureRoutes, type PictureRoutes } from "./routes/picture"
import type { RouteDefinition } from "./types"
export type { ApiPathname } from "./types"

export type ApiRoutes = CategoryRoutes | PictureRoutes | AdminRoutes
export type ApiRouteKey = ApiRoutes["key"]

export const routes: RouteDefinition<ApiRoutes> = {
  ...categoryRoutes,
  ...pictureRoutes,
  ...adminRoutes,
}
