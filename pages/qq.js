import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/router';
import { getPlayerCookies } from '../utils/cookies';
import { IoChatbubbleEllipsesSharp, IoPersonSharp, IoCompassSharp, IoSettingsSharp } from 'react-icons/io5';
import { IoMdArrowBack } from 'react-icons/io';

// ============ QQ 联系人/消息数据 ============

// 玩家自己QQ的"杂音"消息列表（和游戏无关的日常聊天）
function getQQContacts() {
    return [
        {
            id: 'other_qq',
            name: '我的其他QQ帐号',
            avatarImg: null,
            avatarIcon: 'penguin',
            lastMessage: '暂无新消息',
            time: '17:59',
            unread: 0,
        },
        {
            id: 'qqteam',
            name: 'QQ团队',
            avatarImg: null,
            avatarIcon: 'penguin',
            lastMessage: '登录保护通知',
            time: '17:58',
            unread: 1,
        },
        {
            id: 'qqsecurity',
            name: 'QQ安全中心',
            avatarImg: null,
            avatarIcon: 'shield',
            lastMessage: '【密码安全提醒】您已成功修改密码，请…',
            time: '17:58',
            unread: 1,
        },
    ];
}

// ============ 底部导航配置 ============
const NAV_ITEMS = [
    { id: 'message', label: '消息', icon: IoChatbubbleEllipsesSharp },
    { id: 'contacts', label: '联系人', icon: IoPersonSharp },
    { id: 'watch', label: '看点', icon: IoCompassSharp },
    { id: 'dynamic', label: '动态', icon: IoSettingsSharp },
];

