import { useState } from 'react';
import { useGameState } from '../hooks/useGameState';

export default function Chrome() {
  const { state, isHydrated, updateState } = useGameState();
  const [isFixing, setIsFixing] = useState(false);

  // 修复网络
  const handleFixNetwork = async () => {
    console.log('[Chrome] 开始修复网络...');
    setIsFixing(true);

    // 模拟修复过程
    await new Promise(resolve => setTimeout(resolve, 1500));

    updateState({ networkStatus: 'online' });
    console.log('[Chrome] 网络已修复，状态已广播');
    
    setIsFixing(false);
  };

  // 断开网络（用于测试）
  const handleDisconnect = () => {
    console.log('[Chrome] 断开网络连接');
    updateState({ networkStatus: 'offline' });
  };

  // 等待水合完成
  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-500">加载中...</div>
      </div>
    );
  }

  const isOnline = state.networkStatus === 'online';

  return (
    <div className="min-h-screen bg-gray-200 flex flex-col">
      {/* Chrome 顶部栏 */}
      <header className="bg-gray-100 border-b border-gray-300">
        {/* 标签栏 */}
        <div className="flex items-center gap-1 px-2 pt-2">
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-t-lg border border-gray-300 border-b-0 max-w-xs">
            <div className="w-4 h-4 bg-blue-500 rounded-sm flex items-center justify-center">
              <span className="text-white text-xs font-bold">恒</span>
            </div>
            <span className="text-sm text-gray-700 truncate">恒念药业 - 内网系统</span>
            <button className="ml-2 text-gray-400 hover:text-gray-600">×</button>
          </div>
          <button className="px-3 py-2 text-gray-400 hover:bg-gray-200 rounded-t">+</button>
        </div>

        {/* 地址栏 */}
        <div className="bg-white flex items-center gap-2 px-4 py-2">
          {/* 导航按钮 */}
          <div className="flex items-center gap-1">
            <button className="p-1 text-gray-400 hover:bg-gray-100 rounded">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
              </svg>
            </button>
            <button className="p-1 text-gray-400 hover:bg-gray-100 rounded">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
              </svg>
            </button>
            <button className="p-1 text-gray-400 hover:bg-gray-100 rounded">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
              </svg>
            </button>
          </div>

          {/* 地址栏输入框 */}
          <div className="flex-1 flex items-center bg-gray-100 rounded-full px-4 py-1.5">
            <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
            </svg>
            <span className="text-sm text-gray-600">https://intranet.hengnian-pharma.cn/admin/network</span>
          </div>

          {/* 右侧按钮 */}
          <div className="flex items-center gap-2">
            <button className="p-1 text-gray-400 hover:bg-gray-100 rounded">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* 网页内容区域 */}
      <main className="flex-1 bg-white p-8">
        <div className="max-w-2xl mx-auto">
          {/* 公司 Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
                <span className="text-white text-2xl font-bold">恒</span>
              </div>
              <div className="text-left">
                <h1 className="text-xl font-bold text-gray-800">恒念药业</h1>
                <p className="text-xs text-gray-500">Hengnian Pharmaceutical Co., Ltd.</p>
              </div>
            </div>
          </div>

          {/* 内网系统面板 */}
          <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
              <h2 className="text-white font-semibold text-lg">内网系统 - 网络管理面板</h2>
              <p className="text-blue-200 text-sm mt-1">Network Administration Panel v2.4.1</p>
            </div>

            <div className="p-6">
              {/* 当前状态 */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">当前网络状态</h3>
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${
                  isOnline 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-red-100 text-red-700'
                }`}>
                  <span className={`w-3 h-3 rounded-full ${
                    isOnline ? 'bg-green-500 animate-pulse' : 'bg-red-500'
                  }`}></span>
                  <span className="font-medium">
                    {isOnline ? '网络连接正常' : '网络连接异常'}
                  </span>
                </div>
              </div>

              {/* 操作按钮 */}
              <div className="space-y-3">
                {!isOnline ? (
                  <>
                    {/* 离线时显示修复按钮 */}
                    <button
                      onClick={handleFixNetwork}
                      disabled={isFixing}
                      className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                        isFixing
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl'
                      }`}
                    >
                      {isFixing ? (
                        <>
                          <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                          </svg>
                          正在修复网络连接...
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"/>
                          </svg>
                          点击修复网络
                        </>
                      )}
                    </button>

                    <div className="text-center text-sm text-gray-500">
                      检测到外部连接异常，请点击上方按钮进行修复
                    </div>
                  </>
                ) : (
                  <>
                    {/* 在线时显示断开按钮 */}
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                      <svg className="w-12 h-12 text-green-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                      <p className="text-green-700 font-medium">网络连接已恢复正常</p>
                      <p className="text-green-600 text-sm mt-1">所有服务运行中</p>
                    </div>

                    {/* 测试用的断开按钮 */}
                    <button
                      onClick={handleDisconnect}
                      className="w-full px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg font-medium transition-colors text-sm"
                    >
                      模拟断开网络 (测试用)
                    </button>
                  </>
                )}
              </div>

              {/* 系统信息 */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">系统信息</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-gray-100 rounded-lg p-3">
                    <span className="text-gray-500">服务器</span>
                    <p className="font-mono text-gray-700">CN-BJ-01</p>
                  </div>
                  <div className="bg-gray-100 rounded-lg p-3">
                    <span className="text-gray-500">延迟</span>
                    <p className="font-mono text-gray-700">{isOnline ? '23ms' : '---'}</p>
                  </div>
                  <div className="bg-gray-100 rounded-lg p-3">
                    <span className="text-gray-500">上行</span>
                    <p className="font-mono text-gray-700">{isOnline ? '100 Mbps' : '0 Mbps'}</p>
                  </div>
                  <div className="bg-gray-100 rounded-lg p-3">
                    <span className="text-gray-500">下行</span>
                    <p className="font-mono text-gray-700">{isOnline ? '100 Mbps' : '0 Mbps'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 底部版权 */}
          <div className="text-center text-xs text-gray-400 mt-8">
            © 2026 恒念药业股份有限公司 版权所有 | 内部系统 仅限授权访问
          </div>
        </div>
      </main>
    </div>
  );
}
