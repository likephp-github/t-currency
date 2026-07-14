import { emptyGrid, computeAmounts } from '../useConversions';

const rates = {
  base: 'USD',
  rates: { USD: 1, TWD: 30 },
  date: '2026-07-13',
  timestamp: 0,
};

describe('emptyGrid — 清空狀態', () => {
  it('真實貨幣是空字串,虛擬貨幣是 0.00(既有怪癖)', () => {
    expect(emptyGrid(['TWD', 'USD'])).toEqual({
      TWD: '',
      USD: '',
      CHICKEN: '0.00',
      BUBBLE: '0.00',
    });
  });
});

describe('computeAmounts — 換算數學、虛擬貨幣定價、格式化', () => {
  const ctx = (overrides = {}) => ({
    rates,
    selectedCurrencies: ['USD', 'TWD'],
    decimalPlaces: 2,
    ...overrides,
  });

  it('來源貨幣顯示輸入值,其他貨幣依匯率換算並套用小數位', () => {
    const result = computeAmounts('USD', '7', ctx());
    expect(result.USD).toBe('7');
    expect(result.TWD).toBe('210.00');
  });

  it('來源貨幣不套用小數位四捨五入,維持輸入精度', () => {
    const result = computeAmounts('USD', '1.23456', ctx());
    expect(result.USD).toBe('1.23456');
  });

  it('輸入含逗號時先清除再重新分組', () => {
    const result = computeAmounts('USD', '1,234', ctx());
    expect(result.USD).toBe('1,234');
    expect(result.TWD).toBe('37,020.00');
  });

  it('虛擬貨幣數量依 TWD 金額 / 單價計算,套用小數位與千分位', () => {
    const result = computeAmounts('USD', '7', ctx());
    // TWD = 210 → CHICKEN = 210/85 = 2.47(四捨五入), BUBBLE = 210/55 = 3.82
    expect(result.CHICKEN).toBe('2.47');
    expect(result.BUBBLE).toBe('3.82');
  });

  it('來源貨幣本身就是 TWD 時,虛擬貨幣直接用輸入值計算', () => {
    const result = computeAmounts('TWD', '100', ctx());
    expect(result.USD).toBe('3.33');
    expect(result.CHICKEN).toBe('1.18');
  });

  it('TWD 金額為 0 時,虛擬貨幣顯示 0.00', () => {
    const result = computeAmounts('USD', '0', ctx());
    expect(result.TWD).toBe('0.00');
    expect(result.CHICKEN).toBe('0.00');
    expect(result.BUBBLE).toBe('0.00');
  });

  it('只選一種貨幣時仍可計算(沒有其他貨幣要換算)', () => {
    const result = computeAmounts('TWD', '500', ctx({ selectedCurrencies: ['TWD'] }));
    expect(result).toEqual({
      TWD: '500',
      CHICKEN: '5.88',
      BUBBLE: '9.09',
    });
  });
});
