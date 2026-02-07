import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { getPlayerCookies } from '../utils/cookies';
import { appList } from '../data/appList';

const DESKTOP_ICONS_KEY = 'zhangwei_desktop_icons';

// 图标路径映射
const ICON_MAP = {
  wechat: { src: '/icon-wechat.svg', bg: 'bg-green-500' },
  chrome: { src: '/icon-chrome.svg', bg: 'bg-white' },
  qq: { src: '/icon-qq.svg', bg: 'bg-white' },
};

// 应用图标组件（搜索下拉用）
function AppIcon({ iconType }) {
  const icon = ICON_MAP[iconType];
  if (!icon) {
    return (
      <div className="w-10 h-10 bg-gray-500 rounded-lg flex items-center justify-center">
        <span className="text-white text-lg">?</span>
      </div>
    );
  }
  return (
    <div className={`w-10 h-10 ${icon.bg} rounded-lg flex items-center justify-center ${iconType === 'qq' ? 'p-1' : ''}`}>
      <img src={icon.src} alt={iconType} className="w-6 h-6" />
    </div>
  );
}

// 桌面应用大图标
function DesktopAppIcon({ iconType }) {
  const icon = ICON_MAP[iconType];
  if (!icon) return null;
  return (
    <div className={`w-16 h-16 ${icon.bg} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform ${iconType === 'qq' ? 'p-2' : ''}`}>
      <img src={icon.src} alt={iconType} className="w-10 h-10" />
    </div>
  );
}

// 从 localStorage 加载桌面图标
function loadDesktopIcons() {
  if (typeof window === 'undefined') return ['wechat'];
  try {
    const stored = localStorage.getItem(DESKTOP_ICONS_KEY);
    if (stored) return JSON.parse(stored);
  } catch (e) { }
  return ['wechat'];
}

// 保存桌面图标到 localStorage
function saveDesktopIcons(icons) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(DESKTOP_ICONS_KEY, JSON.stringify(icons));
  } catch (e) { }
}

export default function Desktop() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [desktopIcons, setDesktopIcons] = useState(['wechat']);
  const searchRef = useRef(null);

  // 检查是否有玩家cookies，没有则重定向到开始页面
  useEffect(() => {
    const { playerName, startDate } = getPlayerCookies();
    if (!playerName || !startDate) {
      router.replace('/');
    }
    // 加载桌面图标
    setDesktopIcons(loadDesktopIcons());
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

  // 将应用图标添加到桌面
  const addIconToDesktop = (appId) => {
    setDesktopIcons(prev => {
      if (prev.includes(appId)) return prev;
      const next = [...prev, appId];
      saveDesktopIcons(next);
      return next;
    });
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
    addIconToDesktop(app.id);
    openApp(app.route);
    setSearchQuery('');
    setShowSearchResults(false);
  };

  // 点击 "搜索 xxx 的结果" —— 打开 Chrome 搜索
  const handleWebSearch = () => {
    if (!searchQuery.trim()) return;
    addIconToDesktop('chrome');
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

  // 根据 desktopIcons 列表获取对应的 appList 数据
  const visibleApps = desktopIcons
    .map(id => appList.find(a => a.id === id))
    .filter(Boolean);

  return (
    <div className="bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 relative flex flex-col overflow-hidden" style={{ height: '100dvh' }}>
      {/* 桌面壁纸效果 */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />

      {/* 顶部搜索栏 */}
      <div className="relative z-20 pt-4 px-4" ref={searchRef}>
        <div className="max-w-lg mx-auto">
          <div className="flex items-center bg-white/10 backdrop-blur-md hover:bg-white/15 rounded-2xl px-4 py-2.5 transition-colors focus-within:bg-white/15 focus-within:ring-1 focus-within:ring-white/30">
            <svg className="w-4 h-4 text-gray-300 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* 搜索结果下拉框 */}
          {showSearchResults && searchQuery.trim() && (
            <div className="mt-1 bg-gray-800/95 backdrop-blur-md border border-gray-600 rounded-xl shadow-2xl overflow-hidden">
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
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <span className="text-white text-sm">
                    搜索 <span className="text-blue-400 font-medium">&ldquo;{searchQuery}&rdquo;</span> 的结果
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 桌面图标区域 */}
      <div className="relative z-10 flex-1 p-6 pt-4">
        <div className="flex flex-wrap gap-2">
          {visibleApps.map(app => (
            <button
              key={app.id}
              onClick={() => openApp(app.route)}
              className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-white/10 transition-colors group w-24"
            >
              <DesktopAppIcon iconType={app.iconType} />
              <span className="text-white text-sm font-medium drop-shadow-lg">{app.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
