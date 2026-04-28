import { useParams } from 'next/navigation';

const INR_TO_EUR_RATE = 1 / 110.25; // 1 EUR = 110.25 INR

export function useCurrency() {
  const { locale } = useParams();
  const isGerman = locale === 'de';

  const convertAmount = (amount: number) => {
    return isGerman ? amount * INR_TO_EUR_RATE : amount;
  };

  const convertBack = (amount: number) => {
    return isGerman ? amount / INR_TO_EUR_RATE : amount;
  };

  const formatCurrency = (amount: number) => {
    const converted = convertAmount(amount);
    return new Intl.NumberFormat(isGerman ? 'de-DE' : 'en-IN', {
      style: 'currency',
      currency: isGerman ? 'EUR' : 'INR',
      // Euros usually show 2 decimal places, Rupees often 0 in this app
      minimumFractionDigits: isGerman ? 2 : 0,
      maximumFractionDigits: isGerman ? 2 : 0
    }).format(converted);
  };

  const formatRaw = (amount: number) => {
    const converted = convertAmount(amount);
    return converted.toLocaleString(isGerman ? 'de-DE' : 'en-IN', {
      minimumFractionDigits: isGerman ? 2 : 0,
      maximumFractionDigits: isGerman ? 2 : 0
    });
  };

  return {
    formatCurrency,
    formatRaw,
    convertAmount,
    convertBack,
    symbol: isGerman ? "€" : "₹"
  };
}
