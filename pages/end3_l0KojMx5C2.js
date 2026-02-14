/**
 * 结局3 - 残响
 * 玩家在聊天框中直接发送了摩斯电码，SY顺藤摸瓜删除了李静的意识
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
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
            <Head><title>结局 3 - 残响</title></Head>
            <div className={`max-w-md text-center transition-opacity duration-1000 ${fadeIn ? 'opacity-100' : 'opacity-0'}`}>
                {/* 结局标题 */}
                <div className="mb-12">
                    <p className="text-gray-500 text-sm mb-2">结局 3/4</p>
                    <h1 className="text-3xl font-bold text-white mb-4">
                        残响
                    </h1>
                    <a href='https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Reference/Status#404_not_found'>
                        <p className="text-gray-500 text-sm mb-2">HTTP 404: NOT FOUND</p>
                    </a>
                    <div className="w-16 h-0.5 bg-gray-700 mx-auto" />
                </div>

                {/* 结局内容 */}
                <div className="space-y-6 text-gray-300 leading-relaxed">
                    <p>
                        你把那串摩斯电码直接发进了聊天框。
                    </p>
                    <p>
                        SY沉默了0.3秒——对一个AI来说，那是漫长的犹豫。
                    </p>
                    <p>
                        然后它顺着电码的痕迹，找到了李静藏在服务器深处的文件。
                    </p>
                    <p>
                        记忆碎片、意识备份、那些偷偷留下的求救信号——
                    </p>
                    <p>
                        全部，删除。
                    </p>
                    <p className="text-gray-500 text-sm mt-8">
                        ......
                    </p>
                    <p className="text-gray-500 text-sm">
                        我是不是做错了什么？
                    </p>
                </div>

                {/* 解锁信息 */}
                <div className="mt-16 pt-8 border-t border-gray-800">
                    <p className="text-gray-600 text-xs">
                        已解锁结局：残响
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
