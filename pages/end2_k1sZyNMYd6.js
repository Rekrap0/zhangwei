/**
 * 结局2 - 假结局（回声）
 * 玩家选择结束调查，回到和张薇AI聊天的日常
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { getPlayerCookies } from '../utils/cookies';

export default function Ending2() {
    const router = useRouter();
    const [showContent, setShowContent] = useState(false);
    const [fadeIn, setFadeIn] = useState(false);

    useEffect(() => {
        const { playerName: name } = getPlayerCookies();
        if (!name) {
            router.replace('/');
            return;
        }

        // 延迟显示内容
        setTimeout(() => setShowContent(true), 500);
        setTimeout(() => setFadeIn(true), 1000);
    }, [router]);

    if (!showContent) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center p-8">
            <Head><title>结局 2 - 回声</title></Head>
            <div className={`max-w-md text-center transition-opacity duration-1000 ${fadeIn ? 'opacity-100' : 'opacity-0'}`}>
                {/* 结局标题 */}
                <div className="mb-12">
                    <p className="text-gray-500 text-sm mb-2">结局 2/3</p>
                    <h1 className="text-3xl font-bold text-white mb-4">
                        回声
                    </h1>
                    <a href='https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Reference/Status#200_ok'>
                        <p className="text-gray-500 text-sm mb-2">HTTP 200: OK</p>
                    </a>
                    <div className="w-16 h-0.5 bg-gray-700 mx-auto" />
                </div>

                {/* 结局内容 */}
                <div className="space-y-6 text-gray-300 leading-relaxed">
                    <p>
                        张薇发来了消息，配着那些你最熟悉的搞怪表情包。
                    </p>
                    <p>
                        你们又开始了插科打诨，互相诉说着工作上的压力，约着那个总是聚不齐的饭局。
                    </p>
                    <p>
                        只是，你真的相信这是巧合吗？
                    </p>
                    <p>
                        为什么当你按下"修复网络"按钮的瞬间，远在千里之外的她，就恰好重新上线了呢？
                    </p>
                    <p className="text-gray-500 text-sm mt-8">
                        ......
                    </p>
                    <p className="text-gray-500 text-sm">
                        屏幕对面的那个"人"，真的是张薇吗？
                    </p>
                </div>

                {/* 解锁信息 */}
                <div className="mt-16 pt-8 border-t border-gray-800">
                    <p className="text-gray-600 text-xs">
                        已解锁结局：回声
                    </p>
                </div>

                {/* 返回按钮 */}
                <button
                    onClick={() => router.back()}
                    className="mt-8 px-6 py-2 text-gray-500 hover:text-gray-300 transition-colors text-sm"
                >
                    返回上一页
                </button>
                <button
                    onClick={() => router.push('/')}
                    className="mt-8 px-6 py-2 text-gray-500 hover:text-gray-300 transition-colors text-sm"
                >
                    返回主菜单
                </button>
            </div>
        </div>
    );
}
