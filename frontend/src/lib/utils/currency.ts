/**
 * Global currency formatting utility
 */
export const formatCurrency = (amount: number, locale: string = "en-IN", currency: string = "INR") => {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
  }).format(amount);
};

export const formatNumber = (num: number, locale: string = "en-IN") => {
  return new Intl.NumberFormat(locale).format(num);
};
