import type { RouteDefinition } from "./properties"
import { categoryRoutes, type CategoryRoutes } from "./routes/category"
import { pictureRoutes, type PictureRoutes } from "./routes/picture"

export type ApiRoutes = CategoryRoutes | PictureRoutes
export type ApiRouteKey = ApiRoutes["key"]

export const routes: RouteDefinition<ApiRoutes> = {
  ...categoryRoutes,
  ...pictureRoutes,
}
