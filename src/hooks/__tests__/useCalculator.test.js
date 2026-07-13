import { reduce, initialState } from '../useCalculator';

// 依序按鍵,回傳最終狀態
const pressAll = (keys, from = initialState) =>
  keys.reduce((state, key) => reduce(state, key), from);

describe('calculator reducer — 鎖定 HomeScreen 原有計算機語意', () => {
  describe('數字輸入', () => {
    it('輸入單一數字即顯示', () => {
      expect(pressAll(['7']).display).toBe('7');
    });

    it('連續輸入組成多位數', () => {
      expect(pressAll(['1', '0', '0']).display).toBe('100');
    });

    it('前導 0 被取代', () => {
      expect(pressAll(['0', '7']).display).toBe('7');
    });

    it('不改變原 state(immutable)', () => {
      const before = { ...initialState };
      reduce(initialState, '7');
      expect(initialState).toEqual(before);
    });
  });

  describe('00 按鈕', () => {
    it('新數字狀態下只給 0(原有怪癖)', () => {
      expect(pressAll(['00']).display).toBe('0');
    });

    it('接在數字後補兩個零', () => {
      expect(pressAll(['5', '00']).display).toBe('500');
    });

    it('目前是 0 時維持 0', () => {
      expect(pressAll(['0', '00']).display).toBe('0');
    });
  });

  describe('小數點', () => {
    it('新數字狀態下給 0.', () => {
      expect(pressAll(['.']).display).toBe('0.');
    });

    it('接在數字後', () => {
      expect(pressAll(['5', '.', '5']).display).toBe('5.5');
    });

    it('已有小數點時不重複、不更新畫面', () => {
      const state = pressAll(['5', '.']);
      const next = reduce(state, '.');
      expect(next.display).toBeNull();
      expect(next.currentInput).toBe('5.');
    });
  });

  describe('即時求值(輸入第二運算元時邊打邊算)', () => {
    it('100 + 5 在按下 5 時即顯示 105', () => {
      expect(pressAll(['1', '0', '0', '+', '5']).display).toBe('105');
    });

    it('第一次按運算符不更新畫面', () => {
      expect(pressAll(['1', '0', '0', '+']).display).toBeNull();
    });

    it('運算中輸入小數點沿用前值結果', () => {
      // parseFloat('0.') = 0 → 10 + 0 = 10
      expect(pressAll(['1', '0', '+', '.']).display).toBe('10');
    });
  });

  describe('四則運算', () => {
    it('減法:9 - 4 = 5', () => {
      expect(pressAll(['9', '-', '4']).display).toBe('5');
    });

    it('乘法:6 x 7 = 42', () => {
      expect(pressAll(['6', 'x', '7']).display).toBe('42');
    });

    it('除法:8 / 2 = 4', () => {
      expect(pressAll(['8', '/', '2']).display).toBe('4');
    });

    it('除以零回傳前值(原有怪癖)', () => {
      expect(pressAll(['8', '/', '0']).display).toBe('8');
    });

    it('連續運算:100 + 5 + 再輸入 5 → 110', () => {
      const state = pressAll(['1', '0', '0', '+', '5', '+']);
      expect(state.display).toBe('105'); // 按第二個 + 時先結算
      expect(reduce(state, '5').display).toBe('110');
    });
  });

  describe('百分比(單純除以 100,原有語意)', () => {
    it('50 % → 0.5', () => {
      expect(pressAll(['5', '0', '%']).display).toBe('0.5');
    });

    it('運算中:100 + 10 % → 100.1(10% 變 0.1 再參與運算)', () => {
      expect(pressAll(['1', '0', '0', '+', '1', '0', '%']).display).toBe('100.1');
    });

    it('% 後視為新數字,再輸入數字直接取代', () => {
      expect(pressAll(['5', '0', '%', '7']).display).toBe('7');
    });
  });

  describe('等號(即時求值下 = 只清狀態,不重算)', () => {
    it('不更新畫面', () => {
      expect(pressAll(['1', '0', '0', '+', '5', '=']).display).toBeNull();
    });

    it('清除運算狀態', () => {
      const state = pressAll(['1', '0', '0', '+', '5', '=']);
      expect(state.prevValue).toBeNull();
      expect(state.operator).toBeNull();
      expect(state.newNumber).toBe(true);
      expect(state.currentInput).toBe('0');
    });

    it('= 後接運算符從 0 開始,不接續結果(原有怪癖)', () => {
      // 100 + 5 = 之後按 + 5 → 0 + 5 = 5,而非 105 + 5
      expect(pressAll(['1', '0', '0', '+', '5', '=', '+', '5']).display).toBe('5');
    });
  });

  describe('倒退鍵', () => {
    it('刪除最後一個字元', () => {
      expect(pressAll(['1', '2', '3', 'back']).display).toBe('12');
    });

    it('只剩一位時歸 0', () => {
      expect(pressAll(['5', 'back']).display).toBe('0');
    });

    it('運算中倒退即時重算:100 + 5 倒退 → 100 + 0 = 100', () => {
      expect(pressAll(['1', '0', '0', '+', '5', 'back']).display).toBe('100');
    });
  });

  describe('清除鍵', () => {
    it('畫面歸 0', () => {
      expect(pressAll(['1', '+', '2', 'clear']).display).toBe('0');
    });

    it('清除後輸入為全新開始,無殘留運算', () => {
      expect(pressAll(['1', '+', '2', 'clear', '3']).display).toBe('3');
    });
  });

  describe('未知按鍵', () => {
    it('快速失敗並提供描述性訊息', () => {
      expect(() => reduce(initialState, 'oops')).toThrow(/oops/);
    });
  });
});
