import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { useApp } from '../contexts/AppContext';
import ExchangeRateService from '../services/exchangeRateAPI';
import { CURRENCIES } from '../constants/currencies';

const HomeScreen = ({ navigation }) => {
  const {
    selectedCurrencies,
    exchangeRates,
    loading,
    refreshExchangeRates,
    lastUpdate,
    settings
  } = useApp();

  const [amounts, setAmounts] = useState({});
  const [activeInput, setActiveInput] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // 初始化金額
  useEffect(() => {
    if (selectedCurrencies.length > 0) {
      const initialAmounts = {};
      selectedCurrencies.forEach(currency => {
        initialAmounts[currency] = currency === 'USD' ? settings.defaultAmount : 0;
      });
      setAmounts(initialAmounts);
      setActiveInput('USD');
    }
  }, [selectedCurrencies]);

  // 當某個貨幣金額改變時，重新計算其他貨幣
  const handleAmountChange = (currency, value) => {
    if (!exchangeRates) return;

    const numValue = parseFloat(value) || 0;
    setActiveInput(currency);
    
    const newAmounts = { ...amounts };
    newAmounts[currency] = value;

    // 計算其他貨幣的金額
    selectedCurrencies.forEach(targetCurrency => {
      if (targetCurrency !== currency) {
        const converted = ExchangeRateService.convertCurrency(
          numValue,
          currency,
          targetCurrency,
          exchangeRates
        );
        newAmounts[targetCurrency] = converted.toFixed(settings.decimalPlaces);
      }
    });

    setAmounts(newAmounts);
  };

  // 下拉重新整理
  const onRefresh = async () => {
    setRefreshing(true);
    await refreshExchangeRates();
    setRefreshing(false);
  };

  // 獲取貨幣資訊
  const getCurrencyInfo = (code) => {
    return CURRENCIES.find(c => c.code === code) || {
      code,
      name: code,
      symbol: '',
      flag: ''
    };
  };

  // 格式化更新時間
  const formatUpdateTime = () => {
    if (!lastUpdate) return '';
    const now = new Date();
    const diff = Math.floor((now - lastUpdate) / 1000 / 60);
    
    if (diff < 1) return '剛剛更新';
    if (diff < 60) return `${diff}分鐘前更新`;
    
    const hours = now.getHours();
    const minutes = now.getMinutes();
    return `今天${hours}:${minutes.toString().padStart(2, '0')}更新`;
  };

  if (loading && !exchangeRates) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>載入匯率資料...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 標題列 */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>極簡匯率</Text>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => navigation.navigate('Settings')}
        >
          <Text style={styles.menuIcon}>⋯</Text>
        </TouchableOpacity>
      </View>

      {/* 更新時間 */}
      {settings.showExchangeSource && (
        <View style={styles.updateInfo}>
          <Text style={styles.updateText}>🔄 {formatUpdateTime()}</Text>
        </View>
      )}

      {/* 貨幣列表 */}
      <ScrollView
        style={styles.currencyList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {selectedCurrencies.map((currencyCode, index) => {
          const currency = getCurrencyInfo(currencyCode);
          const isActive = activeInput === currencyCode;

          return (
            <View
              key={currencyCode}
              style={[
                styles.currencyRow,
                isActive && styles.currencyRowActive
              ]}
            >
              <View style={styles.currencyInfo}>
                <Text style={styles.currencyFlag}>{currency.flag}</Text>
                <View style={styles.currencyDetails}>
                  <Text style={styles.currencyCode}>{currency.code}</Text>
                  {settings.showSymbol && (
                    <Text style={styles.currencyName}>
                      {currency.name} {currency.symbol}
                    </Text>
                  )}
                </View>
              </View>

              <TextInput
                style={[
                  styles.amountInput,
                  isActive && styles.amountInputActive
                ]}
                value={amounts[currencyCode]?.toString() || ''}
                onChangeText={(value) => handleAmountChange(currencyCode, value)}
                keyboardType="decimal-pad"
                placeholder="0"
                placeholderTextColor="#999"
                onFocus={() => setActiveInput(currencyCode)}
              />
            </View>
          );
        })}
      </ScrollView>

      {/* 底部按鈕 */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.switchButton}
          onPress={() => navigation.navigate('CurrencySelection')}
        >
          <Text style={styles.switchButtonText}>切換貨幣 ⇄</Text>
        </TouchableOpacity>
      </View>

      {/* 匯率來源 */}
      {settings.showExchangeSource && (
        <View style={styles.sourceInfo}>
          <Text style={styles.sourceText}>
            ∞ 數據來自「{settings.exchangeSource === 'SIMPLE' ? '極簡匯率' : '中間價'}」
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5'
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF'
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000'
  },
  menuButton: {
    padding: 8
  },
  menuIcon: {
    fontSize: 24,
    color: '#000'
  },
  updateInfo: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF'
  },
  updateText: {
    fontSize: 14,
    color: '#666'
  },
  currencyList: {
    flex: 1,
    backgroundColor: '#FFFFFF'
  },
  currencyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0'
  },
  currencyRowActive: {
    backgroundColor: '#F8F8F8'
  },
  currencyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  currencyFlag: {
    fontSize: 32,
    marginRight: 16
  },
  currencyDetails: {
    flex: 1
  },
  currencyCode: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000'
  },
  currencyName: {
    fontSize: 14,
    color: '#666',
    marginTop: 2
  },
  amountInput: {
    fontSize: 20,
    fontWeight: '500',
    color: '#000',
    textAlign: 'right',
    minWidth: 120,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F8F8F8',
    borderRadius: 8
  },
  amountInputActive: {
    backgroundColor: '#E8F4FF',
    borderWidth: 1,
    borderColor: '#007AFF'
  },
  bottomBar: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0'
  },
  switchButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center'
  },
  switchButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF'
  },
  sourceInfo: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0'
  },
  sourceText: {
    fontSize: 12,
    color: '#999'
  }
});

export default HomeScreen;
