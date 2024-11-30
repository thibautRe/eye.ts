/**
 * Opaque ID type, with brand
 */
export type ID<Brand extends string> = (number | string) & { __brand: Brand }
