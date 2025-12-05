import { format, type Locale } from "date-fns";
import { enUS } from "date-fns/locale/en-US";
import { ja } from "date-fns/locale/ja";
import { zhCN } from "date-fns/locale/zh-CN";
import type { SupportedLocale } from "../i18n/schema";

export const convertDateFnsLocale = (locale: SupportedLocale) => {
  switch (locale) {
    case "ja":
      return ja;
    case "en":
      return enUS;
    case "zh_CN":
      return zhCN;
    default:
      locale satisfies never;
      return enUS;
  }
};

/**
 * Get ordinal suffix for a day number (1st, 2nd, 3rd, 4th, etc.)
 */
const getOrdinalSuffix = (day: number): string => {
  if (day > 3 && day < 21) return "th";
  switch (day % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
};

/**
 * Format a date with ordinal day (e.g., "12th September, 2025")
 */
const formatWithOrdinal = (
  dateObject: Date,
  pattern: string,
  dateFnsLocale: Locale
): string => {
  const day = dateObject.getDate();
  const ordinal = getOrdinalSuffix(day);
  // Replace 'do' placeholder with day + ordinal
  const formattedPattern = pattern.replace("do", `d'${ordinal}'`);
  return format(dateObject, formattedPattern, { locale: dateFnsLocale });
};

export const formatLocaleDate = (
  date: Date | string | number,
  options: {
    locale?: SupportedLocale;
    target?: "month" | "day" | "time" | "full" | "timeOnly";
  },
) => {
  const { locale = "en", target = "time" } = options;

  const dateObject =
    typeof date === "string" || typeof date === "number"
      ? new Date(date)
      : date;
  const dateFnsLocale = convertDateFnsLocale(locale);

  const getFormatPattern = (
    locale: SupportedLocale,
    target: "month" | "day" | "time" | "full" | "timeOnly",
  ): string => {
    if (locale === "ja") {
      switch (target) {
        case "month":
          return "yyyy年M月";
        case "day":
          return "yyyy年M月d日";
        case "time":
          return "yyyy年M月d日 HH:mm";
        case "full":
          return "EEEE, yyyy年M月d日";
        case "timeOnly":
          return "HH:mm:ss";
      }
    } else if (locale === "en") {
      switch (target) {
        case "month":
          return "MM/yyyy";
        case "day":
          return "dd/MM/yyyy";
        case "time":
          return "dd/MM/yyyy HH:mm";
        case "full":
          return "EEEE, do MMMM, yyyy";
        case "timeOnly":
          return "HH:mm:ss";
      }
    } else if (locale === "zh_CN") {
      switch (target) {
        case "month":
          return "yyyy年M月";
        case "day":
          return "yyyy年M月d日";
        case "time":
          return "yyyy年M月d日 HH:mm";
        case "full":
          return "EEEE, yyyy年M月d日";
        case "timeOnly":
          return "HH:mm:ss";
      }
    }
    // default
    switch (target) {
      case "month":
        return "yyyy-MM";
      case "day":
        return "yyyy-MM-dd";
      case "time":
        return "yyyy-MM-dd HH:mm";
      case "full":
        return "EEEE, do MMMM, yyyy";
      case "timeOnly":
        return "HH:mm";
    }
  };

  const formatPattern = getFormatPattern(locale, target);

  // Use ordinal formatting for 'full' target in English
  if (target === "full" && (locale === "en" || !locale)) {
    return formatWithOrdinal(dateObject, formatPattern, dateFnsLocale);
  }

  return format(dateObject, formatPattern, {
    locale: dateFnsLocale,
  });
};
