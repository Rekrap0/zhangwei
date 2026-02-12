/**
 * Cookie 工具函数
 * 用于管理玩家游戏进度相关的 Cookies
 */

const PLAYER_NAME_KEY = 'zhangwei_player_name';
const START_DATE_KEY = 'zhangwei_start_date';
const QZONE_UNLOCKED_KEY = 'zhangwei_qzone_unlocked';
const ADMIN_AUTH_KEY = 'zhangwei_admin_auth';

// Cookie 过期日期设置为 2099 年
const EXPIRE_DATE = new Date('2099-12-31T23:59:59').toUTCString();

/**
 * 设置 Cookie
 */
export function setCookie(name, value) {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${EXPIRE_DATE}; path=/; SameSite=Lax`;
}

/**
 * 获取 Cookie
 */
export function getCookie(name) {
  if (typeof document === 'undefined') return null;
  
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [cookieName, cookieValue] = cookie.trim().split('=');
    if (cookieName === name) {
      return decodeURIComponent(cookieValue);
    }
  }
  return null;
}

/**
 * 删除 Cookie
 */
export function deleteCookie(name) {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
}

/**
 * 设置玩家信息 Cookies
 */
export function setPlayerCookies(playerName) {
  const currentDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD 格式
  setCookie(PLAYER_NAME_KEY, playerName);
  setCookie(START_DATE_KEY, currentDate);
}

/**
 * 获取玩家信息 Cookies
 */
export function getPlayerCookies() {
  return {
    playerName: getCookie(PLAYER_NAME_KEY),
    startDate: getCookie(START_DATE_KEY),
  };
}

/**
 * 清除所有玩家相关 Cookies
 */
export function clearPlayerCookies() {
  deleteCookie(PLAYER_NAME_KEY);
  deleteCookie(START_DATE_KEY);
  deleteCookie(QZONE_UNLOCKED_KEY);
  deleteCookie(ADMIN_AUTH_KEY);
}

/**
 * 检查玩家是否已开始游戏
 */
export function hasPlayerStarted() {
  const { playerName, startDate } = getPlayerCookies();
  return !!(playerName && startDate);
}

// ============ QQ空间解锁状态 ============

/**
 * 设置QQ空间已解锁
 */
export function setQZoneUnlocked() {
  setCookie(QZONE_UNLOCKED_KEY, 'true');
}

/**
 * 检查QQ空间是否已解锁
 */
export function isQZoneUnlocked() {
  return getCookie(QZONE_UNLOCKED_KEY) === 'true';
}
