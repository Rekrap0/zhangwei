import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { getPlayerCookies } from '../utils/cookies';

export default function Jingzhun() {
  const router = useRouter();
  const [showPopup, setShowPopup] = useState(true);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const { playerName, startDate } = getPlayerCookies();
    if (!playerName || !startDate) {
      router.replace('/');
    }
  }, [router]);

  const handleReturnHome = () => {
    router.push('/hengyao-news');
  };

  const handleStay = () => {
    setShowPopup(false);
    setShowContent(true);
  };

  return (
    <div className="min-h-screen bg-[#E8F4FD]">
      {/* 弹窗 */}
      {showPopup && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full overflow-hidden animate-fade-in">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-[#E8F4FD] rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-[#4A9CC7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">活动已结束!</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                更多活动请关注公众号
                <span className="font-medium text-[#4A9CC7]">&ldquo;小念医生&rdquo;</span>
              </p>
            </div>
            <div className="border-t border-gray-200 flex">
              <button
                onClick={handleReturnHome}
                className="flex-1 py-3.5 text-gray-600 font-medium hover:bg-gray-50 border-r border-gray-200 transition-colors text-sm"
              >
                返回主页
              </button>
              <button
                onClick={handleStay}
                className="flex-1 py-3.5 text-[#4A9CC7] font-medium hover:bg-blue-50 transition-colors text-sm"
              >
                留在此页
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 页面头部 */}
      <header className="bg-gradient-to-r from-[#4A9CC7] to-[#3A8BB5] text-white">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="flex items-center gap-2 text-sm mb-4 opacity-80">
            <a href="/hengyao-news" className="hover:underline">首页</a>
            <span>/</span>
            <span>临床研究</span>
            <span>/</span>
            <span>精准镇痛</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">&ldquo;精准镇痛&rdquo;神经调控临床研究计划</h1>
          <p className="text-lg opacity-90">志愿者招募 &middot; 慢性疼痛与情绪障碍研究</p>
        </div>
      </header>

      {/* 主体内容 */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* 状态标签 */}
        <div className="mb-6">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-700">
            已结束
          </span>
          <span className="text-gray-500 text-sm ml-3">
            招募时间：2023年3月 — 2023年8月
          </span>
        </div>

        {/* 项目简介 */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">项目简介</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            本研究旨在探索基于前沿神经调控技术的精准镇痛方案，通过非侵入性电信号干预，
            调节痛觉传导通路中的关键神经节点，实现对慢性疼痛及情绪障碍的精准缓解。
          </p>
          <p className="text-gray-700 leading-relaxed mb-4">
            项目采用<strong>全封闭式管理</strong>，为参与者提供为期4至8周的系统化治疗与观察。
            所有治疗费用全免，并提供基础生活补贴。
          </p>
          <p className="text-gray-700 leading-relaxed">
            本研究严格遵循医学伦理准则，所有志愿者须签署知情同意书，并有权在任何阶段退出研究。
          </p>
        </div>

        {/* 招募条件 */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">招募条件</h2>
          <ul className="space-y-3">
            {[
              '年龄18-45周岁，男女不限',
              '确诊慢性疼痛、情绪障碍或抑郁相关症状，持续时间不少于3个月',
              '能够配合全封闭管理安排，期间不可自行离开研究基地',
              '无严重心脑血管疾病、癫痫等神经系统器质性病变',
            ].map((text, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="w-6 h-6 bg-[#E8F4FD] rounded-full flex items-center justify-center text-[#4A9CC7] font-bold text-sm flex-shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <span className="text-gray-700">{text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* 研究流程 */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">研究流程</h2>
          <div className="space-y-4">
            {[
              { step: '初筛', desc: '在线提交报名表，进行初步资格审查' },
              { step: '体检', desc: '前往指定医院完成全面体检，确认身体条件符合要求' },
              { step: '入组', desc: '签署知情同意书，进入封闭研究基地' },
              { step: '治疗', desc: '接受4-8周的神经调控治疗及全程医学观察' },
              { step: '随访', desc: '出组后进行为期半年的定期回访与评估' },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="w-10 h-10 bg-[#4A9CC7] rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {i + 1}
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{item.step}</h3>
                  <p className="text-gray-600 text-sm mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 咨询信息 - 仅在关闭弹窗后显示 */}
        {showContent && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border-l-4 border-[#4A9CC7]">
            <h2 className="text-xl font-bold text-gray-900 mb-4">项目咨询</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-gray-500 w-16 flex-shrink-0">咨询人</span>
                <span className="text-gray-900 font-medium">李静 博士</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-gray-500 w-16 flex-shrink-0">电话</span>
                <span className="text-[#4A9CC7] font-medium">13912345678</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-gray-500 w-16 flex-shrink-0">地点</span>
                <span className="text-gray-900">北京市海淀区西北旺东路恒念科技园B座</span>
              </div>
            </div>
          </div>
        )}

        {/* 底部 */}
        <div className="text-center text-gray-400 text-sm py-8">
          <p>&copy; 2023 恒药新闻网 | 本页面仅供信息展示，相关活动已结束</p>
        </div>
      </main>
    </div>
  );
}
