// 获取当前日期并格式化为YYYY-MM-DD
function formatDate() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * 判断当前时间是早上还是晚上
 * @returns {string} 'morning' 或 'evening'
 */
function getTimePeriod() {
  const now = new Date();
  const hours = now.getHours(); // 获取当前小时(0-23)
  // 早上7点到13点(不包括13点)为早上
  if (hours >= 7 && hours < 13) {
    return '早上';
  } else {
    return '晚上';
  }
}
module.exports = {
  formatDate,
  getTimePeriod,
}