/**
 * 结局0 - 茶壶彩蛋
 * 玩家删除了张薇的微信好友
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { getPlayerCookies } from '../utils/cookies';

export default function Ending1() {
  const router = useRouter();
  const [playerName, setPlayerName] = useState('');
  const [showContent, setShowContent] = useState(false);
  const [fadeIn, setFadeIn] = useState(false);

  useEffect(() => {
    const { playerName: name } = getPlayerCookies();
    if (!name) {
      router.replace('/');
      return;
    }
    setPlayerName(name);

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
      <Head><title>结局 0 - 茶壶</title></Head>
      <div className={`max-w-md text-center transition-opacity duration-1000 ${fadeIn ? 'opacity-100' : 'opacity-0'}`}>
        {/* 结局标题 */}
        <div className="mb-12">
          <p className="text-gray-500 text-sm mb-2">结局 0/4</p>
          <h1 className="text-3xl font-bold text-white mb-4">
            茶壶
          </h1>
          <a href='https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Reference/Status#418_im_a_teapot'>
            <p className="text-gray-500 text-sm mb-2">HTTP 418: I'M A TEAPOT</p>
          </a>
          <div className="w-16 h-0.5 bg-gray-700 mx-auto" />
        </div>

        {/* 结局内容 */}
        <div className="space-y-6 text-gray-300 leading-relaxed">
          <p>
            你看到了结局里的HTTP状态码。
          </p>
          <p>
            作为一个IT人员，你知道404不算什么，418才是重点。
          </p>
          <p>
            即使标注着只有4个结局，但是Array starts from 0.
          </p>
          <p>
            你相信作者一定会给418做一个页面的。
          </p>
          <p className="text-gray-500 text-sm mt-8">
            ......
          </p>
          <p className="text-gray-500 text-sm">
            服务器拒绝冲泡咖啡
          </p>
        </div>

        {/* 解锁信息 */}
        <div className="mt-16 pt-8 border-t border-gray-800">
          <p className="text-gray-600 text-xs">
            已解锁结局：茶壶
          </p>
        </div>

        {/* 返回按钮 */}
        <button
          onClick={() => history.back()}
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
