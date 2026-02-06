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
            // 同时清空 localStorage 中的聊天记录和联系人状态
            if (typeof window !== 'undefined') {
                localStorage.removeItem('zhangwei_wechat_messages');
                localStorage.removeItem('zhangwei_wechat_contacts');
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
            <div className="relative z-10 flex flex-col items-center gap-8">
                {/* 游戏标题 */}
                <div className="text-center mb-8">
                    <h1 className="text-5xl font-bold text-white mb-4 tracking-wider">
                        张薇失联事件
                    </h1>
                    <p className="text-gray-400 text-lg">
                        一个关于寻找真相的故事
                    </p>
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
