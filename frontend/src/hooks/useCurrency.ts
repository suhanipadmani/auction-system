export function useCurrency() {
  const formatINR = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatRaw = (amount: number) => {
    return amount.toLocaleString('en-IN');
  };

  return {
    formatINR,
    formatRaw,
    symbol: "₹"
  };
}
