/**
 * Opaque ID type, with brand
 */
export type ID<Brand extends string> = string & { __brand: Brand }

export type PictureId = ID<"picture">
