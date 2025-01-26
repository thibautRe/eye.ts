// const i18nContent = `import("core").I18nContent`

const config = {
  types: {
    columnTypeOverrides: {
      "category_leaves.exif_tags": "string[]",
      "pictures.id": `import("core").PictureId`,
    },
  },
}
export default config
