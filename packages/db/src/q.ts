import {
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
