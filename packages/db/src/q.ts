import {
  type FieldQuery,
  type WhereCondition,
  allOf,
  and,
  anyOf,
  caseInsensitive,
  greaterThan,
  jsonPath,
  lessThan,
  not,
  or,
} from "@databases/pg-typed"

export { type FieldQuery, type WhereCondition }

export const q = {
  greaterThan,
  lessThan,
  not,
  and,
  or,
  allOf,
  anyOf,
  caseInsensitive,
  jsonPath,
}
