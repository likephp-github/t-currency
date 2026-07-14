import { formatAmount, formatUpdateTime } from '../formatting';

describe('formatAmount', () => {
  it('空值回傳空字串', () => {
    expect(formatAmount('')).toBe('');
    expect(formatAmount(null)).toBe('');
    expect(formatAmount(undefined)).toBe('');
  });

  it('decimals 為 null 時只做千分位分組,不四捨五入', () => {
    expect(formatAmount('1234567.891', null)).toBe('1,234,567.891');
  });

  it('decimals 有值時套用小數位四捨五入 + 千分位分組', () => {
    expect(formatAmount(1234567.891, 2)).toBe('1,234,567.89');
    expect(formatAmount(1000, 2)).toBe('1,000.00');
  });

  it('負數保留負號在千分位分組之外', () => {
    expect(formatAmount('-1234.5', null)).toBe('-1,234.5');
    expect(formatAmount(-1234.5, 2)).toBe('-1,234.50');
  });

  it('不足千位不加逗號', () => {
    expect(formatAmount('123', null)).toBe('123');
  });

  it('輸入已含逗號時先清除再重新分組(不重複加逗號)', () => {
    expect(formatAmount('1,234', null)).toBe('1,234');
  });
});

describe('formatUpdateTime', () => {
  const t = jest.fn((key, params) => {
    if (key === 'updatedToday') return `today ${params.time}`;
    return key;
  });

  beforeEach(() => {
    t.mockClear();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('date 為 null 時顯示未更新', () => {
    expect(formatUpdateTime(null, t)).toBe('notUpdated');
  });

  it('一分鐘內顯示剛剛更新', () => {
    const now = new Date('2026-07-14T12:00:00');
    jest.setSystemTime(now);
    const date = new Date('2026-07-14T11:59:30');
    expect(formatUpdateTime(date, t)).toBe('justUpdated');
  });

  it('一小時內顯示相對分鐘數', () => {
    const now = new Date('2026-07-14T12:00:00');
    jest.setSystemTime(now);
    const date = new Date('2026-07-14T11:45:00');
    expect(formatUpdateTime(date, t)).toBe('15updatedMinutesAgo');
  });

  it('超過一小時顯示絕對時間,以 date 本身的時分為準(不是現在時間)', () => {
    const now = new Date('2026-07-14T15:30:00');
    jest.setSystemTime(now);
    const date = new Date('2026-07-14T09:05:00');
    expect(formatUpdateTime(date, t)).toBe('today 9:05');
  });
});
