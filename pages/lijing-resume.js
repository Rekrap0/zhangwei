import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { getPlayerCookies } from '../utils/cookies';

export default function LijingResume() {
  const router = useRouter();

  useEffect(() => {
    const { playerName, startDate } = getPlayerCookies();
    if (!playerName || !startDate) {
      router.replace('/');
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      <Head><title>李静 - 简历</title></Head>
      {/* 顶部导航 */}
      <header className="bg-[#1A1A2E] sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-[#00D4AA] to-[#00A080] rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">&lt;/&gt;</span>
            </div>
            <span className="text-xl font-bold text-white">码上招</span>
            <span className="text-xs text-gray-400 ml-1">CodeHire.cn</span>
          </div>
          <nav className="hidden sm:flex items-center gap-6 text-sm text-gray-300">
            <span className="hover:text-[#00D4AA] cursor-pointer transition-colors">找工作</span>
            <span className="hover:text-[#00D4AA] cursor-pointer transition-colors">人才库</span>
            <span className="hover:text-[#00D4AA] cursor-pointer transition-colors">企业服务</span>
            <button className="px-4 py-1.5 bg-[#00D4AA] text-[#1A1A2E] text-sm font-medium rounded-lg hover:bg-[#00E4BA] transition-colors">
              登录
            </button>
          </nav>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* 个人信息卡片 */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-6">
          <div className="h-24 bg-gradient-to-r from-[#1A1A2E] via-[#2D2D44] to-[#1A1A2E] relative">
            <div className="absolute -bottom-10 left-8">
              <div className="w-20 h-20 rounded-2xl border-4 border-white bg-gradient-to-br from-[#00D4AA] to-[#00A080] overflow-hidden shadow-lg flex items-center justify-center">
                <img src="/avatarLijing.png" />
              </div>
            </div>
            <div className="absolute top-4 right-6 flex items-center gap-2">
              <span className="px-3 py-1 bg-[#00D4AA]/20 text-[#00D4AA] text-xs font-medium rounded-full">
                已认证
              </span>
            </div>
          </div>

          <div className="pt-14 pb-6 px-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">李静</h1>
                <p className="text-gray-600 mt-1">高级系统架构师 · 全栈开发</p>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    北京
                  </span>
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    12年经验
                  </span>
                </div>
              </div>
              <div className="flex gap-3">
                <button className="px-5 py-2 bg-[#00D4AA] text-white text-sm font-medium rounded-lg hover:bg-[#00C49A] transition-colors">
                  立即沟通
                </button>
                <button className="px-5 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">
                  收藏简历
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* 左侧栏 */}
          <div className="md:col-span-1 space-y-6">
            {/* 联系方式 */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-[#00D4AA]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                联系方式
              </h2>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">邮箱</p>
                  <p className="text-sm text-gray-900 font-medium font-mono">lijing@hengnian-pharma.cn</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">手机</p>
                  <p className="text-sm text-gray-900 font-medium">139****5678</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">GitHub</p>
                  <p className="text-sm text-[#00D4AA] font-medium">github.com/lijing-dev</p>
                </div>
              </div>
            </div>

            {/* 技术栈 */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-[#00D4AA]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
                技术栈
              </h2>
              <div className="flex flex-wrap gap-2">
                {['Python', 'Go', 'TypeScript', 'React', 'Node.js', 'PostgreSQL', 'Redis', 'Docker', 'K8s', 'AWS', 'TensorFlow', 'PyTorch'].map((skill) => (
                  <span key={skill} className="px-3 py-1 bg-[#F0FDF9] text-[#00A080] text-xs font-medium rounded-full">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* 右侧主内容 */}
          <div className="md:col-span-2 space-y-6">
            {/* 个人简介 */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-[#00D4AA]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                个人简介
              </h2>
              <p className="text-sm text-gray-700 leading-relaxed">
                12年IT从业经验，专注于分布式系统架构设计与AI应用开发。曾主导多个千万级用户产品的技术架构设计，
                对高并发、高可用系统有深入理解。近年来深耕AI领域，在自然语言处理、机器学习系统工程化方面有丰富实践经验。
                善于将复杂技术问题转化为可落地的解决方案，具备优秀的团队协作和项目管理能力。
              </p>
            </div>

            {/* 工作经历 */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-[#00D4AA]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                工作经历
              </h2>
              <div className="space-y-6">
                <div className="relative pl-6 border-l-2 border-[#00D4AA]/30">
                  <div className="absolute -left-2 top-0 w-4 h-4 bg-[#00D4AA] rounded-full"></div>
                  <div className="pb-6">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-gray-900">高级系统架构师 / IT基础设施负责人</h3>
                      <span className="text-xs text-[#00D4AA] font-medium bg-[#F0FDF9] px-2 py-0.5 rounded">在职</span>
                    </div>
                    <p className="text-sm text-[#00D4AA] font-medium">恒念药业股份有限公司</p>
                    <p className="text-xs text-gray-500 mt-0.5">2014年6月 — 至今 · 北京</p>
                    <ul className="text-sm text-gray-700 mt-3 space-y-1.5 list-disc list-inside">
                      <li>主导公司核心业务系统架构设计与重构，支撑日均百万级数据处理</li>
                      <li>搭建内部AI平台，开发智能客服系统（SY），提升运营效率40%</li>
                      <li>负责IT基础设施规划与安全体系建设，通过ISO 27001认证</li>
                      <li>管理15人技术团队，主导DevOps转型与微服务架构升级</li>
                    </ul>
                  </div>
                </div>

                <div className="relative pl-6 border-l-2 border-gray-200">
                  <div className="absolute -left-2 top-0 w-4 h-4 bg-gray-400 rounded-full"></div>
                  <div className="pb-6">
                    <h3 className="font-semibold text-gray-900">技术专家</h3>
                    <p className="text-sm text-gray-600">阿里巴巴集团 · 阿里云</p>
                    <p className="text-xs text-gray-500 mt-0.5">2011年 — 2014年 · 杭州</p>
                    <ul className="text-sm text-gray-700 mt-3 space-y-1.5 list-disc list-inside">
                      <li>参与阿里云ECS核心模块研发，负责虚拟化资源调度优化</li>
                      <li>设计并实现分布式日志系统，支撑万台级服务器规模</li>
                    </ul>
                  </div>
                </div>

                <div className="relative pl-6 border-l-2 border-gray-200">
                  <div className="absolute -left-2 top-0 w-4 h-4 bg-gray-400 rounded-full"></div>
                  <div>
                    <h3 className="font-semibold text-gray-900">软件开发工程师</h3>
                    <p className="text-sm text-gray-600">百度在线网络技术</p>
                    <p className="text-xs text-gray-500 mt-0.5">2008年 — 2011年 · 北京</p>
                    <ul className="text-sm text-gray-700 mt-3 space-y-1.5 list-disc list-inside">
                      <li>参与百度搜索后端系统开发，优化搜索响应速度</li>
                      <li>负责内部工具链建设，提升团队开发效率</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* 教育背景 */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-[#00D4AA]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M12 14l9-5-9-5-9 5 9 5z" />
                  <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
                </svg>
                教育背景
              </h2>
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-[#F0FDF9] rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-[#00A080] font-bold text-lg">庆</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">庆华大学</h3>
                  <p className="text-sm text-gray-600">计算机科学与技术 · 硕士</p>
                  <p className="text-xs text-gray-500 mt-0.5">2005年 — 2008年</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 底部 */}
        <div className="text-center text-gray-400 text-sm py-8">
          <p>&copy; 2025 码上招 CodeHire.cn · 程序员专属招聘平台</p>
        </div>
      </main>
    </div>
  );
}
