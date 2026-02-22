import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { getPlayerCookies } from '../utils/cookies';

// 新闻数据
const NEWS_ITEMS = [
  {
    id: 1,
    category: '行业动态',
    title: '国家药监局发布2025年医药行业监管年度报告',
    summary: '国家药品监督管理局于近日发布2025年度医药行业监管报告，报告显示全年共批准创新药物42款，同比增长18%。报告强调将持续加强对临床试验的监管力度……',
    date: '2026-01-15',
    image: null,
  },
  {
    id: 2,
    category: '企业专题',
    title: '恒念药业：从实验室到产业化的十一年',
    summary: '恒念药业股份有限公司自2015年6月8日创立以来，始终专注于神经系统疾病治疗领域的研发与创新。创始人田宇以"恒心守念，医者仁心"为理念，带领团队从最初的5人实验室发展为如今拥有超过300名员工的创新型制药企业。公司总部位于北京海淀区，研发投入连续三年超过营收的25%。',
    date: '2026-01-10',
    highlight: true,
  },
  {
    id: 3,
    category: '科技前沿',
    title: '人工智能辅助药物研发获重大突破：新算法将筛选周期缩短70%',
    summary: '中科院计算技术研究所联合多家药企发布最新研究成果，基于大语言模型的分子对接预测算法在抗肿瘤药物先导化合物筛选中取得显著进展……',
    date: '2026-01-08',
    image: null,
  },
  {
    id: 4,
    category: '行业榜单',
    title: '2025年度中国医药百强企业榜单发布',
    summary: '由中国医药工业信息中心发布的年度百强榜单显示，恒瑞医药、中国生物制药、石药集团继续位列前三。新上榜企业中，多家聚焦于神经科学和基因治疗领域……',
    date: '2025-12-28',
    image: null,
  },
  {
    id: 5,
    category: '临床研究',
    title: '新型抗抑郁药物III期临床试验结果公布：有效率达76%',
    summary: '由多家三甲医院联合开展的新型5-HT受体调节剂III期临床试验数据于近日公布。研究纳入1200名中重度抑郁症患者，经过12周治疗后……',
    date: '2025-12-20',
    image: null,
  },
  {
    id: 6,
    category: '投融资',
    title: '2025年医疗健康领域投融资趋势报告：神经科学赛道获资本青睐',
    summary: '据医药投融资数据平台统计，2025年全球神经科学领域融资总额达到87亿美元，同比增长34%。其中，脑机接口和神经调控技术成为最受关注的细分赛道……',
    date: '2025-12-15',
    image: null,
  },
  {
    id: 7,
    category: '政策解读',
    title: '《"十四五"医药工业发展规划》中期评估报告解读',
    summary: '工信部联合国家卫健委发布"十四五"医药工业发展规划中期评估报告，指出我国在生物药、高端制剂和创新医疗器械方面取得了阶段性成果……',
    date: '2025-12-10',
    image: null,
  },
];

// 分类标签颜色
const CATEGORY_COLORS = {
  '行业动态': 'bg-blue-100 text-blue-700',
  '企业专题': 'bg-purple-100 text-purple-700',
  '科技前沿': 'bg-green-100 text-green-700',
  '行业榜单': 'bg-yellow-100 text-yellow-700',
  '临床研究': 'bg-red-100 text-red-700',
  '投融资': 'bg-indigo-100 text-indigo-700',
  '政策解读': 'bg-gray-100 text-gray-700',
};

