# 🚀 快速開始指南

## 步驟 1: 安裝依賴

在專案目錄中執行：

```bash
npm install
```

或使用 yarn：

```bash
yarn install
```

## 步驟 2: 啟動開發伺服器

```bash
npm start
```

這會啟動 Expo 開發伺服器，並在終端顯示 QR code。

## 步驟 3: 在裝置上執行

### 在實體手機上執行：

1. 下載 **Expo Go** APP
   - iOS: [App Store](https://apps.apple.com/app/expo-go/id982107779)
   - Android: [Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent)

2. 掃描終端顯示的 QR code

### 在模擬器上執行：

```bash
# iOS (需要 macOS 和 Xcode)
npm run ios

# Android (需要 Android Studio)
npm run android
```

## 常見問題

### Q: npm install 失敗？

A: 嘗試：
```bash
# 清除快取
npm cache clean --force

# 刪除 node_modules 重新安裝
rm -rf node_modules
npm install
```

### Q: 模擬器無法啟動？

A: 
- iOS: 確保已安裝 Xcode Command Line Tools
- Android: 確保 Android Studio 已正確設定 SDK

### Q: 匯率不更新？

A: 
- 檢查網路連線
- 確認 API 端點可正常訪問
- 查看 console 錯誤訊息

## 下一步

- 📖 閱讀 [README.md](./README.md) 了解完整功能
- 🎨 自訂貨幣列表（編輯 `src/constants/currencies.js`）
- 🔧 調整 UI 樣式（編輯各個 Screen 的 StyleSheet）
- 🌐 更換匯率 API（編輯 `src/services/exchangeRateAPI.js`）

## 需要幫助？

- Expo 文件: https://docs.expo.dev
- React Native 文件: https://reactnative.dev
- React Navigation: https://reactnavigation.org

祝開發順利！🎉
