import { useGameState } from '../hooks/useGameState';

export default function Wechat() {
  const { state, isHydrated, updateState } = useGameState();

  // 回复消息
  const handleReply = () => {
    console.log('[Wechat] 回复消息，消息计数 +1');
    updateState((prev) => ({
      messageCount: prev.messageCount + 1,
    }));
  };

  // 等待水合完成
  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-500">加载中...</div>
      </div>
    );
  }

  const isOnline = state.networkStatus === 'online';

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* 微信顶部栏 */}
      <header className="bg-green-600 text-white px-4 py-3 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 01.213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 00.167-.054l1.903-1.114a.864.864 0 01.717-.098 10.16 10.16 0 002.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348z"/>
          </svg>
          <span className="text-lg font-semibold">微信</span>
        </div>
        
        {/* 网络状态指示器 */}
        <div className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded-full ${
          isOnline ? 'bg-green-500' : 'bg-red-500'
        }`}>
          <span className={`w-2 h-2 rounded-full ${
            isOnline ? 'bg-green-300 animate-pulse' : 'bg-red-300'
          }`}></span>
          <span>{isOnline ? '在线' : '离线'}</span>
        </div>
      </header>

      {/* 聊天列表区域 */}
      <main className="flex-1 p-4">
        {/* 网络离线提示 */}
        {!isOnline && (
          <div className="bg-yellow-100 border border-yellow-300 text-yellow-800 px-4 py-3 rounded-lg mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
            </svg>
            <span className="font-medium">当前网络不可用，无法接收消息</span>
          </div>
        )}

        {/* 聊天项目 - 张薇 */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className={`p-4 flex items-center gap-3 ${
            isOnline ? 'hover:bg-gray-50 cursor-pointer' : 'opacity-50'
          }`}>
            {/* 头像 */}
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                薇
              </div>
              {/* 消息红点 */}
              {isOnline && state.messageCount < 1 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  1
                </span>
              )}
            </div>

            {/* 聊天信息 */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">张薇</h3>
                <span className="text-xs text-gray-400">
                  {isOnline ? '刚刚' : '3天前'}
                </span>
              </div>
              <p className="text-sm text-gray-500 truncate mt-0.5">
                {isOnline 
                  ? '在吗？（1条新消息）' 
                  : '[网络异常] 无法获取消息'}
              </p>
            </div>
          </div>

          {/* 展开的对话内容（仅在线时显示） */}
          {isOnline && (
            <div className="border-t border-gray-100 p-4 bg-gray-50">
              {/* 消息气泡 */}
              <div className="flex gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                  薇
                </div>
                <div className="bg-white rounded-lg px-4 py-2 shadow-sm max-w-xs">
                  <p className="text-gray-800">在吗？好久没联系了...</p>
                  <span className="text-xs text-gray-400 mt-1 block">10:23</span>
                </div>
              </div>

              {/* 回复按钮 */}
              <button
                onClick={handleReply}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"/>
                </svg>
                回复消息
              </button>

              {/* 已回复次数 */}
              {state.messageCount > 0 && (
                <div className="mt-3 text-center text-sm text-gray-500">
                  已回复 <span className="font-semibold text-green-600">{state.messageCount}</span> 次消息
                </div>
              )}
            </div>
          )}
        </div>

        {/* 其他聊天项目占位 */}
        <div className="mt-4 space-y-2">
          {['文件传输助手', '微信团队'].map((name) => (
            <div key={name} className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-3 opacity-50">
              <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 text-sm">
                {name[0]}
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-700">{name}</h3>
                <p className="text-sm text-gray-400 truncate">暂无新消息</p>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* 底部标签栏 */}
      <footer className="bg-white border-t border-gray-200 px-6 py-3">
        <div className="flex justify-around">
          {['微信', '通讯录', '发现', '我'].map((tab, i) => (
            <button
              key={tab}
              className={`flex flex-col items-center gap-1 ${
                i === 0 ? 'text-green-600' : 'text-gray-400'
              }`}
            >
              <div className="w-6 h-6 bg-current opacity-30 rounded"></div>
              <span className="text-xs">{tab}</span>
            </button>
          ))}
        </div>
      </footer>
    </div>
  );
}
