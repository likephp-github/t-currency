import axios from 'axios';

// 使用免費的匯率 API
const EXCHANGE_API_BASE = 'https://api.exchangerate-api.com/v4/latest';
// 備用 API: https://open.er-api.com/v6/latest

class ExchangeRateService {
  constructor() {
    this.cache = {};
    this.lastUpdate = null;
    this.baseCurrency = 'USD';
  }

  /**
   * 獲取最新匯率
   * @param {string} base - 基準貨幣代碼
   * @returns {Promise<Object>} 匯率資料
   */
  async getExchangeRates(base = 'USD') {
    try {
      // 檢查快取（5分鐘內不重複請求）
      const cacheKey = `${base}_rates`;
      const now = Date.now();
      
      if (this.cache[cacheKey] && this.lastUpdate) {
        const timeDiff = now - this.lastUpdate;
        if (timeDiff < 5 * 60 * 1000) { // 5分鐘
          console.log('使用快取的匯率資料');
          return this.cache[cacheKey];
        }
      }

      // 從 API 獲取新資料
      console.log('從 API 獲取匯率資料...');
      const response = await axios.get(`${EXCHANGE_API_BASE}/${base}`);
      
      if (response.data && response.data.rates) {
        this.cache[cacheKey] = {
          base: response.data.base,
          rates: response.data.rates,
          date: response.data.date,
          timestamp: now
        };
        this.lastUpdate = now;
        
        return this.cache[cacheKey];
      }
      
      throw new Error('無效的 API 回應');
    } catch (error) {
      console.error('獲取匯率失敗:', error);
      
      // 如果有快取資料，即使過期也返回
      const cacheKey = `${base}_rates`;
      if (this.cache[cacheKey]) {
        console.log('API 請求失敗，使用快取資料');
        return this.cache[cacheKey];
      }
      
      throw error;
    }
  }

  /**
   * 轉換貨幣
   * @param {number} amount - 金額
   * @param {string} from - 來源貨幣
   * @param {string} to - 目標貨幣
   * @param {Object} rates - 匯率資料
   * @returns {number} 轉換後的金額
   */
  convertCurrency(amount, from, to, rates) {
    if (!rates || !rates.rates) {
      throw new Error('無效的匯率資料');
    }

    // 如果基準貨幣是來源貨幣
    if (from === rates.base) {
      return amount * (rates.rates[to] || 1);
    }
    
    // 如果基準貨幣是目標貨幣
    if (to === rates.base) {
      return amount / (rates.rates[from] || 1);
    }
    
    // 需要通過基準貨幣轉換
    const amountInBase = amount / (rates.rates[from] || 1);
    return amountInBase * (rates.rates[to] || 1);
  }

  /**
   * 批量轉換（用於主畫面顯示多個貨幣）
   * @param {number} amount - 金額
   * @param {string} from - 來源貨幣
   * @param {Array} targetCurrencies - 目標貨幣列表
   * @param {Object} rates - 匯率資料
   * @returns {Object} 所有貨幣的轉換結果
   */
  convertToMultiple(amount, from, targetCurrencies, rates) {
    const results = {};
    
    targetCurrencies.forEach(currency => {
      try {
        results[currency] = this.convertCurrency(amount, from, currency, rates);
      } catch (error) {
        console.error(`轉換 ${currency} 失敗:`, error);
        results[currency] = 0;
      }
    });
    
    return results;
  }

  /**
   * 清除快取
   */
  clearCache() {
    this.cache = {};
    this.lastUpdate = null;
  }
}

export default new ExchangeRateService();
