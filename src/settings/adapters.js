import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'app_settings';

// Production adapter — 包裝 AsyncStorage。
export const asyncStorageAdapter = {
  get: () => AsyncStorage.getItem(STORAGE_KEY),
  set: (value) => AsyncStorage.setItem(STORAGE_KEY, value),
};

// 測試用 adapter — 記憶體內物件,不碰 AsyncStorage。
export const createInMemoryAdapter = (initial = null) => {
  let value = initial;
  return {
    get: async () => value,
    set: async (next) => {
      value = next;
    },
  };
};
