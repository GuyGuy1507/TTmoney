const CURRENCY_CONFIG = {
  USD: { symbol: '$', decimals: 2 },
  EUR: { symbol: '€', decimals: 2 },
  GBP: { symbol: '£', decimals: 2 },
  JPY: { symbol: '¥', decimals: 0 },
  VND: { symbol: '₫', decimals: 0 },
};

export function formatCurrency(amount: number | string, currency: string = 'USD'): string {
  const config = CURRENCY_CONFIG[currency as keyof typeof CURRENCY_CONFIG] || CURRENCY_CONFIG.USD;

  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  const formatted = numAmount.toFixed(config.decimals);

  return `${config.symbol}${formatted}`;
}