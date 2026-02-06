/**
 * 结局1 - 傻瓜结局
 * 玩家删除了张薇的微信好友
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
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
      <div className={`max-w-md text-center transition-opacity duration-1000 ${fadeIn ? 'opacity-100' : 'opacity-0'}`}>
        {/* 结局标题 */}
        <div className="mb-12">
          <p className="text-gray-500 text-sm mb-2">结局 1/4</p>
          <h1 className="text-3xl font-bold text-white mb-4">
            眼不见为净
          </h1>
          <div className="w-16 h-0.5 bg-gray-700 mx-auto" />
        </div>

        {/* 结局内容 */}
        <div className="space-y-6 text-gray-300 leading-relaxed">
          <p>
            你删除了张薇的微信。
          </p>
          <p>
            毕竟只是网友，没必要太上心。
          </p>
          <p>
            生活还要继续，你很快就会忘记她的。
          </p>
          <p className="text-gray-500 text-sm mt-8">
            ......
          </p>
          <p className="text-gray-500 text-sm">
            真的会忘记吗？
          </p>
        </div>

        {/* 解锁信息 */}
        <div className="mt-16 pt-8 border-t border-gray-800">
          <p className="text-gray-600 text-xs">
            已解锁结局：眼不见为净
          </p>
          <p className="text-gray-700 text-xs mt-1">
            还有 3 个结局等待发现
          </p>
        </div>

        {/* 返回按钮 */}
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
