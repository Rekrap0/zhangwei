import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { getPlayerCookies, setCookie, getCookie } from '../utils/cookies';

const ADMIN_AUTH_KEY = 'zhangwei_admin_auth';

// 正确的登录凭证
const CORRECT_EMAIL = 'lijing@hengnian-pharma.cn';
const CORRECT_PASSWORD = 'lj20150608';

export default function HengnianAdmin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showInfo, setShowInfo] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const { playerName, startDate } = getPlayerCookies();
    if (!playerName || !startDate) {
      router.replace('/');
      return;
    }
    // 如果已经登录，跳转到管理面板
    if (getCookie(ADMIN_AUTH_KEY) === 'true') {
      router.replace('/hengnian-panel');
    }
  }, [router]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // 模拟加载延迟
    setTimeout(() => {
      if (email.trim().toLowerCase() === CORRECT_EMAIL && password === CORRECT_PASSWORD) {
        setCookie(ADMIN_AUTH_KEY, 'true');
        router.push('/hengnian-panel');
      } else if (email.trim().toLowerCase() === CORRECT_EMAIL) {
        setError('密码错误，请重试');
      } else {
        setError('账户不存在或凭证无效');
      }
      setIsLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex flex-col">
      {/* 顶部 */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-lg mx-auto px-6 h-14 flex items-center">
          <a href="/hengnian" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-gradient-to-br from-[#1B5E20] to-[#388E3C] rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">恒</span>
            </div>
            <span className="font-bold text-gray-900">恒念药业</span>
            <span className="text-xs text-gray-400">管理系统</span>
          </a>
        </div>
      </header>

      {/* 主体 */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          {/* 登录卡片 */}
          <div className="bg-white rounded-xl shadow-sm p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-[#1B5E20] to-[#388E3C] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900">管理员登录</h2>
              <p className="text-sm text-gray-500 mt-1">恒念药业内部管理系统</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">邮箱地址</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(''); }}
                  placeholder="your@hengnian-pharma.cn"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2E7D32] focus:border-transparent transition-shadow"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">密码</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  placeholder="请输入密码"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2E7D32] focus:border-transparent transition-shadow"
                  required
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg">
                  <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                  </svg>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 bg-[#2E7D32] text-white font-medium rounded-lg hover:bg-[#1B5E20] transition-colors text-sm disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    验证中...
                  </>
                ) : (
                  '登录'
                )}
              </button>
            </form>
          </div>

          {/* 关于管理员账户链接 */}
          <div className="text-center mt-5">
            <button
              onClick={() => setShowInfo(true)}
              className="text-sm text-[#2E7D32] hover:underline"
            >
              关于管理员账户
            </button>
          </div>
        </div>
      </main>

      {/* 关于管理员账户弹窗 */}
      {showInfo && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden">
            <div className="px-6 py-4 bg-[#F5F5F5] border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-bold text-gray-900">关于管理员账户</h3>
              <button
                onClick={() => setShowInfo(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="px-6 py-5 space-y-4 text-sm text-gray-700 leading-relaxed">
              <div>
                <h4 className="font-medium text-gray-900 mb-1">初始密码</h4>
                <p>
                  系统管理员账户的初始密码为管理员<strong>出生日期</strong>（YYYYMMDD格式），
                  例如：19900101。
                </p>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
                <div className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
                  </svg>
                  <p className="text-amber-800 text-sm">
                    <strong>安全提示：</strong>若管理员在30天内未修改初始密码，
                    账户将被<strong>自动锁定</strong>。
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-1">密码修改建议</h4>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="text-[#2E7D32] mt-1">•</span>
                    <span>
                      建议使用<strong>姓名拼音首字母缩写</strong>来增加密码复杂度
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#2E7D32] mt-1">•</span>
                    <span>
                      建议使用有意义的<strong>纪念日期</strong>（如公司创立日期等），
                      而非个人生日，以提高安全性
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#2E7D32] mt-1">•</span>
                    <span>
                      推荐格式：<code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">拼音首字母 + 日期（YYYYMMDD）</code>
                      <br />
                      <span className="text-gray-400">例如：xm20200101</span>
                    </span>
                  </li>
                </ul>
              </div>

              <div className="border-t border-gray-200 pt-3">
                <p className="text-xs text-gray-400">
                  如需重置密码，请联系IT部门：it-support@hengnian-pharma.cn
                </p>
              </div>
            </div>

            <div className="px-6 py-4 bg-[#F5F5F5] border-t border-gray-200">
              <button
                onClick={() => setShowInfo(false)}
                className="w-full py-2 bg-[#2E7D32] text-white text-sm font-medium rounded-lg hover:bg-[#1B5E20] transition-colors"
              >
                我知道了
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 底部 */}
      <footer className="text-center text-xs text-gray-400 py-4">
        <p>&copy; 2015-2026 恒念药业 内部管理系统 v2.4.1</p>
      </footer>
    </div>
  );
}
