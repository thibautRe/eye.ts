import { test, expect } from "vitest"
import { parseRatingFilter, stringifyRatingFilter } from "./rating"

test("parseRatingFilter", () => {
  expect(parseRatingFilter("eq:2")).toMatchInlineSnapshot(`
    {
      "rating": 2,
      "type": "eq",
    }
  `)
  expect(parseRatingFilter("gteq:4")).toMatchInlineSnapshot(`
    {
      "rating": 4,
      "type": "gteq",
    }
  `)
  expect(parseRatingFilter("invalid")).toMatchInlineSnapshot(`null`)
  expect(parseRatingFilter("eq:0")).toMatchInlineSnapshot(`
    {
      "rating": null,
      "type": "eq",
    }
  `)
})

test("stringifyRatingFilter", () => {
  expect(
    stringifyRatingFilter({ type: "eq", rating: 2 }),
  ).toMatchInlineSnapshot(`"eq:2"`)
  expect(
    stringifyRatingFilter({ type: "eq", rating: null }),
  ).toMatchInlineSnapshot(`"eq:null"`)
  expect(
    stringifyRatingFilter({ type: "gteq", rating: 4 }),
  ).toMatchInlineSnapshot(`"gteq:4"`)
})
