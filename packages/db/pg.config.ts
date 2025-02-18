// const i18nContent = `import("core").I18nContent`

const config = {
  types: {
    columnTypeOverrides: {
      "category_leaves.exif_tags": "string[]",
      "category_leaves.slug": `import("core").Slug`,
      "pictures.id": `import("core").PictureId`,
      "pictures.rating": `import("core").Rating`,
    },
  },
}
export default config
