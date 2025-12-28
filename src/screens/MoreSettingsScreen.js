import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Modal,
  TouchableWithoutFeedback,
  ScrollView,
  Image,
  Switch
} from 'react-native';
import { useApp } from '../contexts/AppContext';

const MoreSettingsScreen = ({ navigation }) => {
  const { t, settings, saveSettings } = useApp();
  const [isFlagModalVisible, setFlagModalVisible] = useState(false);

  const handleToggle = (key) => {
    saveSettings({ [key]: !settings[key] });
  };

  // Available flag options for NTD (Taiwan)
  const flagOptions = [
    { label: '🇹🇼', value: '🇹🇼' },
    { label: '🐻', value: '🐻' },
    { label: '🧋', value: '🧋' },
    { label: '🗻', value: '🗻' },
    { label: 'CUSTOM 1', value: 'CUSTOM_FLAG_1' },
    { label: 'CUSTOM 2', value: 'CUSTOM_FLAG_2' }
  ];

  const handleFlagChange = (flag) => {
    // Save the custom flag to settings
    // We'll need to ensure AppContext supports this custom setting
    saveSettings({ customNTDFlag: flag });
    setFlagModalVisible(false);
  };

  const renderFlagModal = () => (
    <Modal
      visible={isFlagModalVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setFlagModalVisible(false)}
    >
      <TouchableWithoutFeedback onPress={() => setFlagModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('selectFlagTitle')}</Text>
            
            {flagOptions.map((option, index) => (
              <React.Fragment key={option.value}>
                {index > 0 && <View style={styles.separator} />}
                <TouchableOpacity
                  style={styles.modalOption}
                  onPress={() => handleFlagChange(option.value)}
                >
                  {option.value === 'CUSTOM_FLAG_1' ? (
                    <Image 
                      source={require('../../assets/custom-flag.jpg')} 
                      style={{ width: 32, height: 32, borderRadius: 16 }} 
                    />
                  ) : option.value === 'CUSTOM_FLAG_2' ? (
                    <Image 
                      source={require('../../assets/formosa-flag.png')} 
                      style={{ width: 32, height: 32, borderRadius: 16 }} 
                    />
                  ) : (
                    <Text style={styles.modalOptionIcon}>{option.label}</Text>
                  )}
                  {settings.customNTDFlag === option.value && <Text style={styles.checkmark}>✓</Text>}
                </TouchableOpacity>
              </React.Fragment>
            ))}

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setFlagModalVisible(false)}
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
      {renderFlagModal()}
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backIcon}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('moreSettings')}</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => setFlagModalVisible(true)}
          >
            <Text style={styles.settingLabel}>{t('changeFlag')}</Text>
            <View style={styles.valueContainer}>
              {settings.customNTDFlag === 'CUSTOM_FLAG_1' ? (
                <Image
                  source={require('../../assets/custom-flag.jpg')}
                  style={{ width: 24, height: 24, borderRadius: 12, marginRight: 8 }}
                />
              ) : settings.customNTDFlag === 'CUSTOM_FLAG_2' ? (
                <Image
                  source={require('../../assets/formosa-flag.png')}
                  style={{ width: 24, height: 24, borderRadius: 12, marginRight: 8 }}
                />
              ) : (
                <Text style={styles.valueText}>{settings.customNTDFlag || '🇹🇼'}</Text>
              )}
              <Text style={styles.chevron}>›</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>{t('chickenCutletRate')}</Text>
            <Switch
              value={settings.chickenCutletRate || false}
              onValueChange={() => handleToggle('chickenCutletRate')}
              trackColor={{ false: '#D1D1D6', true: '#34C759' }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>{t('bubbleTeaRate')}</Text>
            <Switch
              value={settings.bubbleTeaRate || false}
              onValueChange={() => handleToggle('bubbleTeaRate')}
              trackColor={{ false: '#D1D1D6', true: '#34C759' }}
              thumbColor="#FFFFFF"
            />
          </View>
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
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  valueText: {
    fontSize: 24,
    marginRight: 8
  },
  chevron: {
    fontSize: 20,
    color: '#C7C7CC'
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
  modalOptionIcon: {
    fontSize: 24,
    color: '#000'
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

export default MoreSettingsScreen;
