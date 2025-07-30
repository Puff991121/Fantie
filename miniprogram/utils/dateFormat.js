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
/**
 * 计算指定日期与当前日期的间隔天数
 * @param {string} isoDate - ISO 格式日期字符串，如 "2025-07-17T06:30:42.814Z"
 * @returns {object} 包含格式化日期和间隔天数的对象
 */
function calculateDateInterval(isoDate) {
  // 1. 解析传入的ISO日期
  const targetDate = new Date(isoDate);

  // 2. 格式化为年月日（YYYY-MM-DD）
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // 3. 获取当前日期（时分秒归零，只保留年月日）
  const now = new Date();
  const currentDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // 4. 同样处理目标日期（去掉时分秒）
  const targetDateOnly = new Date(
    targetDate.getFullYear(),
    targetDate.getMonth(),
    targetDate.getDate()
  );

  // 5. 计算间隔天数（毫秒转天数）
  const timeDiff = currentDate - targetDateOnly;
  const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
  const daysInterval = Math.abs(daysDiff);
  return daysInterval // 间隔天数（绝对值）;
}

module.exports = {
  formatDate,
  getTimePeriod,
  calculateDateInterval,
}