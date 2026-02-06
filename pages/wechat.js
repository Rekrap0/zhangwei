import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useRouter } from 'next/router';
import { useGameState } from '../hooks/useGameState';
import { getPlayerCookies } from '../utils/cookies';
import { formatDateShort, shouldShowTimestamp, formatTimestamp, getRelativeDate, formatMomentDate } from '../utils/chatDates';
import { generateZhangweiMessages, getZhangweiContact } from '../data/zhangweiChat';
import { IoChatbubbleEllipsesSharp, IoPersonSharp, IoCompassSharp, IoPersonCircleSharp, IoHeartOutline, IoHeart, IoChatbubbleOutline } from 'react-icons/io5';
import { IoMdArrowBack, IoMdCall } from 'react-icons/io';
import { BsThreeDots, BsImage } from 'react-icons/bs';
import { MdOutlineInsertEmoticon } from 'react-icons/md';
import { FaCamera } from 'react-icons/fa';

// 生成初始消息的函数（会在客户端调用以获取动态日期）
function getInitialMessages() {
    return {
        zhangwei: generateZhangweiMessages(),
        filehelper: [],
        wechatteam: [
            { id: 1, sender: 'wechatteam', content: '欢迎使用微信', timestamp: new Date().toISOString(), time: '09:00', type: 'text' },
        ],
    };
}

// localStorage 存储键名
const MESSAGES_STORAGE_KEY = 'zhangwei_wechat_messages';
const CONTACTS_STORAGE_KEY = 'zhangwei_wechat_contacts';

// 从 localStorage 加载消息
function loadMessagesFromStorage() {
    if (typeof window === 'undefined') return null;
    try {
        const stored = localStorage.getItem(MESSAGES_STORAGE_KEY);
        if (stored) {
            console.log('[Wechat] 从 localStorage 加载消息');
            return JSON.parse(stored);
        }
    } catch (error) {
        console.error('[Wechat] 加载消息失败:', error);
    }
    return null;
}

// 保存消息到 localStorage
function saveMessagesToStorage(messages) {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify(messages));
        console.log('[Wechat] 消息已保存到 localStorage');
    } catch (error) {
        console.error('[Wechat] 保存消息失败:', error);
    }
}

// 从 localStorage 加载联系人状态
function loadContactsFromStorage() {
    if (typeof window === 'undefined') return null;
    try {
        const stored = localStorage.getItem(CONTACTS_STORAGE_KEY);
        if (stored) {
            console.log('[Wechat] 从 localStorage 加载联系人');
            return JSON.parse(stored);
        }
    } catch (error) {
        console.error('[Wechat] 加载联系人失败:', error);
    }
    return null;
}

// 保存联系人状态到 localStorage
function saveContactsToStorage(contacts) {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem(CONTACTS_STORAGE_KEY, JSON.stringify(contacts));
        console.log('[Wechat] 联系人已保存到 localStorage');
    } catch (error) {
        console.error('[Wechat] 保存联系人失败:', error);
    }
}

// 生成联系人数据的函数
function getContacts() {
    const zhangwei = getZhangweiContact();
    const today = getRelativeDate(0);

    return [
        {
            ...zhangwei,
            lastMessage: '一个星期了，你到底去哪了？',
            time: formatDateShort(today),
            unread: 0,
        },
        {
            id: 'filehelper',
            name: '文件传输助手',
            avatarImg: '/avatarTransfer.jpg',
            lastMessage: '暂无新消息',
            time: '昨天',
            unread: 0,
        },
        {
            id: 'wechatteam',
            name: '微信团队',
            avatarImg: '/avatarWechat.jpg',
            lastMessage: '欢迎使用微信',
            time: '3天前',
            unread: 0,
        },
    ];
}

// 底部导航配置
const NAV_ITEMS = [
    { id: 'chat', label: '微信', icon: IoChatbubbleEllipsesSharp },
    { id: 'contacts', label: '通讯录', icon: IoPersonSharp },
    { id: 'discover', label: '发现', icon: IoCompassSharp },
    { id: 'me', label: '我', icon: IoPersonCircleSharp },
];

