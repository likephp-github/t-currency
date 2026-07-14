import { flagSource } from '../flagSource';

describe('flagSource', () => {
  it('CUSTOM_FLAG_1 回傳可渲染的圖片 source', () => {
    expect(flagSource('CUSTOM_FLAG_1')).toBeTruthy();
  });

  it('CUSTOM_FLAG_2 回傳可渲染的圖片 source', () => {
    expect(flagSource('CUSTOM_FLAG_2')).toBeTruthy();
  });

  it('兩個哨兵字串對照到不同的圖片', () => {
    expect(flagSource('CUSTOM_FLAG_1')).not.toBe(flagSource('CUSTOM_FLAG_2'));
  });

  it('emoji 旗幟回傳 null', () => {
    expect(flagSource('🇹🇼')).toBeNull();
  });

  it('未設定(undefined)回傳 null', () => {
    expect(flagSource(undefined)).toBeNull();
  });

  it('不是哨兵字串的一般字串回傳 null', () => {
    expect(flagSource('not-a-flag')).toBeNull();
  });
});
