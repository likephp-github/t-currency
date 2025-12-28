import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  SafeAreaView
} from 'react-native';
import { useApp } from '../contexts/AppContext';

const SettingsScreen = ({ navigation }) => {
  const { settings, saveSettings, lastUpdate } = useApp();

  const handleToggle = (key) => {
    saveSettings({ [key]: !settings[key] });
  };

  const handleSourceChange = () => {
    const newSource = settings.exchangeSource === 'SIMPLE' ? 'MEDIUM' : 'SIMPLE';
    saveSettings({ exchangeSource: newSource });
  };

  const formatUpdateTime = () => {
    if (!lastUpdate) return '未更新';
    const hours = lastUpdate.getHours();
    const minutes = lastUpdate.getMinutes();
    return `今天${hours}:${minutes.toString().padStart(2, '0')}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 標題列 */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backIcon}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>換算設置</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        {/* 更新資訊 */}
        <View style={styles.updateSection}>
          <Text style={styles.updateIcon}>🔄</Text>
          <Text style={styles.updateText}>上次更新 {formatUpdateTime()}</Text>
        </View>

        {/* 設定項目 */}
        <View style={styles.section}>
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>當地貨幣</Text>
            <Switch
              value={settings.showLocalCurrency}
              onValueChange={() => handleToggle('showLocalCurrency')}
              trackColor={{ false: '#D1D1D6', true: '#34C759' }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>貨幣符號</Text>
            <Switch
              value={settings.showSymbol}
              onValueChange={() => handleToggle('showSymbol')}
              trackColor={{ false: '#D1D1D6', true: '#34C759' }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>顯示換算匯率源</Text>
            <Switch
              value={settings.showExchangeSource}
              onValueChange={() => handleToggle('showExchangeSource')}
              trackColor={{ false: '#D1D1D6', true: '#34C759' }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* 換算匯率源 */}
        <TouchableOpacity
          style={styles.sourceItem}
          onPress={handleSourceChange}
        >
          <Text style={styles.settingLabel}>換算匯率源</Text>
          <View style={styles.sourceValue}>
            <Text style={styles.sourceText}>
              「{settings.exchangeSource === 'SIMPLE' ? '極簡匯率' : '中間價'}」
            </Text>
            <Text style={styles.chevron}>›</Text>
          </View>
        </TouchableOpacity>

        {/* 貨幣默認值 */}
        <TouchableOpacity style={styles.settingItem}>
          <Text style={styles.settingLabel}>貨幣默認值</Text>
          <View style={styles.valueContainer}>
            <Text style={styles.valueText}>{settings.defaultAmount}</Text>
            <Text style={styles.chevron}>›</Text>
          </View>
        </TouchableOpacity>

        {/* 小數點位數 */}
        <TouchableOpacity style={styles.settingItem}>
          <Text style={styles.settingLabel}>小數點位數</Text>
          <View style={styles.valueContainer}>
            <Text style={styles.valueText}>{settings.decimalPlaces}</Text>
            <Text style={styles.chevron}>›</Text>
          </View>
        </TouchableOpacity>

        {/* 更多設置 */}
        <TouchableOpacity style={styles.moreSettings}>
          <Text style={styles.settingLabel}>更多設置</Text>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>

        {/* 底部連結 */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>恢復默認幣種列表</Text>
        </View>
      </ScrollView>
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
  backButton: {
    padding: 8
  },
  backIcon: {
    fontSize: 24,
    color: '#000'
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000'
  },
  placeholder: {
    width: 40
  },
  content: {
    flex: 1
  },
  updateSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginTop: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E0E0E0'
  },
  updateIcon: {
    fontSize: 16,
    marginRight: 8
  },
  updateText: {
    fontSize: 16,
    color: '#666'
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginTop: 24,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E0E0E0'
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0'
  },
  settingLabel: {
    fontSize: 16,
    color: '#000'
  },
  sourceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    marginTop: 24,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E0E0E0'
  },
  sourceValue: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  sourceText: {
    fontSize: 16,
    color: '#666',
    marginRight: 8
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  valueText: {
    fontSize: 16,
    color: '#666',
    marginRight: 8
  },
  chevron: {
    fontSize: 20,
    color: '#C7C7CC'
  },
  moreSettings: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    marginTop: 24,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E0E0E0'
  },
  footer: {
    padding: 40,
    alignItems: 'center'
  },
  footerText: {
    fontSize: 16,
    color: '#007AFF'
  }
});

export default SettingsScreen;