// 头像组件
function Avatar({ contact, size = 'md', onClick }) {
    const sizeClasses = {
        sm: 'w-8 h-8 text-sm',
        md: 'w-12 h-12 text-lg',
        lg: 'w-20 h-20 text-3xl',
    };

    // 如果有图片头像
    if (contact.avatarImg) {
        return (
            <button
                onClick={onClick}
                className={`${sizeClasses[size]} rounded-lg overflow-hidden flex-shrink-0 hover:opacity-90 transition-opacity`}
            >
                <img
                    src={contact.avatarImg}
                    alt={contact.name || '头像'}
                    className="w-full h-full object-cover"
                />
            </button>
        );
    }

    // 文字头像
    return (
        <button
            onClick={onClick}
            className={`${sizeClasses[size]} rounded-lg bg-gradient-to-br ${contact.avatarBg || 'from-gray-400 to-gray-500'} flex items-center justify-center text-white font-bold flex-shrink-0 hover:opacity-90 transition-opacity`}
        >
            {contact.avatar}
        </button>
    );
}

// 消息列表项
function ChatListItem({ contact, isActive, onClick }) {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 transition-colors ${isActive ? 'bg-gray-200' : ''
                }`}
        >
            <div className="relative">
                <Avatar contact={contact} />
                {contact.unread > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold px-1">
                        {contact.unread > 99 ? '99+' : contact.unread}
                    </span>
                )}
            </div>
            <div className="flex-1 min-w-0 text-left">
                <div className="flex items-center justify-between">
                    <h3 className="font-medium text-gray-900 truncate">{contact.name}</h3>
                    <span className="text-xs text-gray-400 flex-shrink-0 ml-2">{contact.time}</span>
                </div>
                <p className="text-sm text-gray-500 truncate mt-0.5">{contact.lastMessage}</p>
            </div>
        </button>
    );
}

// 时间戳分隔符组件
function TimestampSeparator({ timestamp }) {
    return (
        <div className="flex justify-center my-3">
            <span className="text-gray-400 text-xs">
                {formatTimestamp(timestamp)}
            </span>
        </div>
    );
}

// 系统消息组件
function SystemMessage({ message }) {
    return (
        <div className="flex justify-center my-2">
            <div className="bg-gray-200 text-gray-500 text-xs px-3 py-1 rounded max-w-[80%] text-center">
                {message.content}
                {message.meta?.subtext && (
                    <span className="block text-gray-400 text-xs mt-0.5">{message.meta.subtext}</span>
                )}
            </div>
        </div>
    );
}

// 通话消息组件
function CallMessage({ message, contact, isMe, onAvatarClick }) {
    const myContact = {
        avatarImg: '/avatarPlayer.jpg',
        name: '我',
    };
    const currentContact = isMe ? myContact : contact;

    return (
        <div className={`flex gap-2 ${isMe ? 'flex-row-reverse' : ''}`}>
            <Avatar
                contact={currentContact}
                size="sm"
                onClick={() => !isMe && onAvatarClick?.()}
            />
            <div className={`max-w-[70%] ${isMe ? 'items-end' : 'items-start'}`}>
                <div className="bg-white px-3 py-2 rounded-lg flex items-center gap-2">
                    <IoMdCall className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-700">
                        {message.content}
                    </span>
                </div>
            </div>
        </div>
    );
}

// 图片/表情包消息组件
function MediaMessage({ message, contact, isMe, onAvatarClick }) {
    const myContact = {
        avatarImg: '/avatarPlayer.jpg',
        name: '我',
    };
    const currentContact = isMe ? myContact : contact;

    const isSticker = message.type === 'sticker';
    const isImage = message.type === 'image';

    return (
        <div className={`flex gap-2 ${isMe ? 'flex-row-reverse' : ''}`}>
            <Avatar
                contact={currentContact}
                size="sm"
                onClick={() => !isMe && onAvatarClick?.()}
            />
            <div className={`max-w-[70%] ${isMe ? 'items-end' : 'items-start'}`}>
                {isImage ? (
                    <div className="bg-white p-2 rounded-lg">
                        <div className="w-40 h-28 bg-gray-100 rounded flex items-center justify-center">
                            <BsImage className="w-8 h-8 text-gray-400" />
                        </div>
                        {message.meta?.description && (
                            <p className="text-xs text-gray-400 mt-1 max-w-40">{message.meta.description}</p>
                        )}
                    </div>
                ) : (
                    <div className="bg-white p-2 rounded-lg">
                        <div className="w-24 h-24 bg-gray-50 rounded flex items-center justify-center">
                            <MdOutlineInsertEmoticon className="w-12 h-12 text-yellow-400" />
                        </div>
                        {message.meta?.description && (
                            <p className="text-xs text-gray-400 mt-1 text-center">{message.meta.description}</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

// 聊天气泡
function ChatBubble({ message, contact, isMe, onAvatarClick }) {
    const myContact = {
        avatarImg: '/avatarPlayer.jpg',
        name: '我',
    };

    const currentContact = isMe ? myContact : contact;

    return (
        <div className={`flex gap-2 ${isMe ? 'flex-row-reverse' : ''}`}>
            <Avatar
                contact={currentContact}
                size="sm"
                onClick={() => !isMe && onAvatarClick?.()}
            />
            <div className={`max-w-[70%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                <div
                    className={`px-3 py-2 rounded-lg ${isMe
                            ? 'bg-[#95EC69] text-gray-900'
                            : 'bg-white text-gray-900'
                        }`}
                >
                    <p className="text-sm leading-relaxed break-words">{message.content}</p>
                </div>
            </div>
        </div>
    );
}

