/**
 * 可搜索的应用列表
 * 桌面搜索框通过关键词匹配应用
 */
export const appList = [
  {
    id: 'wechat',
    name: '微信',
    keywords: ['微信', 'wechat', 'wx', 'weixin', '聊天'],
    route: '/wechat',
    iconType: 'wechat',
  },
  {
    id: 'chrome',
    name: 'Chrome',
    keywords: ['chrome', '浏览器', 'browser', 'google', '谷歌', '搜索', '上网'],
    route: '/chrome',
    iconType: 'chrome',
  },
  {
    id: 'qq',
    name: 'QQ',
    keywords: ['qq', 'QQ', '企鹅', '腾讯'],
    route: '/qq',
    iconType: 'qq',
  },
  {
    id: 'weibo',
    name: '微博',
    keywords: ['微博', 'weibo', '新浪', '新浪微博', 'sina', 'wb'],
    route: '/weibo',
    iconType: 'weibo',
  },
];
