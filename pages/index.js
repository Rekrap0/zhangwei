import { useGameState } from '../hooks/useGameState';

export default function Desktop() {
  const { state, isHydrated, resetState } = useGameState();

  // 打开微信页面
  const openWechat = () => {
    console.log('[Desktop] 打开微信窗口');
    window.open('/wechat', '_blank', 'noopener,noreferrer');
  };

  // 打开浏览器页面
  const openChrome = () => {
    console.log('[Desktop] 打开浏览器窗口');
    window.open('/chrome', '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 p-8 relative">
      {/* 桌面壁纸效果 */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
      
      {/* 桌面图标区域 */}
      <div className="relative z-10 flex flex-col gap-6 max-w-xs">
        {/* 微信图标 */}
        <button
          onClick={openWechat}
          className="flex flex-col items-center gap-2 p-4 rounded-lg hover:bg-white/10 transition-colors group"
        >
          <div className="w-16 h-16 bg-green-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
            <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 01.213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 00.167-.054l1.903-1.114a.864.864 0 01.717-.098 10.16 10.16 0 002.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 01-1.162 1.178A1.17 1.17 0 014.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 01-1.162 1.178 1.17 1.17 0 01-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 01.598.082l1.584.926a.272.272 0 00.14.045c.134 0 .24-.111.24-.247 0-.06-.024-.12-.04-.178l-.327-1.233a.49.49 0 01.177-.554C23.048 18.406 24 16.726 24 14.845c0-3.285-3.274-5.987-7.062-5.987zm-2.511 2.874c.535 0 .969.44.969.982a.976.976 0 01-.969.983.976.976 0 01-.969-.983c0-.542.434-.982.97-.982zm4.902 0c.535 0 .969.44.969.982a.976.976 0 01-.969.983.976.976 0 01-.969-.983c0-.542.434-.982.97-.982z"/>
            </svg>
          </div>
          <span className="text-white text-sm font-medium drop-shadow-lg">微信</span>
        </button>

        {/* Chrome 浏览器图标 */}
        <button
          onClick={openChrome}
          className="flex flex-col items-center gap-2 p-4 rounded-lg hover:bg-white/10 transition-colors group"
        >
          <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
            <svg className="w-10 h-10" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" fill="#4285F4"/>
              <circle cx="12" cy="12" r="4" fill="white"/>
              <path d="M12 8 L21 8 A10 10 0 0 0 6 3.2 Z" fill="#EA4335"/>
              <path d="M6 3.2 L10.5 11.5 A4 4 0 0 1 12 8 Z" fill="#EA4335"/>
              <path d="M6 3.2 A10 10 0 0 0 6 20.8 L12 12 Z" fill="#FBBC05"/>
              <path d="M10.5 12.5 L6 20.8 A4 4 0 0 0 12 16 Z" fill="#FBBC05"/>
              <path d="M6 20.8 A10 10 0 0 0 21 8 L12 12 Z" fill="#34A853"/>
              <path d="M12 16 A4 4 0 0 0 13.5 12.5 L21 8 Z" fill="#34A853"/>
            </svg>
          </div>
          <span className="text-white text-sm font-medium drop-shadow-lg">Chrome</span>
        </button>
      </div>

      {/* 状态调试面板 - 右下角 */}
      <div className="fixed bottom-4 right-4 bg-black/70 backdrop-blur-sm text-white p-4 rounded-lg shadow-xl border border-gray-700 z-50">
        <h3 className="text-xs font-bold text-gray-400 uppercase mb-2">调试面板</h3>
        <div className="space-y-1 text-sm font-mono">
          <div className="flex items-center gap-2">
            <span className="text-gray-400">网络状态:</span>
            <span className={`px-2 py-0.5 rounded text-xs ${
              state.networkStatus === 'online' 
                ? 'bg-green-500/20 text-green-400' 
                : 'bg-red-500/20 text-red-400'
            }`}>
              {state.networkStatus}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-400">消息数:</span>
            <span className="text-blue-400">{state.messageCount}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-400">已入侵:</span>
            <span className={state.isHacked ? 'text-red-400' : 'text-gray-500'}>
              {state.isHacked ? '是' : '否'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-400">已水合:</span>
            <span className={isHydrated ? 'text-green-400' : 'text-yellow-400'}>
              {isHydrated ? '是' : '否'}
            </span>
          </div>
        </div>
        
        {/* 重置按钮 */}
        <button
          onClick={resetState}
          className="mt-3 w-full px-3 py-1.5 bg-red-600/30 hover:bg-red-600/50 text-red-300 text-xs rounded transition-colors"
        >
          重置状态
        </button>
      </div>

      {/* 桌面标题 */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 text-white/30 text-sm">
        张薇失联事件 - 模拟桌面 Demo
      </div>
    </div>
  );
}
