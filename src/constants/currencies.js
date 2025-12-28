// 貨幣資料
export const CURRENCIES = [
  {
    code: 'TWD',
    name: '新臺幣',
    symbol: 'NT$',
    flag: '🇹🇼',
    country: '台灣地區'
  },
  {
    code: 'USD',
    name: '美元',
    symbol: '$',
    flag: '🇺🇸',
    country: '美國'
  },
  {
    code: 'EUR',
    name: '歐元',
    symbol: '€',
    flag: '🇪🇺',
    country: '歐盟'
  },
  {
    code: 'JPY',
    name: '日元',
    symbol: '¥',
    flag: '🇯🇵',
    country: '日本'
  },
  {
    code: 'GBP',
    name: '英鎊',
    symbol: '£',
    flag: '🇬🇧',
    country: '英國'
  },
  {
    code: 'KRW',
    name: '韓國幣',
    symbol: '₩',
    flag: '🇰🇷',
    country: '韓國'
  },
  {
    code: 'CNY',
    name: '人民幣',
    symbol: '¥',
    flag: '🇨🇳',
    country: '中國'
  },
  {
    code: 'HKD',
    name: '港幣',
    symbol: 'HK$',
    flag: '🇭🇰',
    country: '香港'
  },
  {
    code: 'SGD',
    name: '新加坡元',
    symbol: 'S$',
    flag: '🇸🇬',
    country: '新加坡'
  },
  {
    code: 'AUD',
    name: '澳元',
    symbol: 'A$',
    flag: '🇦🇺',
    country: '澳洲'
  },
  {
    code: 'CAD',
    name: '加拿大元',
    symbol: 'C$',
    flag: '🇨🇦',
    country: '加拿大'
  },
  {
    code: 'CHF',
    name: '瑞士法郎',
    symbol: 'CHF',
    flag: '🇨🇭',
    country: '瑞士'
  },
  {
    code: 'NZD',
    name: '紐西蘭元',
    symbol: 'NZ$',
    flag: '🇳🇿',
    country: '紐西蘭'
  },
  {
    code: 'THB',
    name: '泰銖',
    symbol: '฿',
    flag: '🇹🇭',
    country: '泰國'
  },
  {
    code: 'MYR',
    name: '馬來西亞令吉',
    symbol: 'RM',
    flag: '🇲🇾',
    country: '馬來西亞'
  },
  {
    code: 'VND',
    name: '越南盾',
    symbol: '₫',
    flag: '🇻🇳',
    country: '越南'
  },
  {
    code: 'PHP',
    name: '菲律賓披索',
    symbol: '₱',
    flag: '🇵🇭',
    country: '菲律賓'
  },
  {
    code: 'IDR',
    name: '印尼盾',
    symbol: 'Rp',
    flag: '🇮🇩',
    country: '印尼'
  },
  {
    code: 'INR',
    name: '印度盧比',
    symbol: '₹',
    flag: '🇮🇳',
    country: '印度'
  }
];

// 常用貨幣（根據截圖）
export const FAVORITE_CURRENCIES = ['ETH', 'MATIC', 'KRW', 'TWD', 'CNY', 'USD', 'JPY', 'EUR'];

// 默認選中的貨幣
export const DEFAULT_SELECTED_CURRENCIES = ['TWD', 'KRW', 'USD', 'JPY', 'EUR'];

// 匯率 API 來源
export const EXCHANGE_RATE_SOURCES = {
  SIMPLE: 'tCurrency',
  MEDIUM: '中間價'
};

// 虛擬貨幣定義 - 台灣特色匯率
export const VIRTUAL_CURRENCIES = {
  CHICKEN_CUTLET: {
    code: 'CHICKEN',
    name: '雞排',
    nameEn: 'Chicken Cutlet',
    nameJa: 'フライドチキン',
    nameKo: '치킨',
    symbol: '🍗',
    flag: '🍗',
    price: 85, // TWD
    settingKey: 'chickenCutletRate'
  },
  BUBBLE_TEA: {
    code: 'BUBBLE',
    name: '珍珠奶茶',
    nameEn: 'Bubble Tea',
    nameJa: 'タピオカティー',
    nameKo: '버블티',
    symbol: '🧋',
    flag: '🧋',
    price: 55, // TWD
    settingKey: 'bubbleTeaRate'
  }
};

// 獲取虛擬貨幣的本地化名稱
export const getVirtualCurrencyName = (virtualCurrency, language = 'zh-TW') => {
  const nameMap = {
    'zh-TW': virtualCurrency.name,
    'en': virtualCurrency.nameEn,
    'ja': virtualCurrency.nameJa,
    'ko': virtualCurrency.nameKo
  };
  return nameMap[language] || virtualCurrency.name;
};
