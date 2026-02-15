import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { getPlayerCookies, setCookie, getCookie, setQZoneUnlocked, isQZoneUnlocked } from '../utils/cookies';
import { useGameState } from '../hooks/useGameState';
import { getRelativeDate, getZhangweiBirthday, getZhangweiRealAge, formatDateFull, formatDateShort, getStartDate } from '../utils/chatDates';
import { IoChatbubbleEllipsesSharp, IoPersonSharp, IoCompassSharp, IoSettingsSharp } from 'react-icons/io5';
import { IoMdArrowBack } from 'react-icons/io';
import Image from "next/image"

// ============ localStorage 存储 ============
const QQ_MESSAGES_KEY = 'zhangwei_qq_messages';
const QQ_CONTACTS_KEY = 'zhangwei_qq_contacts';

function loadQQMessages() {
    if (typeof window === 'undefined') return null;
    try {
        const stored = localStorage.getItem(QQ_MESSAGES_KEY);
        return stored ? JSON.parse(stored) : null;
    } catch { return null; }
}
function saveQQMessages(msgs) {
    if (typeof window === 'undefined') return;
    try { localStorage.setItem(QQ_MESSAGES_KEY, JSON.stringify(msgs)); } catch { }
}
function loadQQContacts() {
    if (typeof window === 'undefined') return null;
    try {
        const stored = localStorage.getItem(QQ_CONTACTS_KEY);
        return stored ? JSON.parse(stored) : null;
    } catch { return null; }
}
function saveQQContacts(contacts) {
    if (typeof window === 'undefined') return;
    try { localStorage.setItem(QQ_CONTACTS_KEY, JSON.stringify(contacts)); } catch { }
}

// ============ QQ 联系人/消息数据 ============

function getQQContacts() {
    const oneWeekAgo = getRelativeDate(-7);
    return [
        {
            id: 'other_qq',
            name: '我的关联QQ账号',
            avatarImg: null,
            avatarIcon: 'penguin',
            lastMessage: '暂无新消息',
            time: '17:59',
            unread: 0,
            chatType: 'linked',
        },
        {
            id: 'qqteam',
            name: 'QQ团队',
            avatarImg: null,
            avatarIcon: 'penguin',
            lastMessage: '登录保护通知',
            time: '17:58',
            unread: 1,
            chatType: 'service',
        },
        {
            id: 'qqsecurity',
            name: 'QQ安全中心',
            avatarImg: null,
            avatarIcon: 'shield',
            lastMessage: '【密码安全提醒】您已成功修改密码，请…',
            time: '17:58',
            unread: 1,
            chatType: 'service',
        },
        {
            id: 'txnews',
            name: '疼讯新闻',
            avatarImg: '/avatarTencentNews.png',
            avatarIcon: 'news',
            lastMessage: '父爱如磐，静待花开——恒念药业董事长田宇…',
            time: '刚刚',
            unread: 1,
            chatType: 'service',
        },
        {
            id: 'splat',
            name: '鱿谊第一',
            avatarImg: '/avatarSplat.jpg',
            avatarIcon: 'group',
            lastMessage: '暂无群消息',
            time: formatDateShort(oneWeekAgo),
            unread: 0,
            chatType: 'group',
        },
        {
            id: 'class5',
            name: '5班班级群',
            avatarImg: '/avatarClassGroup.jpg',
            avatarIcon: 'group',
            lastMessage: '[群主] 辅导员-王老师：@全体成员 各位同学…',
            time: '5年前',
            unread: 0,
            chatType: 'group',
        }
    ];
}

function getInitialQQMessages() {
    const fiveYearsAgo = getRelativeDate(-1825);
    const oneWeekAgo = getRelativeDate(-7);
    return {
        class5: [
            {
                id: 'c5_2',
                sender: 'wanglaoshi',
                senderName: '[群主] 辅导员-王老师',
                avatarImg: '/avatarTutor.jpg',
                content: '@全体成员 各位同学，毕业三年问卷调查麻烦填一下，收到请回复。',
                type: 'text',
                timestamp: fiveYearsAgo.toISOString(),
            },
        ],
        splat: [

        ],
        other_qq: [],
        qqteam: [],
        qqsecurity: [],
        txnews: [],
    };
}

// ============ Base64 解码辅助 ============
const _d = (s) => {
    try { return typeof window !== 'undefined' ? decodeURIComponent(escape(atob(s))) : Buffer.from(s, 'base64').toString('utf-8'); } catch { return ''; }
};

// ============ 鱿谊第一 对话数据 (encoded) ============
const _SPLAT_R1 = ['5Zev77yf5L2g5piv6LCB77yf', '5L2g55+l6YGT6L+Z5Liq5piv5LuA5LmI55qE576k5ZCX77yf'];
const _SPLAT_T = ['c3BsdA==', 'c3BsYXRvb24=','5Za35Za3', '5pav5pmu5ouJ6YGB'];
const _SPLAT_R2 = ['T0tPSw==', '6YKj5omT5bel5ZCX', '6KaB5LiN5L2g5YWIPGEgaHJlZj0iaHR0cHM6Ly9nYW1lLmp5LXMuY29tIj7liqDkuIvmiJHlpb3lj4s8L2E+77yf'];

// ============ 底部导航配置 ============
const NAV_ITEMS = [
    { id: 'message', label: '消息', icon: IoChatbubbleEllipsesSharp },
    { id: 'contacts', label: '联系人', icon: IoPersonSharp },
    { id: 'dynamic', label: '动态', icon: IoCompassSharp },
];

// ============ Toast 组件 ============
function QQToast({ message, visible }) {
    if (!visible) return null;
    return (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[200] bg-black/70 text-white text-sm px-6 py-3 rounded-lg pointer-events-none animate-fade-in">
            {message}
        </div>
    );
}

// ============ 头像组件 ============
function QQAvatar({ contact, size = 'md', className = '' }) {
    const sizeClasses = {
        sm: 'w-8 h-8',
        md: 'w-12 h-12',
        lg: 'w-16 h-16',
    };
    const iconSizes = {
        sm: 'w-4 h-4',
        md: 'w-6 h-6',
        lg: 'w-8 h-8',
    };

    if (contact.avatarImg) {
        return (
            <div className={`${sizeClasses[size]} rounded-full overflow-hidden flex-shrink-0 ${className}`}>
                <img
                    src={contact.avatarImg}
                    alt={contact.name || '头像'}
                    className="w-full h-full object-cover"
                />
            </div>
        );
    }

    if (contact.avatarIcon === 'shield') {
        return (
            <div className={`${sizeClasses[size]} rounded-full bg-[#12B7F5] flex items-center justify-center flex-shrink-0 ${className}`}>
                <svg className={`${iconSizes[size]} text-white`} viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3zm-1 14.5l-4-4 1.41-1.41L11 13.67l5.59-5.59L18 9.5l-7 7z" />
                </svg>
            </div>
        );
    }

    if (contact.avatarIcon === 'group') {
        return (
            <div className={`${sizeClasses[size]} rounded-full bg-[#12B7F5] flex items-center justify-center flex-shrink-0 ${className}`}>
                <svg className={`${iconSizes[size]} text-white`} fill="currentColor" viewBox="0 0 24 24">
                    <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
                </svg>
            </div>
        );
    }

    if (contact.avatarIcon === 'news') {
        return (
            <div className={`${sizeClasses[size]} rounded-full bg-[#FF6B35] flex items-center justify-center flex-shrink-0 ${className}`}>
                <svg className={`${iconSizes[size]} text-white`} fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zM4 12h4v6H4v-6zm6 6V6h10v12H10z" />
                </svg>
            </div>
        );
    }

    // 企鹅图标
    return (
        <div className={`${sizeClasses[size]} rounded-full bg-white border border-gray-200 flex items-center justify-center flex-shrink-0 ${className}`}>
            <img src="/icon-qq.svg" alt="QQ" className="w-7 h-7" />
        </div>
    );
}

