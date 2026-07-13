# tCurrency - Currency Converter

一個簡潔美觀的跨平台匯率換算 APP，使用 React Native (Expo) 開發。

## 📱 功能特色

- ✅ 即時匯率轉換
- ✅ 支援多種貨幣同時換算
- ✅ 自訂常用貨幣列表
- ✅ 貨幣搜尋功能
- ✅ 匯率自動更新（帶快取機制）
- ✅ 可調整小數點位數
- ✅ 設定本地儲存（AsyncStorage）
- ✅ iOS/Android 通用

## 🚀 快速開始

### 安裝依賴

```bash
npm install
```

### 執行專案

```bash
# 啟動開發伺服器
npm start

# 在 iOS 模擬器執行
npm run ios

# 在 Android 模擬器執行
npm run android

# 在網頁瀏覽器執行
npm run web
```

## 📂 專案結構

```
CurrencyConverter/
├── App.js                          # 應用程式入口
├── app.json                        # Expo 配置
├── package.json                    # 專案依賴
├── babel.config.js                 # Babel 配置
├── src/
│   ├── contexts/
│   │   └── AppContext.js          # 全域狀態管理
│   ├── hooks/
│   │   └── useCalculator.js       # 計算機引擎（pure reducer）
│   ├── screens/
│   │   ├── HomeScreen.js          # 主換算頁面
│   │   ├── CurrencySelectionScreen.js  # 貨幣選擇頁面
│   │   ├── SettingsScreen.js      # 設定頁面
│   │   └── MoreSettingsScreen.js  # 更多設定（國旗、虛擬貨幣）
│   ├── services/
│   │   └── exchangeRateAPI.js     # 匯率 API 服務
│   ├── constants/
│   │   └── currencies.js          # 貨幣資料
│   └── i18n/
│       └── translations.js        # 多語言字串
└── assets/                         # 圖片資源
```

## 🛠️ 技術棧

- **框架**: React Native (Expo ~54.0.0)
- **導航**: React Navigation 6
- **狀態管理**: React Context API + Hooks
- **本地儲存**: AsyncStorage
- **匯率 API**: ExchangeRate-API (免費)
- **測試**: Jest (jest-expo)

## 📦 主要依賴

```json
{
  "expo": "~54.0.0",
  "react-native": "0.81.5",
  "@react-navigation/native": "^6.1.9",
  "@react-native-async-storage/async-storage": "2.2.0",
  "axios": "^1.6.2"
}
```

## 🎨 主要功能

### 1. 主換算頁面
- 顯示多個貨幣的即時換算
- 任一貨幣輸入，其他自動計算
- 下拉重新整理匯率
- 顯示最後更新時間

### 2. 貨幣選擇
- 搜尋功能
- 常用貨幣快速選擇
- 字母索引快速導航
- 多選/單選切換

### 3. 設定頁面
- 當地貨幣顯示
- 貨幣符號開關
- 匯率來源選擇
- 小數點位數調整
- 預設金額設定

## 🔧 自訂設定

### 更換匯率 API

在 `src/services/exchangeRateAPI.js` 中修改 API 端點：

```javascript
const EXCHANGE_API_BASE = 'https://api.exchangerate-api.com/v4/latest';
```

### 新增貨幣

在 `src/constants/currencies.js` 中新增貨幣資料：

```javascript
{
  code: 'XYZ',
  name: '貨幣名稱',
  symbol: '$',
  flag: '🏳️',
  country: '國家'
}
```

## 📝 待辦事項

- [ ] 歷史匯率查詢
- [ ] 匯率走勢圖表
- [x] 多語言支援（zh-TW / en / ja / ko）
- [ ] 深色模式
- [ ] 匯率警報功能
- [ ] 離線模式優化

## 🤝 貢獻

歡迎提交 Issue 或 Pull Request！

## 📄 授權

MIT License

## 👨‍💻 開發者

使用 Claude CLI 協助開發
```