// 聊天界面
function ChatView({ contact, messages, onBack, onSendMessage, onAvatarClick, isMobile }) {
    const messagesEndRef = useRef(null);
    const [inputValue, setInputValue] = useState('');

    // 滚动到底部
    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, scrollToBottom]);

    const handleSend = () => {
        if (inputValue.trim()) {
            onSendMessage(inputValue.trim());
            setInputValue('');
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    // 渲染单条消息
    const renderMessage = (msg, index, allMessages) => {
        const prevMsg = index > 0 ? allMessages[index - 1] : null;
        const isMe = msg.sender === 'player' || msg.sender === 'me';

        // 判断是否显示时间戳（玩家新发的消息不显示时间戳）
        // 通过检查 id 是否为数字（时间戳）来判断是否是新发送的消息
        const isPlayerNewMessage = isMe && typeof msg.id === 'number' && msg.id > 1000000000;
        const showTimestamp = !isPlayerNewMessage && shouldShowTimestamp(prevMsg, msg);

        const elements = [];

        // 添加时间戳分隔符
        if (showTimestamp) {
            elements.push(
                <TimestampSeparator key={`ts-${msg.id}`} timestamp={msg.timestamp} />
            );
        }

        // 根据消息类型渲染不同组件
        if (msg.type === 'system') {
            elements.push(
                <SystemMessage key={msg.id} message={msg} />
            );
        } else if (msg.type === 'call') {
            elements.push(
                <CallMessage
                    key={msg.id}
                    message={msg}
                    contact={contact}
                    isMe={isMe}
                    onAvatarClick={() => onAvatarClick(contact)}
                />
            );
        } else if (msg.type === 'image' || msg.type === 'sticker') {
            elements.push(
                <MediaMessage
                    key={msg.id}
                    message={msg}
                    contact={contact}
                    isMe={isMe}
                    onAvatarClick={() => onAvatarClick(contact)}
                />
            );
        } else {
            elements.push(
                <ChatBubble
                    key={msg.id}
                    message={msg}
                    contact={contact}
                    isMe={isMe}
                    onAvatarClick={() => onAvatarClick(contact)}
                />
            );
        }

        return elements;
    };

    return (
        <div className="flex flex-col h-full bg-[#EDEDED]">
            {/* 聊天头部 */}
            <header className="bg-[#EDEDED] px-4 py-3 flex items-center justify-between border-b border-gray-300">
                <div className="flex items-center gap-3">
                    {isMobile && (
                        <button onClick={onBack} className="p-1 -ml-1 text-gray-600">
                            <IoMdArrowBack className="w-6 h-6" />
                        </button>
                    )}
                    <h2 className="font-medium text-gray-900">{contact.name}</h2>
                </div>
                <button onClick={() => onAvatarClick(contact)} className="p-1 text-gray-600">
                    <BsThreeDots className="w-5 h-5" />
                </button>
            </header>

            {/* 消息区域 */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg, index) => renderMessage(msg, index, messages))}
                <div ref={messagesEndRef} />
            </div>

            {/* 输入区域 */}
            <div className="bg-[#F7F7F7] px-4 py-3 border-t border-gray-300">
                <div className="flex items-end gap-2">
                    <div className="flex-1 bg-white rounded-lg border border-gray-300">
                        <textarea
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="输入消息..."
                            rows={1}
                            className="w-full px-3 py-2 text-sm resize-none focus:outline-none rounded-lg"
                            style={{ maxHeight: '100px' }}
                        />
                    </div>
                    <button
                        onClick={handleSend}
                        disabled={!inputValue.trim()}
                        className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${inputValue.trim()
                                ? 'bg-[#07C160] text-white hover:bg-[#06AD56]'
                                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            }`}
                    >
                        发送
                    </button>
                </div>
            </div>
        </div>
    );
}

// 朋友圈单条动态组件
function MomentItem({ moment, contact }) {
    const [liked, setLiked] = useState(false);
    const [imgErrors, setImgErrors] = useState({});

    const handleImgError = (idx) => {
        setImgErrors(prev => ({ ...prev, [idx]: true }));
    };

    return (
        <div className="bg-white px-4 py-3 border-b border-gray-100">
            <div className="flex gap-3">
                <Avatar contact={contact} size="sm" />
                <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-[#576B95] text-sm">{contact.name}</h4>
                    <p className="text-sm text-gray-900 mt-1 whitespace-pre-wrap">{moment.content}</p>
                    
                    {/* 图片展示 */}
                    {moment.images && moment.images.length > 0 && (
                        <div className={`mt-2 grid gap-1 ${moment.images.length === 1 ? 'grid-cols-1 max-w-[200px]' : 'grid-cols-3 max-w-[280px]'}`}>
                            {moment.images.map((img, idx) => (
                                <div key={idx} className="aspect-square bg-gray-100 rounded overflow-hidden relative">
                                    {img.src && !imgErrors[idx] ? (
                                        <img 
                                            src={img.src} 
                                            alt={img.alt || ''} 
                                            className="w-full h-full object-cover" 
                                            onError={() => handleImgError(idx)}
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                                            <BsImage className="w-8 h-8 text-gray-300" />
                                        </div>
                                    )}
                                    {/* 如果图片有特殊标记（如QQ号），显示图片描述 */}
                                    {img.overlay && (
                                        <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs px-1 py-0.5 text-center">
                                            {img.overlay}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* 时间和互动 */}
                    <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-400">{moment.time}</span>
                        <button 
                            onClick={() => setLiked(!liked)}
                            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                        >
                            {liked ? <IoHeart className="w-4 h-4 text-red-500" /> : <IoHeartOutline className="w-4 h-4" />}
                        </button>
                    </div>

                    {/* 点赞列表 */}
                    {moment.likes && moment.likes.length > 0 && (
                        <div className="mt-2 bg-gray-50 px-2 py-1 rounded text-xs text-[#576B95]">
                            <IoHeart className="w-3 h-3 inline mr-1 text-red-400" />
                            {moment.likes.join('，')}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// 朋友圈页面
function MomentsView({ contact, onBack, playerName }) {
    // 计算真实日期（基于开始日期）
    const week1Ago = getRelativeDate(-7);  // 1周前
    const week2Ago = getRelativeDate(-14); // 2周前
    const week3Ago = getRelativeDate(-21); // 3周前
    const week4Ago = getRelativeDate(-28); // 4周前

    // 张薇的朋友圈数据（仅最近一个月可见，共4条）
    // 张薇一周前失联，所以最新的朋友圈是1周前
    const moments = [
        {
            id: 1,
            content: '今天终于放假休息了，出来散步～阳光暖暖的(๑´0`๑)',
            images: [
                { src: '/momentsPark.png', alt: '公园散步' }
            ],
            time: formatMomentDate(week1Ago),
            likes: [playerName || '我'],
        },
        {
            id: 2,
            content: '和新同事一起逛街～她人超好的！',
            images: [
                { src: '/momentsMeet1.png', alt: '逛街合照1' },
                { 
                    src: '/momentsMeet2.png', 
                    alt: '逛街合照2',
                },
                { src: '/momentsMeet3.png', alt: '逛街合照3' },
            ],
            time: formatMomentDate(week2Ago),
            likes: [playerName || '我'],
        },
        {
            id: 3,
            content: '又加班了，组长还带了杯咖啡，杀人诛心啊😭',
            images: [
                { src: '/momentsWorking.jpg', alt: '加班' }
            ],
            time: formatMomentDate(week3Ago),
            likes: [playerName || '我'],
        },
        {
            id: 4,
            content: '妈的谁发明的这玩意儿？？？我以为是新口味可乐结果喝一口直接喷了🤮🤮🤮\n饺子味可乐，可乐味饺子，这世界疯了吧',
            images: [
                { src: '/momentsFun.jpg', alt: '饺子味可乐' }
            ],
            time: formatMomentDate(week4Ago),
            likes: [playerName || '我'],
        },
    ];

    return (
        <div className="flex flex-col h-full bg-[#F5F5F5]">
            {/* 头部 */}
            <header className="bg-[#EDEDED] px-4 py-3 flex items-center gap-3 border-b border-gray-300">
                <button onClick={onBack} className="p-1 -ml-1 text-gray-600">
                    <IoMdArrowBack className="w-6 h-6" />
                </button>
                <h2 className="font-medium text-gray-900">朋友圈</h2>
            </header>

            {/* 封面和头像区域 */}
            <div className="relative">
                <div className="h-32 overflow-hidden">
                    <img 
                        src="/momentsBanner.jpg" 
                        alt="朋友圈封面" 
                        className="w-full h-full object-cover"
                    />
                </div>
                <div className="absolute -bottom-8 right-4 flex items-end gap-2">
                    <span className="text-white text-sm font-medium drop-shadow-md mb-10">{contact.name}</span>
                    <Avatar contact={contact} size="lg" />
                </div>
            </div>

            {/* 朋友圈内容 */}
            <div className="flex-1 overflow-y-auto mt-10">
                {moments.map((moment) => (
                    <MomentItem key={moment.id} moment={moment} contact={contact} />
                ))}

                {/* 底部提示 */}
                <div className="py-6 px-4 text-center">
                    <p className="text-sm text-gray-400">—— 对方设置朋友圈仅近一个月内容可见 ——</p>
                </div>
            </div>
        </div>
    );
}

