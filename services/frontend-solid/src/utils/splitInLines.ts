export interface SplitInLinesOptions {
  /** @default 5 */
  maxAspectRatio?: number
}

export function splitInLines<T extends { width: number; height: number }>(
  pictures: readonly T[],
  options: SplitInLinesOptions = {},
): { pictures: T[]; aspectRatio: number }[] {
  if (pictures.length === 0) return []
  const line: T[] = []
  let rest: T[] = pictures.slice()
  let pic: T
  let aspectRatio = 0
  const { maxAspectRatio = 5 } = options
  do {
    ;[pic, ...rest] = rest
    line.push(pic)
    aspectRatio += pic.width / pic.height
  } while (aspectRatio < maxAspectRatio && rest.length > 0)

  return [
    { aspectRatio: Math.max(maxAspectRatio, aspectRatio), pictures: line },
    ...splitInLines(rest, options),
  ]
}
