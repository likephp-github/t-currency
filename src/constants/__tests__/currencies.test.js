import { CURRENCIES, getCurrencyName } from '../currencies';

describe('CURRENCIES 目錄', () => {
  it('共有 43 種幣別(既有 20 種 + 新增 23 種)', () => {
    expect(CURRENCIES).toHaveLength(43);
  });

  it('代碼不重複', () => {
    const codes = CURRENCIES.map((c) => c.code);
    expect(new Set(codes).size).toBe(codes.length);
  });

  it('每一筆都有完整的多語系名稱與必要欄位', () => {
    CURRENCIES.forEach((currency) => {
      expect(currency.name).toEqual(expect.any(String));
      expect(currency.nameEn).toEqual(expect.any(String));
      expect(currency.nameJa).toEqual(expect.any(String));
      expect(currency.nameKo).toEqual(expect.any(String));
      expect(currency.symbol).toEqual(expect.any(String));
      expect(currency.flag).toEqual(expect.any(String));
      expect(currency.country).toEqual(expect.any(String));
    });
  });

  it('新增的 23 種幣別代碼都在目錄中', () => {
    const newCodes = [
      'MOP', 'SAR', 'QAR', 'TRY', 'ILS', 'RUB', 'SEK', 'NOK', 'DKK',
      'PLN', 'CZK', 'HUF', 'MXN', 'BRL', 'ZAR', 'EGP', 'KHR', 'LAK',
      'MMK', 'MNT', 'PKR', 'BDT', 'LKR'
    ];
    const codes = CURRENCIES.map((c) => c.code);
    newCodes.forEach((code) => expect(codes).toContain(code));
  });

  it('既有的 20 種幣別代碼都還在(沒有被覆蓋或刪除)', () => {
    const originalCodes = [
      'TWD', 'USD', 'EUR', 'JPY', 'GBP', 'KRW', 'CNY', 'HKD', 'SGD',
      'AUD', 'CAD', 'CHF', 'NZD', 'THB', 'MYR', 'VND', 'PHP', 'IDR',
      'INR', 'AED'
    ];
    const codes = CURRENCIES.map((c) => c.code);
    originalCodes.forEach((code) => expect(codes).toContain(code));
  });
});

describe('getCurrencyName', () => {
  const usd = CURRENCIES.find((c) => c.code === 'USD');

  it('依語言回傳對應名稱', () => {
    expect(getCurrencyName(usd, 'zh-TW')).toBe('美元');
    expect(getCurrencyName(usd, 'en')).toBe('US Dollar');
    expect(getCurrencyName(usd, 'ja')).toBe('米ドル');
    expect(getCurrencyName(usd, 'ko')).toBe('미국 달러');
  });

  it('未指定語言時預設 zh-TW', () => {
    expect(getCurrencyName(usd)).toBe('美元');
  });

  it('找不到對應語言時 fallback 回 zh-TW 的 name', () => {
    expect(getCurrencyName(usd, 'fr')).toBe('美元');
  });
});
