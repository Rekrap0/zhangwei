import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useGameState } from '../hooks/useGameState';
import { getPlayerCookies } from '../utils/cookies';
import { formatDateShort, shouldShowTimestamp, formatTimestamp, getRelativeDate, formatMomentDate } from '../utils/chatDates';
import { generateZhangweiMessages, getZhangweiContact } from '../data/zhangweiChat';
import { IoChatbubbleEllipsesSharp, IoPersonSharp, IoCompassSharp, IoPersonCircleSharp, IoHeartOutline, IoHeart, IoChatbubbleOutline, IoQrCodeOutline } from 'react-icons/io5';
import { IoMdArrowBack, IoMdCall } from 'react-icons/io';
import { BsThreeDots, BsImage } from 'react-icons/bs';
import { MdOutlineInsertEmoticon, MdPayment, MdOutlineBookmarkBorder, MdOutlineEmojiEmotions } from 'react-icons/md';
import { FaCamera } from 'react-icons/fa';
import { HiOutlinePhotograph } from 'react-icons/hi';
import { FiSettings } from 'react-icons/fi';
import { useAIChat } from '../hooks/useAIChat';
import { ZHANGWEI_SYSTEM_PROMPT } from '../data/aiPrompts';

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
    const [lightboxOpen, setLightboxOpen] = useState(false);

    return (
        <div className={`flex gap-2 ${isMe ? 'flex-row-reverse' : ''}`}>
            <Avatar
                contact={currentContact}
                size="sm"
                onClick={() => !isMe && onAvatarClick?.()}
            />
            <div className={`max-w-[70%] ${isMe ? 'items-end' : 'items-start'}`}>
                {isImage ? (
                    <div className="bg-white p-2 rounded-lg cursor-pointer" onClick={() => setLightboxOpen(true)}>
                        <img src={message.content} alt="图片" className="w-40 rounded object-cover" />
                    </div>
                ) : (
                    <div className="bg-white p-2 rounded-lg">
                        <img src={message.content} alt="表情包" className="w-24 h-24 rounded object-cover" />
                    </div>
                )}
            </div>
            {lightboxOpen && (
                <div
                    className="fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center cursor-pointer"
                    onClick={() => setLightboxOpen(false)}
                >
                    <img
                        src={message.content}
                        alt="图片"
                        className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}
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
                    {message.isHtml ? (
                        <p className="text-sm leading-relaxed break-words [&_a]:text-[#576B95] [&_a]:underline" dangerouslySetInnerHTML={{ __html: message.content }} />
                    ) : (
                        <p className="text-sm leading-relaxed break-words">{message.content}</p>
                    )}
                </div>
            </div>
        </div>
    );
}

