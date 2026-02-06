import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'zhangwei_game_state';
const CHANNEL_NAME = 'zhangwei_sync_channel';

// 默认状态
const defaultState = {
  networkStatus: 'offline',
  messageCount: 0,
  isHacked: false,
};

/**
 * 跨标签页状态同步 Hook
 * 使用 localStorage 作为单一数据源
 * 使用 BroadcastChannel 实现即时同步
 */
export function useGameState() {
  const [state, setState] = useState(defaultState);
  const [isHydrated, setIsHydrated] = useState(false);

  // 从 localStorage 读取状态
  const loadState = useCallback(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        console.log('[useGameState] 从 localStorage 加载状态:', parsed);
        return parsed;
      }
    } catch (error) {
      console.error('[useGameState] 读取 localStorage 失败:', error);
    }
    return defaultState;
  }, []);

  // 保存状态到 localStorage
  const saveState = useCallback((newState) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
      console.log('[useGameState] 状态已保存到 localStorage:', newState);
    } catch (error) {
      console.error('[useGameState] 保存到 localStorage 失败:', error);
    }
  }, []);

  // 初始化：从 localStorage 加载状态
  useEffect(() => {
    const initialState = loadState();
    setState(initialState);
    setIsHydrated(true);
    console.log('[useGameState] Hook 已初始化，当前状态:', initialState);
  }, [loadState]);

  // 设置 BroadcastChannel 监听
  useEffect(() => {
    // 仅在浏览器环境下运行
    if (typeof window === 'undefined') return;

    const channel = new BroadcastChannel(CHANNEL_NAME);

    channel.onmessage = (event) => {
      console.log('[useGameState] 收到广播消息:', event.data);
      
      if (event.data.type === 'STATE_UPDATE') {
        const newState = event.data.payload;
        console.log('[useGameState] 同步来自其他标签页的状态:', newState);
        
        // 更新本地状态（不需要再次保存到 localStorage，因为发送方已保存）
        setState(newState);
      }
    };

    channel.onmessageerror = (error) => {
      console.error('[useGameState] BroadcastChannel 消息错误:', error);
    };

    console.log('[useGameState] BroadcastChannel 监听已启动');

    // 清理函数
    return () => {
      console.log('[useGameState] BroadcastChannel 监听已关闭');
      channel.close();
    };
  }, []);

  // 监听其他标签页通过 localStorage 的更新（作为备用方案）
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleStorageChange = (event) => {
      if (event.key === STORAGE_KEY && event.newValue) {
        try {
          const newState = JSON.parse(event.newValue);
          console.log('[useGameState] 检测到 localStorage 变化，同步状态:', newState);
          setState(newState);
        } catch (error) {
          console.error('[useGameState] 解析 localStorage 变化失败:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // 更新状态并广播到其他标签页
  const updateState = useCallback((updates) => {
    setState((prevState) => {
      // 支持函数式更新
      const newUpdates = typeof updates === 'function' ? updates(prevState) : updates;
      const newState = { ...prevState, ...newUpdates };

      console.log('[useGameState] 更新状态:', { 旧状态: prevState, 更新: newUpdates, 新状态: newState });

      // 保存到 localStorage
      saveState(newState);

      // 广播到其他标签页
      try {
        const channel = new BroadcastChannel(CHANNEL_NAME);
        channel.postMessage({
          type: 'STATE_UPDATE',
          payload: newState,
          timestamp: Date.now(),
        });
        console.log('[useGameState] 状态已广播到其他标签页');
        channel.close();
      } catch (error) {
        console.error('[useGameState] 广播失败:', error);
      }

      return newState;
    });
  }, [saveState]);

  // 重置状态
  const resetState = useCallback(() => {
    console.log('[useGameState] 重置状态为默认值');
    updateState(defaultState);
  }, [updateState]);

  return {
    state,
    isHydrated,
    updateState,
    resetState,
  };
}

export default useGameState;