// ============ 头像组件 ============
function QQAvatar({ contact, size = 'md', className = '' }) {
    const sizeClasses = {
        sm: 'w-8 h-8',
        md: 'w-12 h-12',
        lg: 'w-16 h-16',
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

    // 默认图标头像
    if (contact.avatarIcon === 'shield') {
        return (
            <div className={`${sizeClasses[size]} rounded-full bg-[#12B7F5] flex items-center justify-center flex-shrink-0 ${className}`}>
                <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3zm-1 14.5l-4-4 1.41-1.41L11 13.67l5.59-5.59L18 9.5l-7 7z"/>
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

// ============ 搜索页面 ============
function SearchView({ onBack, onSelectQQ }) {
    const [query, setQuery] = useState('');
    const [searchResult, setSearchResult] = useState(null);
    const inputRef = useRef(null);

    useEffect(() => {
        // 自动聚焦搜索框
        inputRef.current?.focus();
    }, []);

    // 处理搜索逻辑
    const handleSearch = useCallback((value) => {
        setQuery(value);
        const trimmed = value.trim();

        // 检查是否为纯数字且大于10000
        if (/^\d+$/.test(trimmed) && parseInt(trimmed, 10) > 10000) {
            const qqNumber = trimmed;

            // 特殊QQ号：2847593160
            if (qqNumber === '2847593160') {
                setSearchResult({
                    qqNumber,
                    nickname: 'w.',
                    avatarSrc: '/avatarWei2.png',
                    isSpecial: true,
                });
            } else {
                setSearchResult({
                    qqNumber,
                    nickname: qqNumber,
                    avatarSrc: `https://q1.qlogo.cn/g?b=qq&nk=${qqNumber}&s=100`,
                    isSpecial: false,
                });
            }
        } else {
            setSearchResult(null);
        }
    }, []);

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
                        placeholder="搜索"
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

                {/* 空状态 */}
                {query && !searchResult && (
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

// ============ 消息列表视图 ============
function MessageListView({ contacts, onStartSearch }) {
    return (
        <div className="flex flex-col h-full bg-white">
            {/* 顶部状态栏 */}
            <div className="bg-[#EDEDED] px-4 pt-2 pb-1 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                    <div className="w-8 h-8 rounded-full overflow-hidden">
                        <img src="/avatarPlayer.jpg" alt="我" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex items-center gap-1">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        <span className="text-xs text-gray-500">在线</span>
                        <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <button className="text-gray-600">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </button>
                    <button className="text-gray-600">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* 搜索栏（点击后跳转到搜索视图） */}
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
                        onClick={() => {}}
                    />
                ))}
            </div>
        </div>
    );
}

// ============ QQ空间页面（占位） ============
function QZoneView({ result, onBack }) {
    return (
        <div className="flex flex-col h-full bg-[#F5F5F5]">
            {/* 头部 */}
            <header className="bg-[#12B7F5] px-4 py-3 flex items-center gap-3">
                <button onClick={onBack} className="p-1 -ml-1 text-white">
                    <IoMdArrowBack className="w-6 h-6" />
                </button>
                <h2 className="font-medium text-white">QQ空间</h2>
            </header>

            {/* 封面区域 */}
            <div className="relative bg-gradient-to-b from-[#12B7F5] to-[#0A95C9] h-40 flex items-end justify-end p-4">
                <div className="flex items-end gap-3">
                    <span className="text-white text-lg font-medium drop-shadow-md">{result.nickname}</span>
                    <div className="w-16 h-16 rounded-lg overflow-hidden border-2 border-white shadow-lg">
                        <img
                            src={result.avatarSrc}
                            alt={result.nickname}
                            className="w-full h-full object-cover"
                            onError={(e) => { e.target.src = '/avatarWei2.png'; }}
                        />
                    </div>
                </div>
            </div>

            {/* 空间内容（占位） */}
            <div className="flex-1 overflow-y-auto mt-2">
                <div className="py-16 text-center">
                    <p className="text-gray-400 text-sm">暂无动态</p>
                </div>
            </div>
        </div>
    );
}

// ============ 底部导航栏 ============
function QQBottomNav({ activeTab, onTabChange }) {
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
                                {item.id === 'message' && (
                                    <span className="absolute -top-1 -right-2 min-w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold px-0.5">
                                        2
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
    const [activeTab, setActiveTab] = useState('message');
    const [isSearching, setIsSearching] = useState(false);
    const [viewingQZone, setViewingQZone] = useState(null); // 当前查看的QQ空间结果
    const [contacts, setContacts] = useState([]);
    const [isHydrated, setIsHydrated] = useState(false);

    // 检查cookies并初始化
    useEffect(() => {
        const { playerName, startDate } = getPlayerCookies();
        if (!playerName || !startDate) {
            router.replace('/');
            return;
        }
        setContacts(getQQContacts());
        setIsHydrated(true);
    }, [router]);

    // 开始搜索
    const handleStartSearch = () => {
        setIsSearching(true);
    };

    // 取消搜索
    const handleCancelSearch = () => {
        setIsSearching(false);
    };

    // 选择QQ号 -> 查看空间
    const handleSelectQQ = (result) => {
        setViewingQZone(result);
        setIsSearching(false);
    };

    // 从QQ空间返回
    const handleBackFromQZone = () => {
        setViewingQZone(null);
    };

    // 渲染主内容
    const renderContent = () => {
        // QQ空间视图
        if (viewingQZone) {
            return (
                <QZoneView
                    result={viewingQZone}
                    onBack={handleBackFromQZone}
                />
            );
        }

        // 搜索视图
        if (isSearching) {
            return (
                <SearchView
                    onBack={handleCancelSearch}
                    onSelectQQ={handleSelectQQ}
                />
            );
        }

        // 默认消息列表
        if (activeTab === 'message') {
            return (
                <MessageListView
                    contacts={contacts}
                    onStartSearch={handleStartSearch}
                />
            );
        }

        // 其他标签页占位
        return (
            <div className="h-full flex items-center justify-center bg-white">
                <p className="text-gray-400">
                    {activeTab === 'contacts' && '联系人功能开发中...'}
                    {activeTab === 'watch' && '看点功能开发中...'}
                    {activeTab === 'dynamic' && '动态功能开发中...'}
                </p>
            </div>
        );
    };

    // 加载中
    if (!isHydrated) {
        return (
            <div className="flex flex-col bg-[#EDEDED]" style={{ height: '100dvh' }}>
                <main className="flex-1 overflow-hidden flex items-center justify-center">
                    <p className="text-gray-400">加载中...</p>
                </main>
                <QQBottomNav activeTab={activeTab} onTabChange={setActiveTab} />
            </div>
        );
    }

    return (
        <div className="flex flex-col bg-[#EDEDED]" style={{ height: '100dvh' }}>
            {/* 主内容区域 */}
            <main className="flex-1 overflow-hidden">
                {renderContent()}
            </main>

            {/* 底部导航 - 搜索和QQ空间时隐藏 */}
            {!isSearching && !viewingQZone && (
                <QQBottomNav activeTab={activeTab} onTabChange={setActiveTab} />
            )}
        </div>
    );
}
