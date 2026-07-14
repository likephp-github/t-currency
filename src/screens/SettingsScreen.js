import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  SafeAreaView,
  Modal,
  TouchableWithoutFeedback
} from 'react-native';
import { useApp } from '../contexts/AppContext';
import { formatUpdateTime } from '../utils/formatting';

const SettingsScreen = ({ navigation }) => {
  const { settings, saveSettings, lastUpdate, t } = useApp();
  const [isLanguageModalVisible, setLanguageModalVisible] = useState(false);
  const [isDecimalModalVisible, setDecimalModalVisible] = useState(false);

  const handleToggle = (key) => {
    saveSettings({ [key]: !settings[key] });
  };
  
  const handleLanguagePress = () => {
    setLanguageModalVisible(true);
  };

  const selectLanguage = (lang) => {
    saveSettings({ language: lang });
    setLanguageModalVisible(false);
  };
  
  const handleDecimalPress = () => {
    setDecimalModalVisible(true);
  };

  const selectDecimal = (places) => {
    saveSettings({ decimalPlaces: places });
    setDecimalModalVisible(false);
  };

  const renderLanguageModal = () => (
    <Modal
      visible={isLanguageModalVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setLanguageModalVisible(false)}
    >
      <TouchableWithoutFeedback onPress={() => setLanguageModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('selectLanguageTitle')}</Text>
            
            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => selectLanguage('zh-TW')}
            >
              <Text style={[
                styles.modalOptionText,
                settings.language === 'zh-TW' && styles.selectedOptionText
              ]}>中文(zh-TW)</Text>
              {settings.language === 'zh-TW' && <Text style={styles.checkmark}>✓</Text>}
            </TouchableOpacity>

            <View style={styles.separator} />

            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => selectLanguage('en')}
            >
              <Text style={[
                styles.modalOptionText,
                settings.language === 'en' && styles.selectedOptionText
              ]}>English(en)</Text>
              {settings.language === 'en' && <Text style={styles.checkmark}>✓</Text>}
            </TouchableOpacity>

            <View style={styles.separator} />

            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => selectLanguage('ja')}
            >
              <Text style={[
                styles.modalOptionText,
                settings.language === 'ja' && styles.selectedOptionText
              ]}>日本語(ja)</Text>
              {settings.language === 'ja' && <Text style={styles.checkmark}>✓</Text>}
            </TouchableOpacity>

            <View style={styles.separator} />

            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => selectLanguage('ko')}
            >
              <Text style={[
                styles.modalOptionText,
                settings.language === 'ko' && styles.selectedOptionText
              ]}>한국어(ko)</Text>
              {settings.language === 'ko' && <Text style={styles.checkmark}>✓</Text>}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setLanguageModalVisible(false)}
            >
              <Text style={styles.cancelButtonText}>{t('cancel')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );

  const renderDecimalModal = () => (
    <Modal
      visible={isDecimalModalVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setDecimalModalVisible(false)}
    >
      <TouchableWithoutFeedback onPress={() => setDecimalModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('decimalPlaces')}</Text>
            
            {[0, 1, 2, 3, 4, 5].map((num, index) => (
              <React.Fragment key={num}>
                {index > 0 && <View style={styles.separator} />}
                <TouchableOpacity
                  style={styles.modalOption}
                  onPress={() => selectDecimal(num)}
                >
                  <Text style={[
                    styles.modalOptionText,
                    settings.decimalPlaces === num && styles.selectedOptionText
                  ]}>{num}</Text>
                  {settings.decimalPlaces === num && <Text style={styles.checkmark}>✓</Text>}
                </TouchableOpacity>
              </React.Fragment>
            ))}

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setDecimalModalVisible(false)}
            >
              <Text style={styles.cancelButtonText}>{t('cancel')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      {renderLanguageModal()}
      {renderDecimalModal()}
      {/* 標題列 */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backIcon}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('settingsTitle')}</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        {/* 更新資訊 */}
        <View style={styles.updateSection}>
          <Text style={styles.updateIcon}>🔄</Text>
          <Text style={styles.updateText}>{t('lastUpdate')} {formatUpdateTime(lastUpdate, t)}</Text>
        </View>

        {/* 設定項目 */}
        <View style={styles.section}>
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>{t('showSymbol')}</Text>
            <Switch
              value={settings.showSymbol}
              onValueChange={() => handleToggle('showSymbol')}
              trackColor={{ false: '#D1D1D6', true: '#34C759' }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>
        
        {/* 語言設置 */}
        <TouchableOpacity
          style={styles.sourceItem}
          onPress={handleLanguagePress}
        >
          <Text style={styles.settingLabel}>{t('language')}</Text>
          <View style={styles.sourceValue}>
            <Text style={styles.sourceText}>
              {settings.language === 'zh-TW' ? '中文(zh-TW)' : 
               settings.language === 'ja' ? '日本語(ja)' : 
               settings.language === 'ko' ? '한국어(ko)' : 
               'English(en)'}
            </Text>
            <Text style={styles.chevron}>›</Text>
          </View>
        </TouchableOpacity>

        {/* 小數點位數 */}
        <TouchableOpacity
          style={styles.settingItem}
          onPress={handleDecimalPress}
        >
          <Text style={styles.settingLabel}>{t('decimalPlaces')}</Text>
          <View style={styles.valueContainer}>
            <Text style={styles.valueText}>{settings.decimalPlaces}</Text>
            <Text style={styles.chevron}>›</Text>
          </View>
        </TouchableOpacity>

        {/* 更多設置 */}
        <TouchableOpacity
          style={styles.moreSettings}
          onPress={() => {
            console.log('更多設置按鈕被點擊');
            navigation.navigate('MoreSettings');
          }}
        >
          <Text style={styles.settingLabel}>{t('moreSettings')}</Text>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>

        {/* 底部連結 */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>{t('appName')}</Text>
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
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    width: '100%',
    maxWidth: 340,
    paddingTop: 20,
    alignItems: 'center'
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#000'
  },
  modalOption: {
    width: '100%',
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  modalOptionText: {
    fontSize: 18,
    color: '#000'
  },
  selectedOptionText: {
    color: '#007AFF',
    fontWeight: '600'
  },
  separator: {
    width: '100%',
    height: 1,
    backgroundColor: '#F0F0F0'
  },
  checkmark: {
    fontSize: 18,
    color: '#007AFF',
    fontWeight: 'bold'
  },
  cancelButton: {
    width: '100%',
    paddingVertical: 16,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    marginTop: 8
  },
  cancelButtonText: {
    fontSize: 18,
    color: '#007AFF',
    fontWeight: '600'
  }
});

export default SettingsScreen;
