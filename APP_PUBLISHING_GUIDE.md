# 📱 APP 上架完整指南

## 目錄
1. [準備工作](#準備工作)
2. [Android 上架流程](#android-上架流程)
3. [iOS 上架流程](#ios-上架流程)
4. [使用 Expo 建置](#使用-expo-建置)
5. [常見問題](#常見問題)

---

## 準備工作

### 1. 開發者帳號

#### Android - Google Play Console
- **費用**: 一次性 $25 USD
- **註冊**: https://play.google.com/console/signup
- **需要**: Google 帳號、信用卡

#### iOS - Apple Developer Program
- **費用**: 每年 $99 USD
- **註冊**: https://developer.apple.com/programs/
- **需要**: Apple ID、信用卡
- **⚠️ 注意**: 需要 macOS 進行某些操作

### 2. APP 資訊準備

建立一個清單，準備以下資訊：

```
✅ APP 基本資訊
   - APP 名稱（中文/英文）
   - 簡短描述（80 字）
   - 完整描述（4000 字以內）
   - 關鍵字（iOS）
   - 分類（工具類/財經類）

✅ 視覺資源
   - APP Icon（1024x1024px）
   - 截圖（至少 3-5 張）
     * Android: 多種尺寸（手機/平板）
     * iOS: iPhone/iPad 各種尺寸
   - 宣傳圖（可選）

✅ 隱私政策
   - 隱私政策網址（必須）
   - 使用條款網址（建議）

✅ 聯絡資訊
   - 支援網站
   - 支援電子郵件
   - 電話（可選）
```

---

## Android 上架流程

### Step 1: 準備 Android 版本

#### 1.1 更新 app.json

```json
{
  "expo": {
    "name": "極簡匯率",
    "slug": "currency-converter",
    "version": "1.0.0",
    "android": {
      "package": "com.yourcompany.currencyconverter",
      "versionCode": 1,
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#FFFFFF"
      },
      "permissions": [
        "INTERNET"
      ]
    }
  }
}
```

#### 1.2 建立圖示和啟動畫面

```bash
# APP Icon (1024x1024)
assets/icon.png

# Adaptive Icon (Android, 1024x1024)
assets/adaptive-icon.png

# Splash Screen (1242x2436)
assets/splash.png
```

### Step 2: 使用 Expo 建置 APK/AAB

#### 方法 A: 使用 EAS Build（推薦）

```bash
# 1. 安裝 EAS CLI
npm install -g eas-cli

# 2. 登入 Expo 帳號
eas login

# 3. 設定專案
eas build:configure

# 4. 建置 Android AAB（用於 Play Store）
eas build --platform android

# 或建置 APK（用於測試）
eas build --platform android --profile preview
```

#### 方法 B: 使用傳統 Expo Build

```bash
# 建置 Android AAB
expo build:android -t app-bundle

# 下載建置的檔案
# Expo 會提供下載連結
```

### Step 3: 上傳到 Google Play Console

1. **登入 Google Play Console**
   - 前往 https://play.google.com/console

2. **建立應用程式**
   - 點擊「建立應用程式」
   - 填寫 APP 名稱
   - 選擇語言和類型

3. **填寫商店資訊**
   ```
   🏪 商店一覽
   - 簡短說明
   - 完整說明
   - APP 圖示（512x512）
   - 功能圖片
   - 手機截圖（至少 2 張）
   - 平板截圖（建議）
   ```

4. **上傳 AAB 檔案**
   - 製作 → 正式版
   - 建立新版本
   - 上傳 AAB 檔案
   - 填寫版本資訊

5. **內容分級**
   - 填寫問卷
   - 取得分級

6. **目標受眾和內容**
   - 設定年齡層
   - 隱私政策網址

7. **送審**
   - 檢查所有項目
   - 提交審核
   - ⏱️ 通常 1-3 天

---

## iOS 上架流程

### Step 1: 準備 iOS 版本

#### 1.1 更新 app.json

```json
{
  "expo": {
    "name": "極簡匯率",
    "slug": "currency-converter",
    "version": "1.0.0",
    "ios": {
      "bundleIdentifier": "com.yourcompany.currencyconverter",
      "buildNumber": "1",
      "supportsTablet": true,
      "infoPlist": {
        "NSCameraUsageDescription": "此應用程式不使用相機",
        "NSPhotoLibraryUsageDescription": "此應用程式不使用相簿"
      }
    }
  }
}
```

### Step 2: 建置 iOS APP

#### 使用 EAS Build（必須有 Apple Developer 帳號）

```bash
# 1. 設定 Apple Developer 認證
eas build:configure

# 2. 建置 iOS
eas build --platform ios

# 3. 等待建置完成
# Expo 會自動處理證書和配置檔
```

### Step 3: App Store Connect 設定

1. **登入 App Store Connect**
   - 前往 https://appstoreconnect.apple.com

2. **建立新 APP**
   - 我的 App → ＋ → 新增 App
   - 填寫基本資訊
   ```
   平台: iOS
   名稱: 極簡匯率
   主要語言: 繁體中文
   套裝 ID: com.yourcompany.currencyconverter
   SKU: currency-converter-001
   ```

3. **填寫 APP 資訊**
   ```
   📱 APP 資訊
   - 名稱（30 字）
   - 副標題（30 字，可選）
   - 類別（主要/次要）
   - 內容版權
   - 年齡分級
   
   🖼️ 截圖和預覽
   - iPhone 截圖（多種尺寸）
     * 6.7" (1290 x 2796)
     * 6.5" (1284 x 2778)
     * 5.5" (1242 x 2208)
   - iPad 截圖（如支援）
   
   📝 說明
   - 宣傳文字（170 字）
   - 描述（4000 字）
   - 關鍵字（100 字）
   - 支援 URL
   - 行銷 URL（可選）
   ```

4. **隱私權**
   - 隱私政策 URL（必須）
   - 資料類型和用途

5. **上傳 Build**
   ```bash
   # 使用 EAS 建置後，build 會自動上傳到 App Store Connect
   # 或使用 Transporter APP 手動上傳
   ```

6. **App 審查資訊**
   - 聯絡資訊
   - 測試帳號（如需要）
   - 備註

7. **送審**
   - 提交審核
   - ⏱️ 通常 1-3 天，首次可能更久

---

## 使用 Expo 建置

### EAS Build 完整設定

#### 1. 安裝和設定

```bash
# 安裝 EAS CLI
npm install -g eas-cli

# 登入
eas login

# 初始化專案
cd CurrencyConverter
eas build:configure
```

#### 2. 設定 eas.json

會自動建立 `eas.json`：

```json
{
  "cli": {
    "version": ">= 5.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "app-bundle"
      },
      "ios": {
        "buildType": "app-store"
      }
    }
  },
  "submit": {
    "production": {}
  }
}
```

#### 3. 建置命令

```bash
# 建置 Android AAB（正式版）
eas build --platform android --profile production

# 建置 iOS（正式版）
eas build --platform ios --profile production

# 建置兩個平台
eas build --platform all

# 預覽版本（測試用）
eas build --platform android --profile preview
```

#### 4. 自動提交

```bash
# 自動提交到商店
eas submit --platform android
eas submit --platform ios
```

---

## 版本更新流程

### 更新版本號

#### app.json
```json
{
  "expo": {
    "version": "1.0.1",  // 使用者看到的版本
    "android": {
      "versionCode": 2   // Android 內部版本號（必須遞增）
    },
    "ios": {
      "buildNumber": "2" // iOS 內部版本號（必須遞增）
    }
  }
}
```

### 發布更新

```bash
# 1. 更新版本號
# 編輯 app.json

# 2. 建置新版本
eas build --platform all --profile production

# 3. 提交審核
eas submit --platform android
eas submit --platform ios
```

---

## 常見問題

### Q1: 需要 macOS 才能發布 iOS APP 嗎？

**A:** 使用 EAS Build **不需要** macOS！
- EAS Build 在雲端建置
- 只需要 Apple Developer 帳號
- 可以在 Windows/Linux 上開發和發布

### Q2: 建置需要多久？

**A:** 
- Android: 10-15 分鐘
- iOS: 15-25 分鐘
- 首次建置可能更久

### Q3: 審核通常多久？

**A:**
- **Google Play**: 1-3 天（有時幾小時）
- **App Store**: 1-3 天（首次可能 5-7 天）

### Q4: 審核被拒絕怎麼辦？

**A:** 
1. 仔細閱讀拒絕理由
2. 修正問題
3. 重新建置
4. 重新提交

常見拒絕原因：
- 缺少隱私政策
- APP 功能不完整
- 截圖不符合規定
- 違反商店政策

### Q5: 免費 APP 需要稅務資訊嗎？

**A:**
- **Google Play**: 需要填寫稅務資訊
- **App Store**: 免費 APP 仍需填寫銀行資訊

### Q6: 可以同時發布 Android 和 iOS 嗎？

**A:** 可以！使用 EAS Build：
```bash
eas build --platform all --profile production
```

### Q7: 如何測試 APP？

**A:**
- **Android**: 
  - Internal Testing（內部測試）
  - Closed Testing（封閉測試）
  - Open Testing（開放測試）
  
- **iOS**:
  - TestFlight（最多 10,000 名測試者）

### Q8: 上架費用總結

| 項目 | Android | iOS |
|------|---------|-----|
| 開發者帳號 | $25（一次性）| $99/年 |
| 年度費用 | $0 | $99 |
| 手續費 | 15-30%（內購）| 15-30%（內購）|

### Q9: APP 需要伺服器嗎？

**A:** 你的匯率 APP：
- ✅ 使用外部 API（免費）
- ✅ Supabase 免費方案
- ❌ 不需要自己架設伺服器

---

## 檢查清單

### 發布前檢查

```
□ APP 在實體裝置上測試正常
□ 所有功能都能運作
□ 無明顯 bug
□ 載入速度正常
□ 圖示和截圖已準備
□ 隱私政策網站已建立
□ 開發者帳號已開通
□ app.json 版本號正確
□ Bundle ID / Package Name 正確
□ APP 描述和關鍵字已準備
```

### Android 特定

```
□ APK/AAB 檔案已建置
□ 內容分級問卷已填寫
□ 目標 SDK 版本符合要求
□ 權限說明清楚
```

### iOS 特定

```
□ IPA 檔案已建置
□ Apple Developer 帳號有效
□ 截圖符合所有尺寸要求
□ App Store Connect 已設定
□ 所有必填欄位已完成
```

---

## 實用工具

### 圖示生成器
- https://www.appicon.co/
- https://icon.kitchen/

### 截圖生成器
- https://www.appmockup.com/
- https://smartmockups.com/

### 隱私政策生成器
- https://www.privacypolicies.com/
- https://app-privacy-policy-generator.firebaseapp.com/

---

## 下一步

1. **註冊開發者帳號**（如未註冊）
2. **準備視覺資源**（圖示、截圖）
3. **建立隱私政策網站**
4. **測試 APP**
5. **使用 EAS Build 建置**
6. **提交審核**

---

**祝你上架順利！** 🚀

如有任何問題，隨時在 Claude CLI 中詢問：
```bash
claude
"如何解決 iOS 建置錯誤？"
"Google Play 審核被拒怎麼辦？"
```