// 用户详情页
function ProfileView({ contact, onBack, onOpenSettings, onOpenMoments, isMobile }) {
    return (
        <div className="flex flex-col h-full bg-white">
            {/* 头部 */}
            <header className="bg-[#EDEDED] px-4 py-3 flex items-center justify-between border-b border-gray-300">
                <div className="flex items-center gap-3">
                    <button onClick={onBack} className="p-1 -ml-1 text-gray-600">
                        <IoMdArrowBack className="w-6 h-6" />
                    </button>
                    <h2 className="font-medium text-gray-900">个人信息</h2>
                </div>
                <button onClick={onOpenSettings} className="p-1 text-gray-600">
                    <BsThreeDots className="w-5 h-5" />
                </button>
            </header>

            {/* 用户信息卡片 */}
            <div className="p-4">
                <div className="flex items-center gap-4 pb-4 border-b border-gray-200">
                    <Avatar contact={contact} size="lg" />
                    <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900">{contact.name}</h3>
                        <p className="text-sm text-gray-500 mt-1">微信号：{contact.id}</p>
                        {contact.region && (
                            <p className="text-sm text-gray-500">地区：{contact.region}</p>
                        )}
                    </div>
                </div>

                {/* 朋友圈入口 - 仅张薇显示 */}
                {contact.id === 'zhangwei' && (
                    <button 
                        onClick={onOpenMoments}
                        className="w-full py-4 border-b border-gray-200 flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <FaCamera className="w-5 h-5 text-gray-500" />
                            <span className="text-gray-900">朋友圈</span>
                        </div>
                        <div className="flex items-center gap-2">
                            {/* 朋友圈预览小图 */}
                            <div className="flex -space-x-1">
                                <div className="w-8 h-8 bg-gray-200 rounded border border-white"></div>
                                <div className="w-8 h-8 bg-gray-300 rounded border border-white"></div>
                                <div className="w-8 h-8 bg-gray-200 rounded border border-white"></div>
                            </div>
                            <IoMdArrowBack className="w-5 h-5 text-gray-400 rotate-180" />
                        </div>
                    </button>
                )}

                {/* 个性签名 */}
                {contact.signature && (
                    <div className="py-4 border-b border-gray-200">
                        <p className="text-sm text-gray-500 mb-1">个性签名</p>
                        <p className="text-gray-900">{contact.signature}</p>
                    </div>
                )}

                {/* 状态 */}
                {contact.status && (
                    <div className="py-4 border-b border-gray-200">
                        <p className="text-sm text-gray-500 mb-1">状态</p>
                        <p className="text-red-500 font-medium">{contact.status}</p>
                    </div>
                )}

                {/* 操作按钮 */}
                <div className="mt-6 space-y-3">
                    <button className="w-full py-3 bg-[#07C160] text-white rounded-lg font-medium hover:bg-[#06AD56] transition-colors">
                        发消息
                    </button>
                    <button className="w-full py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors">
                        音视频通话
                    </button>
                </div>
            </div>
        </div>
    );
}

