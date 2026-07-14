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
    chickenCutletRate: true,
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

describe('HomeScreen 換算引擎接線(useConversions)', () => {
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

  const focusInput = (index) => {
    const input = root.root.findAllByType(TextInput)[index];
    act(() => {
      input.props.onFocus();
    });
  };

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

  it('輸入金額 → 其他貨幣與虛擬貨幣連動更新', () => {
    pressKey('7');
    // USD, TWD 兩個真實貨幣輸入框
    expect(inputValues()).toEqual(['7', '210.00']);
    // 雞排(CHICKEN)行以文字節點顯示,TWD=210 → 210/85 = 2.47
    const chickenText = root.root
      .findAllByType(Text)
      .find((node) => node.props.children === '2.47');
    expect(chickenText).toBeDefined();
  });

  it('切換輸入焦點 → 所有貨幣金額清空', () => {
    pressKey('7');
    expect(inputValues()).toEqual(['7', '210.00']);

    // 切換到第二個輸入框(TWD)
    focusInput(1);

    expect(inputValues()).toEqual(['', '']);
  });
});
