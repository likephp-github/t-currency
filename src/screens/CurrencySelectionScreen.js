import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView
} from 'react-native';
import { useApp } from '../contexts/AppContext';
import { CURRENCIES, FAVORITE_CURRENCIES } from '../constants/currencies';
import { canAdd } from '../policies/currencyListPolicy';

const CurrencySelectionScreen = ({ navigation, route }) => {
  const { selectedCurrencies, toggleCurrency, setSelectedCurrencies, t } = useApp();
  const [searchQuery, setSearchQuery] = useState('');

  // 獲取替換模式參數
  const replaceMode = route.params?.replaceMode || false;
  const replaceCurrency = route.params?.replaceCurrency || null;

  // 過濾貨幣
  const filteredCurrencies = useMemo(() => {
    if (!searchQuery) return CURRENCIES;
    
    const query = searchQuery.toLowerCase();
    return CURRENCIES.filter(currency =>
      currency.code.toLowerCase().includes(query) ||
      currency.name.toLowerCase().includes(query) ||
      currency.country.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  // 常用貨幣
  const favoriteCurrenciesList = useMemo(() => {
    return CURRENCIES.filter(c => FAVORITE_CURRENCIES.includes(c.code));
  }, []);

  // 按字母分組
  const groupedCurrencies = useMemo(() => {
    const groups = {};
    filteredCurrencies.forEach(currency => {
      const firstLetter = currency.code[0].toUpperCase();
      if (!groups[firstLetter]) {
        groups[firstLetter] = [];
      }
      groups[firstLetter].push(currency);
    });
    return groups;
  }, [filteredCurrencies]);

  const alphabetIndex = Object.keys(groupedCurrencies).sort();

  const handleCurrencyPress = (currencyCode) => {
    if (replaceMode && replaceCurrency) {
      // 替換模式：用新貨幣替換舊貨幣
      const newCurrencies = selectedCurrencies.map(c =>
        c === replaceCurrency ? currencyCode : c
      );
      setSelectedCurrencies(newCurrencies);
      navigation.goBack();
    } else {
      // 正常模式：切換選擇
      toggleCurrency(currencyCode);
    }
  };

  const renderCurrencyItem = (currency) => {
    const isSelected = selectedCurrencies.includes(currency.code);
    const isCurrent = replaceMode && currency.code === replaceCurrency;

    // 判斷是否應該 disabled
    let isDisabled = false;
    if (replaceMode) {
      // 替換模式：已選擇的貨幣（除了正在替換的）需要 disabled
      isDisabled = isSelected && !isCurrent;
    } else {
      // 正常模式：當已達到上限且該貨幣未被選中時 disabled
      isDisabled = !canAdd(selectedCurrencies) && !isSelected;
    }

    return (
      <TouchableOpacity
        key={currency.code}
        style={[
          styles.currencyItem,
          isCurrent && styles.currentCurrency,
          isDisabled && styles.disabledCurrency
        ]}
        onPress={() => handleCurrencyPress(currency.code)}
        disabled={isDisabled}
      >
        <View style={styles.currencyLeft}>
          <Text style={styles.currencyFlag}>{currency.flag}</Text>
          <View style={styles.currencyInfo}>
            <Text style={styles.currencyName}>{currency.name}</Text>
            <Text style={styles.currencyCode}>{currency.code}</Text>
          </View>
        </View>
        {!replaceMode && isSelected && (
          <Text style={styles.checkmark}>✓</Text>
        )}
        {isCurrent && (
          <Text style={styles.currentLabel}>{t('current')}</Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 標題列 */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {replaceMode 
            ? t('replaceCurrencyTitle', { currency: replaceCurrency }) 
            : t('selectCurrencyTitle')}
        </Text>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.closeIcon}>✕</Text>
        </TouchableOpacity>
      </View>

      {/* 搜尋框 */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder={t('searchCurrencyPlaceholder')}
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <View style={styles.content}>
        <ScrollView style={styles.currencyList}>
          {/* 常用貨幣 */}
          {!searchQuery && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('favorites')}</Text>
              {favoriteCurrenciesList.map(renderCurrencyItem)}
            </View>
          )}

          {/* 所有貨幣（按字母分組）*/}
          {alphabetIndex.map(letter => (
            <View key={letter} style={styles.section}>
              {!searchQuery && (
                <Text style={styles.sectionTitle}>{letter}</Text>
              )}
              {groupedCurrencies[letter].map(renderCurrencyItem)}
            </View>
          ))}

          {filteredCurrencies.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>{t('notFound')}</Text>
            </View>
          )}
        </ScrollView>

        {/* 字母索引 */}
        {!searchQuery && (
          <View style={styles.alphabetIndex}>
            {alphabetIndex.map(letter => (
              <Text key={letter} style={styles.indexLetter}>
                {letter}
              </Text>
            ))}
          </View>
        )}
      </View>

      {/* 已選擇計數 */}
      <View style={styles.footer}>
        <Text style={styles.selectedCount}>
          {t('selectedCount', { count: selectedCurrencies.length })}
          {!canAdd(selectedCurrencies) && t('limitReached')}
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0'
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000'
  },
  closeButton: {
    padding: 8
  },
  closeIcon: {
    fontSize: 24,
    color: '#000'
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0'
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 8
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#000',
    paddingVertical: 8,
    outlineStyle: 'none' // Web fix for outline
  },
  content: {
    flex: 1,
    flexDirection: 'row'
  },
  currencyList: {
    flex: 1,
    backgroundColor: '#FFFFFF'
  },
  section: {
    marginTop: 8
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: '#F5F5F5'
  },
  currencyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0'
  },
  currencyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  currencyFlag: {
    fontSize: 32,
    marginRight: 16
  },
  currencyInfo: {
    flex: 1
  },
  currencyName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000'
  },
  currencyCode: {
    fontSize: 14,
    color: '#666',
    marginTop: 2
  },
  checkmark: {
    fontSize: 24,
    color: '#007AFF',
    fontWeight: 'bold'
  },
  currentCurrency: {
    backgroundColor: '#FFF4E8'
  },
  currentLabel: {
    fontSize: 14,
    color: '#FF9500',
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#FFF4E8',
    borderRadius: 4
  },
  disabledCurrency: {
    opacity: 0.4,
    backgroundColor: '#F5F5F5'
  },
  alphabetIndex: {
    width: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8
  },
  indexLetter: {
    fontSize: 11,
    color: '#007AFF',
    fontWeight: '600',
    paddingVertical: 2
  },
  emptyState: {
    padding: 40,
    alignItems: 'center'
  },
  emptyText: {
    fontSize: 16,
    color: '#999'
  },
  footer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    alignItems: 'center'
  },
  selectedCount: {
    fontSize: 14,
    color: '#666'
  }
});

export default CurrencySelectionScreen;