/**
 * 尾声 - 揭露真相
 * 玩家使用田宇的微博账号发布了公司内幕
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function Epilogue() {
  const router = useRouter();
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    // 逐步显示内容
    const timers = [
      setTimeout(() => setPhase(1), 800),
      setTimeout(() => setPhase(2), 2500),
      setTimeout(() => setPhase(3), 5000),
    ];

    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-8 text-white">
      <Head><title>尾声</title></Head>
      <div className="max-w-2xl text-center space-y-8">
        {/* 描述 */}
        <div className={`transition-opacity duration-1000 ${phase >= 1 ? 'opacity-100' : 'opacity-0'}`}>
          <p className="text-lg leading-relaxed text-gray-200 mb-6">
            你使用田宇的官方认证微博账号发布了一条长微博，详细揭露了恒念药业"精准镇痛"活动的真相：
          </p>
          <ul className="space-y-3 text-gray-300 text-left max-w-md mx-auto">
            <li>• 实验的真实目的是意识转移技术</li>
            <li>• 多名参与者在实验中"意外"死亡</li>
            <li>• 受害者的意识被数字化并囚禁在服务器中</li>
            <li>• 公司利用AI操控死者的社交账号欺骗家属</li>
          </ul>
        </div>

        {/* 后续 */}
        <div className={`transition-opacity duration-1000 ${phase >= 2 ? 'opacity-100' : 'opacity-0'}`}>
          <div className="pt-8 border-t border-white/10">
            <p className="text-gray-400 leading-relaxed">
              微博迅速获得了大量转发和关注
            </p>
            <p className="text-gray-400 leading-relaxed">
              相关部门已介入调查...
            </p>
          </div>
        </div>

        {/* 继续按钮 */}
        <div className={`transition-opacity duration-1000 ${phase >= 3 ? 'opacity-100' : 'opacity-0'}`}>
          <button
            onClick={() => router.push('/end3_HbRv0dYsrQ')}
            className="mt-8 px-8 py-3 text-gray-400 hover:text-white transition-colors  rounded-lg"
          >
            继续
          </button>
        </div>
      </div>
    </div>
  );
}
