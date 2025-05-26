import { expect, test } from "vitest"
import { splitInLines } from "./splitInLines"

test("splitInLines", () => {
  expect(
    splitInLines(
      [
        { height: 30, width: 40 },
        { height: 30, width: 40 },
        { height: 40, width: 40 },
        { height: 50, width: 40 },
        { height: 30, width: 40 },
      ],
      { maxAspectRatio: 5 },
    ),
  ).toMatchInlineSnapshot(`
    [
      {
        "aspectRatio": 4.466666666666667,
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
        ],
      },
      {
        "aspectRatio": 3.75,
        "pictures": [
          {
            "height": 30,
            "width": 40,
          },
        ],
      },
    ]
  `)

  expect(
    splitInLines(
      [
        { height: 30, width: 40 },
        { height: 30, width: 40 },
        { height: 40, width: 40 },
        { height: 50, width: 40 },
        { height: 10, width: 40 },
        { height: 30, width: 40 },
        { height: 30, width: 40 },
        { height: 100, width: 40 },
        { height: 50, width: 40 },
        { height: 30, width: 40 },
      ],
      { maxAspectRatio: 5 },
    ),
  ).toMatchInlineSnapshot(`
    [
      {
        "aspectRatio": 4.466666666666667,
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
        ],
      },
      {
        "aspectRatio": 4,
        "pictures": [
          {
            "height": 10,
            "width": 40,
          },
        ],
      },
      {
        "aspectRatio": 3.8666666666666663,
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
            "height": 100,
            "width": 40,
          },
          {
            "height": 50,
            "width": 40,
          },
        ],
      },
      {
        "aspectRatio": 3.75,
        "pictures": [
          {
            "height": 30,
            "width": 40,
          },
        ],
      },
    ]
  `)
})

test("splitInLines: no infinite loop", () => {
  expect(splitInLines([{ height: 1, width: 10 }], { maxAspectRatio: 5 }))
    .toMatchInlineSnapshot(`
    [
      {
        "aspectRatio": 10,
        "pictures": [
          {
            "height": 1,
            "width": 10,
          },
        ],
      },
    ]
  `)
})
