/**
 * Global date formatting utility
 */
export const formatDate = (date: string | Date, type: "full" | "date" | "time" = "full", locale: string = "en") => {
  if (!date) return "N/A";
  const d = typeof date === "string" ? new Date(date) : date;
  
  const options: Intl.DateTimeFormatOptions = {};
  
  if (type === "full" || type === "date") {
    options.day = "2-digit";
    options.month = "short";
    options.year = "numeric";
  }
  
  if (type === "full" || type === "time") {
    options.hour = "2-digit";
    options.minute = "2-digit";
    options.hour12 = true;
  }

  const localeCode = locale === "de" ? "de-DE" : "en-IN";
  return new Intl.DateTimeFormat(localeCode, options).format(d);
};
