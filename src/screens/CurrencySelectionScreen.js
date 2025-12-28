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

const CurrencySelectionScreen = ({ navigation }) => {
  const { selectedCurrencies, toggleCurrency } = useApp();
  const [searchQuery, setSearchQuery] = useState('');

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
    toggleCurrency(currencyCode);
  };

  const renderCurrencyItem = (currency) => {
    const isSelected = selectedCurrencies.includes(currency.code);
    
    return (
      <TouchableOpacity
        key={currency.code}
        style={styles.currencyItem}
        onPress={() => handleCurrencyPress(currency.code)}
      >
        <View style={styles.currencyLeft}>
          <Text style={styles.currencyFlag}>{currency.flag}</Text>
          <View style={styles.currencyInfo}>
            <Text style={styles.currencyName}>{currency.name}</Text>
            <Text style={styles.currencyCode}>{currency.code}</Text>
          </View>
        </View>
        {isSelected && (
          <Text style={styles.checkmark}>✓</Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 標題列 */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>切換貨幣</Text>
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
          placeholder="貨幣名稱或國家/地區"
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
              <Text style={styles.sectionTitle}>常用</Text>
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
              <Text style={styles.emptyText}>找不到相關貨幣</Text>
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
          已選擇 {selectedCurrencies.length} 種貨幣
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
    paddingVertical: 8
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
