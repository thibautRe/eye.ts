export interface SplitInLinesOptions {
  /** Target aspect ratio of a line */
  targetAspectRatio: number
}

export function splitInLines<T extends { width: number; height: number }>(
  pictures: readonly T[],
  options: SplitInLinesOptions,
): { pictures: T[]; aspectRatio: number }[] {
  if (pictures.length === 0) return []
  const line: T[] = []
  let rest: T[] = pictures.slice()
  let aspectRatio = 0
  while (aspectRatio < options.targetAspectRatio && rest.length > 0) {
    const [pic] = rest.splice(0, 1)
    line.push(pic)
    aspectRatio += pic.width / pic.height
  }

  return [
    {
      aspectRatio: Math.max(options.targetAspectRatio * 0.75, aspectRatio),
      pictures: line,
    },
    ...splitInLines(rest, options),
  ]
}