// ============ 搜索结果项组件 ============
function SearchResultItem({ qqNumber, nickname, avatarSrc, onClick }) {
    const [imgError, setImgError] = useState(false);

    return (
        <button
            onClick={onClick}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 active:bg-gray-100 transition-colors"
        >
            <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-gray-200">
                {!imgError ? (
                    <img
                        src={avatarSrc}
                        alt={nickname}
                        className="w-full h-full object-cover"
                        onError={() => setImgError(true)}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-300">
                        <IoPersonSharp className="w-5 h-5 text-gray-500" />
                    </div>
                )}
            </div>
            <div className="flex-1 text-left">
                <p className="text-sm text-gray-900 font-medium">{nickname}</p>
            </div>
        </button>
    );
}

// ============ 搜索记录 localStorage ============
const QQ_SEARCH_HISTORY_KEY = 'zhangwei_qq_search_history';
const QQ_SEARCH_HISTORY_LINXIAOLIN_KEY = 'zhangwei_qq_search_history_linxiaolin';

function hasSearchedZhangwei() {
    if (typeof window === 'undefined') return false;
    try {
        return localStorage.getItem(QQ_SEARCH_HISTORY_KEY) === 'true';
    } catch { return false; }
}

function markSearchedZhangwei() {
    if (typeof window === 'undefined') return;
    try { localStorage.setItem(QQ_SEARCH_HISTORY_KEY, 'true'); } catch { }
}

function hasSearchedLinxiaolin() {
    if (typeof window === 'undefined') return false;
    try {
        return localStorage.getItem(QQ_SEARCH_HISTORY_LINXIAOLIN_KEY) === 'true';
    } catch { return false; }
}

function markSearchedLinxiaolin() {
    if (typeof window === 'undefined') return;
    try { localStorage.setItem(QQ_SEARCH_HISTORY_LINXIAOLIN_KEY, 'true'); } catch { }
}

// ============ 搜索页面 ============
function SearchView({ onBack, onSelectQQ }) {
    const [query, setQuery] = useState('');
    const [searchResult, setSearchResult] = useState(null);
    const [isSearching, setIsSearching] = useState(false);
    const [hasHistory, setHasHistory] = useState(false);
    const [hasLinxiaolinHistory, setHasLinxiaolinHistory] = useState(false);
    const inputRef = useRef(null);
    const debounceRef = useRef(null);

    useEffect(() => {
        // 自动聚焦搜索框
        inputRef.current?.focus();
        setHasHistory(hasSearchedZhangwei());
        setHasLinxiaolinHistory(hasSearchedLinxiaolin());
        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, []);

    // 执行实际搜索
    const doSearch = useCallback((trimmed) => {
        if (/^\d+$/.test(trimmed) && parseInt(trimmed, 10) > 10000) {
            const qqNumber = trimmed;
            if (qqNumber === '2847593160') {
                markSearchedZhangwei();
                setHasHistory(true);
                setSearchResult({
                    qqNumber,
                    nickname: 'zhangwei',
                    avatarSrc: '/avatarWei2.png',
                    isSpecial: true,
                });
                setIsSearching(false);
            } else if (qqNumber === LINXIAOLIN_QQ || qqNumber === LINXIAOLIN_PHONE) {
                markSearchedLinxiaolin();
                setHasLinxiaolinHistory(true);
                setSearchResult({
                    qqNumber: LINXIAOLIN_QQ,
                    nickname: '晓琳',
                    avatarSrc: '/avatarLinxiaolin.png',
                    isSpecial: false,
                    isLinxiaolin: true,
                });
                setIsSearching(false);
            } else {
                // Show result immediately with QQ number as placeholder nickname
                setSearchResult({
                    qqNumber,
                    nickname: qqNumber,
                    avatarSrc: `https://q1.qlogo.cn/g?b=qq&nk=${qqNumber}&s=100`,
                    isSpecial: false,
                });
                setIsSearching(false);
                // Try to fetch real nickname from QQ portrait API
                fetch(`/api/qq-portrait?uin=${qqNumber}`)
                    .then(r => r.json())
                    .then(data => {
                        if (data.nickname) {
                            setSearchResult(prev => prev && prev.qqNumber === qqNumber
                                ? { ...prev, nickname: data.nickname }
                                : prev
                            );
                        }
                    })
                    .catch(() => { /* keep QQ number as fallback */ });
                return;
            }
        } else {
            setSearchResult(null);
            setIsSearching(false);
        }
    }, []);

    // 处理搜索逻辑（带1秒延迟）
    const handleSearch = useCallback((value) => {
        setQuery(value);
        if (debounceRef.current) clearTimeout(debounceRef.current);

        const trimmed = value.trim();
        if (!trimmed) {
            setSearchResult(null);
            setIsSearching(false);
            return;
        }

        setIsSearching(true);
        debounceRef.current = setTimeout(() => {
            doSearch(trimmed);
        }, 1000);
    }, [doSearch]);

    return (
        <div className="flex flex-col h-full bg-white">
            {/* 搜索头部 */}
            <div className="bg-[#EDEDED] px-3 py-2 flex items-center gap-2">
                <div className="flex-1 bg-white rounded-lg px-3 py-2 flex items-center gap-2">
                    <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => handleSearch(e.target.value)}
                        placeholder="搜索QQ号/手机号/群"
                        className="flex-1 text-sm bg-transparent focus:outline-none text-gray-700"
                    />
                    {query && (
                        <button
                            onClick={() => handleSearch('')}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    )}
                </div>
                <button
                    onClick={onBack}
                    className="text-[#12B7F5] text-sm font-medium px-1 flex-shrink-0"
                >
                    取消
                </button>
            </div>

            {/* 搜索结果 */}
            <div className="flex-1 overflow-y-auto">
                {/* 搜索记录（搜索框为空时显示） */}
                {!query && (hasHistory || hasLinxiaolinHistory) && (
                    <div>
                        <div className="px-4 py-2 bg-[#F5F5F5] flex items-center justify-between">
                            <span className="text-xs text-gray-500 font-medium">搜索记录</span>
                        </div>
                        {hasHistory && (
                            <button
                                onClick={() => onSelectQQ({
                                    qqNumber: ZHANGWEI_QQ,
                                    nickname: 'zhangwei',
                                    avatarSrc: '/avatarWei2.png',
                                    isSpecial: true,
                                })}
                                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 active:bg-gray-100 transition-colors"
                            >
                                <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-gray-200">
                                    <img
                                        src="/avatarWei2.png"
                                        alt="zhangwei"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="flex-1 text-left">
                                    <p className="text-sm text-gray-900 font-medium">zhangwei</p>
                                </div>
                            </button>
                        )}
                        {hasLinxiaolinHistory && (
                            <button
                                onClick={() => onSelectQQ({
                                    qqNumber: LINXIAOLIN_QQ,
                                    nickname: '晓琳',
                                    avatarSrc: '/avatarLinxiaolin.png',
                                    isSpecial: false,
                                    isLinxiaolin: true,
                                })}
                                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 active:bg-gray-100 transition-colors"
                            >
                                <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-gray-200">
                                    <img
                                        src="/avatarLinxiaolin.png"
                                        alt="晓琳"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="flex-1 text-left">
                                    <p className="text-sm text-gray-900 font-medium">晓琳</p>
                                </div>
                            </button>
                        )}
                    </div>
                )}

                {searchResult && (
                    <div>
                        {/* 分类标题 */}
                        <div className="px-4 py-2 bg-[#F5F5F5]">
                            <span className="text-xs text-gray-500 font-medium">人</span>
                        </div>

                        {/* 搜索结果项 */}
                        <SearchResultItem
                            qqNumber={searchResult.qqNumber}
                            nickname={searchResult.nickname}
                            avatarSrc={searchResult.avatarSrc}
                            onClick={() => onSelectQQ(searchResult)}
                        />
                    </div>
                )}

                {/* 搜索中提示 */}
                {isSearching && (
                    <div className="flex items-center justify-center py-16">
                        <div className="flex items-center gap-2 text-gray-400">
                            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            <span className="text-sm">搜索中...</span>
                        </div>
                    </div>
                )}

                {/* 空状态 */}
                {query && !searchResult && !isSearching && (
                    <div className="flex items-center justify-center py-16">
                        <p className="text-sm text-gray-400">未找到相关结果</p>
                    </div>
                )}
            </div>
        </div>
    );
}

