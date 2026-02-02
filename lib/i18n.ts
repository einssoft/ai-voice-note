"use client";

import de from "@/locales/de.json";
import en from "@/locales/en.json";
import fr from "@/locales/fr.json";
import it from "@/locales/it.json";

export const messages = { de, en, fr, it } as const;
export type Locale = keyof typeof messages;
export const supportedLocales: Locale[] = ["de", "en", "fr", "it"];

const fallbackLocale: Locale = "en";

export function getMessages(locale: Locale | string) {
  return messages[(locale as Locale) || fallbackLocale] ?? messages[fallbackLocale];
}

export function t(
  localeMessages: Record<string, string>,
  key: string,
  vars?: Record<string, string | number>
) {
  const template =
    localeMessages[key] ?? (messages[fallbackLocale] as Record<string, string>)[key] ?? key;
  if (!vars) return template;
  return Object.keys(vars).reduce(
    (acc, varKey) => acc.replaceAll(`{${varKey}}`, String(vars[varKey])),
    template
  );
}

export function toIntlLocale(locale: Locale) {
  switch (locale) {
    case "de":
      return "de-DE";
    case "fr":
      return "fr-FR";
    case "it":
      return "it-IT";
    case "en":
    default:
      return "en-US";
  }
}

export function useI18n(locale: Locale) {
  const localeMessages = getMessages(locale);
  const translate = (key: string, vars?: Record<string, string | number>) =>
    t(localeMessages, key, vars);
  return { t: translate, messages: localeMessages };
}
