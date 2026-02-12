import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { getPlayerCookies } from '../utils/cookies';

const WEIBO_STORAGE_KEY = 'zhangwei_weibo_state';
const HENGNIAN_CHAT_KEY = 'zhangwei_hengnian_chat';
const TIANYU_EMAIL = 'tianyu@hengnian-pharma.cn';

export default function Weibo() {
  const router = useRouter();
  const [view, setView] = useState('login'); // login | forgot | verify | reset | success | home
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  
  // 忘记密码流程
  const [forgotInput, setForgotInput] = useState('');
  const [forgotError, setForgotError] = useState('');
  
  // 验证码流程
  const [verifyCode, setVerifyCode] = useState('');
  const [verifyError, setVerifyError] = useState('');
  const [expectedCode, setExpectedCode] = useState('');
  
  // 重置密码流程
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetError, setResetError] = useState('');
  
  // 存储的账户信息
  const [storedAccounts, setStoredAccounts] = useState({}); // { email: password }
  
  const broadcastChannelRef = useRef(null);

  useEffect(() => {
    const { playerName, startDate } = getPlayerCookies();
    if (!playerName || !startDate) {
      router.replace('/');
      return;
    }
    
    // 加载存储的账户信息
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(WEIBO_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.accounts) setStoredAccounts(parsed.accounts);
        }
      } catch (e) {
        console.error('[Weibo] Failed to load state:', e);
      }
      
      // 初始化 BroadcastChannel
      broadcastChannelRef.current = new BroadcastChannel('zhangwei_weibo_channel');
    }
    
    return () => {
      if (broadcastChannelRef.current) {
        broadcastChannelRef.current.close();
      }
    };
  }, [router]);

  // 保存账户信息
  const saveAccounts = (accounts) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(WEIBO_STORAGE_KEY, JSON.stringify({ accounts }));
    } catch (e) {
      console.error('[Weibo] Failed to save state:', e);
    }
  };

  // 检查恒念客服是否已切换到李静模式
  const isHengnianSwitched = () => {
    if (typeof window === 'undefined') return false;
    try {
      const stored = localStorage.getItem(HENGNIAN_CHAT_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.persona === 'lijing';
      }
    } catch (e) {
      // ignore
    }
    return false;
  };

  // 发送验证码到恒念聊天（通过 BroadcastChannel）
  const sendCodeToHengnian = (code) => {
    if (typeof window === 'undefined') return;
    
    // 通过 BroadcastChannel 发送
    if (broadcastChannelRef.current) {
      broadcastChannelRef.current.postMessage({
        type: 'VERIFICATION_CODE',
        code: code,
      });
    }
    
    // 同时直接更新 localStorage 中的聊天记录
    try {
      const stored = localStorage.getItem(HENGNIAN_CHAT_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        const newMsg = {
          role: 'assistant',
          content: `我截获到了验证码：${code}。快去用它重置密码！记住，时间不多了...`,
        };
        parsed.displayMessages = [...(parsed.displayMessages || []), newMsg];
        // 标记李静连接已断开
        parsed.lijingDisconnected = true;
        localStorage.setItem(HENGNIAN_CHAT_KEY, JSON.stringify(parsed));
      }
    } catch (e) {
      console.error('[Weibo] Failed to update hengnian chat:', e);
    }
  };

  // 处理登录
  const handleLogin = (e) => {
    e.preventDefault();
    setLoginError('');
    
    const emailLower = email.trim().toLowerCase();
    const pwd = password;
    
    if (!emailLower || !pwd) {
      setLoginError('请输入手机号/邮箱和密码');
      return;
    }
    
    // 检查是否是田宇的账号
    if (emailLower === TIANYU_EMAIL) {
      const storedPwd = storedAccounts[TIANYU_EMAIL];
      if (storedPwd && pwd === storedPwd) {
        // 登录成功！触发结局
        setView('success');
        return;
      }
    }
    
    setLoginError('用户名或密码不正确');
  };

  // 处理忘记密码提交
  const handleForgotSubmit = (e) => {
    e.preventDefault();
    setForgotError('');
    
    const input = forgotInput.trim();
    if (!input) {
      setForgotError('请输入手机号或邮箱');
      return;
    }
    
    // 检查是否是邮箱格式或纯数字
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input);
    const isPhone = /^\d+$/.test(input);
    
    if (!isEmail && !isPhone) {
      setForgotError('请输入正确的手机号或邮箱格式');
      return;
    }
    
    // 检查是否是田宇的邮箱且恒念已切换
    if (input.toLowerCase() === TIANYU_EMAIL && isHengnianSwitched()) {
      // 生成 6 位验证码
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setExpectedCode(code);
      
      // 发送验证码到恒念聊天
      sendCodeToHengnian(code);
    }
    
    // 无论如何都进入验证码页面
    setView('verify');
  };

  // 处理验证码提交
  const handleVerifySubmit = (e) => {
    e.preventDefault();
    setVerifyError('');
    
    const code = verifyCode.trim();
    if (!code) {
      setVerifyError('请输入验证码');
      return;
    }
    
    if (code.length !== 6 || !/^\d+$/.test(code)) {
      setVerifyError('验证码格式不正确');
      return;
    }
    
    // 只有田宇邮箱且输入正确验证码才能继续
    if (forgotInput.toLowerCase() === TIANYU_EMAIL && code === expectedCode) {
      setView('reset');
    } else {
      setVerifyError('验证码错误，请重试');
    }
  };

  // 处理重置密码
  const handleResetSubmit = (e) => {
    e.preventDefault();
    setResetError('');
    
    if (!newPassword || !confirmPassword) {
      setResetError('请输入新密码');
      return;
    }
    
    if (newPassword.length < 8) {
      setResetError('密码长度至少为8位');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setResetError('两次输入的密码不一致');
      return;
    }
    
    // 保存新密码
    const newAccounts = { ...storedAccounts, [TIANYU_EMAIL]: newPassword };
    setStoredAccounts(newAccounts);
    saveAccounts(newAccounts);
    
    // 返回登录页面
    setView('login');
    setEmail(TIANYU_EMAIL);
    setPassword('');
    setForgotInput('');
    setVerifyCode('');
    setNewPassword('');
    setConfirmPassword('');
  };

  // 登录成功后自动跳转
  useEffect(() => {
    if (view === 'success') {
      const timer = setTimeout(() => {
        router.push('/epilogue_BKRENLMmKd');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [view, router]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FF8200] to-[#E6162D] flex flex-col">
      {/* 顶部栏 */}
      <header className="bg-[#E6162D] py-3 px-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center p-1">
            <img src="/icon-weibo.svg" alt="微博" className="w-5 h-5" />
          </div>
          <span className="text-white font-bold text-lg">微博</span>
        </div>
        <button
          onClick={() => router.push('/desktop')}
          className="text-white/80 hover:text-white text-sm"
        >
          返回桌面
        </button>
      </header>

      {/* 主体内容 */}
      <main className="flex-1 flex items-center justify-center p-4">
        {/* 登录页面 */}
        {view === 'login' && (
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-[#E6162D] rounded-full flex items-center justify-center mx-auto mb-4 p-3">
                <img src="/icon-weibo.svg" alt="微博" className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">登录微博</h2>
              <p className="text-gray-500 text-sm mt-1">随时随地发现新鲜事</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="手机号或邮箱"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#E6162D] transition-colors"
                />
              </div>
              <div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="密码"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#E6162D] transition-colors"
                />
              </div>

              {loginError && (
                <p className="text-red-500 text-sm text-center">{loginError}</p>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-[#E6162D] text-white font-medium rounded-lg hover:bg-[#C41422] transition-colors"
              >
                登录
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    setView('forgot');
                    setForgotInput('');
                    setForgotError('');
                  }}
                  className="text-[#E6162D] text-sm hover:underline"
                >
                  忘记密码？
                </button>
              </div>
            </form>
          </div>
        )}

        {/* 忘记密码页面 */}
        {view === 'forgot' && (
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-8">
            <div className="text-center mb-8">
              <h2 className="text-xl font-bold text-gray-900">找回密码</h2>
              <p className="text-gray-500 text-sm mt-2">请输入您注册时使用的手机号或邮箱</p>
            </div>

            <form onSubmit={handleForgotSubmit} className="space-y-4">
              <div>
                <input
                  type="text"
                  value={forgotInput}
                  onChange={(e) => setForgotInput(e.target.value)}
                  placeholder="请输入手机号或邮箱"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#E6162D] transition-colors"
                />
              </div>

              {forgotError && (
                <p className="text-red-500 text-sm text-center">{forgotError}</p>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-[#E6162D] text-white font-medium rounded-lg hover:bg-[#C41422] transition-colors"
              >
                确定
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setView('login')}
                  className="text-gray-500 text-sm hover:underline"
                >
                  返回登录
                </button>
              </div>
            </form>
          </div>
        )}

        {/* 验证码页面 */}
        {view === 'verify' && (
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-8">
            <div className="text-center mb-8">
              <h2 className="text-xl font-bold text-gray-900">输入验证码</h2>
              <p className="text-gray-500 text-sm mt-2">
                验证码已发送至 {forgotInput}
              </p>
            </div>

            <form onSubmit={handleVerifySubmit} className="space-y-4">
              <div>
                <input
                  type="text"
                  value={verifyCode}
                  onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="请输入6位验证码"
                  maxLength={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#E6162D] transition-colors text-center text-2xl tracking-widest"
                />
              </div>

              <p className="text-gray-400 text-xs text-center">
                如果您未收到验证码，可能是输入错误或未注册微博
              </p>

              {verifyError && (
                <p className="text-red-500 text-sm text-center">{verifyError}</p>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-[#E6162D] text-white font-medium rounded-lg hover:bg-[#C41422] transition-colors"
              >
                验证
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setView('forgot')}
                  className="text-gray-500 text-sm hover:underline"
                >
                  返回上一步
                </button>
              </div>
            </form>
          </div>
        )}

        {/* 重置密码页面 */}
        {view === 'reset' && (
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-8">
            <div className="text-center mb-8">
              <h2 className="text-xl font-bold text-gray-900">设置新密码</h2>
              <p className="text-gray-500 text-sm mt-2">
                密码长度至少8位
              </p>
            </div>

            <form onSubmit={handleResetSubmit} className="space-y-4">
              <div>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="请输入新密码"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#E6162D] transition-colors"
                />
              </div>
              <div>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="请再次输入新密码"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#E6162D] transition-colors"
                />
              </div>

              {resetError && (
                <p className="text-red-500 text-sm text-center">{resetError}</p>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-[#E6162D] text-white font-medium rounded-lg hover:bg-[#C41422] transition-colors"
              >
                确认修改
              </button>
            </form>
          </div>
        )}

        {/* 登录成功 */}
        {view === 'success' && (
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-[#E6162D] rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">登录成功</h2>
              <p className="text-gray-500 text-sm mb-1">账号：田宇 @hengnian_tianyu ✓</p>
              <p className="text-gray-400 text-sm">即将跳转到您的主页...</p>
              <div className="mt-6">
                <div className="w-8 h-8 border-2 border-gray-300 border-t-[#E6162D] rounded-full animate-spin mx-auto" />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
