// 旗幟哨兵字串 → 圖片資源對照表,只存在這一處。
// 新增一面自訂旗 = 只改這裡。

const CUSTOM_FLAG_SOURCES = {
  CUSTOM_FLAG_1: require('../../assets/custom-flag.jpg'),
  CUSTOM_FLAG_2: require('../../assets/formosa-flag.png'),
};

// flag 是 emoji 或哨兵字串;是哨兵字串就回傳可渲染的 Image source,
// 否則回傳 null(呼叫端 fallback 為文字 emoji)。
export const flagSource = (flag) => CUSTOM_FLAG_SOURCES[flag] || null;
