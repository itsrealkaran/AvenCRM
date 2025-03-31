export const offsetCurrency = (currency: string): number => {
  const singleOffsetCurrencies = [
    'CLP',
    'COP',
    'CRC',
    'HUF',
    'ISK',
    'IDR',
    'JPY',
    'KRW',
    'PYG',
    'TWD',
    'VND',
  ];

  return singleOffsetCurrencies.includes(currency.toUpperCase()) ? 1 : 100;
};
