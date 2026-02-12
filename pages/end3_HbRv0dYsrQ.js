/**
 * 结局3 - 真结局（无声）
 * 玩家揭露了真相，但张薇也随之消失
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { getPlayerCookies } from '../utils/cookies';

export default function Ending3() {
    const router = useRouter();
    const [showContent, setShowContent] = useState(false);
    const [fadeIn, setFadeIn] = useState(false);

    useEffect(() => {
        const { playerName: name } = getPlayerCookies();
        if (!name) {
            router.replace('/');
            return;
        }

        // 记录通关状态
        if (typeof window !== 'undefined') {
            localStorage.setItem('zhangwei_game_completed', 'true');
        }

        // 延迟显示内容
        setTimeout(() => setShowContent(true), 500);
        setTimeout(() => setFadeIn(true), 1000);
    }, [router]);

    if (!showContent) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8">
            <div className={`max-w-md text-center transition-opacity duration-1000 ${fadeIn ? 'opacity-100' : 'opacity-0'}`}>
                {/* 结局标题 */}
                <div className="mb-12">
                    <p className="text-gray-400 text-sm mb-2">结局 3/3</p>
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">
                        无声
                    </h1>
                    <a href='https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Reference/Status#204_no_content'>
                        <p className="text-gray-400 text-sm mb-2 hover:text-gray-600 transition-colors">HTTP 204: NO CONTENT</p>
                    </a>
                    <div className="w-16 h-0.5 bg-gray-300 mx-auto" />
                </div>

                {/* 结局内容 */}
                <div className="space-y-6 text-gray-600 leading-relaxed">
                    <p>
                        恒念药业被查封了。
                    </p>
                    <p>
                        田宇被逮捕，服务器被扣押，媒体铺天盖地地报道着这起震惊全国的丑闻。
                    </p>
                    <p>
                        你成功了。真相大白于天下。
                    </p>
                    <p className="text-gray-400 text-sm mt-8">
                        ......
                    </p>
                    <p>
                        只是，每当再次打开微信，想要和谁分享日常的时候——
                    </p>
                    <p>
                        张薇再也没有回复你的消息了。
                    </p>
                    <p className="text-gray-400 text-sm">
                        服务器关闭的那一刻，她也一起消失了。
                    </p>
                </div>

                {/* 解锁信息 */}
                <div className="mt-16 pt-8 border-t border-gray-200">
                    <p className="text-gray-400 text-xs">
                        已解锁结局：无声
                    </p>
                </div>

                {/* 返回按钮 */}
                <button
                    onClick={() => router.push('/')}
                    className="mt-8 px-6 py-2 text-gray-400 hover:text-gray-600 transition-colors text-sm"
                >
                    返回主菜单
                </button>
            </div>
        </div>
    );
}
