export interface SplitInLinesOptions {
  /** Maximum aspect ratio of a line */
  maxAspectRatio: number
}

export function splitInLines<T extends { width: number; height: number }>(
  pictures: readonly T[],
  options: SplitInLinesOptions,
): { pictures: T[]; aspectRatio: number }[] {
  if (pictures.length === 0) return []
  const line: T[] = []
  let rest: T[] = pictures.slice()
  let pic: T
  let aspectRatio = 0
  while (rest.length > 0) {
    const extraAspectRatio = rest[0].width / rest[0].height
    if (
      aspectRatio + extraAspectRatio < options.maxAspectRatio ||
      line.length === 0
    ) {
      ;[pic, ...rest] = rest
      line.push(pic)
      aspectRatio += extraAspectRatio
    } else {
      break
    }
  }

  return [
    {
      aspectRatio: Math.max(options.maxAspectRatio * 0.75, aspectRatio),
      pictures: line,
    },
    ...splitInLines(rest, options),
  ]
}
