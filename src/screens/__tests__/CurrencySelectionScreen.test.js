import React from 'react';
import { create, act } from 'react-test-renderer';
import { Text, TextInput } from 'react-native';

const mockAppValue = {
  selectedCurrencies: ['TWD'],
  toggleCurrency: jest.fn(),
  setSelectedCurrencies: jest.fn(),
  settings: { language: 'en' },
  t: (key) => key,
};

jest.mock('../../contexts/AppContext', () => ({
  useApp: () => mockAppValue,
}));

import CurrencySelectionScreen from '../CurrencySelectionScreen';

describe('CurrencySelectionScreen — 貨幣名稱依語言顯示', () => {
  let root;

  const allTexts = () =>
    root.root.findAllByType(Text).map((node) =>
      Array.isArray(node.props.children) ? node.props.children.join('') : node.props.children
    );

  beforeEach(() => {
    act(() => {
      root = create(
        <CurrencySelectionScreen navigation={{ goBack: jest.fn() }} route={{ params: {} }} />
      );
    });
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
  });

  it('app 語言為 en 時,貨幣名稱顯示英文', () => {
    expect(allTexts()).toContain('US Dollar');
    expect(allTexts()).not.toContain('美元');
  });

  it('搜尋可以用目前顯示語言的名稱找到貨幣', () => {
    const searchInput = root.root.findByType(TextInput);
    act(() => {
      searchInput.props.onChangeText('Dollar');
    });
    expect(allTexts()).toContain('US Dollar');
    expect(allTexts()).not.toContain('Euro');
  });

  it('搜尋可以用貨幣代碼找到貨幣', () => {
    const searchInput = root.root.findByType(TextInput);
    act(() => {
      searchInput.props.onChangeText('jpy');
    });
    expect(allTexts()).toContain('Japanese Yen');
  });
});
