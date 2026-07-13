# t-currency 領域詞彙

本檔記錄專案的 domain 語言。輸出(issue 標題、重構提案、測試名稱)命名概念時,以此處定義的詞為準。

## 計算機引擎(Calculator)

`src/hooks/useCalculator.js`。畫面底部虛擬鍵盤背後的運算核心,pure reducer。

- **即時求值(live evaluation)** — 本計算機的核心語意:輸入第二運算元時「邊打邊算」,畫面即時顯示運算結果(按 `100 + 5` 時畫面顯示 `105`,不是 `5`)。因此 `=` 不做計算,只清除運算狀態 — 結果早已在畫面上。
- **display 字串** — 每次按鍵後「畫面該顯示什麼」的字串;`null` 表示這次按鍵不更新畫面(例如第一次按運算符)。display 字串是計算機與換算流程之間的 seam:計算機吐字串,畫面拿去驅動匯率換算。
- **既有怪癖(刻意保留,測試已鎖定)** — 除以零回傳前值;`%` 為單純除以 100;`00` 在新數字狀態只給 `0`;`=` 後接運算符從 0 開始而非接續結果。修改這些行為前先讀 `src/hooks/__tests__/useCalculator.test.js`。

## 虛擬貨幣(Virtual Currency)

`src/constants/currencies.js` 的 `VIRTUAL_CURRENCIES`。以 TWD 計價的趣味換算單位(雞排、珍奶),顯示在 TWD 列之後,不計入貨幣數量上限。
