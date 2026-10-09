/**
 * 通用格式化工具
 */

/** 价格格式化：整数不带小数，非整数保留两位小数 */
function formatPrice(value) {
  if (typeof value !== 'number' || isNaN(value)) return '0';
  return value % 1 === 0 ? String(value) : value.toFixed(2);
}

/**
 * 相对时间格式化
 * 1 分钟内 → 刚刚；1 小时内 → x分钟前；24 小时内 → x小时前；7 天内 → x天前；更早 → MM-DD
 */
function formatRelativeTime(timestamp) {
  if (!timestamp) return '';
  const diff = Date.now() - timestamp;
  const MINUTE = 60 * 1000;
  const HOUR = 60 * MINUTE;
  const DAY = 24 * HOUR;

  if (diff < MINUTE) return '刚刚';
  if (diff < HOUR) return Math.floor(diff / MINUTE) + '分钟前';
  if (diff < DAY) return Math.floor(diff / HOUR) + '小时前';
  if (diff < 7 * DAY) return Math.floor(diff / DAY) + '天前';

  const date = new Date(timestamp);
  return padZero(date.getMonth() + 1) + '-' + padZero(date.getDate());
}

/** 浏览量格式化：超过 1000 显示 1.2k */
function formatViews(views) {
  const num = views || 0;
  if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
  return String(num);
}

function padZero(num) {
  return num < 10 ? '0' + num : String(num);
}

module.exports = {
  formatPrice: formatPrice,
  formatRelativeTime: formatRelativeTime,
  formatViews: formatViews
};