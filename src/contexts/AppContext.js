import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ExchangeRateService from '../services/exchangeRateAPI';
import { DEFAULT_SELECTED_CURRENCIES } from '../constants/currencies';

const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  // 狀態管理
  const [selectedCurrencies, setSelectedCurrencies] = useState(DEFAULT_SELECTED_CURRENCIES);
  const [exchangeRates, setExchangeRates] = useState(null);
  const [baseCurrency, setBaseCurrency] = useState('USD');
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);
  
  // 設定項
  const [settings, setSettings] = useState({
    showLocalCurrency: false,
    showSymbol: true,
    showExchangeSource: true,
    exchangeSource: 'SIMPLE',
    defaultAmount: 100,
    decimalPlaces: 2
  });

  // 載入設定
  useEffect(() => {
    loadSettings();
    loadSelectedCurrencies();
    fetchExchangeRates();
  }, []);

  // 載入偏好設定
  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem('app_settings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error('載入設定失敗:', error);
    }
  };

  // 儲存設定
  const saveSettings = async (newSettings) => {
    try {
      const updatedSettings = { ...settings, ...newSettings };
      await AsyncStorage.setItem('app_settings', JSON.stringify(updatedSettings));
      setSettings(updatedSettings);
    } catch (error) {
      console.error('儲存設定失敗:', error);
    }
  };

  // 載入選中的貨幣
  const loadSelectedCurrencies = async () => {
    try {
      const saved = await AsyncStorage.getItem('selected_currencies');
      if (saved) {
        setSelectedCurrencies(JSON.parse(saved));
      }
    } catch (error) {
      console.error('載入貨幣列表失敗:', error);
    }
  };

  // 儲存選中的貨幣
  const saveSelectedCurrencies = async (currencies) => {
    try {
      await AsyncStorage.setItem('selected_currencies', JSON.stringify(currencies));
      setSelectedCurrencies(currencies);
    } catch (error) {
      console.error('儲存貨幣列表失敗:', error);
    }
  };

  // 獲取匯率資料
  const fetchExchangeRates = async (base = 'USD') => {
    try {
      setLoading(true);
      const rates = await ExchangeRateService.getExchangeRates(base);
      setExchangeRates(rates);
      setBaseCurrency(base);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('獲取匯率失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  // 重新整理匯率
  const refreshExchangeRates = async () => {
    ExchangeRateService.clearCache();
    await fetchExchangeRates(baseCurrency);
  };

  // 切換貨幣選擇
  const toggleCurrency = (currencyCode) => {
    let newSelected;
    if (selectedCurrencies.includes(currencyCode)) {
      // 移除（但至少保留一個）
      if (selectedCurrencies.length > 1) {
        newSelected = selectedCurrencies.filter(c => c !== currencyCode);
      } else {
        return; // 不能移除最後一個
      }
    } else {
      // 新增
      newSelected = [...selectedCurrencies, currencyCode];
    }
    saveSelectedCurrencies(newSelected);
  };

  const value = {
    // 狀態
    selectedCurrencies,
    exchangeRates,
    baseCurrency,
    loading,
    lastUpdate,
    settings,
    
    // 方法
    setSelectedCurrencies: saveSelectedCurrencies,
    toggleCurrency,
    fetchExchangeRates,
    refreshExchangeRates,
    saveSettings
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
