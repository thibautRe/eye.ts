import { Navigate, Route, Router } from "@solidjs/router"
import {
  lazy as solidLazy,
  type Component,
  type ParentComponent,
} from "solid-js"
import type { PictureId } from "core"

export const routes = {
  Pictures: "/pictures",
  Picture: (id: PictureId | ":id") => `/picture/${id}`,
} as const

/** Creates a redirect component */
const r = (href: string) => () => <Navigate href={href} />

/** Rewraps Solid's lazy component with error logging in case chunks fail to run */
const lazy = (getter: () => Promise<{ default: Component }>) =>
  solidLazy(() =>
    getter().catch((err) => {
      console.error(err)
      throw err
    }),
  )

const PictureList = lazy(() => import("./PictureListRoute"))

export const AppRoutes = () => (
  <Router>
    <Route path={routes.Pictures} component={PictureList} />

    <Route path="*" component={NotFoundRoute} />
  </Router>
)

// Error route helper
const Err: ParentComponent = (p) => <span>{p.children}</span>
export const NotFoundRoute = () => <Err>Not found</Err>
