import { MAX_CURRENCIES, MIN_CURRENCIES, canAdd, canRemove } from '../currencyListPolicy';

describe('currencyListPolicy — 貨幣清單規則(min 1 / max 6 / TWD 保護)', () => {
  it('MAX_CURRENCIES 為 6', () => {
    expect(MAX_CURRENCIES).toBe(6);
  });

  it('MIN_CURRENCIES 為 1', () => {
    expect(MIN_CURRENCIES).toBe(1);
  });

  describe('canAdd', () => {
    it('清單未達上限時可以新增', () => {
      expect(canAdd(['TWD', 'USD'])).toBe(true);
    });

    it('清單剛好達到上限時不可再新增', () => {
      expect(canAdd(['TWD', 'USD', 'EUR', 'JPY', 'GBP', 'KRW'])).toBe(false);
    });

    it('空清單可以新增', () => {
      expect(canAdd([])).toBe(true);
    });
  });

  describe('canRemove', () => {
    it('清單超過最小值時可以移除非保護貨幣', () => {
      expect(canRemove(['TWD', 'USD'], 'USD')).toBe(true);
    });

    it('清單只剩最小值時不可移除', () => {
      expect(canRemove(['USD'], 'USD')).toBe(false);
    });

    it('TWD 永遠不可移除,即使清單還有其他貨幣', () => {
      expect(canRemove(['TWD', 'USD', 'EUR'], 'TWD')).toBe(false);
    });

    it('TWD 是清單中唯一貨幣時也不可移除', () => {
      expect(canRemove(['TWD'], 'TWD')).toBe(false);
    });
  });
});
