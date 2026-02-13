import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { getPlayerCookies, getCookie, deleteCookie } from '../utils/cookies';
import { useGameState } from '../hooks/useGameState';

const ADMIN_AUTH_KEY = 'zhangwei_admin_auth';

export default function HengnianPanel() {
  const router = useRouter();
  const { state, updateState, isHydrated } = useGameState();
  const [showNotification, setShowNotification] = useState(false);
  const [isRepairing, setIsRepairing] = useState(false);
  const [repaired, setRepaired] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const [glitchActive, setGlitchActive] = useState(false);
  const [lastLoginDate, setLastLoginDate] = useState('');

  useEffect(() => {
    const { playerName, startDate } = getPlayerCookies();
    if (!playerName || !startDate) {
      router.replace('/');
      return;
    }
    // 计算上次登录日期（开始日期 - 2年）
    const d = new Date(startDate);
    d.setFullYear(d.getFullYear() - 2);
    setLastLoginDate(`${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`);
    // 检查管理员权限
    if (getCookie(ADMIN_AUTH_KEY) !== 'true') {
      router.replace('/hengnian-admin');
    }
  }, [router]);

  // 检查游戏进度状态
  useEffect(() => {
    if (isHydrated) {
      if (state.continueInvestigation) {
        // 玩家在微信侧选择了继续调查，管理面板应被锁定
        setRepaired(true);
        setIsLocked(true);
      } else if (state.networkRepaired) {
        setRepaired(true);
      }
    }
  }, [isHydrated, state.continueInvestigation, state.networkRepaired]);

  const handleRepairNetwork = () => {
    setIsRepairing(true);
    // 模拟修复过程
    setTimeout(() => {
      setIsRepairing(false);
      setRepaired(true);
      // 更新游戏状态 - 通知其他标签页
      updateState({ networkRepaired: true });
      // 显示手机通知弹窗
      setShowNotification(true);
    }, 2000);
  };

  const handleLogout = () => {
    deleteCookie(ADMIN_AUTH_KEY);
    router.push('/hengnian-admin');
  };

  // 锁定状态下的会话ID动画
  useEffect(() => {
    if (!isLocked) return;

    // 生成随机会话ID
    const chars = '0123456789abcdef';
    const randomId = Array.from({ length: 32 }, () => chars[Math.floor(Math.random() * chars.length)])
      .join('')
      .replace(/(.{8})(.{4})(.{4})(.{4})(.{12})/, '$1-$2-$3-$4-$5');
    setSessionId(randomId);

    // 1.5秒后切换为Base64编码
    const timer = setTimeout(() => {
      setGlitchActive(true);
      setTimeout(() => {
        const base64 = typeof window !== 'undefined'
          ? btoa(window.location.origin + '/hengnian-config')
          : '';
        setSessionId(base64);
        setTimeout(() => {
          setGlitchActive(false);
        }, 300);
      }, 200);
    }, 1500);

    return () => clearTimeout(timer);
  }, [isLocked]);

  // ========== 锁定画面 ==========
  if (isLocked) {
    return (
      <div className={`min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-4 font-mono relative overflow-hidden ${glitchActive ? 'animate-screen-flicker' : ''}`}>
        <div className="max-w-2xl w-full">
          {/* 警告标题 */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
            <span className="text-red-500/80 text-xs uppercase tracking-[0.3em]">SECURITY ALERT — EMERGENCY PROTOCOL ACTIVE</span>
          </div>

          <h1 className="text-red-400 text-2xl font-bold mb-2">
            ⚠ 检测到异常网络活动
          </h1>
          <p className="text-gray-500 text-sm mb-8">
            管理员面板已被安全系统自动锁定
          </p>

          {/* 状态面板 */}
          <div className="bg-[#111] border border-red-900/30 rounded-lg overflow-hidden mb-6">
            <div className="bg-red-900/20 px-5 py-3 border-b border-red-900/30">
              <span className="text-red-400 text-sm font-medium">紧急安全协议 — 状态报告</span>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-start gap-3">
                <span className="text-red-400">●</span>
                <div>
                  <p className="text-gray-300 text-sm">系统检测到异常的管理操作</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-amber-400">●</span>
                <div>
                  <p className="text-gray-300 text-sm">管理员面板已锁定，对外网服务已暂停</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-amber-400">●</span>
                <div>
                  <p className="text-gray-300 text-sm">安全团队已收到通知</p>
                </div>
              </div>

              <div className="border-t border-gray-800 pt-4 mt-4">
                <div className="flex items-start gap-2 text-sm">
                  <span className="text-gray-500 flex-shrink-0">会话ID:</span>
                  <span className={`font-mono text-xs break-all transition-colors duration-300 ${glitchActive ? 'text-red-400' : 'text-green-400/80'}`}>
                    {sessionId}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 底部信息 */}
          <div className="text-gray-600 text-xs space-y-1">
            <p>如有疑问，请联系系统安全管理员。</p>
            <p className="text-gray-700">&copy; 2015-2026 恒念药业 内部安全系统</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F0F2F5] flex flex-col">
      {/* 手机消息通知弹窗 */}
      {showNotification && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 animate-slide-down w-[360px] max-w-[90vw]">
          <button
            onClick={() => {
              setShowNotification(false);
              window.open('/wechat', '_blank');
            }}
            className="w-full bg-white rounded-2xl shadow-2xl shadow-black/20 p-4 flex items-start gap-3 text-left hover:bg-gray-50 active:scale-[0.98] transition-all"
          >
            {/* 微信图标 */}
            <div className="w-10 h-10 bg-[#07C160] rounded-xl flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 01.213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 00.167-.054l1.903-1.114a.864.864 0 01.717-.098 10.16 10.16 0 002.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 01-1.162 1.178A1.17 1.17 0 014.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 01-1.162 1.178 1.17 1.17 0 01-1.162-1.178c0-.651.52-1.18 1.162-1.18zm3.905 4.238c-1.548 0-3.028.428-4.236 1.238-1.399.937-2.27 2.324-2.37 3.876-.105 1.63.64 3.156 2.041 4.17a.418.418 0 01.152.472l-.238.906c-.014.05-.035.1-.035.152 0 .115.093.209.206.209a.23.23 0 00.118-.039l1.348-.789a.612.612 0 01.508-.069 7.18 7.18 0 002.01.285c3.426 0 6.217-2.33 6.217-5.193s-2.791-5.218-6.217-5.218h-.504zm-2.39 2.768c.456 0 .824.375.824.838a.831.831 0 01-.824.836.831.831 0 01-.823-.836c0-.463.368-.838.823-.838zm4.781 0c.456 0 .824.375.824.838a.831.831 0 01-.824.836.831.831 0 01-.823-.836c0-.463.368-.838.823-.838z" />
              </svg>
            </div>
            {/* 通知内容 */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-sm font-semibold text-gray-900">微信</span>
                <span className="text-xs text-gray-400">现在</span>
              </div>
              <p className="text-sm text-gray-700 truncate">您收到了一条微信消息</p>
            </div>
          </button>
        </div>
      )}

      {/* 顶部导航 */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/iconHengnian.png" alt="恒念药业" className="w-8 h-8 rounded-lg object-cover" />
            <div>
              <span className="font-bold text-gray-900">管理面板</span>
              <span className="text-xs text-gray-400 ml-2">恒念药业内部系统</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <img src="/avatarLijing.png" alt="李静" className="w-7 h-7 rounded-full object-cover" />
              <span>李静</span>
            </div>
            <button
              onClick={handleLogout}
              className="text-sm text-gray-500 hover:text-red-500 transition-colors"
            >
              退出
            </button>
          </div>
        </div>
      </header>

      {/* 主体内容 */}
      <main className="flex-1 max-w-6xl mx-auto px-6 py-6 w-full">
        {/* 欢迎信息 */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">欢迎回来，李静</h1>
          <p className="text-sm text-gray-500 mt-1">恒念药业管理系统 | 上次登录：{lastLoginDate}</p>
        </div>

        {/* 状态卡片 */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { label: '员工总数', value: '312', icon: '👥', color: 'bg-blue-50 text-blue-700' },
            { label: '在研项目', value: '8', icon: '🔬', color: 'bg-purple-50 text-purple-700' },
            { label: '系统告警', value: '3', icon: '⚠️', color: 'bg-amber-50 text-amber-700' },
            { label: '网络状态', value: repaired ? '正常' : '异常', icon: repaired ? '✅' : '❌', color: repaired ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700' },
          ].map((card, i) => (
            <div key={i} className="bg-white rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">{card.label}</span>
                <span className="text-xl">{card.icon}</span>
              </div>
              <p className={`text-2xl font-bold ${card.color.split(' ')[1]}`}>{card.value}</p>
            </div>
          ))}
        </div>

        {/* 操作区域 */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* 网络管理 */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">系统管理</h2>

            <div className="space-y-4">
              {/* 修复公司网络 */}
              <div className={`border rounded-xl p-5 ${repaired ? 'border-green-200 bg-green-50/50' : 'border-red-200 bg-red-50/50'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900 flex items-center gap-2">
                      公司网络
                      <span className={`text-xs px-2 py-0.5 rounded-full ${repaired ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {repaired ? '已恢复' : '异常'}
                      </span>
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {repaired
                        ? '公司网络已恢复正常运行'
                        : '检测到部分网络节点连接异常，影响内部通讯'}
                    </p>
                  </div>
                  {!repaired && (
                    <button
                      onClick={handleRepairNetwork}
                      disabled={isRepairing}
                      className="px-5 py-2.5 bg-[#2E7D32] text-white text-sm font-medium rounded-lg hover:bg-[#1B5E20] transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2 flex-shrink-0"
                    >
                      {isRepairing ? (
                        <>
                          <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          修复中...
                        </>
                      ) : (
                        '一键修复'
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* 其他系统项 */}
              <div className="border border-gray-200 rounded-xl p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900 flex items-center gap-2">
                      数据库服务
                      <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">正常</span>
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">PostgreSQL 15.4 · 运行时间: 142天</p>
                  </div>
                </div>
              </div>

              <div className="border border-gray-200 rounded-xl p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900 flex items-center gap-2">
                      应用服务器
                      <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">正常</span>
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">4核 16GB · CPU使用率: 23% · 内存: 67%</p>
                  </div>
                </div>
              </div>

              <div className="border border-gray-200 rounded-xl p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900 flex items-center gap-2">
                      安全监控
                      <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">2项待处理</span>
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">最近24小时内检测到2次异常访问尝试</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 侧边栏 */}
          <div className="space-y-6">
            {/* 快速操作 */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">快速操作</h2>
              <div className="space-y-2">
                {[
                  { label: '员工管理', icon: '👥' },
                  { label: '项目管理', icon: '📋' },
                  { label: '数据报表', icon: '📊' },
                  { label: '系统设置', icon: '⚙️' },
                  { label: '操作日志', icon: '📝' },
                ].map((item, i) => (
                  <button
                    key={i}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <span className="text-lg">{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 系统通知 */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">系统通知</h2>
              <div className="space-y-3">
                <div className="text-sm">
                  <p className="text-gray-900 font-medium">安全更新</p>
                  <p className="text-gray-500 text-xs mt-0.5">系统安全补丁已就绪，请安排更新窗口</p>
                  <p className="text-gray-400 text-xs mt-1">2小时前</p>
                </div>
                <div className="border-t border-gray-100" />
                <div className="text-sm">
                  <p className="text-gray-900 font-medium">存储空间预警</p>
                  <p className="text-gray-500 text-xs mt-0.5">研究数据存储已使用82%，建议清理归档数据</p>
                  <p className="text-gray-400 text-xs mt-1">1天前</p>
                </div>
                <div className="border-t border-gray-100" />
                <div className="text-sm">
                  <p className="text-gray-900 font-medium">备份完成</p>
                  <p className="text-gray-500 text-xs mt-0.5">数据库全量备份已完成，大小: 4.2GB</p>
                  <p className="text-gray-400 text-xs mt-1">2天前</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* 底部 */}
      <footer className="text-center text-xs text-gray-400 py-4 border-t border-gray-200 bg-white mt-6">
        <p>&copy; 2015-2026 恒念药业 内部管理系统 v2.4.1</p>
      </footer>
    </div>
  );
}
