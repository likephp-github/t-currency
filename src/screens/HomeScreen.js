import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  ScrollView
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Swipeable from 'react-native-gesture-handler/Swipeable';
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
    settings,
    setSelectedCurrencies
  } = useApp();

  const [amounts, setAmounts] = useState({});
  const [activeInput, setActiveInput] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // 計算機狀態
  const [calcPrevValue, setCalcPrevValue] = useState(null);
  const [calcOperator, setCalcOperator] = useState(null);
  const [calcNewNumber, setCalcNewNumber] = useState(true);

  // 初始化金額
  useEffect(() => {
    if (selectedCurrencies.length > 0) {
      const initialAmounts = {};
      const firstCurrency = selectedCurrencies[0];
      selectedCurrencies.forEach(currency => {
        initialAmounts[currency] = currency === firstCurrency ? settings.defaultAmount : 0;
      });
      setAmounts(initialAmounts);
      setActiveInput(firstCurrency);
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

  // 刪除貨幣
  const deleteCurrency = (currencyCode) => {
    // 台幣不能刪除
    if (currencyCode === 'TWD') {
      return;
    }

    // 至少要保留一個貨幣
    if (selectedCurrencies.length <= 1) {
      return;
    }

    const newCurrencies = selectedCurrencies.filter(c => c !== currencyCode);
    setSelectedCurrencies(newCurrencies);
  };

  // 替換貨幣（導航到選擇頁面）
  const replaceCurrency = (currencyCode) => {
    navigation.navigate('CurrencySelection', { replaceMode: true, replaceCurrency: currencyCode });
  };

  // 渲染左滑按鈕（刪除）
  const renderLeftActions = (currencyCode) => {
    // 台幣不顯示刪除按鈕
    if (currencyCode === 'TWD') {
      return null;
    }

    return (
      <View style={styles.deleteButton}>
        <Text style={styles.deleteButtonText}>刪除</Text>
      </View>
    );
  };

  // 渲染右滑按鈕（切換）
  const renderRightActions = (currencyCode) => {
    return (
      <View style={styles.replaceButton}>
        <Text style={styles.replaceButtonText}>切換</Text>
      </View>
    );
  };

  // 渲染每個貨幣項目
  const renderCurrencyItem = (currencyCode) => {
    const currency = getCurrencyInfo(currencyCode);
    const isActive = activeInput === currencyCode;

    return (
      <Swipeable
        key={currencyCode}
        renderLeftActions={() => renderLeftActions(currencyCode)}
        renderRightActions={() => renderRightActions(currencyCode)}
        overshootLeft={false}
        overshootRight={false}
        friction={2}
        enableTrackpadTwoFingerGesture
        onSwipeableOpen={(direction) => {
          if (direction === 'left') {
            // 左滑 - 刪除
            deleteCurrency(currencyCode);
          } else if (direction === 'right') {
            // 右滑 - 切換
            replaceCurrency(currencyCode);
          }
        }}
      >
        <View
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
        </Swipeable>
    );
  };

  // 計算機 - 數字按鈕
  const handleNumberPress = (num) => {
    if (!activeInput) return;

    const currentValue = amounts[activeInput]?.toString() || '0';

    if (calcNewNumber) {
      handleAmountChange(activeInput, num);
      setCalcNewNumber(false);
    } else {
      const newValue = currentValue === '0' ? num : currentValue + num;
      handleAmountChange(activeInput, newValue);
    }
  };

  // 計算機 - 運算符按鈕
  const handleOperatorPress = (operator) => {
    if (!activeInput) return;

    const currentValue = parseFloat(amounts[activeInput]) || 0;

    if (calcPrevValue === null) {
      setCalcPrevValue(currentValue);
    } else if (calcOperator) {
      const result = performCalculation(calcPrevValue, currentValue, calcOperator);
      handleAmountChange(activeInput, String(result));
      setCalcPrevValue(result);
    }

    setCalcOperator(operator);
    setCalcNewNumber(true);
  };

  // 計算機 - 執行計算
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

  // 計算機 - 倒退按鈕（刪除最後一個字元）
  const handleBackspace = () => {
    if (!activeInput) return;

    const currentValue = amounts[activeInput]?.toString() || '0';

    if (currentValue.length > 1) {
      const newValue = currentValue.slice(0, -1);
      handleAmountChange(activeInput, newValue);
    } else {
      handleAmountChange(activeInput, '0');
    }
  };

  // 計算機 - 清除按鈕
  const handleClear = () => {
    if (!activeInput) return;

    handleAmountChange(activeInput, '0');
    setCalcPrevValue(null);
    setCalcOperator(null);
    setCalcNewNumber(true);
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
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.container}>
        {/* 標題列 */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>tCurrency</Text>
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

        {/* 貨幣列表容器 */}
        <ScrollView
          style={styles.currencyList}
          contentContainerStyle={styles.currencyListContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {selectedCurrencies.map((currencyCode) => renderCurrencyItem(currencyCode))}

          {/* 新增貨幣按鈕 */}
          {selectedCurrencies.length < 6 && (
            <TouchableOpacity
              style={styles.addCurrencyButton}
              onPress={() => navigation.navigate('CurrencySelection')}
            >
              <Text style={styles.addCurrencyIcon}>+</Text>
              <Text style={styles.addCurrencyText}>新增貨幣</Text>
            </TouchableOpacity>
          )}
        </ScrollView>

      {/* 計算機 - 浮動在底部 */}
      <View style={styles.calculator}>
        {/* 按鈕區域 */}
        <View style={styles.calcButtons}>
          {/* 第一行：7 8 9 ÷ */}
          <View style={styles.calcRow}>
            <TouchableOpacity style={styles.calcButton} onPress={() => handleNumberPress('7')}>
              <Text style={styles.calcButtonText}>7</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.calcButton} onPress={() => handleNumberPress('8')}>
              <Text style={styles.calcButtonText}>8</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.calcButton} onPress={() => handleNumberPress('9')}>
              <Text style={styles.calcButtonText}>9</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.calcButton, styles.calcOperatorButton, calcOperator === '/' && styles.calcButtonActive]}
              onPress={() => handleOperatorPress('/')}
            >
              <Text style={[styles.calcButtonText, styles.calcOperatorText, calcOperator === '/' && styles.calcButtonTextActive]}>÷</Text>
            </TouchableOpacity>
          </View>

          {/* 第二行：4 5 6 × */}
          <View style={styles.calcRow}>
            <TouchableOpacity style={styles.calcButton} onPress={() => handleNumberPress('4')}>
              <Text style={styles.calcButtonText}>4</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.calcButton} onPress={() => handleNumberPress('5')}>
              <Text style={styles.calcButtonText}>5</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.calcButton} onPress={() => handleNumberPress('6')}>
              <Text style={styles.calcButtonText}>6</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.calcButton, styles.calcOperatorButton, calcOperator === 'x' && styles.calcButtonActive]}
              onPress={() => handleOperatorPress('x')}
            >
              <Text style={[styles.calcButtonText, styles.calcOperatorText, calcOperator === 'x' && styles.calcButtonTextActive]}>×</Text>
            </TouchableOpacity>
          </View>

          {/* 第三行：1 2 3 - */}
          <View style={styles.calcRow}>
            <TouchableOpacity style={styles.calcButton} onPress={() => handleNumberPress('1')}>
              <Text style={styles.calcButtonText}>1</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.calcButton} onPress={() => handleNumberPress('2')}>
              <Text style={styles.calcButtonText}>2</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.calcButton} onPress={() => handleNumberPress('3')}>
              <Text style={styles.calcButtonText}>3</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.calcButton, styles.calcOperatorButton, calcOperator === '-' && styles.calcButtonActive]}
              onPress={() => handleOperatorPress('-')}
            >
              <Text style={[styles.calcButtonText, styles.calcOperatorText, calcOperator === '-' && styles.calcButtonTextActive]}>−</Text>
            </TouchableOpacity>
          </View>

          {/* 第四行：C 0 ⌫ + */}
          <View style={styles.calcRow}>
            <TouchableOpacity style={[styles.calcButton, styles.calcClearButton]} onPress={handleClear}>
              <Text style={[styles.calcButtonText, styles.calcClearText]}>C</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.calcButton} onPress={() => handleNumberPress('0')}>
              <Text style={styles.calcButtonText}>0</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.calcButton, styles.calcBackspaceButton]} onPress={handleBackspace}>
              <Text style={[styles.calcButtonText, styles.calcBackspaceText]}>⌫</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.calcButton, styles.calcOperatorButton, calcOperator === '+' && styles.calcButtonActive]}
              onPress={() => handleOperatorPress('+')}
            >
              <Text style={[styles.calcButtonText, styles.calcOperatorText, calcOperator === '+' && styles.calcButtonTextActive]}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 匯率來源 */}
        {settings.showExchangeSource && (
          <View style={styles.sourceInfo}>
            <Text style={styles.sourceText}>
              {settings.exchangeSource === 'SIMPLE' ? 'tCurrency' : '中間價'}
            </Text>
          </View>
        )}
      </View>
      </View>
    </GestureHandlerRootView>
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
  currencyListContent: {
    paddingBottom: 20
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
  deleteButton: {
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: '100%'
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16
  },
  replaceButton: {
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: '100%'
  },
  replaceButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16
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
  addCurrencyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
    marginVertical: 16,
    marginHorizontal: 20,
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed'
  },
  addCurrencyIcon: {
    fontSize: 28,
    color: '#007AFF',
    fontWeight: '600',
    marginRight: 8
  },
  addCurrencyText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600'
  },
  calculator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5
  },
  calcButtons: {
    // Container for all calculator button rows
  },
  calcRow: {
    flexDirection: 'row',
    marginBottom: 8
  },
  calcButton: {
    flex: 1,
    backgroundColor: '#F8F8F8',
    paddingVertical: 18,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
    marginHorizontal: 4
  },
  calcButtonText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000'
  },
  calcOperatorButton: {
    backgroundColor: '#E8F4FF'
  },
  calcOperatorText: {
    color: '#007AFF'
  },
  calcButtonActive: {
    backgroundColor: '#007AFF'
  },
  calcButtonTextActive: {
    color: '#FFFFFF'
  },
  calcClearButton: {
    backgroundColor: '#FFE8E8'
  },
  calcClearText: {
    color: '#FF3B30'
  },
  calcBackspaceButton: {
    backgroundColor: '#FFF4E8'
  },
  calcBackspaceText: {
    color: '#FF9500',
    fontSize: 26
  },
  sourceInfo: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    backgroundColor: '#F8F8F8',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    marginTop: 8
  },
  sourceText: {
    fontSize: 12,
    color: '#999'
  }
});

export default HomeScreen;
