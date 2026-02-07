import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { useGameState } from '../hooks/useGameState';
import { getPlayerCookies } from '../utils/cookies';
import { appList } from '../data/appList';

// 应用图标组件
function AppIcon({ iconType }) {
  switch (iconType) {
    case 'wechat':
      return (
        <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 01.213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 00.167-.054l1.903-1.114a.864.864 0 01.717-.098 10.16 10.16 0 002.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 01-1.162 1.178A1.17 1.17 0 014.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 01-1.162 1.178 1.17 1.17 0 01-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 01.598.082l1.584.926a.272.272 0 00.14.045c.134 0 .24-.111.24-.247 0-.06-.024-.12-.04-.178l-.327-1.233a.49.49 0 01.177-.554C23.048 18.406 24 16.726 24 14.845c0-3.285-3.274-5.987-7.062-5.987zm-2.511 2.874c.535 0 .969.44.969.982a.976.976 0 01-.969.983.976.976 0 01-.969-.983c0-.542.434-.982.97-.982zm4.902 0c.535 0 .969.44.969.982a.976.976 0 01-.969.983.976.976 0 01-.969-.983c0-.542.434-.982.97-.982z"/>
          </svg>
        </div>
      );
    case 'chrome':
      return (
        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
          <svg className="w-7 h-7" viewBox="0 0 24 24">
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
      );
    case 'qq':
      return (
        <div className="w-10 h-10 bg-sky-500 rounded-lg flex items-center justify-center">
          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C8.1 2 5 5.1 5 9c0 1.4.4 2.7 1.1 3.8L4 18l2.5-1c.8.5 1.7.8 2.7.9C9.7 19.8 10.8 21 12 22c1.2-1 2.3-2.2 2.8-4.1 1-.1 1.9-.4 2.7-.9l2.5 1-2.1-5.2C18.6 11.7 19 10.4 19 9c0-3.9-3.1-7-7-7zm0 2c2.8 0 5 2.2 5 5s-2.2 5-5 5-5-2.2-5-5 2.2-5 5-5zm-2 3c-.6 0-1 .4-1 1s.4 1 1 1 1-.4 1-1-.4-1-1-1zm4 0c-.6 0-1 .4-1 1s.4 1 1 1 1-.4 1-1-.4-1-1-1z"/>
          </svg>
        </div>
      );
    default:
      return (
        <div className="w-10 h-10 bg-gray-500 rounded-lg flex items-center justify-center">
          <span className="text-white text-lg">?</span>
        </div>
      );
  }
}

// 桌面应用大图标
function DesktopIcon({ iconType }) {
  switch (iconType) {
    case 'wechat':
      return (
        <div className="w-16 h-16 bg-green-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
          <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 01.213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 00.167-.054l1.903-1.114a.864.864 0 01.717-.098 10.16 10.16 0 002.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 01-1.162 1.178A1.17 1.17 0 014.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 01-1.162 1.178 1.17 1.17 0 01-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 01.598.082l1.584.926a.272.272 0 00.14.045c.134 0 .24-.111.24-.247 0-.06-.024-.12-.04-.178l-.327-1.233a.49.49 0 01.177-.554C23.048 18.406 24 16.726 24 14.845c0-3.285-3.274-5.987-7.062-5.987zm-2.511 2.874c.535 0 .969.44.969.982a.976.976 0 01-.969.983.976.976 0 01-.969-.983c0-.542.434-.982.97-.982zm4.902 0c.535 0 .969.44.969.982a.976.976 0 01-.969.983.976.976 0 01-.969-.983c0-.542.434-.982.97-.982z"/>
          </svg>
        </div>
      );
    default:
      return null;
  }
}

