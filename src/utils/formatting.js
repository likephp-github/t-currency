// 格式化 module — 收斂 HomeScreen 千分位 helper、
// HomeScreen/SettingsScreen 兩份行為不同的 formatUpdateTime。

// 千分位 + 小數位。decimals 為 null 時只做千分位分組,不四捨五入
// (供已經算好精度、不該再被動過的字串使用,例如使用者正在輸入中的金額)。
export const formatAmount = (value, decimals = null) => {
  if (value === null || value === undefined || value === '') return '';

  const rounded = decimals === null ? value.toString() : Number(value).toFixed(decimals);
  const str = rounded.replace(/,/g, '');
  const isNegative = str.startsWith('-');
  const absStr = isNegative ? str.slice(1) : str;
  const parts = absStr.split('.');

  const intPart = parts[0];
  let grouped = '';
  let count = 0;
  for (let i = intPart.length - 1; i >= 0; i--) {
    if (count > 0 && count % 3 === 0) {
      grouped = ',' + grouped;
    }
    grouped = intPart[i] + grouped;
    count++;
  }
  parts[0] = grouped;

  return (isNegative ? '-' : '') + parts.join('.');
};

// 相對時間(剛剛更新 / X 分鐘前)+ 絕對時間(今天 HH:MM)分支,
// 以原 HomeScreen 版為準;date 為 null 時顯示「未更新」。
export const formatUpdateTime = (date, t) => {
  if (!date) return t('notUpdated');

  const now = new Date();
  const diffMinutes = Math.floor((now - date) / 1000 / 60);

  if (diffMinutes < 1) return t('justUpdated');
  if (diffMinutes < 60) return `${diffMinutes}${t('updatedMinutesAgo')}`;

  const hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return t('updatedToday', { time: `${hours}:${minutes}` });
};
