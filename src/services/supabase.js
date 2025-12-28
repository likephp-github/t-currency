import { createClient } from '@supabase/supabase-js';

// Supabase 配置
// 請替換為你的 Supabase 專案資訊
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';

// 建立 Supabase 客戶端
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 用戶偏好設定服務
export class UserPreferencesService {
  /**
   * 儲存用戶偏好設定
   * @param {string} userId - 用戶 ID
   * @param {Object} preferences - 偏好設定
   */
  async savePreferences(userId, preferences) {
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: userId,
          preferences: preferences,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('儲存偏好設定失敗:', error);
      throw error;
    }
  }

  /**
   * 獲取用戶偏好設定
   * @param {string} userId - 用戶 ID
   */
  async getPreferences(userId) {
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('preferences')
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      return data?.preferences || null;
    } catch (error) {
      console.error('獲取偏好設定失敗:', error);
      return null;
    }
  }

  /**
   * 刪除用戶偏好設定
   * @param {string} userId - 用戶 ID
   */
  async deletePreferences(userId) {
    try {
      const { error } = await supabase
        .from('user_preferences')
        .delete()
        .eq('user_id', userId);

      if (error) throw error;
    } catch (error) {
      console.error('刪除偏好設定失敗:', error);
      throw error;
    }
  }
}

export default new UserPreferencesService();
