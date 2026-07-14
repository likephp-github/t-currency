import { asyncStorageAdapter } from './adapters';

// Settings 的單一事實來源。customNTDFlag、chickenCutletRate、
// bubbleTeaRate 過去被畫面直接讀寫卻從未宣告在這裡,現在補齊。
//
// chickenCutletRate / bubbleTeaRate 其實是布林開關(要不要顯示
// 雞排/珍奶換算列),不是匯率數字——既有怪癖,鍵名原樣保留。
export const DEFAULT_SETTINGS = {
  showSymbol: true,
  showExchangeSource: true,
  exchangeSource: 'SIMPLE',
  decimalPlaces: 2,
  language: 'zh-TW',
  customNTDFlag: null,
  chickenCutletRate: false,
  bubbleTeaRate: false,
};

// 讀取設定:缺的鍵用 default 補上(淺層合併),讀取/parse 失敗時
// 整包 fallback 回 default。不做版本化 migration、不逐欄位驗證型別。
export const loadSettings = async (adapter = asyncStorageAdapter) => {
  try {
    const raw = await adapter.get();
    if (!raw) return { ...DEFAULT_SETTINGS };
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch (error) {
    console.error('載入設定失敗:', error);
    return { ...DEFAULT_SETTINGS };
  }
};

// 儲存設定:呼叫端負責把要儲存的完整 settings 物件組好,
// 這裡只負責序列化與持久化。
export const saveSettings = async (settings, adapter = asyncStorageAdapter) => {
  try {
    await adapter.set(JSON.stringify(settings));
  } catch (error) {
    console.error('儲存設定失敗:', error);
  }
};