export default function HengyaoNews() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isGameCompleted, setIsGameCompleted] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const { playerName, startDate } = getPlayerCookies();
    if (!playerName || !startDate) {
      router.replace('/');
    }
    // 检查通关状态
    if (typeof window !== 'undefined') {
      setIsGameCompleted(localStorage.getItem('zhangwei_game_completed') === 'true');
      setIsHydrated(true);
    }
  }, [router]);

  // 451 错误页面（通关后显示）
  if (isHydrated && isGameCompleted) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] flex flex-col items-center justify-center p-6">
        <Head><title>451 Unavailable For Legal Reasons</title></Head>
        <div className="max-w-lg w-full text-center">
          <h1 className="text-8xl font-bold text-red-500 mb-4">451</h1>
          <h2 className="text-2xl font-medium text-white mb-6">Unavailable For Legal Reasons</h2>
          <div className="bg-[#252525] border border-gray-700 rounded-lg p-6 text-left mb-8">
            <p className="text-gray-300 text-sm leading-relaxed mb-4">
              您访问的网站因涉嫌违反相关法律已被封停，请求已被授权部门依法拒绝。
            </p>
            <p className="text-gray-500 text-xs">
              参考条款：HTTP 451 – 因法律原因不可用
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F6FA]">
      <Head><title>恒药新闻</title></Head>
      {/* 顶部导航栏 */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <img src="/iconHengyao.png" alt="恒药新闻" className="w-8 h-8 rounded-lg object-cover" />
              <h1 className="text-xl font-bold text-gray-900">
                恒药新闻
              </h1>
              <span className="text-xs text-gray-400 hidden sm:inline ml-1">HENGYAO NEWS</span>
            </div>

            {/* 导航链接 */}
            <nav className="hidden md:flex items-center gap-6 text-sm">
              <span className="text-[#1E88E5] font-medium cursor-pointer">首页</span>
              <span className="text-gray-600 hover:text-[#1E88E5] cursor-pointer">行业动态</span>
              <span className="text-gray-600 hover:text-[#1E88E5] cursor-pointer">企业报道</span>
              <span className="text-gray-600 hover:text-[#1E88E5] cursor-pointer">临床研究</span>
              <span className="text-gray-600 hover:text-[#1E88E5] cursor-pointer">政策法规</span>
            </nav>

            {/* 搜索 */}
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center bg-gray-100 rounded-lg px-3 py-1.5 gap-2">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="搜索资讯..."
                  className="bg-transparent text-sm focus:outline-none text-gray-700 w-32"
                />
              </div>

              {/* 移动端省略号按钮 */}
              <button
                className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg hover:bg-gray-100 transition-colors"
                onClick={() => setMobileMenuOpen(prev => !prev)}
                aria-label="菜单"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeWidth={2} d="M4 7h16M4 12h16M4 17h16" />
                </svg>
              </button>
            </div>
          </div>

          {/* 移动端折叠菜单 */}
          <div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            mobileMenuOpen ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'
          }`}>
            <nav className="flex flex-col px-4 pb-3 space-y-1 border-t border-gray-100">
              <span className="text-[#1E88E5] font-medium text-sm py-2 cursor-pointer">首页</span>
              <span className="text-gray-600 hover:text-[#1E88E5] text-sm py-2 cursor-pointer transition-colors">行业动态</span>
              <span className="text-gray-600 hover:text-[#1E88E5] text-sm py-2 cursor-pointer transition-colors">企业报道</span>
              <span className="text-gray-600 hover:text-[#1E88E5] text-sm py-2 cursor-pointer transition-colors">临床研究</span>
              <span className="text-gray-600 hover:text-[#1E88E5] text-sm py-2 cursor-pointer transition-colors">政策法规</span>
            </nav>
          </div>
        </div>
      </header>

      {/* 主体内容 */}
      <main className="max-w-5xl mx-auto px-4 py-6">
        {/* 头条区域 */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-[#1E88E5] to-[#1565C0] p-6 text-white">
            <span className="text-xs font-medium bg-white/20 px-2 py-0.5 rounded">头条</span>
            <h2 className="text-2xl font-bold mt-3 mb-2">{NEWS_ITEMS[0].title}</h2>
            <p className="text-sm opacity-90 leading-relaxed line-clamp-2">{NEWS_ITEMS[0].summary}</p>
            <span className="text-xs opacity-70 mt-3 block">{NEWS_ITEMS[0].date}</span>
          </div>
        </div>

        {/* 新闻列表 */}
        <div className="space-y-4">
          {NEWS_ITEMS.slice(1).map((news) => (
            <article
              key={news.id}
              className={`bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition-shadow cursor-pointer ${
                news.highlight ? 'ring-1 ring-purple-200' : ''
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  {/* 分类标签 */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded ${CATEGORY_COLORS[news.category] || 'bg-gray-100 text-gray-700'}`}>
                      {news.category}
                    </span>
                    {news.highlight && (
                      <span className="text-xs font-medium px-2 py-0.5 rounded bg-red-50 text-red-600">
                        推荐
                      </span>
                    )}
                    <span className="text-xs text-gray-400">{news.date}</span>
                  </div>

                  {/* 标题 */}
                  <h3 className="text-lg font-bold text-gray-900 mb-2 hover:text-[#1E88E5] transition-colors">
                    {news.title}
                  </h3>

                  {/* 摘要 */}
                  <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">
                    {news.summary}
                  </p>
                </div>

                {/* 缩略图占位 */}
                <div className="hidden sm:block w-32 h-24 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                    <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.41a2.25 2.25 0 013.182 0l2.909 2.91m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                    </svg>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* 加载更多 */}
        <div className="text-center py-8">
          <button className="px-6 py-2.5 bg-white text-gray-600 text-sm font-medium rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
            加载更多
          </button>
        </div>
      </main>

      {/* 底部 */}
      <footer className="bg-white border-t border-gray-200 mt-8">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <img src="/iconHengyao.png" alt="恒药新闻" className="w-6 h-6 rounded object-cover" />
              <span>恒药新闻网</span>
            </div>
            <div className="flex gap-4">
              <span className="hover:text-gray-600 cursor-pointer">关于我们</span>
              <span className="hover:text-gray-600 cursor-pointer">联系方式</span>
              <span className="hover:text-gray-600 cursor-pointer">投稿指南</span>
              <span className="hover:text-gray-600 cursor-pointer">隐私政策</span>
            </div>
            <p>&copy; 2024 恒药新闻 hengyao-news.cn</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
