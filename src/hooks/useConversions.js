import { useEffect, useState } from 'react';
import ExchangeRateService from '../services/exchangeRateAPI';
import { VIRTUAL_CURRENCIES } from '../constants/currencies';
import { formatAmount } from '../utils/formatting';

// 換算引擎 — 從 HomeScreen 抽出的 amounts grid。
// 擁有金額狀態本身,不只是換算數學;rates blob、跨匯率數學、
// 虛擬貨幣定價、小數位與千分位格式化全部收在這裡,呼叫端
// (畫面)只認得到貨幣代碼 → 顯示字串。

// 清空狀態:真實貨幣是空字串,虛擬貨幣是 '0.00'(既有怪癖,原樣保留)。
export const emptyGrid = (selectedCurrencies) => {
  const grid = {};
  selectedCurrencies.forEach((code) => {
    grid[code] = '';
  });
  Object.values(VIRTUAL_CURRENCIES).forEach((virtual) => {
    grid[virtual.code] = '0.00';
  });
  return grid;
};

// 純函式:給定來源貨幣與原始輸入,算出整包新的顯示金額 grid。
// 來源貨幣本身不套用小數位四捨五入(維持使用者輸入精度),
// 其餘貨幣與虛擬貨幣數量都套用 decimalPlaces + 千分位。
export const computeAmounts = (fromCode, rawValue, { rates, selectedCurrencies, decimalPlaces }) => {
  const cleanValue = rawValue.replace(/,/g, '');
  const numValue = parseFloat(cleanValue) || 0;

  const otherCurrencies = selectedCurrencies.filter((code) => code !== fromCode);
  const converted = ExchangeRateService.convertToMultiple(numValue, fromCode, otherCurrencies, rates);

  const amounts = {};
  amounts[fromCode] = formatAmount(cleanValue, null);
  otherCurrencies.forEach((code) => {
    amounts[code] = formatAmount(converted[code], decimalPlaces);
  });

  const twdAmount = fromCode === 'TWD' ? numValue : (converted.TWD ?? 0);
  Object.values(VIRTUAL_CURRENCIES).forEach((virtual) => {
    amounts[virtual.code] = twdAmount
      ? formatAmount(twdAmount / virtual.price, decimalPlaces)
      : '0.00';
  });

  return amounts;
};

export const useConversions = (rates, selectedCurrencies, decimalPlaces) => {
  const [amounts, setAmounts] = useState(() => emptyGrid(selectedCurrencies));

  // selectedCurrencies 改變時自動重設,呼叫端不需要手動觸發
  useEffect(() => {
    setAmounts(emptyGrid(selectedCurrencies));
  }, [selectedCurrencies]);

  const clear = () => {
    setAmounts(emptyGrid(selectedCurrencies));
  };

  const setAmount = (fromCode, rawValue) => {
    if (!rates) return;
    setAmounts(computeAmounts(fromCode, rawValue, { rates, selectedCurrencies, decimalPlaces }));
  };

  return { amounts, setAmount, clear };
};