// 随机提示语
const LAZY_HINTS = [
    '还是之后再弄吧',
    '现在不是做这件事的时候',
    '这样应该也不会有线索吧',
];

// 好友设置页面
function FriendSettingsView({ contact, onBack, onDeleteFriend }) {
    const [isBlocked, setIsBlocked] = useState(false);
    const [showHint, setShowHint] = useState(false); // 全屏提示遮罩
    const [hintText, setHintText] = useState('');

    const handleAction = () => {
        // 如果已经在显示，点击关闭
        if (showHint) {
            setShowHint(false);
            return;
        }
        // 随机选择一条提示
        const randomHint = LAZY_HINTS[Math.floor(Math.random() * LAZY_HINTS.length)];
        setHintText(randomHint);
        setShowHint(true);
    };

    const handleDeleteFriend = () => {
        // 只有张薇的好友设置才会触发删除结局
        if (contact.id === 'zhangwei') {
            onDeleteFriend();
        } else {
            handleAction();
        }
    };

    return (
        <div className="flex flex-col h-full bg-[#F5F5F5] relative">
            {/* 全屏提示遮罩 */}
            {showHint && (
                <div
                    className="absolute inset-0 bg-black/60 z-50 flex items-center justify-center"
                    onClick={() => setShowHint(false)}
                >
                    <p className="text-white text-lg font-medium px-6 text-center">
                        {hintText}
                    </p>
                </div>
            )}

            {/* 头部 */}
            <header className="bg-[#EDEDED] px-4 py-3 flex items-center gap-3 border-b border-gray-300">
                <button onClick={onBack} className="p-1 -ml-1 text-gray-600">
                    <IoMdArrowBack className="w-6 h-6" />
                </button>
                <h2 className="font-medium text-gray-900">好友设置</h2>
            </header>

            {/* 设置选项 */}
            <div className="flex-1 overflow-y-auto">
                {/* 用户信息 */}
                <div className="bg-white px-4 py-3 flex items-center gap-3 mb-2">
                    <Avatar contact={contact} size="md" />
                    <div>
                        <h3 className="font-medium text-gray-900">{contact.name}</h3>
                        <p className="text-sm text-gray-500">微信号：{contact.id}</p>
                    </div>
                </div>

                {/* 设置项 */}
                <div className="bg-white divide-y divide-gray-100">
                    {/* 修改好友备注 */}
                    <button
                        onClick={handleAction}
                        className="w-full px-4 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                        <span className="text-gray-900">修改好友备注</span>
                        <IoMdArrowBack className="w-5 h-5 text-gray-400 rotate-180" />
                    </button>

                    {/* 隐私 */}
                    <button
                        onClick={handleAction}
                        className="w-full px-4 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                        <span className="text-gray-900">隐私</span>
                        <IoMdArrowBack className="w-5 h-5 text-gray-400 rotate-180" />
                    </button>

                    {/* 分享用户 */}
                    <button
                        onClick={handleAction}
                        className="w-full px-4 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                        <span className="text-gray-900">分享用户</span>
                        <IoMdArrowBack className="w-5 h-5 text-gray-400 rotate-180" />
                    </button>

                    {/* 屏蔽 */}
                    <button
                        onClick={handleAction}
                        className="w-full px-4 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                        <span className="text-gray-900">屏蔽</span>
                        <div
                            className={`w-12 h-7 rounded-full transition-colors relative ${isBlocked ? 'bg-[#07C160]' : 'bg-gray-300'
                                }`}
                        >
                            <div
                                className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${isBlocked ? 'translate-x-5' : 'translate-x-0.5'
                                    }`}
                            />
                        </div>
                    </button>
                </div>

                {/* 删除好友 */}
                <div className="mt-4 bg-white">
                    <button
                        onClick={handleDeleteFriend}
                        className="w-full px-4 py-4 flex items-center justify-center hover:bg-gray-50 transition-colors"
                    >
                        <span className="text-red-500 font-medium">删除好友</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

// 消息列表视图
function ChatListView({ contacts, activeContactId, onSelectContact }) {
    return (
        <div className="flex flex-col h-full bg-white">
            {/* 搜索栏 */}
            <div className="px-3 py-2 bg-[#EDEDED]">
                <div className="bg-white rounded-lg px-3 py-2 flex items-center gap-2">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        type="text"
                        placeholder="搜索"
                        className="flex-1 text-sm bg-transparent focus:outline-none"
                    />
                </div>
            </div>

            {/* 聊天列表 */}
            <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
                {contacts.map((contact) => (
                    <ChatListItem
                        key={contact.id}
                        contact={contact}
                        isActive={activeContactId === contact.id}
                        onClick={() => onSelectContact(contact)}
                    />
                ))}
            </div>
        </div>
    );
}

// 底部导航栏
function BottomNav({ activeTab, onTabChange }) {
    return (
        <nav className="bg-[#F7F7F7] border-t border-gray-300 px-2 py-1 safe-area-pb">
            <div className="flex justify-around">
                {NAV_ITEMS.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => onTabChange(item.id)}
                            className={`flex flex-col items-center gap-0.5 py-1 px-4 ${isActive ? 'text-[#07C160]' : 'text-gray-500'
                                }`}
                        >
                            <Icon className="w-6 h-6" />
                            <span className="text-xs">{item.label}</span>
                        </button>
                    );
                })}
            </div>
        </nav>
    );
}

// 主页面组件
export default function Wechat() {
    const router = useRouter();
    const { state, updateState } = useGameState();
    const [activeTab, setActiveTab] = useState('chat');

    // 检查是否有玩家cookies，没有则重定向到开始页面
    useEffect(() => {
        const { playerName, startDate } = getPlayerCookies();
        if (!playerName || !startDate) {
            router.replace('/');
        }
    }, [router]);

    // 初始化消息和联系人（需要在客户端执行以获取cookies中的日期）
    const [contacts, setContacts] = useState([]);
    const [activeContact, setActiveContact] = useState(null);
    // 按联系人ID存储消息 { contactId: [...messages] }
    const [messagesByContact, setMessagesByContact] = useState({});
    const [showProfile, setShowProfile] = useState(false);
    const [showFriendSettings, setShowFriendSettings] = useState(false);
    const [showMoments, setShowMoments] = useState(false);
    const [profileContact, setProfileContact] = useState(null);
    const [isMobile, setIsMobile] = useState(false);
    const [isHydrated, setIsHydrated] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);
    const [playerName, setPlayerName] = useState('');

    // 检测屏幕宽度和获取玩家名称 - 仅在客户端执行
    useEffect(() => {
        setIsHydrated(true);
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        
        // 获取玩家名称
        const { playerName: name } = getPlayerCookies();
        if (name) setPlayerName(name);
        
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // 初始化动态数据（基于cookies中的开始日期）
    useEffect(() => {
        if (!isHydrated) return;

        // 尝试从localStorage加载
        const storedMessages = loadMessagesFromStorage();
        const storedContacts = loadContactsFromStorage();

        // 生成基于开始日期的动态数据
        const dynamicContacts = getContacts();
        const dynamicMessages = getInitialMessages();

        if (storedMessages && Object.keys(storedMessages).length > 0) {
            // 如果有存储的消息，使用存储的
            setMessagesByContact(storedMessages);
        } else {
            // 否则使用动态生成的初始消息
            setMessagesByContact(dynamicMessages);
        }

        if (storedContacts && storedContacts.length > 0) {
            // 合并存储的联系人状态与动态联系人数据
            setContacts(dynamicContacts.map(c => {
                const stored = storedContacts.find(sc => sc.id === c.id);
                return stored ? { ...c, ...stored } : c;
            }));
        } else {
            setContacts(dynamicContacts);
        }

        setIsInitialized(true);
    }, [isHydrated]);

    // 保存消息到 localStorage
    useEffect(() => {
        if (isInitialized && Object.keys(messagesByContact).length > 0) {
            saveMessagesToStorage(messagesByContact);
        }
    }, [messagesByContact, isInitialized]);

    // 保存联系人到 localStorage
    useEffect(() => {
        if (isInitialized && contacts.length > 0) {
            saveContactsToStorage(contacts);
        }
    }, [contacts, isInitialized]);

    // 获取当前联系人的消息
    const currentMessages = activeContact ? (messagesByContact[activeContact.id] || []) : [];

    // 选择联系人
    const handleSelectContact = (contact) => {
        setActiveContact(contact);
        setShowProfile(false);
        // 清除未读消息
        setContacts((prev) =>
            prev.map((c) => (c.id === contact.id ? { ...c, unread: 0 } : c))
        );
    };

    // 发送消息
    const handleSendMessage = (content) => {
        if (!activeContact) return;

        const now = new Date();
        const newMessage = {
            id: Date.now(),
            sender: 'player',
            content,
            timestamp: now.toISOString(),
            time: now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
            type: 'text',
        };

        // 更新对应联系人的消息列表
        setMessagesByContact((prev) => ({
            ...prev,
            [activeContact.id]: [...(prev[activeContact.id] || []), newMessage],
        }));

        // 更新游戏状态
        updateState((prev) => ({
            messageCount: prev.messageCount + 1,
        }));

        // 更新联系人最后消息
        setContacts((prev) =>
            prev.map((c) =>
                c.id === activeContact.id
                    ? { ...c, lastMessage: content, time: newMessage.time }
                    : c
            )
        );
    };

    // 查看用户资料
    const handleViewProfile = (contact) => {
        setProfileContact(contact);
        setShowProfile(true);
        setShowFriendSettings(false);
        setShowMoments(false);
    };

    // 打开好友设置
    const handleOpenFriendSettings = () => {
        setShowFriendSettings(true);
        setShowMoments(false);
    };

    // 打开朋友圈
    const handleOpenMoments = () => {
        setShowMoments(true);
        setShowFriendSettings(false);
    };

    // 返回用户资料页（从朋友圈或设置）
    const handleBackFromMoments = () => {
        setShowMoments(false);
    };

    // 返回用户资料页
    const handleBackFromSettings = () => {
        setShowFriendSettings(false);
    };

    // 删除好友（结局1）
    const handleDeleteFriend = () => {
        router.push('/end1_5zhUd_x7Kp');
    };

    // 返回聊天
    const handleBackFromProfile = () => {
        setShowProfile(false);
        setShowFriendSettings(false);
        setShowMoments(false);
    };

    // 返回消息列表（移动端）
    const handleBackToList = () => {
        setActiveContact(null);
        setShowProfile(false);
        setShowFriendSettings(false);
        setShowMoments(false);
    };

    // 渲染主内容区域
    const renderContent = () => {
        // 显示朋友圈页面
        if (showMoments && profileContact) {
            return (
                <MomentsView
                    contact={profileContact}
                    onBack={handleBackFromMoments}
                    playerName={playerName}
                />
            );
        }

        // 显示好友设置页面
        if (showFriendSettings && profileContact) {
            return (
                <FriendSettingsView
                    contact={profileContact}
                    onBack={handleBackFromSettings}
                    onDeleteFriend={handleDeleteFriend}
                />
            );
        }

        // 显示用户资料页
        if (showProfile && profileContact) {
            return (
                <ProfileView
                    contact={profileContact}
                    onBack={handleBackFromProfile}
                    onOpenSettings={handleOpenFriendSettings}
                    onOpenMoments={handleOpenMoments}
                    isMobile={isMobile}
                />
            );
        }

        // 移动端布局
        if (isMobile) {
            if (activeContact) {
                return (
                    <ChatView
                        contact={activeContact}
                        messages={currentMessages}
                        onBack={handleBackToList}
                        onSendMessage={handleSendMessage}
                        onAvatarClick={handleViewProfile}
                        isMobile={true}
                    />
                );
            }
            return (
                <ChatListView
                    contacts={contacts}
                    activeContactId={null}
                    onSelectContact={handleSelectContact}
                />
            );
        }

        // 桌面端布局 - 左右分栏
        return (
            <div className="flex h-full">
                {/* 左侧消息列表 - 1/3 */}
                <div className="w-1/3 border-r border-gray-300 flex flex-col">
                    <ChatListView
                        contacts={contacts}
                        activeContactId={activeContact?.id}
                        onSelectContact={handleSelectContact}
                    />
                </div>

                {/* 右侧聊天区域 - 2/3 */}
                <div className="flex-1 flex flex-col">
                    {activeContact ? (
                        <ChatView
                            contact={activeContact}
                            messages={currentMessages}
                            onBack={handleBackToList}
                            onSendMessage={handleSendMessage}
                            onAvatarClick={handleViewProfile}
                            isMobile={false}
                        />
                    ) : (
                        <div className="flex-1 flex items-center justify-center bg-[#F5F5F5]">
                            <p className="text-gray-400">选择一个聊天开始对话</p>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    // 等待客户端水合和初始化完成，避免 hydration mismatch
    if (!isHydrated || !isInitialized) {
        return (
            <div className="flex flex-col bg-[#EDEDED]" style={{ height: '100dvh' }}>
                <main className="flex-1 overflow-hidden flex items-center justify-center">
                    <p className="text-gray-400">加载中...</p>
                </main>
                <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
            </div>
        );
    }

    return (
        <div className="flex flex-col bg-[#EDEDED]" style={{ height: '100dvh' }}>
            {/* 主内容区域 */}
            <main className="flex-1 overflow-hidden">
                {activeTab === 'chat' ? (
                    renderContent()
                ) : (
                    <div className="h-full flex items-center justify-center bg-white">
                        <p className="text-gray-400">
                            {activeTab === 'contacts' && '通讯录功能开发中...'}
                            {activeTab === 'discover' && '发现功能开发中...'}
                            {activeTab === 'me' && '我的页面开发中...'}
                        </p>
                    </div>
                )}
            </main>

            {/* 底部导航 - 仅在非聊天详情页显示（移动端）或始终显示（桌面端） */}
            {(!isMobile || (!activeContact && !showProfile)) && (
                <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
            )}
        </div>
    );
}
