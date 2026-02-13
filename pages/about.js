export default function About() {
    const credits = [
        { name: 'Claude Opus 4.6', role: '编程协助', icon: '🛠' },
        { name: 'Gemini 3 Pro', role: '流程设计', icon: '🧩' },
        { name: '久言', role: '剧本编写', icon: '🎬' },
        { name: '朔月', role: '架构设计', icon: '💻' },
        { name: '豆包', role: '图片生成', icon: '🎨' },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

            <div className="relative z-10 max-w-2xl mx-auto px-6 py-16">
                {/* 返回按钮 */}
                <button
                    onClick={() => window.location.href = '/'}
                    className="text-gray-400 hover:text-white transition-colors text-sm mb-10 flex items-center gap-1"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    返回主页
                </button>

                {/* 标题 */}
                <h1 className="text-4xl font-bold text-white mb-2 tracking-wider">关于此项目</h1>
                <p className="text-gray-500 mb-12">张薇失联事件 — 网页解密游戏</p>

                {/* 项目结构 */}
                <section className="mb-12">
                    <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                        <span className="w-1 h-5 bg-blue-500 rounded-full inline-block" />
                        项目结构
                    </h2>
                    <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-3 text-sm text-gray-300 leading-relaxed">
                        <p>
                            本项目基于 <span className="text-blue-400 font-medium">Next.js</span> 构建，使用 Pages Router 进行页面路由管理，配合 <span className="text-blue-400 font-medium">Tailwind CSS</span> 实现界面样式。
                        </p>
                        <p>
                            游戏内每个"应用"（微信、QQ、浏览器等）对应一个独立页面，通过模拟手机桌面的搜索框进行导航。游戏状态通过 Cookies 和 localStorage 在浏览器本地持久化，并借助 BroadcastChannel 实现跨标签页同步。
                        </p>
                        <a
                            href="https://github.com/Rekrap0/zhangwei"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-sm text-blue-400 hover:text-blue-300 transition-colors"
                        >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                            </svg>
                            Rekrap0/zhangwei
                        </a>
                        <p className="inline text-xs">（如果打不开就是还没公开）</p>
                    </div>
                </section>

                {/* 使用的 API */}
                <section className="mb-12">
                    <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                        <span className="w-1 h-5 bg-green-500 rounded-full inline-block" />
                        使用的 API
                    </h2>
                    <div className="space-y-3">
                        <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                            <h3 className="text-white font-medium mb-1">搜索 API</h3>
                            <p className="text-gray-400 text-sm mb-2">提供游戏内浏览器的网页搜索功能</p>
                            <a
                                href="https://github.com/ankushthakur2007/miyami_websearch_tool"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-sm text-blue-400 hover:text-blue-300 transition-colors"
                            >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                                </svg>
                                ankushthakur2007/miyami_websearch_tool
                            </a>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                            <h3 className="text-white font-medium mb-1">LLM 提供商</h3>
                            <p className="text-gray-400 text-sm mb-2">为游戏内 AI 角色提供回复能力</p>
                            <div className="flex items-center gap-2 text-sm">
                                <span className="text-green-400 font-medium">GroqCloud</span>
                                <span className="text-gray-600">·</span>
                                <span className="text-gray-400">模型：</span>
                                <code className="text-gray-300 bg-white/10 px-2 py-0.5 rounded text-xs">gpt-oss-20b</code>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 制作人员 */}
                <section className="mb-12">
                    <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                        <span className="w-1 h-5 bg-purple-500 rounded-full inline-block" />
                        制作人员
                    </h2>
                    <p className="text-white text-sm pb-2">由字母表A-Z排序，不分先后</p>
                    <div className="grid gap-2">
                        {credits.map((person) => (
                            <div
                                key={person.name}
                                className="bg-white/5 border border-white/10 rounded-xl px-5 py-4 flex items-center justify-between"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-lg">{person.icon}</span>
                                    <span className="text-white font-medium">{person.name}</span>
                                </div>
                                <span className="text-gray-500 text-sm">{person.role}</span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* 底部 */}
                <div className="text-center text-gray-600 text-xs pt-4 border-t border-white/5">
                    © 2026 Jiangye
                </div>
            </div>
        </div>
    );
}
