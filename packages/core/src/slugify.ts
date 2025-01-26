export const slugify = (name: string) =>
  encodeURIComponent(
    name.trim().toLowerCase().replaceAll(" ", "_").replaceAll("/", "_"),
  )
