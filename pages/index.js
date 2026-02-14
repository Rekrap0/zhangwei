import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { getPlayerCookies, setPlayerCookies, clearPlayerCookies } from '../utils/cookies';

export default function StartScreen() {
    const router = useRouter();
    const [isReturningPlayer, setIsReturningPlayer] = useState(false);
    const [showNameModal, setShowNameModal] = useState(false);
    const [playerName, setPlayerName] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [showClearConfirm, setShowClearConfirm] = useState(false);
    const [isGameCompleted, setIsGameCompleted] = useState(false);
    const [activeTab, setActiveTab] = useState(0);
    const [hasViewedNotice, setHasViewedNotice] = useState(false);
    const [nameError, setNameError] = useState('');
    const [isInAppBrowser, setIsInAppBrowser] = useState(false);

    // 角色名黑名单，防止玩家使用与游戏角色重名的昵称
    const BLACKLISTED_NAMES = [
        '张薇', '田宇', '李静', '田念安', '林晓琳',
        '小恒', 'SY', 'sy', 'Sy', 'sY', '思圆', '朔月',
        '恒念', '小念医生',
    ];

    const isNameBlacklisted = (name) => {
        const trimmed = name.trim();
        return BLACKLISTED_NAMES.some(
            (blocked) => trimmed === blocked || trimmed.toLowerCase() === blocked.toLowerCase()
        );
    };

    // 结局数据（路径经过编码，避免直接暴露）
    // 使用简单的字符替换混淆
    const endingData = [
        { id: 1, name: '眼不见为净', code: 'ZW5kMV81emhVZHg3S3A=' },
        { id: 2, name: '回声', code: 'ZW5kMl9rMXNaeU5NWWQ2' },
        { id: 3, name: '残响', code: 'ZW5kM19sMEtvak14NUMy' },
        { id: 4, name: '无声', code: 'ZW5kNF9IYlJ2MGRZc3JR' },
    ];

    // 解码并跳转
    const goToEnding = (code) => {
        try {
            const path = '/' + atob(code);
            router.push(path);
        } catch (e) {
            // ignore
        }
    };

    // 检查是否为已有存档的玩家
    useEffect(() => {
        const { playerName, startDate } = getPlayerCookies();
        if (playerName && startDate) {
            setIsReturningPlayer(true);
        }
        // 检查通关状态
        if (typeof window !== 'undefined') {
            const completed = localStorage.getItem('zhangwei_game_completed') === 'true';
            setIsGameCompleted(completed);
            // 检测是否在微信/QQ内置浏览器中
            if (/micromessenger|qq\//i.test(navigator.userAgent)) {
                setIsInAppBrowser(true);
            }
        }
        setIsLoading(false);
    }, []);

    // 开始/继续游戏
    const handleStartGame = () => {
        if (isReturningPlayer) {
            // 直接跳转到桌面
            router.push('/desktop');
        } else {
            // 显示输入网名的弹窗
            setShowNameModal(true);
        }
    };

    // 确认网名并开始游戏
    const handleConfirmName = () => {
        if (!playerName.trim()) return;
        if (isNameBlacklisted(playerName)) {
            setNameError('无法使用这个名字');
            return;
        }
        setNameError('');
        setPlayerCookies(playerName.trim());
        router.push('/desktop');
    };

    // 清空游戏进度
    const handleClearProgress = () => {
        setShowClearConfirm(true);
    };

    const confirmClearProgress = () => {
        clearPlayerCookies();
        // 清空所有 localStorage 游戏数据
        if (typeof window !== 'undefined') {
            // 微信相关
            localStorage.removeItem('zhangwei_wechat_messages');
            localStorage.removeItem('zhangwei_wechat_contacts');
            // 桌面图标
            localStorage.removeItem('zhangwei_desktop_icons');
            // 已发现的搜索结果
            localStorage.removeItem('zhangwei_discovered_results');
            // 游戏状态
            localStorage.removeItem('zhangwei_game_state');
            // 恒念客服聊天
            localStorage.removeItem('zhangwei_hengnian_chat');
            // 微博账户状态
            localStorage.removeItem('zhangwei_weibo_state');
            // 微博验证码
            localStorage.removeItem('zhangwei_weibo_verification_code');
            // 管理员登录状态已在 clearPlayerCookies 中清除（是 Cookie 不是 localStorage）
            // QQ空间解锁状态
            localStorage.removeItem('zhangwei_qzone_unlocked');
            // QQ聊天记录和联系人
            localStorage.removeItem('zhangwei_qq_messages');
            localStorage.removeItem('zhangwei_qq_contacts');
            localStorage.removeItem('zhangwei_qq_class5_dissolved');
            localStorage.removeItem('zhangwei_qq_search_history');
            localStorage.removeItem('zhangwei_qq_splat_stage');
            // 清除所有 AI 聊天记录 (zhangwei_ai_chat_*)
            const keysToRemove = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith('zhangwei_ai_chat_')) {
                    keysToRemove.push(key);
                }
            }
            keysToRemove.forEach(key => localStorage.removeItem(key));
            // 通关状态
            localStorage.removeItem('zhangwei_game_completed');
        }
        setIsReturningPlayer(false);
        setIsGameCompleted(false);
        setShowClearConfirm(false);
    };

    // 关闭弹窗
    const handleCloseModal = () => {
        setShowNameModal(false);
        setPlayerName('');
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 flex items-center justify-center">
                <div className="text-white/50">加载中...</div>
            </div>
        );
    }

    const tabLabels = ['前情提要', '游戏介绍', '游戏须知'];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 flex flex-col items-center justify-center relative overflow-hidden">
            <Head><title>张薇失联事件</title></Head>
            {/* 内置浏览器警告 */}
            {isInAppBrowser && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-start justify-center overflow-y-auto">
                    <div className="bg-gray-900 border border-gray-700 rounded-xl m-5 p-6 max-w-md w-full shadow-2xl mt-20">
                        <p className="text-red-400 font-bold text-lg mb-3">
                            您似乎正在通过QQ或微信内置浏览器访问此网站，这会导致网站显示不正常。
                        </p>
                        <p className="text-white mb-3">
                            请点击右上角 → 在浏览器打开。
                        </p>
                        <p className="text-red-400 mb-3">
                            如果右上角未显示按钮，请长按选择下方链接，点击&ldquo;打开&rdquo;或手动复制并粘贴到浏览器打开。
                        </p>
                        <p className="text-white font-bold break-all select-all">
                            {typeof window !== 'undefined' ? window.location.href : ''}
                        </p>
                    </div>
                </div>
            )}

            {/* 背景效果 */}
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

            {/* 主内容区域 */}
            <div className="relative z-10 flex flex-col items-center gap-8 my-10">
                {/* 游戏标题 */}
                <div className="text-center mb-8">
                    <section className='p-5'>
                        <h1 className="text-5xl font-bold text-white mb-4 tracking-wider">
                            张薇失联事件
                        </h1>
                        <p className="text-gray-400 text-lg">
                            一个关于寻找真相的故事
                        </p>
                    </section>
                    {isGameCompleted ? (
                        <>
                            <section className='p-5'>
                                <h2 className="text-2xl font-bold text-green-400 mb-4 tracking-wider">🎉 恭喜通关本游戏</h2>
                                <p className="text-white max-w-[500px] px-5 text-center my-2">
                                    如果觉得还不错的话，记得分享给你的朋友喔
                                </p>
                            </section>
                            <section className='p-5'>
                                <h2 className="text-xl font-bold text-white mb-4 tracking-wider">结局回顾</h2>
                                <div className="flex flex-col gap-3 max-w-[300px] mx-auto">
                                    {endingData.map((ending) => (
                                        <button
                                            key={ending.id}
                                            onClick={() => goToEnding(ending.code)}
                                            className="px-6 py-3 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-600 hover:border-gray-500 rounded-lg text-white transition-all"
                                        >
                                            结局 {ending.id}：{ending.name}
                                        </button>
                                    ))}
                                </div>
                            </section>
                        </>
                    ) : (
                        <>
                            {/* Tab switcher */}
                            <div className="flex gap-1 mb-0 max-w-[540px] mx-auto px-5">
                                {tabLabels.map((label, i) => (
                                    <button
                                        key={label}
                                        onClick={() => {
                                            setActiveTab(i);
                                            if (i === 2) setHasViewedNotice(true);
                                        }}
                                        className={`flex-1 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${activeTab === i
                                                ? 'text-white'
                                                : 'text-gray-400 hover:text-gray-300 hover:bg-gray-700/30'
                                            }`}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>

                            {/* Tab content */}
                            <div className="rounded-b-lg max-w-[540px] mx-auto px-5 h-[300px] overflow-y-scroll mt-5">
                                {activeTab === 0 && (
                                    <section>
                                        <p className="text-white max-w-[500px] px-5 text-left my-2">
                                            你的网友"张薇"是你的好闺蜜，但是已经失联超过 168 小时了。 她最后一次给你发微信是在一周前。作为她在网络上最好的朋友，你察觉到了某种不寻常的违和感。
                                        </p>
                                    </section>
                                )}
                                {activeTab === 1 && (
                                    <section>
                                        <p className="text-white max-w-[500px] px-5 text-left my-2">
                                            这是一款"没有进度条"的ARG游戏，你可以使用主角的手机里的搜索框去打开主角的手机应用、搜索网页结果，一步步推进找到线索。<br />
                                            你只能通过搜索框搜索正确、完整的应用名来打开应用，不过在搜索一次并打开应用之后，应用图标会添加至桌面的"最近使用"界面。
                                        </p>
                                        <p className="text-white max-w-[500px] px-5 text-left my-2">
                                            你的目标：
                                            <ul className="px-5 list-disc">
                                                <li>找回张薇。</li>
                                                <li>找到事件的真相。</li>
                                            </ul>
                                        </p>
                                        <p className="text-white max-w-[500px] px-5 text-left my-2">
                                            如果不知道怎么开始的话，请想起你们最后的聊天记录在"<b>微信</b>"里，试着用搜索框打开这个应用吧。
                                        </p>
                                    </section>
                                )}
                                {activeTab === 2 && (
                                    <section>
                                        <ul className="text-white text-left max-w-[500px] px-5 list-disc">
                                            <li>本游戏剧情纯属虚构，与现实的人、地点、组织没有任何关系。请勿将游戏内的任何内容带入现实，或对现实中同名的真实公司、真实人物进行联系或骚扰。</li>
                                            <li>和同类网页解密游戏有所不同的是，此游戏没有页面编号，你已经访问过的页面<b>可能会随游戏的进度推动继续变化</b>。</li>
                                            <li>游戏内的时间由您开始游戏的时间而定，<b>部分线索的时间将会随游戏开始时间而变化</b>（也就是说，直接复制其他人解除来的密码不一定有用的）</li>
                                            <li>游戏可能会调用真实世界的网页或搜索结果以提升沉浸感和游戏难度，您可以通过查看网站地址栏域名是否为{window.location.href}的方式来判断自己是在游戏内还是在外部网站。</li>
                                            <li>本游戏不要求任何编程、it知识。请你只从肉眼可见的信息中进行推理，无需查看页面元素改/解析文件等。</li>
                                            <li>本网站使用Cookies等技术在你的浏览器本地储存游戏进度（Cookies内容被不会发送，也不包含任何分析型Cookies），本项目未连接或使用任何数据库。</li>
                                            <li>部分文本输入框/搜索框会使用外部的API来提供更好的游戏体验，请勿在文本框/搜索框搜索真实世界的个人信息。</li>
                                            <li>为了提高效率和保护隐私，部分动态图片、新闻图片、包括真实人脸的图片使用AI生成。本游戏的所有人类作者拒绝使用也不鼓励在现实生活中使用AI生成头像或插画。</li>
                                            <li>游戏中没有跳脸或血腥画面（因为作者本人很讨厌这些）。游戏不包含任何音效。</li>
                                        </ul>
                                    </section>
                                )}
                            </div>
                        </>
                    )}
                    {/* 版权信息 */}
                    <div className="text-gray-500 text-xs">
                        © {new Date().getFullYear()} Jiangye
                    </div>
                </div>

                {/* 按钮区域 */}
                <div className="flex flex-col items-center gap-4">
                    {!isGameCompleted &&
                        <button
                            onClick={() => {
                                if (!isReturningPlayer && !hasViewedNotice) {
                                    const next = activeTab + 1;
                                    setActiveTab(next);
                                    if (next === 2) setHasViewedNotice(true);
                                } else {
                                    handleStartGame();
                                }
                            }}
                            className="px-12 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white text-xl font-semibold rounded-lg shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300 transform hover:scale-105"
                        >
                            {isReturningPlayer ? '继续游戏' : (hasViewedNotice ? '开始游戏' : '下一步')}
                        </button>
                    }
                    <div className='flex gap-4'>
                        <button
                            onClick={() => window.location.href = '/about'}
                            className="mt-4 text-gray-300 hover:text-white underline underline-offset-4 decoration-text-gray-300/50 hover:decoration-white transition-colors text-sm"
                        >
                            关于此项目
                        </button>

                        <button
                            onClick={() => window.location.href = 'mailto:songjiangye2021@gmail.com?subject=' + encodeURIComponent('张薇失联事件 - 问题反馈')}
                            className="mt-4 text-gray-300 hover:text-white underline underline-offset-4 decoration-text-gray-300/50 hover:decoration-white transition-colors text-sm"
                        >
                            反馈问题
                        </button>

                        {/* 清空游戏进度按钮 - Link 样式，红色 */}
                        <button
                            onClick={handleClearProgress}
                            className="mt-4 text-red-400 hover:text-red-300 underline underline-offset-4 decoration-red-400/50 hover:decoration-red-300 transition-colors text-sm"
                        >
                            清空游戏进度
                        </button>
                    </div>
                </div>

            </div>

            {/* 输入网名弹窗 */}
            {
                showNameModal && (
                    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
                        <div className="bg-gray-800 border border-gray-700 rounded-xl p-8 max-w-md w-full mx-4 shadow-2xl">
                            <h2 className="text-2xl font-bold text-white mb-2">欢迎来到游戏</h2>
                            <p className="text-gray-400 mb-6">请输入你的网名，这将作为你在游戏中的身份</p>

                            <input
                                type="text"
                                value={playerName}
                                onChange={(e) => {
                                    setPlayerName(e.target.value);
                                    if (nameError) setNameError('');
                                }}
                                onKeyDown={(e) => e.key === 'Enter' && handleConfirmName()}
                                placeholder="请输入你的昵称..."
                                className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                                autoFocus
                            />
                            {nameError && (
                                <p className="text-red-400 text-sm mt-2">{nameError}</p>
                            )}

                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={handleCloseModal}
                                    className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors"
                                >
                                    取消
                                </button>
                                <button
                                    onClick={handleConfirmName}
                                    disabled={!playerName.trim()}
                                    className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
                                >
                                    确认
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* 清空进度确认弹窗 */}
            {
                showClearConfirm && (
                    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
                        <div className="bg-gray-800 border border-gray-700 rounded-xl p-8 max-w-md w-full mx-4 shadow-2xl">
                            <h2 className="text-2xl font-bold text-white mb-2">确认清空进度</h2>
                            <p className="text-gray-400 mb-6">确定要清空所有游戏进度吗？此操作不可撤销。</p>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowClearConfirm(false)}
                                    className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors"
                                >
                                    取消
                                </button>
                                <button
                                    onClick={confirmClearProgress}
                                    className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-lg transition-colors"
                                >
                                    确认清空
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
}