// ============ 消息列表项 ============
function QQChatListItem({ contact, onClick }) {
    return (
        <button
            onClick={onClick}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 active:bg-gray-100 transition-colors"
        >
            <div className="relative">
                <QQAvatar contact={contact} />
                {contact.unread > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold px-1">
                        {contact.unread > 99 ? '99+' : contact.unread}
                    </span>
                )}
            </div>
            <div className="flex-1 min-w-0 text-left">
                <div className="flex items-center justify-between">
                    <h3 className="font-medium text-gray-900 truncate text-[15px]">{contact.name}</h3>
                    <span className="text-xs text-gray-400 flex-shrink-0 ml-2">{contact.time}</span>
                </div>
                <p className="text-sm text-gray-500 truncate mt-0.5">{contact.lastMessage}</p>
            </div>
        </button>
    );
}

// ============ 群聊/普通聊天界面 ============
function QQChatView({ contact, messages, onBack, onSendMessage, isMobile, disabled, disabledText }) {
    const messagesEndRef = useRef(null);
    const [inputValue, setInputValue] = useState('');

    const scrollToBottom = useCallback(() => {
        requestAnimationFrame(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'instant' });
        });
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, scrollToBottom]);

    const handleSend = () => {
        if (disabled) return;
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

    return (
        <div className="flex flex-col h-full bg-[#EDEDED]">
            {/* 聊天头部 */}
            <header className="bg-[#EDEDED] px-4 py-3 flex items-center justify-between border-b border-gray-300">
                <div className="flex items-center gap-3">
                    <button onClick={onBack} className="p-1 -ml-1 text-gray-600">
                        <IoMdArrowBack className="w-6 h-6" />
                    </button>
                    <h2 className="font-medium text-gray-900">{contact.name}</h2>
                </div>
            </header>

            {/* 消息区域 */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg) => {
                    if (msg.type === 'system') {
                        return (
                            <div key={msg.id} className="flex justify-center my-2">
                                <div className="bg-gray-200 text-gray-500 text-xs px-3 py-1 rounded max-w-[80%] text-center">
                                    {msg.content}
                                </div>
                            </div>
                        );
                    }
                    const isMe = msg.sender === 'player';
                    return (
                        <div key={msg.id} className={`flex gap-2 ${isMe ? 'flex-row-reverse' : ''}`}>
                            {isMe ? (
                                <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                                    <img src="/avatarPlayer.jpg" alt="我" className="w-full h-full object-cover" />
                                </div>
                            ) : msg.avatarImg ? (
                                <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                                    <img src={msg.avatarImg} alt={msg.senderName || ''} className="w-full h-full object-cover" />
                                </div>
                            ) : (
                                <div className="w-8 h-8 rounded-full bg-[#12B7F5] flex items-center justify-center flex-shrink-0">
                                    <IoPersonSharp className="w-4 h-4 text-white" />
                                </div>
                            )}
                            <div className={`max-w-[70%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                {!isMe && msg.senderName && (
                                    <span className="text-xs text-gray-400 mb-0.5 ml-1">
                                        {(() => {
                                            const match = msg.senderName.match(/^\[(群主|管理员)\]\s*(.*)$/);
                                            if (match) {
                                                const role = match[1];
                                                const name = match[2];
                                                const bgColor = role === '群主' ? 'bg-[#E8A317]' : 'bg-[#2BA7A7]';
                                                return (<><span className={`${bgColor} text-white text-[10px] px-1 py-[1px] rounded mr-1`}>{role}</span>{name}</>);
                                            }
                                            return msg.senderName;
                                        })()}
                                    </span>
                                )}
                                <div className={`px-3 py-2 rounded-lg ${isMe ? 'bg-[#95CAFF] text-gray-900' : 'bg-white text-gray-900'}`}>
                                    {msg.html ? (
                                        <p className="text-sm leading-relaxed break-words [&_a]:text-[#12B7F5] [&_a]:underline" dangerouslySetInnerHTML={{ __html: msg.content }} />
                                    ) : (
                                        <p className="text-sm leading-relaxed break-words">{msg.content}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* 输入区域 */}
            <div className="bg-[#F7F7F7] px-4 py-3 border-t border-gray-300">
                <div className="flex items-end gap-2">
                    <div className="flex-1 bg-white rounded-lg border border-gray-300">
                        <textarea
                            value={inputValue}
                            onChange={(e) => !disabled && setInputValue(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder={disabled ? disabledText : '输入消息...'}
                            rows={1}
                            disabled={disabled}
                            className={`w-full px-3 py-2 text-sm resize-none focus:outline-none rounded-lg ${disabled ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : ''}`}
                            style={{ maxHeight: '100px' }}
                        />
                    </div>
                    <button
                        onClick={handleSend}
                        disabled={disabled || !inputValue.trim()}
                        className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${!disabled && inputValue.trim()
                            ? 'bg-[#12B7F5] text-white hover:bg-[#0FA3DB]'
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

// ============ 服务号消息界面（QQ团队、QQ安全中心、疼讯新闻） ============
function QQServiceView({ contact, onBack }) {
    return (
        <div className="flex flex-col h-full bg-[#EDEDED]">
            {/* 头部 */}
            <header className="bg-[#EDEDED] px-4 py-3 flex items-center justify-between border-b border-gray-300">
                <div className="flex items-center gap-3">
                    <button onClick={onBack} className="p-1 -ml-1 text-gray-600">
                        <IoMdArrowBack className="w-6 h-6" />
                    </button>
                    <h2 className="font-medium text-gray-900">{contact.name}</h2>
                </div>
            </header>

            {/* 消息区域 */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {contact.id === 'qqteam' && (
                    <div className="flex justify-center">
                        <div className="bg-white rounded-xl shadow-sm w-lg m-5 w-full overflow-hidden">
                            <div className="px-4 py-3 border-b border-gray-100">
                                <h3 className="font-bold text-gray-900 text-sm">安全通知</h3>
                            </div>

                            <div className="px-4 py-3 space-y-2 text-sm">
                                <div className="flex"><span className="text-gray-500 w-24 flex-shrink-0">账号：</span><span className="text-gray-400">{(() => { const { playerName: name } = getPlayerCookies(); return name; })()}</span></div>
                                <div className="flex"><span className="text-gray-500 w-24 flex-shrink-0">通知类型：</span><span className="text-gray-900">非常用环境登录</span></div>
                                <div className="flex"><span className="text-gray-500 w-24 flex-shrink-0">日期：</span><span className="text-gray-900">{(() => { const d = getStartDate(); const pad = n => String(n).padStart(2, '0'); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; })()}</span></div>
                                <div className="flex"><span className="text-gray-500 w-24 flex-shrink-0">详情：</span><span className="text-gray-900">如非本人操作请改密。</span></div>
                            </div>
                            <div className="border-t border-gray-100">
                                <button className="w-full px-4 py-3 text-sm text-[#12B7F5] flex items-center justify-between hover:bg-gray-50 transition-colors">
                                    <span>查看详情</span>
                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {contact.id === 'qqsecurity' && (
                    <div className="flex justify-center">
                        <div className="bg-white rounded-xl shadow-sm w-lg m-5 w-full overflow-hidden">
                            <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
                                <svg className="w-5 h-5 text-[#12B7F5]" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3zm-1 14.5l-4-4 1.41-1.41L11 13.67l5.59-5.59L18 9.5l-7 7z" />
                                </svg>
                                <h3 className="font-bold text-gray-900 text-sm">密码安全提醒</h3>
                            </div>
                            <div className="px-4 py-4 text-sm text-gray-700 leading-relaxed">
                                <p>您已成功修改QQ密码，请妥善保管新密码。</p>
                                <p className="mt-2 text-gray-500 text-xs">如非本人操作，请立即通过QQ安全中心冻结账号。</p>
                            </div>
                            <div className="border-t border-gray-100 px-4 py-3">
                                <p className="text-xs text-gray-400 mb-2">建议您启用二次验证以增强账号安全</p>
                                <button className="w-full py-2.5 rounded-lg bg-[#12B7F5] text-white text-sm font-medium hover:bg-[#0FA3DB] transition-colors">
                                    前往开启
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {contact.id === 'txnews' && (
                    <div className="flex justify-center">
                        <div className="bg-white rounded-xl shadow-sm w-lg m-5 w-full overflow-hidden">
                            <div className="px-4 py-3">
                                <h4 className="text-sm font-bold text-gray-900 leading-relaxed mb-2">父爱如磐，静待花开——恒念药业董事长田宇与女儿的渐冻症抗争之路</h4>
                                <div className="w-full h-40 bg-gray-100 rounded-lg overflow-hidden mb-2 flex items-center justify-center">
                                    <img
                                        src="/newsTianyu.png"
                                        alt="新闻配图"
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                            e.target.parentElement.innerHTML = '<span class="text-gray-300 text-sm">图片加载中...</span>';
                                        }}
                                    />
                                </div>
                                <p className="text-xs text-gray-500 leading-relaxed">恒念药业创始人田宇（45岁），多年来不仅带领企业深耕神经系统疾病药物研发，更因其女儿罹患渐冻症而走上一条充满艰辛与希望的抗争之路……</p>
                            </div>
                            <div className="border-t border-gray-100">
                                <button
                                    onClick={() => window.location.href = '/txnews-tianyu'}
                                    className="w-full px-4 py-3 text-sm text-[#12B7F5] flex items-center justify-between hover:bg-gray-50 transition-colors"
                                >
                                    <span>阅读全文</span>
                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// ============ 我的关联QQ账号页面（亮色） ============
function LinkedQQView({ onBack }) {
    return (
        <div className="flex flex-col h-full bg-[#F5F5F5]">
            {/* 头部 */}
            <header className="bg-white px-4 py-3 flex items-center justify-between border-b border-gray-200">
                <button onClick={onBack} className="p-1 -ml-1 text-gray-600">
                    <IoMdArrowBack className="w-6 h-6" />
                </button>
                <h2 className="font-medium text-gray-900">我的关联QQ账号</h2>
                <button className="text-[#12B7F5] text-sm font-medium">管理</button>
            </header>

            {/* 关联QQ号消息提醒 */}
            <div className="bg-white mx-4 mt-4 rounded-xl px-4 py-3 flex items-center justify-between">
                <span className="text-gray-900 text-sm">关联QQ号消息提醒</span>
                <div className="w-11 h-6 bg-[#12B7F5] rounded-full relative">
                    <div className="absolute top-0.5 right-0.5 w-5 h-5 bg-white rounded-full shadow" />
                </div>
            </div>

            {/* 账号列表 */}
            <div className="px-4 mt-5 flex items-start gap-6">
                {/* 添加账号按钮 */}
                <div className="flex flex-col items-center gap-1.5">
                    <button className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors">
                        <svg className="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                    </button>
                    <span className="text-sm text-[#12B7F5]">添加账号</span>
                </div>
            </div>

            {/* 分隔线 */}
            <div className="mx-4 mt-5 border-t border-gray-200" />

            {/* 暂无新消息 */}
            <div className="px-4 mt-4">
                <p className="text-sm text-gray-400">暂无新消息</p>
            </div>

            <div className="flex-1" />
        </div>
    );
}

// ============ 消息列表视图 ============
function MessageListView({ contacts, onStartSearch, onSelectContact }) {
    const [showPlusMenu, setShowPlusMenu] = useState(false);
    const plusMenuRef = useRef(null);

    // 点击外部关闭弹窗
    useEffect(() => {
        if (!showPlusMenu) return;
        const handleClickOutside = (e) => {
            if (plusMenuRef.current && !plusMenuRef.current.contains(e.target)) {
                setShowPlusMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showPlusMenu]);

    return (
        <div className="flex flex-col h-full bg-white">
            {/* 顶部状态栏 */}
            <div className="bg-[#EDEDED] px-4 pt-2 pb-1 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                    <div className="w-10 h-10 rounded-full overflow-hidden">
                        <img src="/avatarPlayer.jpg" alt="我" className="w-full h-full object-cover" />
                    </div>
                    <div>
                        <span className="text-lg">{(() => { const { playerName: name } = getPlayerCookies(); return name; })()}</span>
                        <div className="flex items-center gap-1">
                            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                            <span className="text-xs text-gray-500">在线</span>
                            <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <button className="text-gray-600">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </button>
                    <div className="relative" ref={plusMenuRef}>
                        <button
                            className="text-gray-600"
                            onClick={() => setShowPlusMenu(prev => !prev)}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                        </button>
                        {showPlusMenu && (
                            <div className="absolute right-0 top-full mt-2 w-40 bg-[#4C4C4C] rounded-lg shadow-xl z-50 overflow-hidden animate-fade-in">
                                {/* 小三角 */}
                                <div className="absolute -top-1.5 right-3 w-3 h-3 bg-[#4C4C4C] rotate-45" />
                                <button
                                    onClick={() => {
                                        setShowPlusMenu(false);
                                        onStartSearch();
                                    }}
                                    className="w-full flex items-center gap-2.5 px-4 py-3 text-white text-sm hover:bg-[#5A5A5A] active:bg-[#666] transition-colors"
                                >
                                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                    </svg>
                                    添加好友
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* 搜索栏 */}
            <div className="px-3 py-2 bg-[#EDEDED]">
                <button
                    onClick={onStartSearch}
                    className="w-full bg-white rounded-lg px-3 py-2 flex items-center gap-2"
                >
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <span className="text-sm text-gray-400">搜索</span>
                </button>
            </div>

            {/* 消息列表 */}
            <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
                {contacts.map((contact) => (
                    <QQChatListItem
                        key={contact.id}
                        contact={contact}
                        onClick={() => onSelectContact(contact)}
                    />
                ))}
            </div>
        </div>
    );
}

// ============ 张薇QQ号常量 ============
const ZHANGWEI_QQ = '2847593160';

// ============ 林晓琳QQ号常量 ============
const LINXIAOLIN_QQ = '703066656';
const LINXIAOLIN_PHONE = '18612345678';

function getLinxiaolinAge() {
    const now = new Date();
    let age = now.getFullYear() - 1985;
    const monthDiff = now.getMonth() - 1; // Feb = 1
    if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < 17)) {
        age--;
    }
    return age;
}

// ============ 用户详情页（亮色模式） ============
function QQProfileView({ result, onBack, onOpenQZone }) {
    const isZhangwei = result.qqNumber === ZHANGWEI_QQ;
    const isLinxiaolin = result.qqNumber === LINXIAOLIN_QQ;
    const [imgError, setImgError] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [realAge, setRealAge] = useState(null);

    useEffect(() => {
        if (isZhangwei) {
            setRealAge(getZhangweiRealAge());
        }
    }, [isZhangwei]);

    const handleAddFriend = () => {
        setShowToast(true);
        setTimeout(() => setShowToast(false), 7777);
    };

    return (
        <div className="flex flex-col h-full bg-[#F5F5F5] relative">
            {/* 气泡提示 */}
            {showToast && (
                <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 animate-fade-in">
                    <div className="bg-gray-800/90 text-white text-sm px-4 py-2.5 rounded-lg shadow-lg flex items-center gap-2 whitespace-nowrap">
                        <svg className="w-4 h-4 text-[#12B7F5] flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
                        </svg>
                        好友申请已发送
                    </div>
                </div>
            )}

            {/* 顶部导航 */}
            <div className="relative z-10">
                <div className="absolute top-0 left-0 right-0 px-4 py-3 flex items-center justify-between">
                    <button onClick={onBack} className="w-9 h-9 rounded-full bg-white/80 shadow flex items-center justify-center">
                        <IoMdArrowBack className="w-5 h-5 text-gray-700" />
                    </button>
                    <button className="w-9 h-9 rounded-full bg-white/80 shadow flex items-center justify-center">
                        <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* 头图/封面区域 */}
            <div className="h-48 bg-gradient-to-b from-[#A8D8EA] to-[#E8F4F8] relative overflow-hidden">
                {/* 装饰性波浪背景 */}
                <div className="absolute inset-0 opacity-30">
                    <svg viewBox="0 0 400 200" className="w-full h-full" preserveAspectRatio="none">
                        <path d="M0,100 C100,150 200,50 400,100 L400,0 L0,0 Z" fill="#87CEEB" />
                        <path d="M0,120 C150,80 250,160 400,120 L400,0 L0,0 Z" fill="#B0E0E6" />
                    </svg>
                </div>
            </div>

            {/* 用户信息卡片 */}
            <div className="bg-white rounded-t-2xl -mt-8 relative z-10 px-5 pt-5 pb-4 shadow-sm">
                <div className="flex items-center gap-4">
                    {/* 头像 */}
                    <div className="w-20 h-20 rounded-full overflow-hidden border-3 border-white flex-shrink-0 bg-gray-100 shadow">
                        {!imgError ? (
                            <img
                                src={result.avatarSrc}
                                alt={result.nickname}
                                className="w-full h-full object-cover"
                                onError={() => setImgError(true)}
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-200">
                                <IoPersonSharp className="w-8 h-8 text-gray-400" />
                            </div>
                        )}
                    </div>
                    {/* 昵称和QQ号 */}
                    <div className="flex-1 min-w-0">
                        <h2 className="text-gray-900 text-xl font-bold truncate">{result.nickname}</h2>
                        <p className="text-gray-500 text-sm mt-0.5">QQ号：{result.qqNumber}</p>
                    </div>
                </div>

                {/* 张薇特有信息 */}
                {isZhangwei && realAge !== null && (
                    <div className="mt-4 flex items-center gap-2 text-gray-500 text-sm">
                        <span>女</span>
                        <span className="text-gray-300">|</span>
                        <span>{realAge}岁</span>
                    </div>
                )}

                {/* 林晓琳特有信息 */}
                {isLinxiaolin && (
                    <div className="mt-4 flex items-center gap-2 text-gray-500 text-sm">
                        <span>女</span>
                        <span className="text-gray-300">|</span>
                        <span>{getLinxiaolinAge()}岁</span>
                        <span className="text-gray-300">|</span>
                        <span>2月17日</span>
                        <span className="text-gray-300"> </span>
                        <span>水瓶座</span>
                    </div>
                )}
            </div>

            {/* 分隔 */}
            <div className="h-2 bg-[#F5F5F5]" />

            {/* QQ空间入口 */}
            <button
                onClick={onOpenQZone}
                className="bg-white px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                    <span className="text-gray-900 text-[15px]">查看TA的QQ空间</span>
                </div>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
            </button>

            {/* 占位区域填充 */}
            <div className="flex-1 bg-[#F5F5F5]" />

            {/* 底部操作按钮 */}
            <div className="bg-white px-4 py-4 border-t border-gray-200">
                <button
                    onClick={handleAddFriend}
                    className="w-full py-3 rounded-lg bg-[#12B7F5] text-white text-sm font-medium hover:bg-[#0FA3DB] transition-colors"
                >
                    添加好友
                </button>
            </div>
        </div>
    );
}

// ============ QQ空间无权限页面（亮色模式） ============
function QZoneNoPermissionView({ result, onBack }) {
    const [imgError, setImgError] = useState(false);

    return (
        <div className="flex flex-col h-full bg-[#F5F5F5]">
            {/* 顶部导航 */}
            <div className="bg-white px-4 py-3 flex items-center justify-between border-b border-gray-200">
                <button onClick={onBack} className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors">
                    <IoMdArrowBack className="w-5 h-5 text-gray-700" />
                </button>
                <button className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors">
                    <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01" />
                    </svg>
                </button>
            </div>

            {/* 头像 + 昵称 */}
            <div className="bg-white px-5 py-4 flex items-center gap-3">
                <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0 bg-gray-100 shadow-sm">
                    {!imgError ? (
                        <img
                            src={result.avatarSrc}
                            alt={result.nickname}
                            className="w-full h-full object-cover"
                            onError={() => setImgError(true)}
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-200">
                            <IoPersonSharp className="w-6 h-6 text-gray-400" />
                        </div>
                    )}
                </div>
                <div>
                    <span className="text-gray-900 text-lg font-medium">{result.nickname}</span>
                    <span className="text-gray-400 text-sm ml-1">（{result.qqNumber}）</span>
                </div>
            </div>

            {/* 分隔线 */}
            <div className="h-px bg-gray-200 mx-5" />

            {/* 无权限提示 */}
            <div className="flex-1 flex flex-col items-center justify-center px-6 bg-white">
                {/* 锁图标 */}
                <div className="w-20 h-20 rounded-full border-2 border-gray-300 flex items-center justify-center mb-6">
                    <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                    </svg>
                </div>

                <h3 className="text-gray-900 text-lg font-medium mb-2">主人设置了权限</h3>
                <p className="text-gray-500 text-sm">加对方为好友后才可以申请访问。</p>

                {/* 删除记录按钮 */}
                <button className="mt-8 px-6 py-2.5 rounded-full border border-gray-300 text-gray-600 text-sm hover:bg-gray-50 transition-colors flex items-center gap-1.5">
                    删除记录
                    <span className="text-yellow-500 text-base">💎</span>
                </button>
            </div>

            {/* 底部操作按钮 */}
            <div className="bg-white px-4 py-4 flex items-center gap-3 border-t border-gray-200">
                <button onClick={onBack} className="flex-1 py-3 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors">
                    查看资料卡
                </button>
                <button className="flex-1 py-3 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors">
                    加好友
                </button>
            </div>
        </div>
    );
}

// ============ QQ空间说说数据 ============
function getQZonePosts() {
    const posts = [
        {
            daysAgo: 1095,
            content: '就躺着吧，反正今天也不会有什么好事发生。',
        },
        {
            daysAgo: 1097,
            content: '又是盯着天花板的第四个小时 脑子里的声音比装修队还吵 吃完那把白色药片以后胃里像是吞了一块烧红的炭一直在往下坠 坠到哪里是个头啊 甚至分不清是饿还是恶心 想吐又吐不出来 这种把灵魂困在发烂肉体里的感觉什么时候能结束 连呼吸都觉得是在浪费空气',
        },
        {
            daysAgo: 1098,
            content: '看着窗外面的人走来走去觉得他们像是在另一个维度的生物 刚刚那个卖保险的给我打电话我竟然盯着手机屏震动看它挂断 连张嘴说个不需要都觉得耗尽了半辈子的力气 我现在的状态就像是一滩烂泥扶不上墙 别来问我怎么了 问就是没死但快了',
        },
        {
            daysAgo: 1100,
            content: '收拾行李发现二十多年竟然没什么值得带走的东西 也好 说是去封闭式治疗希望能睡个好觉 哪怕是长眠不醒的那种也好过现在这种半死不活的清醒 祝我好运吧 或者是祝我解脱 晚安这个破烂的世界',
        },
        {
            daysAgo: 1101,
            content: '在医院门口捡到的 像是科幻小说里把灵魂卖给魔鬼的契约 不过正好 这种日复一日的凌迟我真的一秒都忍不了了',
            image: '/momentsEvent.jpg',
        },
        {
            daysAgo: 1103,
            content: '我已经记不清快乐是什么感觉了，就像被一层厚厚的灰色玻璃罩住，外面的光进不来，里面的我出不去。每天醒来的第一件事，不是期待今天会发生什么，而是计算着还要熬多久才能再次躺下。我对着镜子练习微笑，想让自己看起来和正常人一样，可笑容到了嘴角，却怎么也到不了眼睛。我知道大家都在关心我，劝我开心一点，可他们不知道，"开心"对我来说，就像让一个瘫痪的人跑起来一样，不是不想，是做不到。我不是故意要消极，我只是真的没有力气了，连呼吸都觉得是一种负担。',
        },
        {
            daysAgo: 1600,
            content: '每次发完疯清醒过来回看那些文字都觉得生理性反胃 删动态的手速比脑子转得快 留下的都是还没来得及嫌弃的电子垃圾 别翻了 没什么好看的 都是些过期作废的情绪',
            image: '/momentsSmile.gif',
        },
    ];

    return posts.map((post) => {
        const date = getRelativeDate(-post.daysAgo);
        return {
            ...post,
            date,
            dateStr: formatDateFull(date),
        };
    }).sort((a, b) => b.date - a.date); // 按时间倒序
}

// ============ QQ空间密码验证页（亮色模式） ============
function QZonePasswordGate({ onUnlock }) {
    const [answer, setAnswer] = useState('');
    const [error, setError] = useState(false);
    const [shaking, setShaking] = useState(false);

    const handleSubmit = () => {
        const { yyyymmdd } = getZhangweiBirthday();
        if (answer.trim() === yyyymmdd) {
            setQZoneUnlocked();
            onUnlock();
        } else {
            setError(true);
            setShaking(true);
            setTimeout(() => setShaking(false), 500);
            setTimeout(() => setError(false), 2000);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleSubmit();
    };

    return (
        <div className="flex-1 flex flex-col items-center justify-center px-6 bg-white">
            {/* 问题标题 */}
            <div className="w-full max-w-sm mb-6">
                <h3 className="text-gray-900 text-lg font-bold mb-1">问题：我的生日(填8位数字)?</h3>
                <div className={`relative ${shaking ? 'animate-shake' : ''}`}>
                    <input
                        type="text"
                        value={answer}
                        onChange={(e) => {
                            setAnswer(e.target.value.replace(/\D/g, '').slice(0, 8));
                            setError(false);
                        }}
                        onKeyDown={handleKeyDown}
                        placeholder="请输入答案"
                        maxLength={8}
                        className={`w-full border-b-2 py-2 text-sm bg-transparent focus:outline-none transition-colors ${error ? 'border-red-400 text-red-500' : 'border-gray-300 text-gray-700 focus:border-[#12B7F5]'
                            }`}
                    />
                </div>
                {error && (
                    <p className="text-red-400 text-xs mt-1.5">答案不正确，请重试</p>
                )}
            </div>

            {/* 提交按钮 */}
            <button
                onClick={handleSubmit}
                className="w-full max-w-sm py-3 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 active:bg-gray-100 transition-colors mb-10"
            >
                提交
            </button>

            {/* 锁图标 */}
            <div className="w-20 h-20 rounded-full border-2 border-gray-300 flex items-center justify-center mb-6">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
            </div>

            <h3 className="text-gray-900 text-lg font-medium mb-2">主人设置了权限</h3>
            <p className="text-gray-500 text-sm">需要回答问题才能访问TA的空间。</p>

            {/* 删除记录按钮 */}
            <button className="mt-8 px-6 py-2.5 rounded-full border border-gray-300 text-gray-600 text-sm hover:bg-gray-50 transition-colors flex items-center gap-1.5">
                删除记录
                <span className="text-yellow-500 text-base">💎</span>
            </button>
        </div>
    );
}

// ============ 说说项组件 ============
function QZonePostItem({ post, nickname, avatarSrc }) {
    const [lightboxOpen, setLightboxOpen] = useState(false);

    return (
        <div className="bg-white px-5 py-4">
            <div className="flex gap-3">
                {/* 头像（圆形） */}
                <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-gray-100">
                    <img
                        src={avatarSrc}
                        alt={nickname}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.src = '/avatarWei2.png'; }}
                    />
                </div>
                {/* 内容 */}
                <div className="flex-1 min-w-0">
                    <p className="text-[#5B7FB5] text-sm font-medium mb-1.5">{nickname}</p>
                    <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap break-words">{post.content}</p>
                    {/* 图片（带点击放大） */}
                    {post.image && (
                        <button
                            onClick={() => setLightboxOpen(true)}
                            className="mt-2 block rounded-lg overflow-hidden max-w-[200px]"
                        >
                            <img
                                src={post.image}
                                alt="图片"
                                className="w-full h-auto object-cover rounded-lg"
                            />
                        </button>
                    )}
                    {/* 图片灯箱 */}
                    {lightboxOpen && post.image && (
                        <div
                            className="fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center cursor-zoom-out"
                            onClick={() => setLightboxOpen(false)}
                        >
                            <button
                                onClick={() => setLightboxOpen(false)}
                                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                            >
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                            <img
                                src={post.image}
                                alt="图片"
                                className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg shadow-2xl"
                                onClick={(e) => e.stopPropagation()}
                            />
                        </div>
                    )}
                    <div className="mt-3 flex items-center justify-between">
                        <span className="text-gray-400 text-xs">{post.dateStr}</span>
                        <div className="flex items-center gap-5">
                            {/* 点赞 */}
                            <button className="text-gray-400 hover:text-gray-500">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.633 10.25c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V2.75a.75.75 0 01.75-.75 2.25 2.25 0 012.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282m0 0h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 00-1.423-.23H3.35" />
                                </svg>
                            </button>
                            {/* 评论 */}
                            <button className="text-gray-400 hover:text-gray-500">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z" />
                                </svg>
                            </button>
                            {/* 转发（分享箭头） */}
                            <button className="text-gray-400 hover:text-gray-500">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                                    <path d="M14.554 3.9974L19.2301 8.13188C21.0767 9.76455 22 10.5809 22 11.6325C22 12.6842 21.0767 13.5005 19.2301 15.1332L14.554 19.2677C13.7111 20.0129 13.2897 20.3856 12.9422 20.2303C12.5947 20.0751 12.5947 19.5143 12.5947 18.3925V15.6472C8.35683 15.6472 3.76579 17.6545 2 21C2 10.2943 8.27835 7.61792 12.5947 7.61792V4.87257C12.5947 3.75082 12.5947 3.18995 12.9422 3.03474C13.2897 2.87953 13.7111 3.25215 14.554 3.9974Z" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* 评论输入框 */}
                    <div className="mt-3 flex items-center">
                        <div className="flex-1 bg-gray-100 rounded-full px-2 py-1.5 flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full overflow-hidden flex-shrink-0">
                                <img src="/avatarPlayer.jpg" alt="我" className="w-full h-full object-cover" />
                            </div>
                            <span className="text-xs text-gray-500">说点什么吧…</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ============ QQ空间页面（含密码验证 + 说说列表） ============
function QZoneView({ result, onBack }) {
    const [unlocked, setUnlocked] = useState(false);
    const [posts, setPosts] = useState([]);

    // 初始化时检查cookie
    useEffect(() => {
        if (isQZoneUnlocked()) {
            setUnlocked(true);
        }
    }, []);

    // 解锁后生成说说
    useEffect(() => {
        if (unlocked) {
            setPosts(getQZonePosts());
        }
    }, [unlocked]);

    const handleUnlock = () => {
        setUnlocked(true);
    };

    return (
        <div className="flex flex-col h-full bg-[#F5F5F5]">
            {/* 头部 */}
            <header className="bg-white px-4 py-3 flex items-center gap-3 border-b border-gray-200">
                <button onClick={onBack} className="p-1 -ml-1 text-gray-700 hover:text-gray-900">
                    <IoMdArrowBack className="w-6 h-6" />
                </button>
                <h2 className="font-medium text-gray-900">QQ空间</h2>
            </header>

            {/* 封面区域 */}
            <div className="relative bg-gradient-to-b from-[#87CEEB] to-[#E0F2FE] h-40 flex items-end justify-start p-4">
                <div className="flex items-end gap-3">
                    <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white shadow-lg">
                        <img
                            src={result.avatarSrc}
                            alt={result.nickname}
                            className="w-full h-full object-cover"
                            onError={(e) => { e.target.src = '/avatarWei2.png'; }}
                        />
                    </div>
                    <span className="text-gray-800 text-lg font-medium drop-shadow-sm">{result.nickname}</span>
                </div>
            </div>

            {/* 空间内容 */}
            {!unlocked ? (
                /* 密码验证页 */
                <QZonePasswordGate onUnlock={handleUnlock} />
            ) : (
                /* 说说列表 */
                <div className="flex-1 overflow-y-auto">
                    <div className="divide-y divide-gray-100 mt-2">
                        {posts.map((post, idx) => (
                            <QZonePostItem
                                key={idx}
                                post={post}
                                nickname={result.nickname}
                                avatarSrc={result.avatarSrc}
                            />
                        ))}
                    </div>
                    {/* 底部提示 */}
                    <div className="py-8 text-center">
                        <p className="text-gray-400 text-xs">— 没有更多了 —</p>
                    </div>
                </div>
            )}

            {/* 密码页底部按钮 */}
            {!unlocked && (
                <div className="bg-white px-4 py-4 flex items-center gap-3 border-t border-gray-200">
                    <button className="flex-1 py-3 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors">
                        申请访问
                    </button>
                    <button onClick={onBack} className="flex-1 py-3 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors">
                        查看资料卡
                    </button>
                </div>
            )}
        </div>
    );
}

// ============ 底部导航栏 ============
function QQBottomNav({ activeTab, onTabChange, totalUnread = 0 }) {
    return (
        <nav className="bg-[#F7F7F7] border-t border-gray-300 px-2 py-1">
            <div className="flex justify-around">
                {NAV_ITEMS.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => onTabChange(item.id)}
                            className={`flex flex-col items-center gap-0.5 py-1 px-4 relative ${isActive ? 'text-[#12B7F5]' : 'text-gray-500'
                                }`}
                        >
                            <div className="relative">
                                <Icon className="w-6 h-6" />
                                {item.id === 'message' && totalUnread > 0 && (
                                    <span className="absolute -top-1 -right-2 min-w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold px-0.5">
                                        {totalUnread > 99 ? '99+' : totalUnread}
                                    </span>
                                )}
                            </div>
                            <span className="text-xs">{item.label}</span>
                        </button>
                    );
                })}
            </div>
        </nav>
    );
}

// ============ 主页面组件 ============
export default function QQ() {
    const router = useRouter();
    const { state: gameState, isHydrated: gameHydrated } = useGameState();
    const [activeTab, setActiveTab] = useState('message');
    const [isSearching, setIsSearching] = useState(false);
    const [viewingProfile, setViewingProfile] = useState(null);
    const [viewingQZone, setViewingQZone] = useState(null);
    const [activeContact, setActiveContact] = useState(null); // 当前打开的聊天联系人
    const [contacts, setContacts] = useState([]);
    const [messagesByContact, setMessagesByContact] = useState({});
    const [isHydrated, setIsHydrated] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);
    const [class5Dissolved, setClass5Dissolved] = useState(false);
    const [splatStage, setSplatStage] = useState(0); // 0=idle, 1=asked question, 2=correct answer given, 3=done
    const splatReplyingRef = useRef(false);
    const [toastMsg, setToastMsg] = useState('');
    const [showToast, setShowToast] = useState(false);

    const triggerToast = useCallback((msg) => {
        setToastMsg(msg);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 7777);
    }, []);

    // 检查cookies并初始化
    useEffect(() => {
        const { playerName, startDate } = getPlayerCookies();
        if (!playerName || !startDate) {
            router.replace('/');
            return;
        }
        setIsHydrated(true);
    }, [router]);

    // 初始化消息和联系人
    useEffect(() => {
        if (!isHydrated) return;

        const storedMessages = loadQQMessages();
        const storedContacts = loadQQContacts();
        const dynamicContacts = getQQContacts();
        const dynamicMessages = getInitialQQMessages();

        if (storedMessages && Object.keys(storedMessages).length > 0) {
            setMessagesByContact(storedMessages);
        } else {
            setMessagesByContact(dynamicMessages);
        }

        if (storedContacts && storedContacts.length > 0) {
            setContacts(dynamicContacts.map(c => {
                const stored = storedContacts.find(sc => sc.id === c.id);
                return stored ? { ...c, ...stored } : c;
            }));
        } else {
            setContacts(dynamicContacts);
        }

        // Load dissolved state
        if (typeof window !== 'undefined') {
            const dissolved = localStorage.getItem('zhangwei_qq_class5_dissolved') === 'true';
            setClass5Dissolved(dissolved);
            const storedSplatStage = localStorage.getItem('zhangwei_qq_splat_stage');
            if (storedSplatStage !== null) setSplatStage(parseInt(storedSplatStage, 10));
        }

        setIsInitialized(true);
    }, [isHydrated]);

    // Save messages
    useEffect(() => {
        if (isInitialized && Object.keys(messagesByContact).length > 0) {
            saveQQMessages(messagesByContact);
        }
    }, [messagesByContact, isInitialized]);

    // Save contacts
    useEffect(() => {
        if (isInitialized && contacts.length > 0) {
            saveQQContacts(contacts);
        }
    }, [contacts, isInitialized]);

    // Save splat stage
    useEffect(() => {
        if (isInitialized && typeof window !== 'undefined') {
            localStorage.setItem('zhangwei_qq_splat_stage', String(splatStage));
        }
    }, [splatStage, isInitialized]);

    // 根据游戏状态过滤联系人（疼讯新闻仅在继续调查时显示）
    const filteredContacts = contacts.filter(c => {
        if (c.id === 'txnews' && !gameState.continueInvestigation) return false;
        return true;
    });

    // 计算未读总数用于badge
    const totalUnread = filteredContacts.reduce((sum, c) => sum + (c.unread || 0), 0);

    // 选择联系人打开聊天
    const handleSelectContact = (contact) => {
        setActiveContact(contact);
        // 清除未读
        setContacts(prev => prev.map(c => c.id === contact.id ? { ...c, unread: 0 } : c));
        if (contact.id === 'splat' || contact.id === 'class5') {
            triggerToast('这个群聊和我要找到的真相应该没有关联');
        }
    };

    // 发送消息
    const handleSendMessage = (contactId, content) => {
        const now = new Date();
        const newMsg = {
            id: 'player_' + Date.now(),
            sender: 'player',
            content,
            type: 'text',
            timestamp: now.toISOString(),
        };

        setMessagesByContact(prev => {
            const updated = {
                ...prev,
                [contactId]: [...(prev[contactId] || []), newMsg],
            };

            // 鱿谊第一群：朔月互动
            if (contactId === 'splat' && !splatReplyingRef.current) {
                const playerMsgs = updated[contactId].filter(m => m.sender === 'player');
                const currentStage = splatStage;

                if (currentStage === 0 && playerMsgs.length === 1) {
                    // 第一次发言：朔月回复两条
                    splatReplyingRef.current = true;
                    const replies = _SPLAT_R1;
                    replies.forEach((encoded, i) => {
                        setTimeout(() => {
                            setMessagesByContact(prev => ({
                                ...prev,
                                splat: [...(prev.splat || []), {
                                    id: 'sp_r1_' + i + '_' + Date.now(),
                                    sender: 'sakugetsu',
                                    senderName: '朔月',
                                    avatarImg: '/avatarSakugetsu.png',
                                    content: _d(encoded),
                                    type: 'text',
                                    timestamp: new Date().toISOString(),
                                }],
                            }));
                            if (i === replies.length - 1) {
                                setSplatStage(1);
                                splatReplyingRef.current = false;
                            }
                        }, (i + 1) * 1200);
                    });
                } else if (currentStage === 1) {
                    // 等待正确答案
                    const lastPlayerMsg = content.trim().toLowerCase();
                    const triggers = _SPLAT_T.map(e => _d(e).toLowerCase());
                    if (triggers.some(t => lastPlayerMsg.includes(t))) {
                        splatReplyingRef.current = true;
                        const replies = _SPLAT_R2;
                        replies.forEach((encoded, i) => {
                            setTimeout(() => {
                                setMessagesByContact(prev => ({
                                    ...prev,
                                    splat: [...(prev.splat || []), {
                                        id: 'sp_r2_' + i + '_' + Date.now(),
                                        sender: 'sakugetsu',
                                        senderName: '朔月',
                                        avatarImg: '/avatarSakugetsu.png',
                                        content: _d(encoded),
                                        type: 'text',
                                        html: i === replies.length - 1,
                                        timestamp: new Date().toISOString(),
                                    }],
                                }));
                                if (i === replies.length - 1) {
                                    setSplatStage(3);
                                    splatReplyingRef.current = false;
                                }
                            }, (i + 1) * 1200);
                        });
                        setSplatStage(2);
                    }
                }
            }

            // 5班班级群：第3条玩家消息后解散
            if (contactId === 'class5') {
                const playerMsgs = updated[contactId].filter(m => m.sender === 'player');
                if (playerMsgs.length >= 3 && !class5Dissolved) {
                    setClass5Dissolved(true);
                    if (typeof window !== 'undefined') {
                        localStorage.setItem('zhangwei_qq_class5_dissolved', 'true');
                    }
                    triggerToast('该群已被管理员解散');
                }
            }

            return updated;
        });

        // 更新联系人最后消息
        setContacts(prev => prev.map(c =>
            c.id === contactId ? { ...c, lastMessage: content, time: now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }) } : c
        ));
    };

    // 搜索相关
    const handleStartSearch = () => setIsSearching(true);
    const handleCancelSearch = () => setIsSearching(false);
    const handleSelectQQ = (result) => {
        setViewingProfile(result);
        setIsSearching(false);
    };
    const handleBackFromProfile = () => setViewingProfile(null);
    const handleOpenQZone = () => { if (viewingProfile) setViewingQZone(viewingProfile); };
    const handleBackFromQZone = () => setViewingQZone(null);
    const handleBackFromChat = () => setActiveContact(null);

    // 渲染主内容
    const renderContent = () => {
        // QQ空间
        if (viewingQZone) {
            const isZhangwei = viewingQZone.qqNumber === ZHANGWEI_QQ;
            return isZhangwei ? (
                <QZoneView result={viewingQZone} onBack={handleBackFromQZone} />
            ) : (
                <QZoneNoPermissionView result={viewingQZone} onBack={handleBackFromQZone} />
            );
        }

        // 用户详情
        if (viewingProfile) {
            return (
                <QQProfileView
                    result={viewingProfile}
                    onBack={handleBackFromProfile}
                    onOpenQZone={handleOpenQZone}
                />
            );
        }

        // 搜索
        if (isSearching) {
            return <SearchView onBack={handleCancelSearch} onSelectQQ={handleSelectQQ} />;
        }

        // 聊天界面
        if (activeContact) {
            // 服务号（QQ团队、QQ安全中心、疼讯新闻）—— 无输入框
            if (activeContact.chatType === 'service') {
                return <QQServiceView contact={activeContact} onBack={handleBackFromChat} />;
            }

            // 关联QQ账号
            if (activeContact.chatType === 'linked') {
                return <LinkedQQView onBack={handleBackFromChat} />;
            }

            // 群聊
            const msgs = messagesByContact[activeContact.id] || [];
            const isClass5 = activeContact.id === 'class5';
            const isSplat = activeContact.id === 'splat';
            const playerMsgCount = isClass5 ? msgs.filter(m => m.sender === 'player').length : 0;
            const isDisabled = (isClass5 && (class5Dissolved || playerMsgCount >= 5))
                || (isSplat && (splatStage >= 2 || splatReplyingRef.current));

            return (
                <QQChatView
                    contact={activeContact}
                    messages={msgs}
                    onBack={handleBackFromChat}
                    onSendMessage={(content) => handleSendMessage(activeContact.id, content)}
                    disabled={isDisabled}
                    disabledText={isClass5 ? '无法在已解散的群聊中发送消息' : ''}
                />
            );
        }

        // 消息列表
        if (activeTab === 'message') {
            return (
                <MessageListView
                    contacts={filteredContacts}
                    onStartSearch={handleStartSearch}
                    onSelectContact={handleSelectContact}
                />
            );
        }

        // 其他标签页
        return (
            <div className="h-full flex items-center justify-center bg-white p-10">
                <p className="text-gray-400">
                    {activeTab === 'contacts' && ('这里是' + (() => { const { playerName: name } = getPlayerCookies(); return name; })() + '的微信通讯录界面，应该不会有什么线索吧？')}
                    {activeTab === 'dynamic' && ('这里是' + (() => { const { playerName: name } = getPlayerCookies(); return name; })() + '的好友动态界面，既然我在QQ上没有张薇的好友，这里应该不会有什么线索吧？')}
                </p>
            </div>
        );
    };

    if (!isHydrated || !isInitialized) {
        return (
            <div className="flex flex-col bg-[#EDEDED]" style={{ height: '100dvh' }}>
                <main className="flex-1 overflow-hidden flex items-center justify-center">
                    <p className="text-gray-400">加载中...</p>
                </main>
                <QQBottomNav activeTab={activeTab} onTabChange={setActiveTab} totalUnread={0} />
            </div>
        );
    }

    return (
        <div className="flex flex-col bg-[#EDEDED]" style={{ height: '100dvh' }}>
            <Head><title>QQ</title></Head>
            <main className="flex-1 overflow-hidden">
                {renderContent()}
            </main>

            {/* 底部导航 - 搜索、详情、QQ空间、聊天时隐藏 */}
            {!isSearching && !viewingProfile && !viewingQZone && !activeContact && (
                <QQBottomNav activeTab={activeTab} onTabChange={setActiveTab} totalUnread={totalUnread} />
            )}

            <QQToast message={toastMsg} visible={showToast} />
        </div>
    );
}
