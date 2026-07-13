import React from 'react';
import { create, act } from 'react-test-renderer';
import { TouchableOpacity, Text, TextInput } from 'react-native';

jest.mock('expo-blur', () => ({
  BlurView: ({ children }) => children ?? null,
}));

jest.mock('react-native-gesture-handler', () => {
  const { View } = require('react-native');
  return { GestureHandlerRootView: View };
});

jest.mock('react-native-gesture-handler/Swipeable', () => {
  const { View } = require('react-native');
  return View;
});

const mockAppValue = {
  selectedCurrencies: ['USD', 'TWD'],
  exchangeRates: {
    base: 'USD',
    rates: { USD: 1, TWD: 30 },
    date: '2026-07-13',
    timestamp: 0,
  },
  loading: false,
  refreshExchangeRates: jest.fn(),
  lastUpdate: null,
  settings: {
    decimalPlaces: 2,
    language: 'zh-TW',
    showExchangeSource: false,
    chickenCutletRate: false,
    bubbleTeaRate: false,
    customNTDFlag: null,
    exchangeSource: 'SIMPLE',
  },
  setSelectedCurrencies: jest.fn(),
  t: (key) => key,
};

jest.mock('../../contexts/AppContext', () => ({
  useApp: () => mockAppValue,
}));

import HomeScreen from '../HomeScreen';

describe('HomeScreen 計算機接線(useCalculator → 換算流程)', () => {
  let root;

  const pressKey = (label) => {
    const button = root.root
      .findAllByType(TouchableOpacity)
      .find((node) =>
        node.findAllByType(Text).some((text) => text.props.children === label)
      );
    expect(button).toBeDefined();
    act(() => {
      button.props.onPress();
    });
  };

  const inputValues = () =>
    root.root.findAllByType(TextInput).map((node) => node.props.value);

  beforeEach(() => {
    act(() => {
      root = create(<HomeScreen navigation={{ navigate: jest.fn() }} />);
    });
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
  });

  it('按 7 → USD 顯示 7,TWD 換算為 210.00', () => {
    pressKey('7');
    expect(inputValues()).toEqual(['7', '210.00']);
  });

  it('即時求值:7 + 3 在按下 3 時顯示 10,TWD 換算 300.00', () => {
    pressKey('7');
    pressKey('+');
    pressKey('3');
    expect(inputValues()).toEqual(['10', '300.00']);
  });

  it('= 之後輸入開始新計算', () => {
    pressKey('7');
    pressKey('+');
    pressKey('3');
    pressKey('=');
    pressKey('5');
    expect(inputValues()).toEqual(['5', '150.00']);
  });

  it('C 清除:畫面歸 0', () => {
    pressKey('7');
    pressKey('C');
    expect(inputValues()).toEqual(['0', '0.00']);
  });

  it('千分位顯示:輸入 1000000 顯示 1,000,000', () => {
    ['1', '0', '0', '0', '0', '0', '0'].forEach(pressKey);
    expect(inputValues()[0]).toBe('1,000,000');
    expect(inputValues()[1]).toBe('30,000,000.00');
  });
});
