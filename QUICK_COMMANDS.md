# 🚀 APP 上架快速指令參考

## 一、準備工作

### 安裝 EAS CLI
```bash
npm install -g eas-cli
```

### 登入 Expo
```bash
eas login
```

---

## 二、專案設定

### 初始化 EAS
```bash
cd CurrencyConverter
eas build:configure
```

### 更新 app.json（重要！）
```json
{
  "expo": {
    "name": "極簡匯率",
    "slug": "t-currency",
    "version": "1.0.0",
    "android": {
      "package": "com.yourcompany.currencyconverter",
      "versionCode": 1
    },
    "ios": {
      "bundleIdentifier": "com.yourcompany.currencyconverter",
      "buildNumber": "1"
    }
  }
}
```

⚠️ **記得修改**:
- `com.yourcompany` 改成你的公司/個人網域（反向）
- 例如: `com.johnsmith.currencyconverter`

---

## 三、建置 APP

### Android 

#### 建置 AAB（Google Play 正式版）
```bash
eas build --platform android --profile production
```

#### 建置 APK（測試用）
```bash
eas build --platform android --profile preview
```

### iOS

#### 建置 IPA（App Store）
```bash
eas build --platform ios --profile production
```

### 同時建置兩個平台
```bash
eas build --platform all --profile production
```

---

## 四、查看建置狀態

### 查看建置列表
```bash
eas build:list
```

### 查看特定建置詳情
```bash
eas build:view [BUILD_ID]
```

---

## 五、提交到商店

### 提交到 Google Play
```bash
eas submit --platform android
```

需要準備：
- Google Play Console 帳號
- Service Account JSON 金鑰

### 提交到 App Store
```bash
eas submit --platform ios
```

需要準備：
- Apple Developer 帳號
- App Store Connect API 金鑰

---

## 六、版本更新

### 1. 更新版本號

編輯 `app.json`:
```json
{
  "expo": {
    "version": "1.0.1",  // 顯示給用戶的版本
    "android": {
      "versionCode": 2   // ⚠️ 必須遞增！
    },
    "ios": {
      "buildNumber": "2" // ⚠️ 必須遞增！
    }
  }
}
```

### 2. 重新建置
```bash
eas build --platform all --profile production
```

### 3. 提交更新
```bash
eas submit --platform android
eas submit --platform ios
```

---

## 七、測試版本

### 建立 Internal Testing Build
```bash
eas build --platform android --profile preview
```

### 分享給測試者
```bash
# 建置完成後，EAS 會提供下載連結
# 直接分享連結給測試者
```

---

## 八、常用指令整理

| 功能 | 指令 |
|------|------|
| 登入 | `eas login` |
| 登出 | `eas logout` |
| 查看帳號 | `eas whoami` |
| 初始化 | `eas build:configure` |
| 建置 Android | `eas build -p android` |
| 建置 iOS | `eas build -p ios` |
| 建置全部 | `eas build -p all` |
| 查看建置 | `eas build:list` |
| 提交 Android | `eas submit -p android` |
| 提交 iOS | `eas submit -p ios` |
| 查看設定 | `eas config` |

---

## 九、故障排除

### 清除快取重新建置
```bash
eas build --platform android --clear-cache
```

### 本地建置（需要 Android Studio/Xcode）
```bash
# Android
eas build --platform android --local

# iOS  
eas build --platform ios --local
```

### 查看日誌
```bash
eas build:view [BUILD_ID]
```

---

## 十、完整發布流程（複製即用）

### 首次發布

```bash
# 1. 安裝工具
npm install -g eas-cli

# 2. 登入
eas login

# 3. 進入專案
cd CurrencyConverter

# 4. 初始化
eas build:configure

# 5. 檢查 app.json 設定
# ⚠️ 確認 package name / bundle identifier 正確

# 6. 建置（約 15-20 分鐘）
eas build --platform all --profile production

# 7. 等待建置完成
# 會收到 Email 通知

# 8. 手動上傳或自動提交
# 方法 A: 下載 AAB/IPA 手動上傳
# 方法 B: 使用 EAS Submit
eas submit --platform android
eas submit --platform ios
```

### 更新版本

```bash
# 1. 修改 app.json 版本號
# version: "1.0.0" → "1.0.1"
# versionCode: 1 → 2
# buildNumber: "1" → "2"

# 2. 重新建置
eas build --platform all --profile production

# 3. 提交
eas submit --platform all
```

---

## 十一、開發者帳號註冊

### Google Play Console
```
網址: https://play.google.com/console/signup
費用: $25 USD（一次性）
需要: Google 帳號 + 信用卡
```

### Apple Developer
```
網址: https://developer.apple.com/programs/
費用: $99 USD/年
需要: Apple ID + 信用卡
```

---

## 十二、EAS Build 設定檔範例

### eas.json 完整範例
```json
{
  "cli": {
    "version": ">= 5.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": {
        "simulator": true
      }
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      },
      "ios": {
        "simulator": false
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
    "production": {
      "android": {
        "serviceAccountKeyPath": "./google-service-account.json"
      },
      "ios": {
        "appleId": "your-apple-id@email.com",
        "ascAppId": "1234567890",
        "appleTeamId": "ABCD123456"
      }
    }
  }
}
```

---

## 💡 小技巧

### 加速建置
```bash
# 使用 --no-wait 在背景建置
eas build --platform android --no-wait

# 同時建置多個平台
eas build --platform all
```

### 檢查建置大小
```bash
# 建置完成後檢查 APK/AAB 大小
# 目標: < 100 MB
```

### 自動化
```bash
# 建立 npm script
# package.json:
{
  "scripts": {
    "build:android": "eas build --platform android --profile production",
    "build:ios": "eas build --platform ios --profile production",
    "build:all": "eas build --platform all --profile production",
    "submit:all": "eas submit --platform all"
  }
}

# 使用:
npm run build:all
```

---

## 🎯 第一次發布檢查清單

建置前：
```
□ app.json 版本號已設定
□ package name / bundle identifier 已修改
□ APP 圖示已準備 (1024x1024)
□ 啟動畫面已準備
□ 在實機上測試通過
□ 無明顯 bug
```

提交前：
```
□ 開發者帳號已註冊並付費
□ 隱私政策網站已建立
□ APP 描述已撰寫
□ 截圖已準備（多種尺寸）
□ 分級資訊已確認
```

---

## 📞 需要幫助？

在專案目錄執行：
```bash
claude
```

然後詢問：
```
"EAS build 失敗怎麼辦？"
"如何修改 bundle identifier？"
"Google Play 審核被拒絕，原因是...?"
```

---

**祝發布順利！** 🎉