// 聊天界面
function ChatView({ contact, messages, onBack, onSendMessage, onAvatarClick, isMobile, isTyping }) {
    const messagesEndRef = useRef(null);
    const [inputValue, setInputValue] = useState('');

    // 滚动到底部（使用 requestAnimationFrame 确保 DOM 布局完成后再滚动）
    const scrollToBottom = useCallback(() => {
        requestAnimationFrame(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'instant' });
        });
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
                    <h2 className="font-medium text-gray-900">{isTyping ? '对方正在输入…' : contact.name}</h2>
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
    const [lightboxImg, setLightboxImg] = useState(null); // 当前放大查看的图片

    const handleImgError = (idx) => {
        setImgErrors(prev => ({ ...prev, [idx]: true }));
    };

    const openLightbox = (img) => {
        setLightboxImg(img);
    };

    const closeLightbox = () => {
        setLightboxImg(null);
    };

    return (
        <div className="bg-white px-4 py-3 border-b border-gray-100">
            {/* Lightbox 遮罩层 */}
            {lightboxImg && (
                <div 
                    className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4"
                    onClick={closeLightbox}
                >
                    <button 
                        onClick={closeLightbox}
                        className="absolute top-4 right-4 text-white text-3xl font-light hover:text-gray-300 transition-colors z-10"
                    >
                        ×
                    </button>
                    <img 
                        src={lightboxImg.src} 
                        alt={lightboxImg.alt || ''} 
                        className="max-w-full max-h-full object-contain"
                        onClick={(e) => e.stopPropagation()}
                    />
                    {/* 图片描述/overlay 信息 */}
                    {lightboxImg.overlay && (
                        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-lg text-sm">
                            {lightboxImg.overlay}
                        </div>
                    )}
                </div>
            )}

            <div className="flex gap-3">
                <Avatar contact={contact} size="sm" />
                <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-[#576B95] text-sm">{contact.name}</h4>
                    <p className="text-sm text-gray-900 mt-1 whitespace-pre-wrap">{moment.content}</p>
                    
                    {/* 图片展示 */}
                    {moment.images && moment.images.length > 0 && (
                        <div className={`mt-2 grid gap-1 ${moment.images.length === 1 ? 'grid-cols-1 max-w-[200px]' : 'grid-cols-3 max-w-[280px]'}`}>
                            {moment.images.map((img, idx) => (
                                <div 
                                    key={idx} 
                                    className="aspect-square bg-gray-100 rounded overflow-hidden relative cursor-pointer hover:opacity-90 transition-opacity"
                                    onClick={() => img.src && !imgErrors[idx] && openLightbox(img)}
                                >
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
    const e8daysAgo = getRelativeDate(-8);  // 1周前
    const week2Ago = getRelativeDate(-14); // 2周前
    const week3Ago = getRelativeDate(-21); // 3周前
    const week4Ago = getRelativeDate(-28); // 4周前

    // 张薇的朋友圈数据（仅最近一个月可见，共4条）
    // 张薇一周前失联，所以最新的朋友圈是1周前
    const moments = [
        {
            id: 1,
            content: '难得给我批了半天假期，出来散步～阳光暖暖的(๑´0`๑)',
            images: [
                { src: '/momentsPark.png', alt: '公园散步' }
            ],
            time: formatMomentDate(e8daysAgo),
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
            content: '明天就请项目经理喝一瓶😇',
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
function ProfileView({ contact, onBack, onOpenSettings, onOpenMoments, onSendMessage, isMobile }) {
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
                    <button onClick={onSendMessage} className="w-full py-3 bg-[#07C160] text-white rounded-lg font-medium hover:bg-[#06AD56] transition-colors">
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

// 好友设置页面
function FriendSettingsView({ contact, onBack, onDeleteFriend }) {
    const [isBlocked, setIsBlocked] = useState(false);

    const handleDeleteFriend = () => {
        // 只有张薇的好友设置才会触发删除结局
        if (contact.id === 'zhangwei') {
            onDeleteFriend();
        }
    };

    return (
        <div className="flex flex-col h-full bg-[#F5F5F5] relative">
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
                        className="w-full px-4 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                        <span className="text-gray-900">修改好友备注</span>
                        <IoMdArrowBack className="w-5 h-5 text-gray-400 rotate-180" />
                    </button>

                    {/* 隐私 */}
                    <button
                        className="w-full px-4 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                        <span className="text-gray-900">隐私</span>
                        <IoMdArrowBack className="w-5 h-5 text-gray-400 rotate-180" />
                    </button>

                    {/* 分享用户 */}
                    <button
                        className="w-full px-4 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                        <span className="text-gray-900">分享用户</span>
                        <IoMdArrowBack className="w-5 h-5 text-gray-400 rotate-180" />
                    </button>

                    {/* 屏蔽 */}
                    <button
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

// 陌生人详情页（非好友，用于林晓琳等）
function StrangerProfileView({ contact, onBack }) {
    const [showToast, setShowToast] = useState(false);

    const handleAddContact = () => {
        setShowToast(true);
        setTimeout(() => setShowToast(false), 7777);
    };

    return (
        <div className="flex flex-col h-full bg-white relative">
            {/* Toast */}
            {showToast && (
                <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[200] bg-black/70 text-white text-sm px-6 py-3 rounded-lg pointer-events-none animate-fade-in">
                    好友申请已发送
                </div>
            )}

            {/* 头部 */}
            <header className="bg-[#EDEDED] px-4 py-3 flex items-center justify-between border-b border-gray-300">
                <div className="flex items-center gap-3">
                    <button onClick={onBack} className="p-1 -ml-1 text-gray-600">
                        <IoMdArrowBack className="w-6 h-6" />
                    </button>
                    <h2 className="font-medium text-gray-900">个人信息</h2>
                </div>
                <button className="p-1 text-gray-600">
                    <BsThreeDots className="w-5 h-5" />
                </button>
            </header>

            {/* 用户信息卡片 */}
            <div className="p-4">
                <div className="flex items-center gap-4 pb-4 border-b border-gray-200">
                    <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                        <img
                            src={contact.avatarImg}
                            alt={contact.name}
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900">{contact.name}</h3>
                        <p className="text-sm text-gray-500 mt-1">微信号：{contact.wechatId || contact.id}</p>
                        {contact.region && (
                            <p className="text-sm text-gray-500">地区：{contact.region}</p>
                        )}
                    </div>
                </div>

                {/* 个性签名 */}
                {contact.signature && (
                    <div className="py-4 border-b border-gray-200">
                        <p className="text-sm text-gray-500 mb-1">个性签名</p>
                        <p className="text-gray-900">{contact.signature}</p>
                    </div>
                )}

                {/* 操作按钮 */}
                <div className="mt-6">
                    <button
                        onClick={handleAddContact}
                        className="w-full py-3 bg-[#07C160] text-white rounded-lg font-medium hover:bg-[#06AD56] transition-colors"
                    >
                        添加到通讯录
                    </button>
                </div>
            </div>
        </div>
    );
}

// 封禁账号页面
function BannedAccountView({ onBack }) {
    return (
        <div className="flex flex-col h-full bg-white">
            <header className="bg-[#EDEDED] px-4 py-3 flex items-center gap-3 border-b border-gray-300">
                <button onClick={onBack} className="p-1 -ml-1 text-gray-600">
                    <IoMdArrowBack className="w-6 h-6" />
                </button>
                <h2 className="font-medium text-gray-900">公众号</h2>
            </header>
            <div className="flex-1 flex flex-col items-center justify-center px-6">
                <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center mb-6 shadow-lg">
                    <span className="text-white text-4xl font-bold">!</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">帐号被永久封禁</h3>
                <p className="text-gray-500 text-sm text-center leading-relaxed mb-8">
                    根据相关法律法规和政策的要求，此帐号已被永久屏蔽。
                </p>
                <button
                    onClick={onBack}
                    className="px-8 py-2.5 border border-gray-300 rounded-lg text-gray-700 text-sm hover:bg-gray-50 transition-colors"
                >
                    回到首页
                </button>
            </div>
        </div>
    );
}

// Toast 提示组件
function Toast({ message, visible }) {
    if (!visible) return null;
    return (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[200] bg-black/70 text-white text-sm px-6 py-3 rounded-lg pointer-events-none animate-fade-in">
            {message}
        </div>
    );
}

// 消息列表视图
function ChatListView({ contacts, activeContactId, onSelectContact, onSearchSelect, onBannedAccount }) {
    const [searchText, setSearchText] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const showDropdown = searchText.trim().length > 0;
    const isXiaoNian = searchText.trim() === '小念医生';

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
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        onFocus={() => setIsFocused(true)}
                        placeholder="搜索"
                        className="flex-1 text-sm bg-transparent focus:outline-none"
                    />
                    {searchText && (
                        <button onClick={() => { setSearchText(''); }} className="text-gray-400 hover:text-gray-600">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 001.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                        </button>
                    )}
                </div>

                {/* 搜索下拉结果 */}
                {showDropdown && (
                    <div className="mt-1 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
                        <button
                            onClick={() => {
                                onSearchSelect(searchText.trim());
                                setSearchText('');
                            }}
                            className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left"
                        >
                            <div className="w-8 h-8 bg-[#07C160] rounded-lg flex items-center justify-center flex-shrink-0">
                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <span className="text-sm text-[#576B95]">
                                搜索QQ号/手机/微信ID：<span className="text-[#07C160] font-medium">{searchText.trim()}</span>
                            </span>
                        </button>
                        {isXiaoNian && (
                            <button
                                onClick={() => {
                                    onBannedAccount();
                                    setSearchText('');
                                }}
                                className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left border-t border-gray-100"
                            >
                                <div className="w-8 h-8 bg-[#FA5151] rounded-lg flex items-center justify-center flex-shrink-0">
                                    <span className="text-white text-xs font-bold">公</span>
                                </div>
                                <span className="text-sm text-gray-900">
                                    公众号：<span className="font-medium">小念医生</span>
                                </span>
                            </button>
                        )}
                    </div>
                )}
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
    const [showBannedAccount, setShowBannedAccount] = useState(false);
    const [strangerProfile, setStrangerProfile] = useState(null); // 陌生人资料页
    const [toastMessage, setToastMessage] = useState('');
    const [showToast, setShowToast] = useState(false);
    const [showQQNotification, setShowQQNotification] = useState(false);

    // Toast 辅助函数
    const triggerToast = useCallback((msg) => {
        setToastMessage(msg);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 7777);
    }, []);

    // 搜索选择处理
    const handleSearchSelect = useCallback((query) => {
        if (query === '2847593160') {
            // 跳转到张薇的个人资料页
            const zhangwei = contacts.find(c => c.id === 'zhangwei');
            if (zhangwei) {
                setProfileContact(zhangwei);
                setShowProfile(true);
                setShowFriendSettings(false);
                setShowMoments(false);
                setShowBannedAccount(false);
            }
        } else if (query === '18612345678') {
            // 搜索林晓琳的手机号
            setStrangerProfile({
                id: 'linxiaolin',
                name: '晓琳',
                wechatId: 'lxl_0217',
                avatarImg: '/avatarLinxiaolin.png',
                signature: '暂时不使用微信。',
            });
            setShowProfile(false);
            setShowFriendSettings(false);
            setShowMoments(false);
            setShowBannedAccount(false);
        } else {
            triggerToast('用户不存在或对方设置了被搜索权限');
        }
    }, [contacts, triggerToast]);

    // 张薇 AI 聊天
    const isGameCompleted = typeof window !== 'undefined' && localStorage.getItem('zhangwei_game_completed') === 'true';
    const {
        aiMessages: zhangweiAiMessages,
        isAiThinking: isZhangweiThinking,
        isDebouncing: isZhangweiDebouncing,
        addUserMessage: addZhangweiMessage,
        isInitialized: isZhangweiAiInitialized,
    } = useAIChat({
        chatId: 'zhangwei',
        systemPrompt: ZHANGWEI_SYSTEM_PROMPT,
        firstMessage: '你在吗？？我好像做了一个很长的梦……',
        enabled: !!state.networkRepaired && !isGameCompleted,
    });
    const lastAiMsgCountRef = useRef(0);
    const aiSyncedRef = useRef(false);

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

        // 检查是否通关
        const gameCompleted = typeof window !== 'undefined' && localStorage.getItem('zhangwei_game_completed') === 'true';

        if (storedMessages && Object.keys(storedMessages).length > 0) {
            // 如果有存储的消息，使用存储的
            // 通关后追加玩家发送的消息
            if (gameCompleted) {
                const zhangweiMsgs = storedMessages['zhangwei'] || [];
                const alreadyHasDreamMsg = zhangweiMsgs.some(m => m.id === 'player_dream_msg');
                if (!alreadyHasDreamMsg) {
                    const now = new Date();
                    const dreamMsg = {
                        id: 'player_dream_msg',
                        sender: 'player',
                        content: '我梦见你了',
                        timestamp: now.toISOString(),
                        time: now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
                        type: 'text',
                    };
                    storedMessages['zhangwei'] = [...zhangweiMsgs, dreamMsg];
                }
            }
            setMessagesByContact(storedMessages);
        } else {
            // 否则使用动态生成的初始消息
            setMessagesByContact(dynamicMessages);
        }

        if (storedContacts && storedContacts.length > 0) {
            // 合并存储的联系人状态与动态联系人数据
            let mergedContacts = dynamicContacts.map(c => {
                const stored = storedContacts.find(sc => sc.id === c.id);
                return stored ? { ...c, ...stored } : c;
            });
            // 通关后更新张薇的最后消息
            if (gameCompleted) {
                mergedContacts = mergedContacts.map(c => {
                    if (c.id === 'zhangwei') {
                        return { ...c, lastMessage: '我梦见你了' };
                    }
                    return c;
                });
            }
            setContacts(mergedContacts);
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

    // 监听网络修复状态 - 当管理面板修复网络后，张薇发送消息
    useEffect(() => {
        if (!isInitialized) return;
        if (!state.networkRepaired) return;

        // 检查是否已经发送过网络恢复消息（避免重复）
        const zhangweiMsgs = messagesByContact['zhangwei'] || [];
        const alreadySent = zhangweiMsgs.some(m => m.id === 'network_restored');
        if (alreadySent) return;

        const now = new Date();
        const restoredMessage = {
            id: 'network_restored',
            sender: 'zhangwei',
            content: '你在吗？？我好像做了一个很长的梦……',
            timestamp: now.toISOString(),
            time: now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
            type: 'text',
        };

        setMessagesByContact((prev) => ({
            ...prev,
            zhangwei: [...(prev['zhangwei'] || []), restoredMessage],
        }));

        setContacts((prev) =>
            prev.map((c) =>
                c.id === 'zhangwei'
                    ? { ...c, lastMessage: restoredMessage.content, time: restoredMessage.time, unread: (c.unread || 0) + 1 }
                    : c
            )
        );
    }, [state.networkRepaired, isInitialized]);

    // 当 AI 聊天从 localStorage 加载完成后，同步 ref 避免重复注入历史消息
    useEffect(() => {
        if (!isZhangweiAiInitialized) return;
        if (aiSyncedRef.current) return;
        aiSyncedRef.current = true;
        const assistantMsgs = zhangweiAiMessages.filter(m => m.role === 'assistant');
        lastAiMsgCountRef.current = assistantMsgs.length;
    }, [isZhangweiAiInitialized, zhangweiAiMessages]);

    // 监听张薇 AI 的回复，注入到微信消息列表（多行拆分并延迟显示）
    useEffect(() => {
        if (!isInitialized) return;
        if (!aiSyncedRef.current) return;
        // 只关注 assistant 消息
        const assistantMsgs = zhangweiAiMessages.filter(m => m.role === 'assistant');
        if (assistantMsgs.length <= lastAiMsgCountRef.current) return;

        // 取最新的 assistant 消息
        const newMsgs = assistantMsgs.slice(lastAiMsgCountRef.current);
        lastAiMsgCountRef.current = assistantMsgs.length;

        // 将每条 AI 消息按换行拆分，依次延迟注入
        const allLines = [];
        for (const msg of newMsgs) {
            const lines = msg.content.split('\n').map(l => l.trim()).filter(l => l.length > 0);
            allLines.push(...lines);
        }

        const timers = [];
        allLines.forEach((line, index) => {
            const timer = setTimeout(() => {
                const now = new Date();
                const wechatMsg = {
                    id: 'ai_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
                    sender: 'zhangwei',
                    content: line,
                    timestamp: now.toISOString(),
                    time: now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
                    type: 'text',
                };

                setMessagesByContact(prev => ({
                    ...prev,
                    zhangwei: [...(prev['zhangwei'] || []), wechatMsg],
                }));

                setContacts(prev =>
                    prev.map(c =>
                        c.id === 'zhangwei'
                            ? { ...c, lastMessage: line, time: wechatMsg.time, unread: (activeContact?.id === 'zhangwei' ? 0 : (c.unread || 0) + 1) }
                            : c
                    )
                );
            }, index * 800); // 每条消息间隔 800ms
            timers.push(timer);
        });

        return () => timers.forEach(t => clearTimeout(t));
    }, [zhangweiAiMessages, isInitialized, activeContact]);

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

        // 张薇 AI 回复（网络修复后）
        if (activeContact.id === 'zhangwei' && state.networkRepaired) {
            addZhangweiMessage(content);
        }

        // 微信团队自动回复
        if (activeContact.id === 'wechatteam') {
            setTimeout(() => {
                const replyTime = new Date();
                const autoReply = {
                    id: Date.now() + 1,
                    sender: 'wechatteam',
                    content: '如果遇到问题，可<a href="https://support.weixin.qq.com/security/newreadtemplate?t=feedback/index#/list" target="_blank" rel="noopener noreferrer">轻触此处</a>反馈给我们。',
                    isHtml: true,
                    timestamp: replyTime.toISOString(),
                    time: replyTime.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
                    type: 'text',
                };
                setMessagesByContact((prev) => ({
                    ...prev,
                    wechatteam: [...(prev.wechatteam || []), autoReply],
                }));
                setContacts((prev) =>
                    prev.map((c) =>
                        c.id === 'wechatteam'
                            ? { ...c, lastMessage: '如果遇到问题，可轻触此处反馈给我们。', time: autoReply.time }
                            : c
                    )
                );
            }, 1000);
        }
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
        // 通关后阻止触发结局1
        const gameCompleted = typeof window !== 'undefined' && localStorage.getItem('zhangwei_game_completed') === 'true';
        if (gameCompleted) {
            triggerToast('不会忘记你的');
            return;
        }
        router.push('/end1_5zhUdx7Kp');
    };

    // 结束调查（结局2）- 新标签页打开
    const handleEndInvestigation = () => {
        location.href = '/end2_k1sZyNMYd6';
        //window.locate('/end2_k1sZyNMYd6', '_blank');
    };

    // 继续调查 - 关闭覆盖层，同步到所有标签页
    const handleContinueInvestigation = () => {
        updateState({ continueInvestigation: true });
        // 显示QQ消息通知
        setTimeout(() => setShowQQNotification(true), 800);
    };

    // 是否显示调查选择覆盖层
    const showInvestigationOverlay = !!(state.networkRepaired && !state.continueInvestigation && activeContact?.id === 'zhangwei' && !showProfile && !showFriendSettings && !showMoments);

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
        // 显示封禁账号页面
        if (showBannedAccount) {
            return (
                <BannedAccountView
                    onBack={() => setShowBannedAccount(false)}
                />
            );
        }

        // 显示陌生人资料页
        if (strangerProfile) {
            return (
                <StrangerProfileView
                    contact={strangerProfile}
                    onBack={() => setStrangerProfile(null)}
                />
            );
        }

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
                    onSendMessage={() => {
                        setShowProfile(false);
                        setShowFriendSettings(false);
                        setShowMoments(false);
                        if (profileContact) handleSelectContact(profileContact);
                    }}
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
                        isTyping={activeContact?.id === 'zhangwei' && (isZhangweiThinking || isZhangweiDebouncing)}
                    />
                );
            }
            return (
                <ChatListView
                    contacts={contacts}
                    activeContactId={null}
                    onSelectContact={handleSelectContact}
                    onSearchSelect={handleSearchSelect}
                    onBannedAccount={() => setShowBannedAccount(true)}
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
                        onSearchSelect={handleSearchSelect}
                        onBannedAccount={() => setShowBannedAccount(true)}
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
                            isTyping={activeContact?.id === 'zhangwei' && (isZhangweiThinking || isZhangweiDebouncing)}
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
            <Head><title>微信</title></Head>
            {/* 主内容区域 */}
            <main className="flex-1 overflow-hidden relative">
                {activeTab === 'chat' ? (
                    renderContent()
                ) : activeTab === 'me' ? (
                    <div className="h-full bg-[#F5F5F5] overflow-y-auto">
                        {/* 个人信息卡片 */}
                        <div className="bg-white px-4 pt-10 pb-5">
                            <div className="flex items-center gap-4">
                                {/* 玩家头像 */}
                                <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                                    <img src="/avatarPlayer.jpg" alt="头像" className="w-full h-full object-cover" />
                                </div>
                                {/* 昵称 & 状态 */}
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-lg font-bold text-gray-900 truncate">{playerName || '玩家'}</h3>
                                    <button className="mt-1 flex items-center gap-1 text-sm text-gray-400">
                                        <span className="text-base leading-none">+</span>
                                        <span>状态</span>
                                    </button>
                                </div>
                                {/* 二维码按钮（装饰） */}
                                <div className="p-2 text-gray-400 flex items-center gap-1">
                                    <IoQrCodeOutline className="w-5 h-5" />
                                    <IoMdArrowBack className="w-4 h-4 rotate-180 text-gray-300" />
                                </div>
                            </div>
                        </div>

                        <div className="h-2" />

                        {/* 功能菜单 */}
                        <div className="bg-white divide-y divide-gray-100">
                            {/* 支付 */}
                            <button className="w-full px-4 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-7 h-7 flex items-center justify-center">
                                        <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none">
                                            <rect x="1" y="4" width="22" height="16" rx="3" stroke="#2DC100" strokeWidth="1.5" />
                                            <circle cx="12" cy="12" r="3.5" stroke="#2DC100" strokeWidth="1.5" />
                                            <circle cx="4.5" cy="12" r="1" fill="#2DC100" />
                                            <circle cx="19.5" cy="12" r="1" fill="#2DC100" />
                                        </svg>
                                    </div>
                                    <span className="text-gray-900">支付</span>
                                </div>
                                <IoMdArrowBack className="w-5 h-5 text-gray-300 rotate-180" />
                            </button>
                        </div>

                        <div className="h-2" />

                        <div className="bg-white divide-y divide-gray-100">
                            {/* 收藏 */}
                            <button className="w-full px-4 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-7 h-7 flex items-center justify-center">
                                        <MdOutlineBookmarkBorder className="w-6 h-6 text-[#E8B830]" />
                                    </div>
                                    <span className="text-gray-900">收藏</span>
                                </div>
                                <IoMdArrowBack className="w-5 h-5 text-gray-300 rotate-180" />
                            </button>
                            {/* 朋友圈 */}
                            <button className="w-full px-4 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-7 h-7 flex items-center justify-center">
                                        <HiOutlinePhotograph className="w-6 h-6 text-[#4A90D9]" />
                                    </div>
                                    <span className="text-gray-900">朋友圈</span>
                                </div>
                                <IoMdArrowBack className="w-5 h-5 text-gray-300 rotate-180" />
                            </button>
                            {/* 表情 */}
                            <button className="w-full px-4 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-7 h-7 flex items-center justify-center">
                                        <MdOutlineEmojiEmotions className="w-6 h-6 text-[#E8B830]" />
                                    </div>
                                    <span className="text-gray-900">表情</span>
                                </div>
                                <IoMdArrowBack className="w-5 h-5 text-gray-300 rotate-180" />
                            </button>
                        </div>

                        <div className="h-2" />

                        <div className="bg-white divide-y divide-gray-100">
                            {/* 设置 */}
                            <button className="w-full px-4 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-7 h-7 flex items-center justify-center">
                                        <FiSettings className="w-6 h-6 text-[#4A90D9]" />
                                    </div>
                                    <span className="text-gray-900">设置</span>
                                </div>
                                <IoMdArrowBack className="w-5 h-5 text-gray-300 rotate-180" />
                            </button>
                        </div>

                        <div className="h-4" />
                    </div>
                ) : (
                    <div className="h-full flex items-center justify-center bg-white p-10">
                        <p className="text-gray-400">
                            {activeTab === 'contacts' && ('这里是' + (() => { const { playerName: name } = getPlayerCookies(); return name; })() + '的微信通讯录界面，应该不会有什么线索吧？')}
                            {activeTab === 'discover' && ('这里是' + (() => { const { playerName: name } = getPlayerCookies(); return name; })() + '的微信发现界面，有很多好友的情况下去查看朋友圈有些混乱吧？不如单独查看某一个好友的朋友圈？')}
                        </p>
                    </div>
                )}

                {/* 调查选择覆盖层 - 张薇聊天界面上的半透明覆盖 */}
                {showInvestigationOverlay && (
                    <div className="absolute inset-0 bg-black/70 z-40 flex items-center justify-center p-4 transition-opacity duration-500 opacity-0 hover:opacity-100">
                        <div className="max-w-sm w-full text-center">
                            <div className="mb-6">
                                <div className="w-16 h-16 bg-[#07C160] rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-500/30">
                                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 01.213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 00.167-.054l1.903-1.114a.864.864 0 01.717-.098 10.16 10.16 0 002.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 01-1.162 1.178A1.17 1.17 0 014.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 01-1.162 1.178 1.17 1.17 0 01-1.162-1.178c0-.651.52-1.18 1.162-1.18zm3.905 4.238c-1.548 0-3.028.428-4.236 1.238-1.399.937-2.27 2.324-2.37 3.876-.105 1.63.64 3.156 2.041 4.17a.418.418 0 01.152.472l-.238.906c-.014.05-.035.1-.035.152 0 .115.093.209.206.209a.23.23 0 00.118-.039l1.348-.789a.612.612 0 01.508-.069 7.18 7.18 0 002.01.285c3.426 0 6.217-2.33 6.217-5.193s-2.791-5.218-6.217-5.218h-.504zm-2.39 2.768c.456 0 .824.375.824.838a.831.831 0 01-.824.836.831.831 0 01-.823-.836c0-.463.368-.838.823-.838zm4.781 0c.456 0 .824.375.824.838a.831.831 0 01-.824.836.831.831 0 01-.823-.836c0-.463.368-.838.823-.838z" />
                                    </svg>
                                </div>
                                <h2 className="text-xl font-bold text-white mb-2">张薇发来了消息！</h2>
                                <p className="text-gray-300 text-sm leading-relaxed">
                                    嗯？张薇突然回来了？
                                </p>
                            </div>

                            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5">
                                <p className="text-white text-lg font-medium mb-5">是否结束调查？</p>
                                <div className="space-y-3">
                                    <button
                                        onClick={handleEndInvestigation}
                                        className="w-full py-3 bg-[#07C160] text-white font-medium rounded-xl hover:bg-[#06AD56] transition-colors text-sm"
                                    >
                                        太好了，结束调查！
                                    </button>
                                    <button
                                        onClick={handleContinueInvestigation}
                                        className="w-full py-3 bg-white/10 text-white font-medium rounded-xl hover:bg-white/20 transition-colors text-sm border border-white/20"
                                    >
                                        不...我要继续调查
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {/* 底部导航 - 仅在非聊天详情页显示（移动端）或始终显示（桌面端） */}
            {(!isMobile || (!activeContact && !showProfile)) && (
                <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
            )}

            {/* QQ 消息通知弹窗 */}
            {showQQNotification && (
                <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 animate-slide-down w-[360px] max-w-[90vw]">
                    <button
                        onClick={() => {
                            setShowQQNotification(false);
                            window.open('/qq', '_blank');
                        }}
                        className="w-full bg-white rounded-2xl shadow-2xl shadow-black/20 p-4 flex items-start gap-3 text-left hover:bg-gray-50 active:scale-[0.98] transition-all"
                    >
                        {/* QQ图标 */}
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
                            <img src="/icon-qq.svg" alt="QQ" className="w-full h-full object-cover" />
                        </div>
                        {/* 通知内容 */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-0.5">
                                <span className="text-sm font-semibold text-gray-900">QQ</span>
                                <span className="text-xs text-gray-400">现在</span>
                            </div>
                            <p className="text-sm text-gray-700 truncate">腾讯新闻：父爱如磐，静待花开——恒念药业董事长……</p>
                        </div>
                    </button>
                </div>
            )}

            {/* Toast 提示 */}
            <Toast message={toastMessage} visible={showToast} />
        </div>
    );
}
