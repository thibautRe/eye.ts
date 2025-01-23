import { asyncLocalStorage } from "./asyncLocalStorage"

type Severity = "log" | "warn" | "error"

const getEmoji = (severity: Severity) =>
  severity === "error" ? "❌ " : severity === "warn" ? "⚠️ " : ""

const logBySeverity =
  (severity: Severity) =>
  (...items: unknown[]) => {
    const s = asyncLocalStorage.getStore()
    console[severity](
      `${getEmoji(severity)}<${s?.requestId ?? "???"}>`,
      ...items,
    )
  }

export const log = logBySeverity("log")
export const warn = logBySeverity("warn")
export const error = logBySeverity("error")
