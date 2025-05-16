import { expect, test } from "vitest"
import { splitInLines } from "./splitInLines"

test("splitInLines", () => {
  expect(
    splitInLines([
      { height: 30, width: 40 },
      { height: 30, width: 40 },
      { height: 40, width: 40 },
      { height: 50, width: 40 },
      { height: 30, width: 40 },
    ]),
  ).toMatchInlineSnapshot(`
    [
      {
        "aspectRatio": 5.8,
        "pictures": [
          {
            "height": 30,
            "width": 40,
          },
          {
            "height": 30,
            "width": 40,
          },
          {
            "height": 40,
            "width": 40,
          },
          {
            "height": 50,
            "width": 40,
          },
          {
            "height": 30,
            "width": 40,
          },
        ],
      },
    ]
  `)
})
