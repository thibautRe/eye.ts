import type { ID } from "./id"

export type Slug = ID<"slug">
/** This function is idempotent */
export const slugify = (name: string): Slug =>
  name
    .trim()
    .toLowerCase()
    .replaceAll(/[&$%+,/:;=?#@\s]/g, "_")
    .replaceAll(/_{2,}/g, "_") as Slug
