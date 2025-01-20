export const supportedLangCodes = ["en", "fr", "tr"] as const
export type SupportedLangCode = (typeof supportedLangCodes)[number]

export type I18nContent = Partial<Record<SupportedLangCode, string>>

export const translate = (
  content: I18nContent,
  langCode: SupportedLangCode,
): string => content[langCode] ?? content.en ?? content.fr ?? content.tr ?? ""
