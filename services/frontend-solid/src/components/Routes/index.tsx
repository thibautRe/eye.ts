import { Navigate, Route, Router } from "@solidjs/router"
import {
  lazy as solidLazy,
  type Component,
  type ParentComponent,
} from "solid-js"
import type { PictureId } from "core"

export const routes = {
  PictureList: "/pictures",
  PictureUpload: "/pictures/upload",
  Picture: (id: PictureId | ":id") => `/picture/${id}`,

  CategoryList: `/categories`,
  Category: (slug: string | ":slug") => `/category/${slug}`,
  CategoryEdit: (slug: string | ":slug") => `${routes.Category(slug)}/edit`,
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
const PictureUpload = lazy(() => import("./PictureUploadRoute"))
const Picture = lazy(() => import("./PictureRoute"))

const CategoryList = lazy(() => import("./CategoryListRoute"))
const Category = lazy(() => import("./CategoryRoute"))
const CategoryEdit = lazy(() => import("./CategoryEditRoute"))

export const AppRoutes = () => (
  <Router>
    <Route path={routes.PictureList} component={PictureList} />
    <Route path={routes.PictureUpload} component={PictureUpload} />
    <Route path={routes.Picture(":id")} component={Picture} />

    <Route path={routes.CategoryList} component={CategoryList} />
    <Route path={routes.Category(":slug")} component={Category} />
    <Route path={routes.CategoryEdit(":slug")} component={CategoryEdit} />

    {/* Convenience redirects */}
    <Route path="/" component={r(routes.PictureList)} />
    <Route path={"/picture/"} component={r(routes.PictureList)} />
    <Route path={"/category/"} component={r(routes.CategoryList)} />

    <Route path="*" component={NotFoundRoute} />
  </Router>
)

// Error route helper
const Err: ParentComponent = (p) => <span>{p.children}</span>
export const NotFoundRoute = () => <Err>Not found</Err>
