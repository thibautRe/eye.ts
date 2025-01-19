export function isNotNull<T>(i: T | null): i is T {
  return i !== null
}
