import { useRef } from 'react';

// 計算機引擎 — 從 HomeScreen 抽出的 pure reducer。
// 語意:即時求值 — 輸入第二運算元時邊打邊顯示運算結果,
// 「=」不重算,只清除運算狀態(結果已在畫面上)。
// 既有行為原樣保留:除以零回傳前值、% 為單純除以 100、
// 「00」在新數字狀態下只給 0、「=」後接運算符從 0 開始。

export const initialState = {
  prevValue: null,      // 待運算的前值
  operator: null,       // 待運算的運算符 '+' | '-' | 'x' | '/'
  newNumber: true,      // 下一個數字鍵是否開始新數字
  currentInput: '0',    // 目前輸入中的數字(字串)
  display: null,        // 這次按鍵要顯示的字串;null = 畫面不更新
};

const DIGITS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
const OPERATORS = ['+', '-', 'x', '/'];

const performCalculation = (prev, current, operator) => {
  switch (operator) {
    case '+':
      return prev + current;
    case '-':
      return prev - current;
    case 'x':
      return prev * current;
    case '/':
      return current !== 0 ? prev / current : prev;
    default:
      return current;
  }
};

// 有待處理運算時即時求值,否則直接顯示目前輸入
const liveDisplay = (state, currentInput) => {
  if (state.prevValue !== null && state.operator) {
    return String(performCalculation(state.prevValue, parseFloat(currentInput), state.operator));
  }
  return currentInput;
};

export const reduce = (state, key) => {
  if (DIGITS.includes(key)) {
    const currentInput = state.newNumber
      ? key
      : state.currentInput === '0' ? key : state.currentInput + key;
    return { ...state, newNumber: false, currentInput, display: liveDisplay(state, currentInput) };
  }

  if (key === '00') {
    const currentInput = state.newNumber
      ? '0'
      : state.currentInput === '0' ? '0' : state.currentInput + '00';
    return { ...state, newNumber: false, currentInput, display: liveDisplay(state, currentInput) };
  }

  if (key === '.') {
    if (state.newNumber) {
      return { ...state, newNumber: false, currentInput: '0.', display: liveDisplay(state, '0.') };
    }
    if (!state.currentInput.includes('.')) {
      const currentInput = state.currentInput + '.';
      return { ...state, currentInput, display: liveDisplay(state, currentInput) };
    }
    return { ...state, display: null };
  }

  if (key === '%') {
    const percentValue = (parseFloat(state.currentInput) || 0) / 100;
    const strValue = String(percentValue);
    return { ...state, currentInput: strValue, newNumber: true, display: liveDisplay(state, strValue) };
  }

  if (OPERATORS.includes(key)) {
    const currentValue = parseFloat(state.currentInput) || 0;
    if (state.prevValue !== null && state.operator) {
      const result = performCalculation(state.prevValue, currentValue, state.operator);
      return { prevValue: result, operator: key, newNumber: true, currentInput: '0', display: String(result) };
    }
    return { ...state, prevValue: currentValue, operator: key, newNumber: true, currentInput: '0', display: null };
  }

  if (key === '=') {
    return { ...initialState, display: null };
  }

  if (key === 'back') {
    const currentInput = state.currentInput.length > 1 ? state.currentInput.slice(0, -1) : '0';
    return { ...state, currentInput, display: liveDisplay(state, currentInput) };
  }

  if (key === 'clear') {
    return { ...initialState, display: '0' };
  }

  throw new Error(`useCalculator: 未知按鍵 "${key}"`);
};

// 計算機狀態不參與渲染(結果透過 press 回傳值流向換算),用 ref 即可
export const useCalculator = () => {
  const stateRef = useRef(initialState);

  const press = (key) => {
    const next = reduce(stateRef.current, key);
    stateRef.current = next;
    return next.display;
  };

  const reset = () => {
    stateRef.current = initialState;
  };

  return { press, reset };
};
