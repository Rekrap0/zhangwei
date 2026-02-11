import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { getPlayerCookies } from '../utils/cookies';

export default function Hengnian() {
  const router = useRouter();

  useEffect(() => {
    const { playerName, startDate } = getPlayerCookies();
    if (!playerName || !startDate) {
      router.replace('/');
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-white">
      {/* 顶部导航 */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#1B5E20] to-[#388E3C] rounded-lg flex items-center justify-center">
              <span className="text-white text-lg font-bold">恒</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 leading-tight">恒念药业</h1>
              <p className="text-[10px] text-gray-400 leading-none tracking-wider">HENGNIAN PHARMA</p>
            </div>
          </div>

          {/* 导航 */}
          <nav className="hidden md:flex items-center gap-8 text-sm">
            <span className="text-[#2E7D32] font-medium cursor-pointer">首页</span>
            <span className="text-gray-600 hover:text-[#2E7D32] cursor-pointer transition-colors">关于我们</span>
            <span className="text-gray-600 hover:text-[#2E7D32] cursor-pointer transition-colors">产品与研发</span>
            <span className="text-gray-600 hover:text-[#2E7D32] cursor-pointer transition-colors">新闻中心</span>
            <span className="text-gray-600 hover:text-[#2E7D32] cursor-pointer transition-colors">社会责任</span>
            <span className="text-gray-600 hover:text-[#2E7D32] cursor-pointer transition-colors">加入我们</span>
          </nav>

          {/* 语言切换 */}
          <div className="hidden sm:flex items-center gap-2 text-xs text-gray-500">
            <span className="text-[#2E7D32] font-medium">中文</span>
            <span>/</span>
            <span className="cursor-pointer hover:text-[#2E7D32]">EN</span>
          </div>
        </div>
      </header>

      {/* Hero 区域 */}
      <section className="bg-gradient-to-br from-[#E8F5E9] via-[#F1F8E9] to-[#FFFDE7] py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <svg viewBox="0 0 800 400" className="w-full h-full" preserveAspectRatio="none">
            <circle cx="700" cy="50" r="200" fill="#4CAF50" />
            <circle cx="100" cy="350" r="150" fill="#81C784" />
          </svg>
        </div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
            创新药物<br />
            <span className="text-[#2E7D32]">恒念为民</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mb-8 leading-relaxed">
            恒念药业专注于神经系统疾病治疗的创新研发，致力于为全球患者提供安全、有效的治疗方案。
          </p>
          <button className="px-8 py-3 bg-[#2E7D32] text-white font-medium rounded-lg hover:bg-[#1B5E20] transition-colors text-sm shadow-lg shadow-green-200">
            了解更多
          </button>
        </div>
      </section>

      {/* 数据展示 */}
      <section className="py-12 bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { num: '11+', label: '年深耕经验' },
              { num: '300+', label: '员工团队' },
              { num: '40+', label: 'SCI论文' },
              { num: '12', label: '发明专利' },
            ].map((item, i) => (
              <div key={i} className="py-4">
                <p className="text-3xl font-bold text-[#2E7D32]">{item.num}</p>
                <p className="text-sm text-gray-500 mt-1">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 关于我们 */}
      <section className="py-16 bg-[#FAFAFA]">
        <div className="max-w-6xl mx-auto px-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">关于恒念药业</h3>
          <div className="w-12 h-1 bg-[#2E7D32] rounded mb-6" />
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <p className="text-gray-700 leading-relaxed mb-4">
                恒念药业股份有限公司成立于<strong>2015年6月8日</strong>，由创始人田宇博士以
                &ldquo;恒心守念，医者仁心&rdquo;的理念创立。公司总部位于北京市海淀区，
                是一家专注于神经系统疾病治疗的创新型制药企业。
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                公司核心团队汇聚了来自国内外顶尖科研机构的神经科学专家，拥有完整的
                从基础研究到临床转化的研发平台。研发投入连续三年超过营收的25%，
                在神经调控、疼痛管理等领域取得了多项突破性进展。
              </p>
              <p className="text-gray-700 leading-relaxed">
                恒念药业秉持&ldquo;以科技守护生命&rdquo;的使命，致力于为全球神经系统疾病患者
                带来希望与改变。
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h4 className="font-bold text-gray-900 mb-4">核心业务</h4>
              <div className="space-y-4">
                {[
                  { title: '神经调控技术', desc: '基于电信号干预的非侵入性镇痛方案' },
                  { title: '创新药物研发', desc: '针对神经退行性疾病的小分子药物管线' },
                  { title: '数字化医疗', desc: '智能化患者管理与远程诊疗平台' },
                  { title: '临床研究服务', desc: '面向抑郁、焦虑等情绪障碍的临床研究' },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-[#E8F5E9] rounded-lg flex items-center justify-center flex-shrink-0">
                      <div className="w-2 h-2 bg-[#2E7D32] rounded-full" />
                    </div>
                    <div>
                      <h5 className="text-sm font-medium text-gray-900">{item.title}</h5>
                      <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 管理团队 */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">管理团队</h3>
          <div className="w-12 h-1 bg-[#2E7D32] rounded mb-8" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                name: '田宇',
                title: '创始人 / 董事长',
                desc: '连续创业者，致力于神经科学研究转化。曾获"中关村高端领军人才"等荣誉。',
              },
              {
                name: '赵瑞',
                title: '首席研究员（CRO）',
                desc: '神经科学博士，哈佛医学院博士后。拥有15年以上神经系统疾病研究经验。',
              },
              {
                name: '林晓琳',
                title: '首席运营官（COO）',
                desc: '拥有超过12年医药行业运营管理经验，曾任某跨国药企中国区运营总监。',
              },
            ].map((person, i) => (
              <div key={i} className="bg-[#FAFAFA] rounded-xl p-6 hover:shadow-md transition-shadow">
                <div className="w-16 h-16 bg-gradient-to-br from-[#81C784] to-[#2E7D32] rounded-full flex items-center justify-center mb-4">
                  <span className="text-white text-2xl font-bold">{person.name.charAt(0)}</span>
                </div>
                <h4 className="font-bold text-gray-900">{person.name}</h4>
                <p className="text-sm text-[#2E7D32] mt-0.5">{person.title}</p>
                <p className="text-sm text-gray-600 mt-2 leading-relaxed">{person.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 新闻动态 */}
      <section className="py-16 bg-[#FAFAFA]">
        <div className="max-w-6xl mx-auto px-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">新闻动态</h3>
          <div className="w-12 h-1 bg-[#2E7D32] rounded mb-8" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { date: '2025-12-01', title: '恒念药业荣获"2025中国医药创新企业50强"', desc: '在近日举办的中国医药创新发展大会上，恒念药业凭借在神经调控技术领域的突出贡献……' },
              { date: '2025-09-15', title: '公司与北京大学签署战略合作协议', desc: '恒念药业与北京大学生命科学学院签署为期五年的产学研合作框架协议……' },
              { date: '2025-06-08', title: '恒念药业十周年庆典圆满举行', desc: '2025年6月8日，公司迎来创立十周年庆典，全体员工共同回顾十年发展历程……' },
            ].map((news, i) => (
              <div key={i} className="bg-white rounded-xl p-5 hover:shadow-md transition-shadow cursor-pointer">
                <span className="text-xs text-gray-400">{news.date}</span>
                <h4 className="font-medium text-gray-900 mt-2 mb-2 leading-snug">{news.title}</h4>
                <p className="text-sm text-gray-600 line-clamp-2">{news.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 联系方式 */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">联系我们</h3>
          <div className="w-12 h-1 bg-[#2E7D32] rounded mb-6" />
          <div className="grid sm:grid-cols-3 gap-6">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-[#2E7D32] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-gray-900">公司地址</p>
                <p className="text-sm text-gray-600 mt-0.5">北京市海淀区西北旺东路恒念科技园</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-[#2E7D32] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-gray-900">商务合作</p>
                <p className="text-sm text-gray-600 mt-0.5">contact@hengnian-pharma.cn</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-[#2E7D32] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-gray-900">咨询电话</p>
                <p className="text-sm text-gray-600 mt-0.5">010-8888-7766</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 底部 */}
      <footer className="bg-[#1B5E20] text-white">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm font-bold">恒</span>
              </div>
              <div>
                <p className="font-medium">恒念药业股份有限公司</p>
                <p className="text-xs text-white/60">Hengnian Pharmaceutical Co., Ltd.</p>
              </div>
            </div>
            <div className="flex items-center gap-6 text-sm text-white/80">
              <span className="hover:text-white cursor-pointer">法律声明</span>
              <span className="hover:text-white cursor-pointer">隐私政策</span>
              <a href="/hengnian-admin" className="hover:text-white cursor-pointer">管理员登录</a>
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-white/20 text-center text-xs text-white/50">
            <p>&copy; 2015-2026 恒念药业 版权所有 | 京ICP备15088888号-1</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
