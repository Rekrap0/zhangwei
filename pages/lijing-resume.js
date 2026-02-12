import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { getPlayerCookies } from '../utils/cookies';

export default function ZhaoruiResume() {
  const router = useRouter();

  useEffect(() => {
    const { playerName, startDate } = getPlayerCookies();
    if (!playerName || !startDate) {
      router.replace('/');
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-[#F3F2EE]">
      {/* 顶部导航 */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 h-12 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-[#0A66C2] rounded flex items-center justify-center">
              <span className="text-white text-xs font-bold">医</span>
            </div>
            <span className="text-lg font-bold text-[#0A66C2]">医才网</span>
            <span className="text-xs text-gray-400 ml-1">MedTalent</span>
          </div>
          <nav className="hidden sm:flex items-center gap-4 text-sm text-gray-600">
            <span className="hover:text-[#0A66C2] cursor-pointer">人才库</span>
            <span className="hover:text-[#0A66C2] cursor-pointer">招聘信息</span>
            <span className="hover:text-[#0A66C2] cursor-pointer">企业入驻</span>
          </nav>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* 个人信息卡片 */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-4">
          {/* 顶部背景条 */}
          <div className="h-28 bg-gradient-to-r from-[#004182] to-[#0A66C2] relative">
            <div className="absolute -bottom-12 left-6">
              <div className="w-24 h-24 rounded-full border-4 border-white bg-gray-200 overflow-hidden shadow-lg">
                <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                  <span className="text-4xl font-bold text-[#0A66C2]">李</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-16 pb-6 px-6">
            <h1 className="text-2xl font-bold text-gray-900">李静</h1>
            <p className="text-lg text-gray-600 mt-1">神经科学博士 | 恒念药业 首席研究员</p>
            <p className="text-sm text-gray-500 mt-1">北京 · 中国</p>

            <div className="flex gap-2 mt-4">
              <button className="px-4 py-1.5 bg-[#0A66C2] text-white text-sm font-medium rounded-full hover:bg-[#004182] transition-colors">
                联系TA
              </button>
              <button className="px-4 py-1.5 border border-[#0A66C2] text-[#0A66C2] text-sm font-medium rounded-full hover:bg-blue-50 transition-colors">
                保存简历
              </button>
            </div>
          </div>
        </div>

        {/* 联系方式 */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-4">
          <h2 className="text-lg font-bold text-gray-900 mb-4">联系方式</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
              <div>
                <p className="text-xs text-gray-500">邮箱</p>
                <p className="text-sm text-gray-900 font-medium">lijing@hengnian-pharma.cn</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
              </svg>
              <div>
                <p className="text-xs text-gray-500">电话</p>
                <p className="text-sm text-gray-900 font-medium">13912345678</p>
              </div>
            </div>
          </div>
        </div>

        {/* 个人简介 */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-4">
          <h2 className="text-lg font-bold text-gray-900 mb-3">个人简介</h2>
          <p className="text-sm text-gray-700 leading-relaxed">
            神经科学博士，拥有超过15年神经系统疾病研究经验。曾先后在中科院神经科学研究所、
            哈佛医学院进行博士后研究，2015年加入恒念药业担任首席研究员，主导多项神经调控
            与疼痛管理领域的前沿研究。发表SCI论文40余篇，获得发明专利12项。主要研究方向
            包括意识与神经信号处理、神经退行性疾病干预及精准镇痛技术。
          </p>
        </div>

        {/* 工作经历 */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-4">
          <h2 className="text-lg font-bold text-gray-900 mb-4">工作经历</h2>
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-[#0A66C2] font-bold text-lg">恒</span>
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">首席研究员（CRO）</h3>
                <p className="text-sm text-gray-600">恒念药业股份有限公司</p>
                <p className="text-xs text-gray-500 mt-0.5">2015年6月 — 至今 · 北京</p>
                <p className="text-sm text-gray-700 mt-2 leading-relaxed">
                  领导公司核心研发团队，负责神经调控技术平台的搭建与迭代。主导"精准镇痛"
                  等多个临床研究项目，管理超过50人的研发团队。
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-red-600 font-bold text-lg">哈</span>
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">博士后研究员</h3>
                <p className="text-sm text-gray-600">哈佛医学院 神经科学系</p>
                <p className="text-xs text-gray-500 mt-0.5">2012年 — 2015年 · 波士顿</p>
                <p className="text-sm text-gray-700 mt-2 leading-relaxed">
                  研究方向为神经信号解码与重编码，参与多项NIH资助的神经接口研究项目。
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-green-700 font-bold text-lg">中</span>
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">助理研究员</h3>
                <p className="text-sm text-gray-600">中国科学院神经科学研究所</p>
                <p className="text-xs text-gray-500 mt-0.5">2009年 — 2012年 · 上海</p>
                <p className="text-sm text-gray-700 mt-2 leading-relaxed">
                  从事神经退行性疾病发病机制研究，在意识信号传导领域取得多项创新性成果。
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 教育背景 */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-4">
          <h2 className="text-lg font-bold text-gray-900 mb-4">教育背景</h2>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-purple-700 font-bold text-lg">北</span>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">北京大学</h3>
                <p className="text-sm text-gray-600">神经科学 博士</p>
                <p className="text-xs text-gray-500 mt-0.5">2005年 — 2009年</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-purple-700 font-bold text-lg">北</span>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">北京大学</h3>
                <p className="text-sm text-gray-600">生物医学工程 学士</p>
                <p className="text-xs text-gray-500 mt-0.5">2001年 — 2005年</p>
              </div>
            </div>
          </div>
        </div>

        {/* 底部 */}
        <div className="text-center text-gray-400 text-sm py-6">
          <p>&copy; 2025 医才网 MedTalent.cn &middot; 医药行业人才服务平台</p>
        </div>
      </main>
    </div>
  );
}