export default function Desktop() {
  const { state, isHydrated, resetState } = useGameState();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchRef = useRef(null);

  // 检查是否有玩家cookies，没有则重定向到开始页面
  useEffect(() => {
    const { playerName, startDate } = getPlayerCookies();
    if (!playerName || !startDate) {
      router.replace('/');
    }
  }, [router]);

  // 点击外部关闭搜索下拉框
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSearchResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 打开应用（新标签页）
  const openApp = (route) => {
    console.log('[Desktop] 打开应用:', route);
    window.open(route, '_blank', 'noopener,noreferrer');
  };

  // 根据搜索词匹配应用
  const getMatchingApps = () => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return appList.filter(app =>
      app.keywords.some(kw => kw.toLowerCase().includes(q)) ||
      app.name.toLowerCase().includes(q)
    );
  };

  // 点击搜索结果中的应用
  const handleAppSelect = (app) => {
    openApp(app.route);
    setSearchQuery('');
    setShowSearchResults(false);
  };

  // 点击 "搜索 xxx 的结果" —— 打开 Chrome 搜索
  const handleWebSearch = () => {
    if (!searchQuery.trim()) return;
    window.open(`/chrome?q=${encodeURIComponent(searchQuery)}`, '_blank', 'noopener,noreferrer');
    setSearchQuery('');
    setShowSearchResults(false);
  };

  // 回车键搜索
  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      handleWebSearch();
    }
    if (e.key === 'Escape') {
      setShowSearchResults(false);
      setSearchQuery('');
    }
  };

  const matchingApps = getMatchingApps();

  return (
    <div className="h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 relative flex flex-col overflow-hidden">
      {/* 桌面壁纸效果 */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />

      {/* 桌面图标区域 */}
      <div className="relative z-10 flex-1 p-8">
        <div className="flex flex-col gap-2 max-w-xs">
          {/* 微信图标 */}
          <button
            onClick={() => openApp('/wechat')}
            className="flex flex-col items-center gap-2 p-4 rounded-lg hover:bg-white/10 transition-colors group w-24"
          >
            <DesktopIcon iconType="wechat" />
            <span className="text-white text-sm font-medium drop-shadow-lg">微信</span>
          </button>
        </div>
      </div>

      {/* 底部任务栏 */}
      <div className="relative z-20 bg-gray-900/80 backdrop-blur-md border-t border-white/10" ref={searchRef}>
        {/* 搜索结果下拉框 */}
        {showSearchResults && searchQuery.trim() && (
          <div className="absolute bottom-full left-0 right-0 mx-4 sm:mx-auto sm:max-w-lg mb-1 bg-gray-800/95 backdrop-blur-md border border-gray-600 rounded-xl shadow-2xl overflow-hidden">
            {/* 匹配到的应用 */}
            {matchingApps.length > 0 && (
              <div className="p-2">
                <p className="text-xs text-gray-400 px-3 py-1.5 font-medium uppercase tracking-wide">应用</p>
                {matchingApps.map(app => (
                  <button
                    key={app.id}
                    onClick={() => handleAppSelect(app)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <AppIcon iconType={app.iconType} />
                    <span className="text-white text-sm font-medium">{app.name}</span>
                  </button>
                ))}
              </div>
            )}

            {/* 分割线 */}
            {matchingApps.length > 0 && (
              <div className="border-t border-gray-700" />
            )}

            {/* 搜索网页（始终显示） */}
            <div className="p-2">
              <p className="text-xs text-gray-400 px-3 py-1.5 font-medium uppercase tracking-wide">搜索</p>
              <button
                onClick={handleWebSearch}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/10 transition-colors"
              >
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                  </svg>
                </div>
                <span className="text-white text-sm">
                  搜索 <span className="text-blue-400 font-medium">&ldquo;{searchQuery}&rdquo;</span> 的结果
                </span>
              </button>
            </div>
          </div>
        )}

        {/* 搜索栏 */}
        <div className="px-4 py-2.5">
          <div className="max-w-lg mx-auto">
            <div className="flex items-center bg-gray-700/60 hover:bg-gray-700/80 rounded-lg px-4 py-2 transition-colors focus-within:bg-gray-700/80 focus-within:ring-1 focus-within:ring-blue-500/50">
              <svg className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSearchResults(true);
                }}
                onFocus={() => { if (searchQuery.trim()) setShowSearchResults(true); }}
                onKeyDown={handleSearchKeyDown}
                placeholder="搜索应用或网页..."
                className="flex-1 bg-transparent text-white text-sm placeholder-gray-400 focus:outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => { setSearchQuery(''); setShowSearchResults(false); }}
                  className="ml-2 text-gray-400 hover:text-gray-200 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 状态调试面板 - 右下角 */}
      <div className="fixed bottom-16 right-4 bg-black/70 backdrop-blur-sm text-white p-4 rounded-lg shadow-xl border border-gray-700 z-50">
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
    </div>
  );
}
