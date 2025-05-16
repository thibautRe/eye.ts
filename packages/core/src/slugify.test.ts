import { test, expect } from "vitest"
import { slugify } from "./slugify"

test("slugify", () => {
  expect(slugify("Hello world")).toMatchInlineSnapshot(`"hello_world"`)
  expect(slugify(" This is fine ")).toMatchInlineSnapshot(`"this_is_fine"`)
  expect(slugify("this_is_fine")).toMatchInlineSnapshot(`"this_is_fine"`)
  expect(
    slugify("This is ?/ Not really # valid %20 chars"),
  ).toMatchInlineSnapshot(`"this_is_not_really_valid_20_chars"`)
  expect(slugify("skógafoss")).toMatchInlineSnapshot(`"skógafoss"`)
})
