import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { getPlayerCookies, setPlayerCookies, clearPlayerCookies } from '../utils/cookies';

export default function StartScreen() {
    const router = useRouter();
    const [isReturningPlayer, setIsReturningPlayer] = useState(false);
    const [showNameModal, setShowNameModal] = useState(false);
    const [playerName, setPlayerName] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    // 检查是否为已有存档的玩家
    useEffect(() => {
        const { playerName, startDate } = getPlayerCookies();
        if (playerName && startDate) {
            setIsReturningPlayer(true);
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
        if (playerName.trim()) {
            setPlayerCookies(playerName.trim());
            router.push('/desktop');
        }
    };

    // 清空游戏进度
    const handleClearProgress = () => {
        if (confirm('确定要清空所有游戏进度吗？此操作不可撤销。')) {
            clearPlayerCookies();
            // 同时清空 localStorage 中的聊天记录、联系人状态和桌面图标
            if (typeof window !== 'undefined') {
                localStorage.removeItem('zhangwei_wechat_messages');
                localStorage.removeItem('zhangwei_wechat_contacts');
                localStorage.removeItem('zhangwei_desktop_icons');
            }
            setIsReturningPlayer(false);
        }
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

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 flex flex-col items-center justify-center relative overflow-hidden">
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
                    <section className='p-5'>
                        <h2 className="text-xl font-bold text-white mb-4 tracking-wider">前情提要</h2>
                        <p className="text-white max-w-[500px] px-5 text-left">
                            你的网友“张薇”是你的好闺蜜，但是已经失联超过 168 小时了。 她最后一次给你发微信是在一周前。作为她在网络上最好的朋友，你察觉到了某种不寻常的违和感。
                        </p>
                    </section>
                    <section className='p-5'>
                        <h2 className="text-xl font-bold text-white mb-4 tracking-wider">游戏介绍</h2>
                        <p className="text-white max-w-[500px] px-5 text-left">
                            这是一款“没有进度条”的ARG游戏，你可以使用主角的手机里的搜索框去打开主角的手机应用、搜索网页结果，一步步推进找到线索。<br/>
                            你的目标：
                        </p>
                        <ul className="text-white text-left max-w-[500px] px-5 list-disc">
                            <li>找回张薇。</li>
                            <li>找到事件的真相。</li>
                        </ul>
                    </section>
                    <section className='p-5'>
                        <h2 className="text-xl font-bold text-white mb-4 tracking-wider">游戏须知</h2>
                        <ul className="text-white text-left max-w-[500px] px-5 list-disc">
                            <li>本游戏剧情纯属虚构，请勿将游戏内的任何内容带入现实，或对现实中同名的真实公司、真实人物进行联系或骚扰。</li>
                            <li>和同类网页解密游戏有所不同的是，此游戏没有页面编号，你已经访问过的页面<b>可能会随游戏的进度推动继续变化</b>。</li>
                            <li>游戏可能会调用真实世界的网页或搜索结果以提升沉浸感和游戏难度，您可以通过查看网站地址栏域名是否为{window.location.href}的方式来判断自己是在游戏内还是在外部网站。</li>
                            <li>本游戏不要求任何编程、it知识。请你只从肉眼可见的信息中进行推理，无需查看源代码或修改/解析文件等。</li>
                            <li>本网站使用Cookies等技术在你的浏览器本地储存游戏进度（Cookies内容被不会发送，也不包含任何分析型Cookies），部分文本输入框/搜索框会使用外部的API来提供更好的游戏体验，请勿在文本框/搜索框搜索真实世界的个人信息。</li>
                            <li>游戏中没有跳脸或血腥画面（因为作者本人很讨厌这些）。游戏不包含任何音效。</li>
                        </ul>
                    </section>
                    {/* 版权信息 */}
                    <div className="text-gray-500 text-xs">
                        © 2026 Jiangye
                    </div>
                </div>

                {/* 按钮区域 */}
                <div className="flex flex-col items-center gap-4">
                    {/* 开始/继续游戏按钮 */}
                    <button
                        onClick={handleStartGame}
                        className="px-12 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white text-xl font-semibold rounded-lg shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300 transform hover:scale-105"
                    >
                        {isReturningPlayer ? '继续游戏' : '开始游戏'}
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

            {/* 输入网名弹窗 */}
            {showNameModal && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-gray-800 border border-gray-700 rounded-xl p-8 max-w-md w-full mx-4 shadow-2xl">
                        <h2 className="text-2xl font-bold text-white mb-2">欢迎来到游戏</h2>
                        <p className="text-gray-400 mb-6">请输入你的网名，这将作为你在游戏中的身份</p>

                        <input
                            type="text"
                            value={playerName}
                            onChange={(e) => setPlayerName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleConfirmName()}
                            placeholder="请输入你的网名..."
                            className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                            autoFocus
                        />

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
            )}
        </div>
    );
}
