import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { getPlayerCookies } from '../utils/cookies';
import searchablePages from '../data/searchablePages.json';

// 搜索结果黑名单：标题或URL中包含以下任意关键词的结果将被过滤
const SEARCH_BLACKLIST = [
  'po', 'vp', 'vn', 'xv', '习', '黄', '江', '人', '共', '台', '本', '毛', '党', '成', '维基', '六'
];

export default function Chrome() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [currentView, setCurrentView] = useState('home'); // 'home' | 'results'

  // 检查是否有玩家cookies
  useEffect(() => {
    const { playerName, startDate } = getPlayerCookies();
    if (!playerName || !startDate) {
      router.replace('/');
    }
  }, [router]);

  // 处理 URL 查询参数
  useEffect(() => {
    if (router.isReady && router.query.q) {
      const q = router.query.q;
      setSearchQuery(q);
      performSearch(q);
    }
  }, [router.isReady, router.query.q]);

  // 根据关键词匹配特殊页面
  const getMatchingSpecialPages = useCallback((query) => {
    const q = query.toLowerCase().trim();
    return searchablePages.filter(page => {
      // 精准匹配模式：查询必须完全等于某个关键词
      if (page.exactMatch) {
        return page.keywords.some(keyword => q === keyword.toLowerCase());
      }

      // 基础关键词匹配
      const keywordMatch = page.keywords.some(keyword =>
        q.includes(keyword.toLowerCase()) ||
        keyword.toLowerCase().includes(q)
      );
      if (!keywordMatch) return false;

      // 若定义了 requireAny，查询中还需包含至少一个额外关键词
      if (page.requireAny && page.requireAny.length > 0) {
        return page.requireAny.some(rk => q.includes(rk.toLowerCase()));
      }

      return true;
    });
  }, []);

  // 执行搜索
  const performSearch = async (query) => {
    if (!query.trim()) return;

    setIsSearching(true);
    setCurrentView('results');

    // 匹配特殊的游戏页面
    const specialResults = getMatchingSpecialPages(query).map(page => ({
      title: page.title,
      url: page.url,
      content: page.description,
      displayUrl: page.displayUrl,
      isSpecial: true,
    }));

    try {
      const response = await fetch(
        `/api/search?query=${encodeURIComponent(query)}`
      );
      const data = await response.json();

      const apiResults = (data.results || []).map(r => ({
        title: r.title || '无标题',
        url: r.url,
        content: r.content || '',
        displayUrl: r.url,
        isSpecial: false,
      }));

      // 特殊页面不过滤；仅对 API 结果应用黑名单
      const filteredApiResults = apiResults.filter(r =>
        !SEARCH_BLACKLIST.some(term => {
          const t = term.toLowerCase();
          return (r.title || '').toLowerCase().includes(t) || (r.url || '').toLowerCase().includes(t);
        })
      );
      setSearchResults([...specialResults, ...filteredApiResults]);
    } catch (error) {
      console.error('[Chrome] 搜索 API 调用失败:', error);
      // API 失败时仅显示特殊页面（不过滤）
      setSearchResults(specialResults);
    } finally {
      setIsSearching(false);
    }
  };

  // 提交搜索
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      performSearch(searchQuery);
      router.push(`/chrome?q=${encodeURIComponent(searchQuery)}`, undefined, { shallow: true });
    }
  };

  // 回到主页
  const handleGoHome = () => {
    setCurrentView('home');
    setSearchQuery('');
    setSearchResults(null);
    router.push('/chrome', undefined, { shallow: true });
  };

  // ========== 主页视图：Google 搜索 ==========
  if (currentView === 'home') {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <div className="flex-1 flex flex-col items-center justify-center px-4">
          {/* Google Logo */}
          <div className="mb-8 select-none">
            <h1 className="text-8xl font-normal tracking-tight">
              <span className="text-[#4285F4]">G</span>
              <span className="text-[#EA4335]">o</span>
              <span className="text-[#FBBC05]">o</span>
              <span className="text-[#4285F4]">g</span>
              <span className="text-[#34A853]">l</span>
              <span className="text-[#EA4335]">e</span>
            </h1>
          </div>

          {/* 搜索框 */}
          <form onSubmit={handleSearch} className="w-full max-w-[584px]">
            <div className="flex items-center border border-gray-200 rounded-full px-5 py-3 hover:shadow-md focus-within:shadow-md transition-shadow bg-white">
              <svg className="w-5 h-5 text-gray-400 mr-4 flex-shrink-0" viewBox="0 0 24 24" fill="none">
                <path d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 text-base focus:outline-none text-gray-700"
                autoFocus
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="ml-3 text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            <div className="flex justify-center gap-3 mt-8">
              <button
                type="submit"
                className="px-6 py-2.5 bg-[#F8F9FA] hover:bg-[#E8E8E8] text-sm text-gray-700 rounded border border-transparent hover:border-gray-200 transition-colors"
              >
                Google 搜索
              </button>
              <button
                type="button"
                className="px-6 py-2.5 bg-[#F8F9FA] hover:bg-[#E8E8E8] text-sm text-gray-700 rounded border border-transparent hover:border-gray-200 transition-colors"
              >
                手气不错
              </button>
            </div>
          </form>
        </div>

        {/* 底部 */}
        <div className="bg-[#F2F2F2] text-sm text-gray-600">
          <div className="px-8 py-3 border-b border-gray-300">
            中国
          </div>
          <div className="px-8 py-3 flex flex-wrap justify-between">
            <div className="flex gap-6">
              <span className="hover:underline cursor-pointer">关于 Google</span>
              <span className="hover:underline cursor-pointer">广告</span>
              <span className="hover:underline cursor-pointer">商务</span>
            </div>
            <div className="flex gap-6">
              <span className="hover:underline cursor-pointer">隐私权</span>
              <span className="hover:underline cursor-pointer">条款</span>
              <span className="hover:underline cursor-pointer">设置</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ========== 搜索结果视图 ==========
  return (
    <div className="min-h-screen bg-white">
      <Head><title>Chrome</title></Head>
      {/* 顶部搜索栏 */}
      <div className="border-b border-gray-200 sticky top-0 bg-white z-10">
        <div className="px-6 py-4">
          <div className="flex items-center gap-6 max-w-[700px]">
            {/* Logo */}
            <button onClick={handleGoHome} className="flex-shrink-0 select-none">
              <span className="text-[28px] font-normal tracking-tight">
                <span className="text-[#4285F4]">G</span>
                <span className="text-[#EA4335]">o</span>
                <span className="text-[#FBBC05]">o</span>
                <span className="text-[#4285F4]">g</span>
                <span className="text-[#34A853]">l</span>
                <span className="text-[#EA4335]">e</span>
              </span>
            </button>

            {/* 搜索框 */}
            <form onSubmit={handleSearch} className="flex-1">
              <div className="flex items-center border border-gray-200 rounded-full px-5 py-2.5 hover:shadow-md focus-within:shadow-md transition-shadow">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 text-base focus:outline-none text-gray-700"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="ml-2 text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
                <button type="submit" className="ml-3 flex-shrink-0">
                  <svg className="w-5 h-5 text-[#4285F4]" viewBox="0 0 24 24" fill="none">
                    <path d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* 分类标签 */}
        <div className="px-6 flex gap-6 text-sm">
          <span className="pb-3 border-b-2 border-[#4285F4] text-[#4285F4] cursor-pointer">全部</span>
          <span className="pb-3 text-gray-600 hover:text-[#4285F4] cursor-pointer">图片</span>
          <span className="pb-3 text-gray-600 hover:text-[#4285F4] cursor-pointer">新闻</span>
          <span className="pb-3 text-gray-600 hover:text-[#4285F4] cursor-pointer">视频</span>
          <span className="pb-3 text-gray-600 hover:text-[#4285F4] cursor-pointer">更多</span>
        </div>
      </div>

      {/* 搜索结果 */}
      <div className="max-w-[700px] px-6 py-5">
        {isSearching ? (
          <div className="py-12">
            <div className="flex items-center gap-3 text-gray-500">
              <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              正在搜索...
            </div>
          </div>
        ) : searchResults && searchResults.length > 0 ? (
          <div>
            <p className="text-sm text-gray-500 mb-5">
              找到约 {searchResults.length.toLocaleString()} 条结果
            </p>

            <div className="space-y-8 relative">
              {searchResults.slice(0, 6).map((result, index) => (
                <div key={index} className={`relative ${index === 5 ? 'pointer-events-none' : ''}`}>
                  {/* 第6个结果的渐变遮罩 */}
                  {index === 5 && (
                    <div className="absolute inset-0 bg-gradient-to-b from-white/0 via-white/70 to-white z-10" />
                  )}

                  {/* URL 显示 */}
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm text-gray-600 truncate">
                      {result.displayUrl || result.url}
                    </span>
                  </div>

                  {/* 标题链接 */}
                  <a
                    href={result.url}
                    target={result.url.startsWith('http') ? '_blank' : '_self'}
                    rel="noopener noreferrer"
                    className="text-xl text-[#1A0DAB] hover:underline block leading-snug"
                  >
                    {result.title}
                  </a>

                  {/* 描述 */}
                  {result.content && (
                    <p className="text-sm text-gray-600 mt-1 leading-relaxed line-clamp-3">
                      {result.content}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : searchResults ? (
          <div className="py-12 text-gray-500">
            <p className="text-lg mb-2">
              找不到和 <strong className="text-gray-700">&ldquo;{searchQuery}&rdquo;</strong> 相关的结果
            </p>
            <p className="text-sm">
              建议：
            </p>
            <ul className="text-sm list-disc list-inside mt-1 space-y-1">
              <li>请检查输入字词有无错误</li>
              <li>请尝试其他查询词</li>
              <li>请改用较常见的字词</li>
            </ul>
          </div>
        ) : null}
      </div>
    </div>
  );
}
