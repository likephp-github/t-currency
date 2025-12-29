import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Image,
  Platform,
  Animated
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { BlurView } from 'expo-blur';
import { useApp } from '../contexts/AppContext';
import ExchangeRateService from '../services/exchangeRateAPI';
import { CURRENCIES, VIRTUAL_CURRENCIES, getVirtualCurrencyName } from '../constants/currencies';

const HomeScreen = ({ navigation }) => {
  const {
    selectedCurrencies,
    exchangeRates,
    loading,
    refreshExchangeRates,
    lastUpdate,
    settings,
    setSelectedCurrencies,
    t
  } = useApp();

  const [amounts, setAmounts] = useState({});
  const [activeInput, setActiveInput] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [inputKey, setInputKey] = useState(0); // 用於強制 TextInput 重新掛載

  // 計算機狀態
  const [calcPrevValue, setCalcPrevValue] = useState(null);
  const [calcOperator, setCalcOperator] = useState(null);
  const [calcNewNumber, setCalcNewNumber] = useState(true);
  const [calcCurrentInput, setCalcCurrentInput] = useState('0'); // 追蹤當前輸入的數字

  // 防止焦點切換循環的標記
  const isProcessingFocus = useRef(false);

  // 初始化金額
  useEffect(() => {
    if (selectedCurrencies.length > 0) {
      const initialAmounts = {};
      selectedCurrencies.forEach(currency => {
        initialAmounts[currency] = ''; // 所有貨幣初始值為空
      });
      setAmounts(initialAmounts);
      setActiveInput(selectedCurrencies[0]); // 設定第一個貨幣為焦點
    }
  }, [selectedCurrencies]);

  // 建立顯示項目陣列（真實貨幣 + 虛擬貨幣）
  const displayItems = useMemo(() => {
    const items = [];

    selectedCurrencies.forEach((currencyCode) => {
      // 加入真實貨幣
      items.push({
        type: 'REAL',
        code: currencyCode
      });

      // TWD 後面插入虛擬貨幣（不計入 6 個貨幣限制）
      if (currencyCode === 'TWD') {
        if (settings.chickenCutletRate) {
          items.push({
            type: 'VIRTUAL',
            code: 'CHICKEN',
            data: VIRTUAL_CURRENCIES.CHICKEN_CUTLET
          });
        }
        if (settings.bubbleTeaRate) {
          items.push({
            type: 'VIRTUAL',
            code: 'BUBBLE',
            data: VIRTUAL_CURRENCIES.BUBBLE_TEA
          });
        }
      }
    });

    return items;
  }, [selectedCurrencies, settings.chickenCutletRate, settings.bubbleTeaRate]);

  // 處理輸入框獲得焦點（切換輸入框）
  const handleInputFocus = (currency) => {
    // 防止重複觸發（Android 無限循環問題）
    if (isProcessingFocus.current) {
      return;
    }

    // 如果切換到不同的輸入框，清空所有值
    if (activeInput !== currency) {
      isProcessingFocus.current = true;

      // 清空所有貨幣金額
      const clearedAmounts = {};
      selectedCurrencies.forEach(c => {
        clearedAmounts[c] = '';
      });
      setAmounts(clearedAmounts);
      setActiveInput(currency);
      setInputKey(prev => prev + 1); // 強制 TextInput 重新掛載（iOS 值清除問題）

      // 重置計算機狀態（關鍵！防止舊值被保留）
      setCalcCurrentInput('0');
      setCalcNewNumber(true);
      setCalcPrevValue(null);
      setCalcOperator(null);

      // 重置處理標記
      setTimeout(() => {
        isProcessingFocus.current = false;
      }, 100);
    }
  };

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
    const currency = CURRENCIES.find(c => c.code === code) || {
      code,
      name: code,
      symbol: '',
      flag: ''
    };

    // 如果是台幣且有自訂國旗，使用自訂國旗
    if (code === 'TWD' && settings.customNTDFlag) {
      return { ...currency, flag: settings.customNTDFlag };
    }

    return currency;
  };

  // 格式化更新時間
  const formatUpdateTime = () => {
    if (!lastUpdate) return '';
    const now = new Date();
    const diff = Math.floor((now - lastUpdate) / 1000 / 60);

    if (diff < 1) return t('justUpdated');
    if (diff < 60) return `${diff}${t('updatedMinutesAgo')}`;

    const hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const timeStr = `${hours}:${minutes}`;
    return t('updatedToday', { time: timeStr });
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
        <Text style={styles.deleteButtonText}>{t('delete')}</Text>
      </View>
    );
  };

  // 渲染右滑按鈕（切換）
  const renderRightActions = (currencyCode) => {
    if (currencyCode === 'TWD') {
      return null;
    }
    
    return (
      <View style={styles.replaceButton}>
        <Text style={styles.replaceButtonText}>{t('replace')}</Text>
      </View>
    );
  };

  // 渲染虛擬貨幣行
  const renderVirtualCurrencyItem = (item) => {
    const { data } = item;
    const virtualCode = item.code;

    // 計算虛擬貨幣數量
    const calculateVirtualAmount = () => {
      if (!amounts['TWD']) return '0.00';

      const twdAmount = parseFloat(amounts['TWD']) || 0;
      if (twdAmount === 0) return '0.00';

      const quantity = twdAmount / data.price;
      return quantity.toFixed(settings.decimalPlaces);
    };

    const virtualAmount = calculateVirtualAmount();
    const virtualName = getVirtualCurrencyName(data, settings.language);

    return (
      <View
        key={virtualCode}
        style={[
          styles.currencyRow,
          styles.virtualCurrencyRow
        ]}
      >
        <View style={styles.currencyInfo}>
          <Text style={styles.currencyFlag}>{data.flag}</Text>
          <View style={styles.currencyDetails}>
            <Text style={styles.currencyCode}>
              {virtualName}
              {settings.showSymbol && (
                <Text style={styles.currencyName}>&nbsp;{data.symbol}</Text>
              )}
            </Text>
          </View>
        </View>

        <View style={styles.virtualAmountContainer}>
          <Text style={styles.virtualAmountText}>
            {virtualAmount}
          </Text>
        </View>
      </View>
    );
  };

  // 渲染每個貨幣項目
  const renderCurrencyItem = (item) => {
    // 如果是虛擬貨幣，使用專用渲染函數
    if (item.type === 'VIRTUAL') {
      return renderVirtualCurrencyItem(item);
    }

    // 以下是原有的真實貨幣渲染邏輯
    const currencyCode = item.code;
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
              {currency.flag === 'CUSTOM_FLAG_1' ? (
                <Image 
                  source={require('../../assets/custom-flag.jpg')} 
                  style={[styles.currencyFlagImage, { width: 32, height: 32, borderRadius: 16, marginRight: 16 }]} 
                />
              ) : currency.flag === 'CUSTOM_FLAG_2' ? (
                <Image 
                  source={require('../../assets/formosa-flag.png')} 
                  style={[styles.currencyFlagImage, { width: 32, height: 32, borderRadius: 16, marginRight: 16 }]} 
                />
              ) : (
                <Text style={styles.currencyFlag}>{currency.flag}</Text>
              )}
              <View style={styles.currencyDetails}>
                <Text style={styles.currencyCode}>
                  {currency.code}
                  {settings.showSymbol && (
                    <Text style={styles.currencyName}>&nbsp;{currency.symbol}</Text>
                  )}
                </Text>
              </View>
            </View>

            <TextInput
              key={`${currencyCode}-${inputKey}`}
              style={[
                styles.amountInput,
                isActive && styles.amountInputActive
              ]}
              showSoftInputOnFocus={false}
              value={amounts[currencyCode]?.toString() || ''}
              onFocus={() => handleInputFocus(currencyCode)}
              onChangeText={(value) => handleAmountChange(currencyCode, value)}
              keyboardType="decimal-pad"
              placeholder="0"
              placeholderTextColor="#999"
            />
          </View>
        </Swipeable>
    );
  };

  // 計算機 - 數字按鈕
  const handleNumberPress = (num) => {
    if (!activeInput) return;

    // 建立當前輸入的數字
    let newCurrentInput;
    if (calcNewNumber) {
      newCurrentInput = num;
      setCalcNewNumber(false);
    } else {
      newCurrentInput = calcCurrentInput === '0' ? num : calcCurrentInput + num;
    }

    // 儲存當前輸入
    setCalcCurrentInput(newCurrentInput);

    // 如果有待處理的運算，立即計算並顯示結果
    let displayValue = newCurrentInput;
    if (calcPrevValue !== null && calcOperator) {
      const result = performCalculation(calcPrevValue, parseFloat(newCurrentInput), calcOperator);
      displayValue = String(result);
    }

    // 更新顯示值並轉換所有貨幣
    handleAmountChange(activeInput, displayValue);
  };

  // 計算機 - 小數點
  const handleDecimal = () => {
    if (!activeInput) return;
    
    let newCurrentInput = calcCurrentInput;
    if (calcNewNumber) {
      newCurrentInput = '0.';
      setCalcNewNumber(false);
    } else if (!newCurrentInput.includes('.')) {
      newCurrentInput += '.';
    } else {
      return;
    }

    setCalcCurrentInput(newCurrentInput);

    let displayValue = newCurrentInput;
    if (calcPrevValue !== null && calcOperator) {
      const result = performCalculation(calcPrevValue, parseFloat(newCurrentInput), calcOperator);
      displayValue = String(result);
    }
    handleAmountChange(activeInput, displayValue);
  };

  // 計算機 - 00按鈕
  const handleDoubleZero = () => {
    if (!activeInput) return;
    
    let newCurrentInput;
    if (calcNewNumber) {
      newCurrentInput = '0';
      setCalcNewNumber(false);
    } else {
      newCurrentInput = calcCurrentInput === '0' ? '0' : calcCurrentInput + '00';
    }

    setCalcCurrentInput(newCurrentInput);

    let displayValue = newCurrentInput;
    if (calcPrevValue !== null && calcOperator) {
      const result = performCalculation(calcPrevValue, parseFloat(newCurrentInput), calcOperator);
      displayValue = String(result);
    }
    handleAmountChange(activeInput, displayValue);
  };

  // 計算機 - 百分比
  const handlePercent = () => {
    if (!activeInput) return;
    
    const currentValue = parseFloat(calcCurrentInput) || 0;
    const percentValue = currentValue / 100;
    const strValue = String(percentValue);
    
    setCalcCurrentInput(strValue);
    setCalcNewNumber(true); // 完成一次轉換後，下次輸入視為新數字

    let displayValue = strValue;
    if (calcPrevValue !== null && calcOperator) {
       // 如果是在運算中按下%，通常是針對當前輸入取百分比，然後再參與運算
       // 例如 100 + 10 % -> 100 + 0.1 -> 100.1 (有些計算機邏輯不同，這裡是簡單除以100)
       const result = performCalculation(calcPrevValue, percentValue, calcOperator);
       displayValue = String(result);
    }
    handleAmountChange(activeInput, displayValue);
  };

  // 計算機 - 等號 (結束運算)
  const handleEqual = () => {
    if (!activeInput) return;
    
    // 這裡不做額外運算，因為輸入時已經即時運算了
    // 主要是清除運算符狀態，讓下次輸入變成全新的開始，但保留當前值
    setCalcPrevValue(null);
    setCalcOperator(null);
    setCalcNewNumber(true);
    setCalcCurrentInput('0');
  };

  // 計算機 - 運算符按鈕
  const handleOperatorPress = (operator) => {
    if (!activeInput) return;

    const currentValue = parseFloat(calcCurrentInput) || 0;

    // 如果已有待處理的運算，先計算出結果
    if (calcPrevValue !== null && calcOperator) {
      const result = performCalculation(calcPrevValue, currentValue, calcOperator);
      setCalcPrevValue(result);
      handleAmountChange(activeInput, String(result));
    } else {
      // 第一次按運算符，儲存當前值
      setCalcPrevValue(currentValue);
    }

    setCalcOperator(operator);
    setCalcNewNumber(true);
    setCalcCurrentInput('0'); // 重置當前輸入
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

    // 刪除最後一個字元
    let newCurrentInput;
    if (calcCurrentInput.length > 1) {
      newCurrentInput = calcCurrentInput.slice(0, -1);
    } else {
      newCurrentInput = '0';
    }

    // 儲存新的輸入
    setCalcCurrentInput(newCurrentInput);

    // 如果有待處理的運算，立即重新計算結果
    let displayValue = newCurrentInput;
    if (calcPrevValue !== null && calcOperator) {
      const result = performCalculation(calcPrevValue, parseFloat(newCurrentInput), calcOperator);
      displayValue = String(result);
    }

    handleAmountChange(activeInput, displayValue);
  };

  // 計算機 - 清除按鈕
  const handleClear = () => {
    if (!activeInput) return;

    handleAmountChange(activeInput, '0');
    setCalcPrevValue(null);
    setCalcOperator(null);
    setCalcNewNumber(true);
    setCalcCurrentInput('0');
  };

  if (loading && !exchangeRates) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>{t('loading')}</Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.container}>
        {/* 標題列 */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>極台匯率</Text>
          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => navigation.navigate('Settings')}
          >
            <Text style={styles.menuIcon}>⋯</Text>
          </TouchableOpacity>
        </View>

        {/* 更新時間與新增貨幣按鈕 */}
        <View style={styles.updateInfo}>
          {settings.showExchangeSource ? (
            <Text style={styles.updateText}>🔄 {formatUpdateTime()}</Text>
          ) : <View />}
          
          {selectedCurrencies.length < 6 && (
            <TouchableOpacity
              onPress={() => navigation.navigate('CurrencySelection')}
            >
              <Text style={styles.headerAddButtonText}>{t('addCurrency')}</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* 貨幣列表容器 */}
        <ScrollView
          style={styles.currencyList}
          contentContainerStyle={styles.currencyListContent}
          scrollEnabled={true}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {displayItems.map((item) => {
            const uniqueKey = `${item.type}-${item.code}`;
            return <React.Fragment key={uniqueKey}>{renderCurrencyItem(item)}</React.Fragment>;
          })}
        </ScrollView>

      {/* 計算機 - 浮動在底部 - 5x4 佈局 */}
      <BlurView intensity={Platform.OS === 'android' ? 100 : 80} tint="dark" style={styles.calculator}>
        {/* Android 專用不透明背景 */}
        {Platform.OS === 'android' && (
          <View style={styles.calcAndroidBackground} />
        )}
        {/* 按鈕區域 */}
        <View style={styles.calcButtons}>
          {/* 第一行：C 0 00 + × */}
          <View style={styles.calcRow}>
            <TouchableOpacity style={[styles.calcButton, styles.calcClearButton]} onPress={handleClear}>
              <Text style={[styles.calcButtonText, styles.calcClearText]}>C</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.calcButton} onPress={() => handleNumberPress('0')}>
              <Text style={styles.calcButtonText}>0</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.calcButton} onPress={handleDoubleZero}>
              <Text style={styles.calcButtonText}>00</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.calcButton, styles.calcOperatorButton, calcOperator === '+' && styles.calcButtonActive]}
              onPress={() => handleOperatorPress('+')}
            >
              <Text style={[styles.calcButtonText, styles.calcOperatorText, calcOperator === '+' && styles.calcButtonTextActive]}>+</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.calcButton, styles.calcOperatorButton, calcOperator === 'x' && styles.calcButtonActive]}
              onPress={() => handleOperatorPress('x')}
            >
              <Text style={[styles.calcButtonText, styles.calcOperatorText, calcOperator === 'x' && styles.calcButtonTextActive]}>×</Text>
            </TouchableOpacity>
          </View>

          {/* 第二行：7 8 9 − ÷ */}
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
              style={[styles.calcButton, styles.calcOperatorButton, calcOperator === '-' && styles.calcButtonActive]}
              onPress={() => handleOperatorPress('-')}
            >
              <Text style={[styles.calcButtonText, styles.calcOperatorText, calcOperator === '-' && styles.calcButtonTextActive]}>−</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.calcButton, styles.calcOperatorButton, calcOperator === '/' && styles.calcButtonActive]}
              onPress={() => handleOperatorPress('/')}
            >
              <Text style={[styles.calcButtonText, styles.calcOperatorText, calcOperator === '/' && styles.calcButtonTextActive]}>÷</Text>
            </TouchableOpacity>
          </View>

          {/* 第三行：4 5 6 ⌫ % */}
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
            <TouchableOpacity style={[styles.calcButton, styles.calcBackspaceButton]} onPress={handleBackspace}>
              <Text style={[styles.calcButtonText, styles.calcBackspaceText]}>⌫</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.calcButton} onPress={handlePercent}>
              <Text style={styles.calcButtonText}>%</Text>
            </TouchableOpacity>
          </View>

          {/* 第四行：1 2 3 . = */}
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
            <TouchableOpacity style={styles.calcButton} onPress={handleDecimal}>
              <Text style={styles.calcButtonText}>.</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.calcButton, styles.calcEqualButton]}
              onPress={handleEqual}
            >
              <Text style={[styles.calcButtonText, styles.calcEqualText]}>=</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 匯率來源 */}
        {settings.showExchangeSource && (
          <View style={styles.sourceInfo}>
            <Text style={styles.sourceText}>
              {settings.exchangeSource === 'SIMPLE' ? t('exchangeSourceSimple') : t('exchangeSourceMedium')}
            </Text>
          </View>
        )}
      </BlurView>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0'
  },
  updateText: {
    fontSize: 14,
    color: '#666'
  },
  headerAddButtonText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600'
  },
  currencyList: {
    flex: 1,
    backgroundColor: '#FFFFFF'
  },
  currencyListContent: {
    paddingBottom: 360
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
  calculator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 12,
    paddingVertical: 10,
    paddingBottom: 24,
    overflow: 'hidden'
  },
  calcAndroidBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.85)', // 不透明黑色背景
    zIndex: -1
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
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 46,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)'
  },
  calcButtonText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF'
  },
  calcOperatorButton: {
    backgroundColor: 'rgba(0, 122, 255, 0.3)',
    borderColor: 'rgba(0, 122, 255, 0.4)'
  },
  calcOperatorText: {
    color: '#FFFFFF'
  },
  calcButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF'
  },
  calcButtonTextActive: {
    color: '#FFFFFF'
  },
  calcClearButton: {
    backgroundColor: 'rgba(255, 59, 48, 0.3)',
    borderColor: 'rgba(255, 59, 48, 0.4)'
  },
  calcClearText: {
    color: '#FFFFFF'
  },
  calcBackspaceButton: {
    backgroundColor: 'rgba(255, 149, 0, 0.3)',
    borderColor: 'rgba(255, 149, 0, 0.4)'
  },
  calcBackspaceText: {
    color: '#FFFFFF',
    fontSize: 22
  },
  calcEqualButton: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF'
  },
  calcEqualText: {
    color: '#FFFFFF'
  },
  sourceInfo: {
    paddingVertical: 6,
    paddingHorizontal: 20,
    backgroundColor: 'transparent',
    alignItems: 'center',
    marginTop: 4
  },
  sourceText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)'
  },
  virtualCurrencyRow: {
    backgroundColor: '#FFFBF0', // 淡黃色背景
    borderLeftWidth: 3,
    borderLeftColor: '#FFD700' // 金色左邊框
  },
  virtualCurrencyPrice: {
    fontSize: 12,
    color: '#999',
    marginTop: 2
  },
  virtualAmountContainer: {
    backgroundColor: '#FFF8E1',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'flex-end'
  },
  virtualAmountText: {
    fontSize: 20,
    fontWeight: '500',
    color: '#F57C00', // 橘色文字
    textAlign: 'right'
  }
});

export default HomeScreen;