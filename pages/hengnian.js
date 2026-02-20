import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { getPlayerCookies } from '../utils/cookies';
import { useAIChat } from '../hooks/useAIChat';
import { SY_SYSTEM_PROMPT, LIJING_SYSTEM_PROMPT } from '../data/aiPrompts';

// 聊天客服组件
const CHAT_STORAGE_KEY = 'zhangwei_hengnian_chat';

function ChatWidget({ forceOpen }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [persona, setPersona] = useState('sy'); // 'sy' | 'lijing'
  const [displayMessages, setDisplayMessages] = useState([]); // [{role, content}]
  const [isFlickering, setIsFlickering] = useState(false);
  const [lijingDisconnected, setLijingDisconnected] = useState(false);
  const messagesEndRef = useRef(null);
  const lastAiCountRef = useRef(-1); // -1 表示未初始化
  const isInitializedRef = useRef(false);
  const broadcastChannelRef = useRef(null);

  // 响应外部 forceOpen 变化
  useEffect(() => {
    if (forceOpen) setIsOpen(true);
  }, [forceOpen]);

  // 从 localStorage 加载状态
  useEffect(() => {
    if (typeof window === 'undefined' || isInitializedRef.current) return;
    try {
      const stored = localStorage.getItem(CHAT_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.persona) setPersona(parsed.persona);
        if (parsed.displayMessages) setDisplayMessages(parsed.displayMessages);
        // lastAiCount 会在同步 useEffect 中根据 aiMessages 自动初始化
        if (parsed.lijingDisconnected) setLijingDisconnected(true);
      }
    } catch (e) {
      console.error('[ChatWidget] Failed to load state:', e);
    }
    isInitializedRef.current = true;
  }, []);

  // 监听来自微博的 BroadcastChannel 消息
  useEffect(() => {
    if (typeof window === 'undefined') return;

    broadcastChannelRef.current = new BroadcastChannel('zhangwei_weibo_channel');

    broadcastChannelRef.current.onmessage = (event) => {
      if (event.data?.type === 'VERIFICATION_CODE') {
        const code = event.data.code;
        // 添加李静发送验证码的消息
        const newMsg = {
          role: 'assistant',
          content: `我截获到了验证码：${code}。快去用它重置密码！记住，时间不多了...`,
        };
        setDisplayMessages(prev => {
          const updated = [...prev, newMsg];
          // 同时标记连接断开
          setLijingDisconnected(true);
          // 保存状态
          if (typeof window !== 'undefined') {
            try {
              localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify({
                persona: 'lijing',
                displayMessages: updated,
                lastAiCount: lastAiCountRef.current,
                lijingDisconnected: true,
              }));
            } catch (e) {
              // ignore
            }
          }
          return updated;
        });
      }
    };

    return () => {
      if (broadcastChannelRef.current) {
        broadcastChannelRef.current.close();
      }
    };
  }, []);

  // 保存状态到 localStorage
  const saveState = useCallback((msgs, p, aiCount, disconnected = false) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify({
        persona: p,
        displayMessages: msgs,
        lastAiCount: aiCount,
        lijingDisconnected: disconnected || lijingDisconnected,
      }));
    } catch (e) {
      console.error('[ChatWidget] Failed to save state:', e);
    }
  }, [lijingDisconnected]);

  const currentPrompt = persona === 'sy' ? SY_SYSTEM_PROMPT : LIJING_SYSTEM_PROMPT;
  const currentChatId = persona === 'sy' ? 'hengnian_sy' : 'hengnian_lijing';

  const {
    aiMessages,
    isAiThinking,
    isDebouncing,
    addUserMessage,
    resetChat,
    isInitialized: isAiInitialized,
  } = useAIChat({
    chatId: currentChatId,
    systemPrompt: currentPrompt,
    enabled: true,
    debounceMs: 3000, // 3秒消息合并
  });

  // 同步 AI 消息到显示列表
  useEffect(() => {
    // 等待两者都初始化完成
    if (!isInitializedRef.current || !isAiInitialized) return;

    const assistantMsgs = aiMessages.filter(m => m.role === 'assistant');
    console.log('[ChatWidget] Sync effect - assistantMsgs:', assistantMsgs.length, 'lastAiCount:', lastAiCountRef.current);

    // 首次同步时，如果 lastAiCount 未设置（-1），初始化为当前 AI 消息数量
    if (lastAiCountRef.current === -1) {
      lastAiCountRef.current = assistantMsgs.length;
      return;
    }

    // 如果 AI 消息数量少于记录的数量，说明 aiMessages 被重置了，需要同步重置计数器
    if (assistantMsgs.length < lastAiCountRef.current) {
      console.log('[ChatWidget] aiMessages was reset, resetting lastAiCount from', lastAiCountRef.current, 'to', assistantMsgs.length);
      lastAiCountRef.current = assistantMsgs.length;
    }

    if (assistantMsgs.length === lastAiCountRef.current) {
      // 没有新消息
      return;
    }

    // 有新消息需要显示
    const newMsgs = assistantMsgs.slice(lastAiCountRef.current);
    console.log('[ChatWidget] Adding new messages:', newMsgs);
    lastAiCountRef.current = assistantMsgs.length;
    setDisplayMessages(prev => {
      const updated = [...prev, ...newMsgs.map(m => ({ role: 'assistant', content: m.content }))];
      saveState(updated, persona, lastAiCountRef.current);
      return updated;
    });
  }, [aiMessages, persona, saveState, isAiInitialized]);

  // 滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [displayMessages, isAiThinking]);

  const handleSend = () => {
    const text = inputValue.trim();
    if (!text) return;
    if (text.includes("-.- ..-. -.-. ...- -- . ..... -----") && persona === 'sy' ){
      setInputValue('');
      router.push('/end3_l0KojMx5C2');
      return;
    }
    // 检查是否是切换暗号
    if (text.toUpperCase() === 'KFCVME50' && persona === 'sy') {
      setInputValue('');
      // 显示闪烁特效
      setIsFlickering(true);
      setTimeout(() => {
        setIsFlickering(false);
        // 切换到李静模式，保留之前的UI消息记录，但AI重新开始
        setPersona('lijing');
        lastAiCountRef.current = -1; // 重置为未初始化，让同步逻辑重新计算
        resetChat('hengnian_lijing');
        // 在现有消息后追加系统切换提示和李静的开场白
        setDisplayMessages(prev => {
          const updated = [
            ...prev,
            { role: 'system', content: '██ 系统接口已切换 ██' },
            { role: 'assistant', content: '你终于找到这里了。时间不多了，公司的安全部门马上就会发现我们，我们长话短说！' },
          ];
          saveState(updated, 'lijing', 0);
          return updated;
        });
      }, 800);
      return;
    }

    setInputValue('');
    setDisplayMessages(prev => {
      const updated = [...prev, { role: 'user', content: text }];
      saveState(updated, persona, lastAiCountRef.current);
      return updated;
    });

    // 如果李静连接已断开，只显示消息但不发送到AI
    if (lijingDisconnected && persona === 'lijing') {
      // 不调用 addUserMessage，消息不会发送到AI
      return;
    }

    addUserMessage(text);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const headerColor = persona === 'sy' ? 'bg-[#2E7D32]' : 'bg-[#B71C1C]';

  return (
    <>
      {/* 悬浮按钮 */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-br from-[#2E7D32] to-[#388E3C] rounded-full shadow-lg shadow-green-900/30 flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
        >
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </button>
      )}

      {/* 聊天窗口 */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[360px] max-w-[calc(100vw-2rem)] h-[500px] max-h-[calc(100vh-4rem)] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200">
          {/* 闪烁特效层 */}
          {isFlickering && (
            <div className="absolute inset-0 z-10 bg-red-500 animate-screen-flicker pointer-events-none" />
          )}

          {/* 头部 */}
          <div className={`${headerColor} px-4 py-3 flex items-center justify-between`}>
            <div className="flex items-center gap-2">
              <img src="/iconHengnian.png" alt="恒念药业" className="w-8 h-8 rounded-full object-cover" />
              <div>
                <p className="text-white text-sm font-medium">恒念药业在线客服</p>
                <p className="text-white/60 text-xs">在线</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* 消息区域 */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {/* 欢迎消息 */}
            {displayMessages.length === 0 && persona === 'sy' && (
              <div className="flex gap-2">
                <div className="bg-white rounded-lg rounded-tl-sm px-3 py-2 max-w-[80%] shadow-sm">
                  <p className="text-sm text-gray-700">您好！我是恒念药业智能客服思圆，有什么可以帮您的吗？ 😊</p>
                </div>
              </div>
            )}

            {displayMessages.map((msg, i) => {
              if (msg.role === 'system') {
                return (
                  <div key={i} className="flex justify-center">
                    <span className="text-xs text-red-400 bg-red-50 px-3 py-1 rounded-full">{msg.content}</span>
                  </div>
                );
              }
              if (msg.role === 'user') {
                return (
                  <div key={i} className="flex gap-2 flex-row-reverse">
                    <div className="bg-blue-500 text-white rounded-lg rounded-tr-sm px-3 py-2 max-w-[80%] shadow-sm">
                      <p className="text-sm">{msg.content}</p>
                    </div>
                  </div>
                );
              }
              // assistant
              const isLijing = persona === 'lijing';
              return (
                <div key={i} className="flex gap-2">
                  <div className="bg-white rounded-lg rounded-tl-sm px-3 py-2 max-w-[80%] shadow-sm">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              );
            })}

            {/* 正在输入指示器 */}
            {(isAiThinking || isDebouncing) && (
              <div className="flex gap-2">
                <div className="bg-white rounded-lg rounded-tl-sm px-3 py-2 shadow-sm">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* 输入区域 */}
          <div className="px-3 py-2 border-t border-gray-200 bg-white">
            <div className="flex items-end gap-2">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={persona === 'sy' ? '输入您的问题...' : '输入消息...'}
                rows={1}
                className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg resize-none focus:outline-none focus:border-[#2E7D32] transition-colors"
                style={{ maxHeight: '80px' }}
              />
              <button
                onClick={handleSend}
                disabled={!inputValue.trim()}
                className={`px-3 py-2 rounded-lg text-white text-sm font-medium transition-colors ${inputValue.trim()
                  ? `${persona === 'lijing' ? 'bg-[#B71C1C] hover:bg-[#8B0000]' : 'bg-[#2E7D32] hover:bg-[#1B5E20]'}`
                  : 'bg-gray-300 cursor-not-allowed'
                  }`}
              >
                发送
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function Hengnian() {
  const router = useRouter();
  const [chatOpen, setChatOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const { playerName, startDate } = getPlayerCookies();
    if (!playerName || !startDate) {
      router.replace('/');
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-white">
      <Head><title>恒念药业</title></Head>
      {/* 顶部导航 */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <img src="/iconHengnian.png" alt="恒念药业" className="w-10 h-10 rounded-lg object-cover" />
            <div>
              <h1 className="text-lg font-bold text-gray-900 leading-tight">恒念药业</h1>
              <p className="text-[10px] text-gray-400 leading-none tracking-wider">HENGNIAN PHARMA</p>
            </div>
          </div>

          {/* 导航 */}
          <nav className="hidden md:flex items-center gap-8 text-sm">
            <span className="text-[#2E7D32] font-medium cursor-pointer">首页</span>
            <span className="text-gray-600 hover:text-[#2E7D32] cursor-pointer transition-colors">产品与研发</span>
            <span className="text-gray-600 hover:text-[#2E7D32] cursor-pointer transition-colors"><a href="/hengyao-news">新闻中心</a></span>
            <span className="text-gray-600 hover:text-[#2E7D32] cursor-pointer transition-colors">社会责任</span>
            <span className="text-gray-600 hover:text-[#2E7D32] cursor-pointer transition-colors">加入我们</span>
            <a href="/hengnian-admin" className="hover:text-white cursor-pointer"><span className="text-gray-600 hover:text-[#2E7D32] cursor-pointer transition-colors">管理员登录</span></a>
          </nav>

          {/* 语言切换 */}
          <div className="hidden sm:flex items-center gap-2 text-xs text-gray-500">
            <span className="text-[#2E7D32] font-medium">中文</span>
            <span>/</span>
            <span className="cursor-pointer hover:text-[#2E7D32]">EN</span>
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

        {/* 移动端折叠菜单 */}
        <div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          mobileMenuOpen ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'
        }`}>
          <nav className="flex flex-col px-6 pb-4 space-y-1 border-t border-gray-100">
            <span className="text-[#2E7D32] font-medium text-sm py-2 cursor-pointer">首页</span>
            <span className="text-gray-600 hover:text-[#2E7D32] text-sm py-2 cursor-pointer transition-colors">产品与研发</span>
            <span className="text-gray-600 hover:text-[#2E7D32] text-sm py-2 cursor-pointer transition-colors"><a href="/hengyao-news">新闻中心</a></span>
            <span className="text-gray-600 hover:text-[#2E7D32] text-sm py-2 cursor-pointer transition-colors">社会责任</span>
            <span className="text-gray-600 hover:text-[#2E7D32] text-sm py-2 cursor-pointer transition-colors">加入我们</span>
            <a href="/hengnian-admin" className="hover:text-white cursor-pointer"><span className="text-gray-600 hover:text-[#2E7D32] text-sm py-2 cursor-pointer transition-colors">管理员登录</span></a>
            <div className="flex items-center gap-2 text-xs text-gray-500 pt-2 border-t border-gray-100">
              <span className="text-[#2E7D32] font-medium">中文</span>
              <span>/</span>
              <span className="cursor-pointer hover:text-[#2E7D32]">EN</span>
            </div>
          </nav>
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
        <div className="max-w-6xl mx-auto px-6 relative z-[1]">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
            创新药物<br />
            <span className="text-[#2E7D32]">恒念为民</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mb-8 leading-relaxed">
            恒念药业专注于神经系统疾病治疗的创新研发，致力于为全球患者提供安全、有效的治疗方案。
          </p>
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
                公司总部位于北京市海淀区，由创始人田宇博士以
                &ldquo;恒心守念，医者仁心&rdquo;的理念创立。
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
                avatar: '/avatarTianyu.png',
              },
              {
                name: '林晓琳',
                title: '首席研究员（CRO）',
                desc: '神经科学博士，海外归国学者。拥有15年以上神经系统疾病研究经验。',
                avatar: '/avatarLinxiaolin.png',
              },
              {
                name: '陈志远',
                title: '首席运营官（COO）',
                desc: '拥有超过12年医药行业运营管理经验，曾任某跨国药企中国区运营总监。',
                avatar: '/avatarChenzhiyuan.png',
              },
            ].map((person, i) => (
              <div key={i} className="bg-[#FAFAFA] rounded-xl p-6 hover:shadow-md transition-shadow">
                <img src={person.avatar} alt={person.name} className="w-16 h-16 rounded-full object-cover mb-4" />
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
              { date: '2025-09-15', title: '公司与北景大学签署战略合作协议', desc: '恒念药业与北景大学生命科学学院签署为期五年的产学研合作框架协议……' },
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
              <img src="/iconHengnian.png" alt="恒念药业" className="w-8 h-8 rounded-lg object-cover" />
              <div>
                <p className="font-medium">恒念药业股份有限公司</p>
                <p className="text-xs text-white/60">Hengnian Pharmaceutical Co., Ltd.</p>
              </div>
            </div>
            <div className="flex items-center gap-6 text-sm text-white/80">
              <span className="hover:text-white cursor-pointer">法律声明</span>
              <span className="hover:text-white cursor-pointer">隐私政策</span>
              <a href="/hengnian-admin" className="hover:text-white cursor-pointer"><b>管理员登录</b></a>
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-white/20 text-center text-xs text-white/50">
            <p>&copy; 2015-2026 恒念药业 版权所有 </p>
          </div>
        </div>
      </footer>

      {/* 聊天客服组件 */}
      <ChatWidget forceOpen={chatOpen} />
    </div>
  );
}
