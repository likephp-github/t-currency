// 貨幣清單規則 — 收斂自 AppContext / HomeScreen / CurrencySelectionScreen
// 三處重複實作的「數量 1–6、TWD 不可刪」規則。

export const MAX_CURRENCIES = 6;
export const MIN_CURRENCIES = 1;
const PROTECTED_CURRENCY = 'TWD';

export const canAdd = (selectedCurrencies) => selectedCurrencies.length < MAX_CURRENCIES;

export const canRemove = (selectedCurrencies, currencyCode) => {
  if (currencyCode === PROTECTED_CURRENCY) return false;
  return selectedCurrencies.length > MIN_CURRENCIES;
};
