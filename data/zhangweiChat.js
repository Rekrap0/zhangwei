/**
 * 张薇聊天记录数据
 * 基于玩家开始日期动态生成
 */

import { getRelativeDate, getZhangweiBirthday, formatDateFull } from '../utils/chatDates';

/**
 * 创建消息对象
 * @param {Object} params - 消息参数
 * @returns {Object} 消息对象
 */
function createMessage({ id, sender, content, date, time, type = 'text', meta = null }) {
  const timestamp = new Date(date);
  const [hours, minutes] = time.split(':').map(Number);
  timestamp.setHours(hours, minutes, 0, 0);
  
  return {
    id,
    sender,
    content,
    timestamp: timestamp.toISOString(),
    time,
    type,
    meta, // 可用于特殊消息类型（图片描述、系统提示等）
  };
}

/**
 * 生成张薇的聊天记录
 * @returns {Array} 聊天消息数组
 */
export function generateZhangweiMessages() {
  const birthday = getZhangweiBirthday();
  
  // 关键日期（相对于玩家开始日期）
  const day14Ago = getRelativeDate(-14); // 两周前，气氛尚正常
  const day12Ago = getRelativeDate(-12); // 埋藏生日线索
  const day8Ago = getRelativeDate(-8);   // 开始出现异样
  const day7Ago = getRelativeDate(-7);   // 失联前夕
  const birthdayDate = getRelativeDate(-6); // 生日当天
  const day5Ago = getRelativeDate(-5);   // 失联中
  const today = getRelativeDate(0);       // 今天
  
  let messageId = 1;
  const messages = [];

  // ========== 两周前 (day14Ago) - 气氛尚正常 ==========
  messages.push(createMessage({
    id: messageId++,
    sender: 'zhangwei',
    content: '[图片]',
    date: day14Ago,
    time: '10:23',
    type: 'image',
    meta: { description: '一张杂乱的办公桌，堆满了速溶咖啡，屏幕上全是密密麻麻的代码和表格' },
  }));
  
  messages.push(createMessage({
    id: messageId++,
    sender: 'zhangwei',
    content: '服了，宏图这边的PM（项目经理）是不是脑子有坑？',
    date: day14Ago,
    time: '10:23',
  }));
  
  messages.push(createMessage({
    id: messageId++,
    sender: 'zhangwei',
    content: '昨天刚标完的几万条数据，今天说格式不对要重来。我真的会谢🙏。',
    date: day14Ago,
    time: '10:23',
  }));
  
  messages.push(createMessage({
    id: messageId++,
    sender: 'player',
    content: '还在加班？这也太压榨了吧。',
    date: day14Ago,
    time: '10:25',
  }));
  
  messages.push(createMessage({
    id: messageId++,
    sender: 'zhangwei',
    content: '没办法呀，为了生活🥲。虽然这公司在郊区，鸟不拉屎的，但给的确实还可以。',
    date: day14Ago,
    time: '10:26',
  }));
  
  messages.push(createMessage({
    id: messageId++,
    sender: 'zhangwei',
    content: '而且最近不知道咋回事，总觉得记性越来越差，可能是熬夜熬傻了。',
    date: day14Ago,
    time: '10:26',
  }));

  // ========== 12天前 (day12Ago) - 埋藏生日线索 ==========
  messages.push(createMessage({
    id: messageId++,
    sender: 'player',
    content: '周末出来吃饭？发现一家很好的火锅。',
    date: day12Ago,
    time: '19:40',
  }));
  
  messages.push(createMessage({
    id: messageId++,
    sender: 'zhangwei',
    content: '别提了，周末全员封闭开发。😭',
    date: day12Ago,
    time: '19:42',
  }));
  
  messages.push(createMessage({
    id: messageId++,
    sender: 'zhangwei',
    content: '我现在就指望撑到下周四了。',
    date: day12Ago,
    time: '19:42',
  }));
  
  messages.push(createMessage({
    id: messageId++,
    sender: 'player',
    content: '下周四咋了？项目上线？',
    date: day12Ago,
    time: '19:43',
  }));
  
  messages.push(createMessage({
    id: messageId++,
    sender: 'zhangwei',
    content: '？？？',
    date: day12Ago,
    time: '19:43',
  }));
  
  messages.push(createMessage({
    id: messageId++,
    sender: 'zhangwei',
    content: '[表情包]',
    date: day12Ago,
    time: '19:43',
    type: 'sticker',
    meta: { description: '猫猫震惊.jpg' },
  }));
  
  messages.push(createMessage({
    id: messageId++,
    sender: 'zhangwei',
    content: `你是不是忘了？那天我生日啊大哥！！👊`,
    date: day12Ago,
    time: '19:44',
  }));
  
  messages.push(createMessage({
    id: messageId++,
    sender: 'player',
    content: '啊！抱歉抱歉，最近忙晕了。',
    date: day12Ago,
    time: '19:45',
  }));
  
  messages.push(createMessage({
    id: messageId++,
    sender: 'zhangwei',
    content: '哼，原谅你了。那天我特意请了半天假，打算狠狠睡一觉。',
    date: day12Ago,
    time: '19:46',
  }));
  
  messages.push(createMessage({
    id: messageId++,
    sender: 'player',
    content: '那等你睡醒给你补过？',
    date: day12Ago,
    time: '19:46',
  }));
  
  messages.push(createMessage({
    id: messageId++,
    sender: 'zhangwei',
    content: '再看吧，最近主管盯得紧，说是有大客户在审查数据，不允许私自外出。',
    date: day12Ago,
    time: '19:48',
  }));

  // ========== 8天前 (day8Ago) - 开始出现异样 ==========
  messages.push(createMessage({
    id: messageId++,
    sender: 'player',
    content: '你最近回消息好慢，没事吧？',
    date: day8Ago,
    time: '23:15',
  }));
  
  messages.push(createMessage({
    id: messageId++,
    sender: 'zhangwei',
    content: '没事，就是太累了。',
    date: day8Ago,
    time: '23:18',
  }));
  
  messages.push(createMessage({
    id: messageId++,
    sender: 'zhangwei',
    content: '而且很奇怪，我最近老是做梦。',
    date: day8Ago,
    time: '23:18',
  }));
  
  messages.push(createMessage({
    id: messageId++,
    sender: 'zhangwei',
    content: '梦见自己在一片白色的海里游泳，怎么游都游不到岸边。',
    date: day8Ago,
    time: '23:19',
  }));
  
  messages.push(createMessage({
    id: messageId++,
    sender: 'player',
    content: '压力太大了，要不要我这周末去看你？反正我在家也没事，给你带点吃的。',
    date: day8Ago,
    time: '23:20',
  }));
  
  messages.push(createMessage({
    id: messageId++,
    sender: 'zhangwei',
    content: '别！',
    date: day8Ago,
    time: '23:20',
  }));
  
  messages.push(createMessage({
    id: messageId++,
    sender: 'zhangwei',
    content: '呃，我是说，公司现在全封闭管理，外人进不来的，保安很凶。',
    date: day8Ago,
    time: '23:21',
  }));
  
  messages.push(createMessage({
    id: messageId++,
    sender: 'zhangwei',
    content: '等忙完这段时间我去找你吧。一定。',
    date: day8Ago,
    time: '23:21',
  }));
  
  messages.push(createMessage({
    id: messageId++,
    sender: 'player',
    content: '行吧，那你注意休息。',
    date: day8Ago,
    time: '23:22',
  }));

  // ========== 7天前 (day7Ago) - 失联前夕 ==========
  messages.push(createMessage({
    id: messageId++,
    sender: 'zhangwei',
    content: '[语音通话]',
    date: day7Ago,
    time: '03:42',
    type: 'call',
    meta: { status: '对方已取消', duration: null },
  }));
  
  messages.push(createMessage({
    id: messageId++,
    sender: 'zhangwei',
    content: '[语音通话]',
    date: day7Ago,
    time: '03:42',
    type: 'call',
    meta: { status: '对方已取消', duration: null },
  }));
  
  messages.push(createMessage({
    id: messageId++,
    sender: 'zhangwei',
    content: '这里的空调好冷。',
    date: day7Ago,
    time: '03:44',
  }));
  
  messages.push(createMessage({
    id: messageId++,
    sender: 'zhangwei',
    content: '我好像看见我自己了。',
    date: day7Ago,
    time: '03:44',
  }));
  
  messages.push(createMessage({
    id: messageId++,
    sender: 'zhangwei',
    content: '别来找我。',
    date: day7Ago,
    time: '03:44',
  }));

  // ========== 生日当天 (birthdayDate) - 彻底异常 ==========
  messages.push(createMessage({
    id: messageId++,
    sender: 'system',
    content: `张薇 发起语音通话`,
    date: birthdayDate,
    time: '03:00',
    type: 'system',
    meta: { subtext: '(玩家此时在睡觉，未接听)' },
  }));
  
  messages.push(createMessage({
    id: messageId++,
    sender: 'system',
    content: '通话时长 00:00，对方已挂断',
    date: birthdayDate,
    time: '03:00',
    type: 'system',
  }));
  
  messages.push(createMessage({
    id: messageId++,
    sender: 'zhangwei',
    content: 'pleh',
    date: birthdayDate,
    time: '03:01',
  }));
  
  messages.push(createMessage({
    id: messageId++,
    sender: 'player',
    content: '？',
    date: birthdayDate,
    time: '09:30',
  }));
  
  messages.push(createMessage({
    id: messageId++,
    sender: 'player',
    content: '昨晚咋了？三点多给我打电话？',
    date: birthdayDate,
    time: '09:30',
  }));
  
  messages.push(createMessage({
    id: messageId++,
    sender: 'player',
    content: '生日快乐！🎂',
    date: birthdayDate,
    time: '09:31',
  }));
  
  messages.push(createMessage({
    id: messageId++,
    sender: 'player',
    content: '人呢？',
    date: birthdayDate,
    time: '09:35',
  }));

  // ========== 5天前 (day5Ago) ==========
  messages.push(createMessage({
    id: messageId++,
    sender: 'player',
    content: '张薇？',
    date: day5Ago,
    time: '12:00',
  }));
  
  messages.push(createMessage({
    id: messageId++,
    sender: 'player',
    content: '看到回个话，有点担心你了。',
    date: day5Ago,
    time: '12:00',
  }));

  // ========== 今天 (today) ==========
  messages.push(createMessage({
    id: messageId++,
    sender: 'player',
    content: '一个星期了，你到底去哪了？',
    date: today,
    time: '08:00',
  }));

  return messages;
}

/**
 * 获取张薇的联系人信息
 * @returns {Object} 联系人信息
 */
export function getZhangweiContact() {
  return {
    id: 'zhangwei',
    name: '张薇',
    avatarImg: '/avatarWei.png',
    region: '北京',
    signature: '每天都要开心哦~',
  };
}

/**
 * 获取生日密码提示
 * @returns {{ birthday: string, password: string }}
 */
export function getBirthdayHint() {
  const birthday = getZhangweiBirthday();
  return {
    birthday: birthday.formatted,
    password: birthday.mmdd,
  };
}
