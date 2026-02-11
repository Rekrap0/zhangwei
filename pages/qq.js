import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/router';
import { getPlayerCookies, setCookie, getCookie, setQZoneUnlocked, isQZoneUnlocked } from '../utils/cookies';
import { getRelativeDate, getZhangweiBirthday, getZhangweiRealAge, formatDateFull } from '../utils/chatDates';
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
                    <path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3zm-1 14.5l-4-4 1.41-1.41L11 13.67l5.59-5.59L18 9.5l-7 7z" />
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
    const [isSearching, setIsSearching] = useState(false);
    const inputRef = useRef(null);
    const debounceRef = useRef(null);

    useEffect(() => {
        // 自动聚焦搜索框
        inputRef.current?.focus();
        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, []);

    // 执行实际搜索
    const doSearch = useCallback((trimmed) => {
        if (/^\d+$/.test(trimmed) && parseInt(trimmed, 10) > 10000) {
            const qqNumber = trimmed;
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
        setIsSearching(false);
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
                        onClick={() => { }}
                    />
                ))}
            </div>
        </div>
    );
}

// ============ 张薇QQ号常量 ============
const ZHANGWEI_QQ = '2847593160';

// ============ 用户详情页（亮色模式） ============
function QQProfileView({ result, onBack, onOpenQZone }) {
    const isZhangwei = result.qqNumber === ZHANGWEI_QQ;
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
        setTimeout(() => setShowToast(false), 2500);
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
                    <span className="text-gray-900 text-[15px]">QQ空间</span>
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
            content: '我已经记不清快乐是什么感觉了，就像被一层厚厚的灰色玻璃罩住，外面的光进不来，里面的我出不去。每天醒来的第一件事，不是期待今天会发生什么，而是计算着还要熬多久才能再次躺下。我对着镜子练习微笑，想让自己看起来和正常人一样，可笑容到了嘴角，却怎么也到不了眼睛。我知道大家都在关心我，劝我开心一点，可他们不知道，"开心"对我来说，就像让一个瘫痪的人跑起来一样，不是不想，是做不到。我不是故意要消极，我只是真的没有力气了，连呼吸都觉得是一种负担。',
        },
        {
            daysAgo: 1101,
            content: '在医院门口捡到一张传单 上面写着"精准镇痛"计划 说是能通过神经调控技术阻断痛觉 听起来像是科幻小说里的骗局或者是把灵魂卖给魔鬼的契约 但是无所谓了 反正现在的我也和行尸走肉没区别 如果能让我哪怕一秒钟不感觉到痛 让我把脑子挖出来都行 这种日复一日的凌迟我真的一秒都忍不了了',
        },
        {
            daysAgo: 1103,
            content: '收拾行李发现二十多年竟然没什么值得带走的东西 也好 说是去封闭式治疗希望能睡个好觉 哪怕是长眠不醒的那种也好过现在这种半死不活的清醒 祝我好运吧 或者是祝我解脱 晚安这个破烂的世界',
        },
        {
            daysAgo: 1600,
            content: '每次发完疯清醒过来回看那些文字都觉得生理性反胃 删动态的手速比脑子转得快 留下的都是还没来得及嫌弃的电子垃圾 别翻了 没什么好看的 都是些过期作废的情绪',
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
<path d="M14.554 3.9974L19.2301 8.13188C21.0767 9.76455 22 10.5809 22 11.6325C22 12.6842 21.0767 13.5005 19.2301 15.1332L14.554 19.2677C13.7111 20.0129 13.2897 20.3856 12.9422 20.2303C12.5947 20.0751 12.5947 19.5143 12.5947 18.3925V15.6472C8.35683 15.6472 3.76579 17.6545 2 21C2 10.2943 8.27835 7.61792 12.5947 7.61792V4.87257C12.5947 3.75082 12.5947 3.18995 12.9422 3.03474C13.2897 2.87953 13.7111 3.25215 14.554 3.9974Z" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
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
    const [viewingProfile, setViewingProfile] = useState(null); // 当前查看的用户详情
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

    // 选择QQ号 -> 查看用户详情
    const handleSelectQQ = (result) => {
        setViewingProfile(result);
        setIsSearching(false);
    };

    // 从用户详情返回
    const handleBackFromProfile = () => {
        setViewingProfile(null);
    };

    // 从用户详情 -> 打开QQ空间
    const handleOpenQZone = () => {
        if (viewingProfile) {
            setViewingQZone(viewingProfile);
        }
    };

    // 从QQ空间返回到用户详情
    const handleBackFromQZone = () => {
        setViewingQZone(null);
    };

    // 渲染主内容
    const renderContent = () => {
        // QQ空间视图（在用户详情之上）
        if (viewingQZone) {
            const isZhangwei = viewingQZone.qqNumber === ZHANGWEI_QQ;
            if (isZhangwei) {
                return (
                    <QZoneView
                        result={viewingQZone}
                        onBack={handleBackFromQZone}
                    />
                );
            } else {
                return (
                    <QZoneNoPermissionView
                        result={viewingQZone}
                        onBack={handleBackFromQZone}
                    />
                );
            }
        }

        // 用户详情视图
        if (viewingProfile) {
            return (
                <QQProfileView
                    result={viewingProfile}
                    onBack={handleBackFromProfile}
                    onOpenQZone={handleOpenQZone}
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

            {/* 底部导航 - 搜索、详情和QQ空间时隐藏 */}
            {!isSearching && !viewingProfile && !viewingQZone && (
                <QQBottomNav activeTab={activeTab} onTabChange={setActiveTab} />
            )}
        </div>
    );
}
