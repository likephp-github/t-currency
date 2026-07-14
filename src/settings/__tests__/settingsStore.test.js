import { DEFAULT_SETTINGS, loadSettings, saveSettings } from '../settingsStore';
import { createInMemoryAdapter } from '../adapters';

describe('DEFAULT_SETTINGS', () => {
  it('宣告完整的 8 個鍵', () => {
    expect(Object.keys(DEFAULT_SETTINGS).sort()).toEqual([
      'bubbleTeaRate',
      'chickenCutletRate',
      'customNTDFlag',
      'decimalPlaces',
      'exchangeSource',
      'language',
      'showExchangeSource',
      'showSymbol',
    ]);
  });

  it('不包含已移除的死欄位', () => {
    expect(DEFAULT_SETTINGS).not.toHaveProperty('showLocalCurrency');
    expect(DEFAULT_SETTINGS).not.toHaveProperty('defaultAmount');
  });
});

describe('loadSettings', () => {
  it('沒有已存資料時回傳 defaults', async () => {
    const adapter = createInMemoryAdapter(null);
    const settings = await loadSettings(adapter);
    expect(settings).toEqual(DEFAULT_SETTINGS);
  });

  it('已存資料缺鍵時,缺的鍵補 default(淺層合併)', async () => {
    const adapter = createInMemoryAdapter(JSON.stringify({ decimalPlaces: 4 }));
    const settings = await loadSettings(adapter);
    expect(settings).toEqual({ ...DEFAULT_SETTINGS, decimalPlaces: 4 });
  });

  it('已存資料完整時,值以已存資料為準', async () => {
    const persisted = { ...DEFAULT_SETTINGS, language: 'en', chickenCutletRate: true };
    const adapter = createInMemoryAdapter(JSON.stringify(persisted));
    const settings = await loadSettings(adapter);
    expect(settings).toEqual(persisted);
  });

  it('讀取失敗時整包 fallback 回 defaults,不拋出例外', async () => {
    const adapter = { get: async () => { throw new Error('storage 壞了'); } };
    await expect(loadSettings(adapter)).resolves.toEqual(DEFAULT_SETTINGS);
  });

  it('parse 失敗時整包 fallback 回 defaults,不拋出例外', async () => {
    const adapter = createInMemoryAdapter('不是 JSON');
    await expect(loadSettings(adapter)).resolves.toEqual(DEFAULT_SETTINGS);
  });
});

describe('saveSettings', () => {
  it('儲存後可以用同一個 adapter 讀回相同內容', async () => {
    const adapter = createInMemoryAdapter(null);
    const toSave = { ...DEFAULT_SETTINGS, decimalPlaces: 3, customNTDFlag: '🐻' };

    await saveSettings(toSave, adapter);
    const reloaded = await loadSettings(adapter);

    expect(reloaded).toEqual(toSave);
  });

  it('寫入失敗時不拋出例外', async () => {
    const adapter = { set: async () => { throw new Error('storage 壞了'); } };
    await expect(saveSettings(DEFAULT_SETTINGS, adapter)).resolves.toBeUndefined();
  });
});
