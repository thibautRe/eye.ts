import type { ID } from "./id"

export type Slug = ID<"slug">
export const slugify = (name: string): Slug =>
  name.trim().toLowerCase().replaceAll(" ", "_").replaceAll("/", "_") as Slug
