/**
 * 聊天日期工具函数
 * 基于玩家开始游戏日期动态计算聊天记录的日期
 */

import { getPlayerCookies } from './cookies';

/**
 * 获取玩家开始日期
 * @returns {Date} 玩家开始游戏的日期
 */
export function getStartDate() {
  const { startDate } = getPlayerCookies();
  if (startDate) {
    return new Date(startDate);
  }
  // 默认返回今天
  return new Date();
}

/**
 * 计算相对于开始日期的日期
 * @param {number} daysOffset - 距离开始日期的天数（负数表示之前）
 * @returns {Date} 计算后的日期
 */
export function getRelativeDate(daysOffset) {
  const startDate = getStartDate();
  const result = new Date(startDate);
  result.setDate(result.getDate() + daysOffset);
  return result;
}

/**
 * 格式化日期为 "YYYY年 M月 D日" 格式（不显示周几）
 * @param {Date} date - 日期对象
 * @returns {string} 格式化的日期字符串
 */
export function formatDateFull(date) {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${year}年${month}月${day}日`;
}

/**
 * 格式化日期为简短格式
 * @param {Date} date - 日期对象
 * @param {Date} referenceDate - 参考日期（通常是今天/开始日期）
 * @returns {string} 格式化的日期字符串
 */
export function formatDateShort(date, referenceDate = null) {
  const ref = referenceDate || getStartDate();
  const refDateOnly = new Date(ref.getFullYear(), ref.getMonth(), ref.getDate());
  const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.floor((refDateOnly - dateOnly) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return '今天';
  } else if (diffDays === 1) {
    return '昨天';
  } else if (diffDays < 7) {
    return `${diffDays}天前`;
  } else {
    return `${date.getMonth() + 1}/${date.getDate()}`;
  }
}

/**
 * 计算张薇的生日（基于开始日期推算）
 * 规则：开始日期往前推6天是张薇的月日，出生年份 = 开始日期年份 - 26
 * @returns {{ date: Date, birthYear: number, formatted: string, mmdd: string, yyyymmdd: string }}
 */
export function getZhangweiBirthday() {
  const birthday = getRelativeDate(-6);
  const startDate = getStartDate();
  const birthYear = startDate.getFullYear() - 26;
  const mm = String(birthday.getMonth() + 1).padStart(2, '0');
  const dd = String(birthday.getDate()).padStart(2, '0');
  return {
    date: birthday,
    birthYear,
    formatted: `${birthday.getMonth() + 1}月${birthday.getDate()}日`,
    mmdd: mm + dd,
    // 密码格式：yyyyMMdd
    yyyymmdd: `${birthYear}${mm}${dd}`,
  };
}

/**
 * 计算张薇基于当前系统时间的真实年龄
 * @returns {number} 真实年龄
 */
export function getZhangweiRealAge() {
  const { birthYear } = getZhangweiBirthday();
  const birthday = getRelativeDate(-6);
  const birthMonth = birthday.getMonth();
  const birthDay = birthday.getDate();

  const now = new Date();
  let age = now.getFullYear() - birthYear;
  // 如果今年生日还没过，减1
  const monthNow = now.getMonth();
  const dayNow = now.getDate();
  if (monthNow < birthMonth || (monthNow === birthMonth && dayNow < birthDay)) {
    age--;
  }
  return age;
}

/**
 * 生成聊天消息时间线
 * 基于开始日期返回各个关键日期
 * @returns {Object} 包含各个关键日期的对象
 */
export function getChatTimeline() {
  const startDate = getStartDate();
  return {
    // 今天（开始日期）
    today: startDate,
    // 5天前（失联第5天）
    day5Ago: getRelativeDate(-5),
    // 6天前（生日当天，彻底失联）
    birthday: getRelativeDate(-6),
    // 7天前（失联前夕）
    day7Ago: getRelativeDate(-7),
    // 8天前（开始出现异样）
    day8Ago: getRelativeDate(-8),
    // 12天前（埋藏生日线索）
    day12Ago: getRelativeDate(-12),
    // 14天前（两周前，气氛尚正常）
    day14Ago: getRelativeDate(-14),
  };
}

/**
 * 判断两个消息之间是否需要显示时间戳
 * 规则：第一条消息或与上一条间隔超过5分钟时显示
 * @param {Object} prevMessage - 上一条消息
 * @param {Object} currentMessage - 当前消息
 * @returns {boolean} 是否需要显示时间戳
 */
export function shouldShowTimestamp(prevMessage, currentMessage) {
  if (!prevMessage) return true; // 第一条消息始终显示
  
  const prevTime = new Date(prevMessage.timestamp);
  const currTime = new Date(currentMessage.timestamp);
  
  // 如果间隔超过5分钟，显示时间戳
  const diffMinutes = (currTime - prevTime) / (1000 * 60);
  return diffMinutes > 5;
}

/**
 * 格式化消息时间戳显示
 * 今天只显示时间，其他日期显示 "日期 时间"
 * @param {Date|string} timestamp - 消息时间戳
 * @returns {string} 格式化的时间戳显示
 */
export function formatTimestamp(timestamp) {
  const date = new Date(timestamp);
  const today = getStartDate();
  const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  
  const time = formatTime(date);
  
  // 如果是今天，只显示时间
  if (todayDateOnly.getTime() === dateOnly.getTime()) {
    return time;
  }
  
  // 其他日期显示“日期 时间”
  return `${formatDateFull(date)} ${time}`;
}

/**
 * 格式化朋友圈日期显示（M月D日格式）
 * @param {Date} date - 日期对象
 * @returns {string} 格式化的日期字符串
 */
export function formatMomentDate(date) {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${month}月${day}日`;
}

/**
 * 格式化时间戳为 HH:MM 格式
 * @param {Date|string} timestamp - 时间戳
 * @returns {string} 格式化的时间字符串
 */
export function formatTime(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
}

/**
 * 格式化消息时间显示（用于联系人列表）
 * @param {Date|string} timestamp - 消息时间戳
 * @param {Date} referenceDate - 参考日期
 * @returns {string} 格式化的时间显示
 */
export function formatMessageTime(timestamp, referenceDate = null) {
  const date = new Date(timestamp);
  const ref = referenceDate || getStartDate();
  const refDateOnly = new Date(ref.getFullYear(), ref.getMonth(), ref.getDate());
  const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.floor((refDateOnly - dateOnly) / (1000 * 60 * 60 * 24));
  
  const time = formatTime(date);
  
  if (diffDays === 0) {
    return time;
  }
  return time;
}
