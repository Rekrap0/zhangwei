/**
 * useAIChat Hook
 * 
 * 通用AI聊天Hook，支持：
 * - 10秒消息批量合并发送
 * - 消息记录限制（保留最近10条）
 * - 达到6条后自动异步总结聊天历史
 * - localStorage持久化
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { SUMMARY_SYSTEM_PROMPT } from '../data/aiPrompts';
import { getFallbackReply, inferPersonaFromChatId } from '../data/aiFallback';
import { withBasePath } from '../utils/basePath';

const STORAGE_PREFIX = 'zhangwei_ai_chat_';

/**
 * @param {Object} options
 * @param {string} options.chatId - 唯一标识符，用于 localStorage 持久化
 * @param {string} options.systemPrompt - 系统提示词
 * @param {string} options.firstMessage - AI 的第一条消息（可选）
 * @param {boolean} options.enabled - 是否启用 AI 功能
 * @param {number} options.debounceMs - 消息合并等待时间（默认10000ms）
 * @param {number} options.maxMessages - 消息记录上限（默认10）
 * @param {number} options.summarizeThreshold - 触发总结的消息数阈值（默认6）
 */
export function useAIChat({
  chatId,
  systemPrompt,
  firstMessage = null,
  enabled = false,
  debounceMs = 5000,
  maxMessages = 10,
  summarizeThreshold = 6,
}) {
  // AI 会话状态
  const [aiMessages, setAiMessages] = useState([]); // [{role: 'user'|'assistant', content}]
  const [summary, setSummary] = useState('');
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [isDebouncing, setIsDebouncing] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [lastError, setLastError] = useState(null); // { status: number, message: string } | null

  // 消息批处理相关
  const pendingUserMessages = useRef([]);
  const debounceTimer = useRef(null);
  const isSummarizing = useRef(false);
  const currentSystemPrompt = useRef(systemPrompt);

  // 跟踪 systemPrompt 变化
  useEffect(() => {
    currentSystemPrompt.current = systemPrompt;
  }, [systemPrompt]);

  // 从 localStorage 加载状态（当 chatId 变化时重新加载）
  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    // 标记为未初始化
    setIsInitialized(false);

    // 先清空状态，防止残留
    setAiMessages([]);
    setSummary('');

    try {
      const stored = localStorage.getItem(STORAGE_PREFIX + chatId);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.messages) setAiMessages(parsed.messages);
        if (parsed.summary) setSummary(parsed.summary);
      }
    } catch (e) {
      console.error('[useAIChat] Failed to load state:', e);
    }
    setIsInitialized(true);
  }, [chatId, enabled]);

  // 保存到 localStorage
  const saveState = useCallback((messages, currentSummary) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_PREFIX + chatId, JSON.stringify({
        messages,
        summary: currentSummary,
      }));
    } catch (e) {
      console.error('[useAIChat] Failed to save state:', e);
    }
  }, [chatId]);

  // 构建完整的消息数组用于 API 请求
  const buildApiMessages = useCallback((messages, currentSummary) => {
    const apiMessages = [];

    // 系统提示词
    let sysContent = currentSystemPrompt.current;
    if (currentSummary) {
      sysContent += `\n\n## 之前的聊天历史总结\n${currentSummary}`;
    }
    apiMessages.push({ role: 'system', content: sysContent });

    // 如果有 firstMessage 且消息列表为空或第一条不是 assistant 消息
    if (firstMessage && (messages.length === 0 || messages[0].role !== 'assistant')) {
      apiMessages.push({ role: 'assistant', content: firstMessage });
    }

    // 添加消息历史（每条消息截取前100个字符以控制token用量）
    for (const msg of messages) {
      apiMessages.push({ role: msg.role, content: (msg.content || '').slice(0, 100) });
    }

    return apiMessages;
  }, [firstMessage]);

  // 触发异步总结
  const triggerSummarize = useCallback(async (messages, currentSummary) => {
    if (isSummarizing.current) return;
    isSummarizing.current = true;

    try {
      const chatLog = messages
        .map(m => `${m.role === 'user' ? '用户' : 'AI'}: ${m.content || ''}`)
        .join('\n');

      const summaryMessages = [
        { role: 'system', content: SUMMARY_SYSTEM_PROMPT },
        {
          role: 'user',
          content: currentSummary
            ? `之前的总结：\n${currentSummary}\n\n新的聊天记录：\n${chatLog}`
            : `聊天记录：\n${chatLog}`,
        },
      ];

      const response = await fetch(withBasePath('/api/chat'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: summaryMessages, purpose: 'summarize' }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.content) {
          setSummary(data.content);
          // 总结完成后削减消息到最近4条
          setAiMessages(prev => {
            const current = prev || [];
            const trimmed = current.slice(-4);
            saveState(trimmed, data.content);
            return trimmed;
          });
        }
      }
    } catch (e) {
      console.error('[useAIChat] Summarize failed:', e);
    } finally {
      isSummarizing.current = false;
    }
  }, [saveState]);

  // 使用 ref 跟踪最新消息，避免 Safari 的异步问题
  const messagesRef = useRef([]);

  // 同步更新 ref
  useEffect(() => {
    messagesRef.current = aiMessages;
  }, [aiMessages]);

  // 发送消息到 Groq API
  const sendToApi = useCallback(async (userContent) => {
    console.log('[useAIChat] sendToApi called with:', userContent);
    setIsAiThinking(true);

    // 将用户消息加入记录
    const userMsg = { role: 'user', content: userContent };

    // 使用 ref 获取当前消息，避免 Safari 回调延迟问题
    const currentMessages = messagesRef.current || [];
    const updatedMessages = [...currentMessages, userMsg];
    
    // 更新 ref 和 state
    messagesRef.current = updatedMessages;
    setAiMessages(updatedMessages);
    
    console.log('[useAIChat] updatedMessages:', updatedMessages);

    try {
      // 使用 ref 获取最新的 systemPrompt
      const apiMessages = buildApiMessages(updatedMessages, summary);
      console.log('[useAIChat] Sending API request, messages count:', apiMessages.length);

      const response = await fetch(withBasePath('/api/chat'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages, purpose: 'chat' }),
      });

      console.log('[useAIChat] API response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('[useAIChat] API response data:', data);
        const assistantContent = data.content || '...';
        const assistantMsg = { role: 'assistant', content: assistantContent };

        setAiMessages(prev => {
          const current = prev || [];
          let newMessages = [...current, assistantMsg];
          console.log('[useAIChat] newMessages after assistant reply:', newMessages);

          // 限制消息数量
          if (newMessages.length > maxMessages) {
            newMessages = newMessages.slice(-maxMessages);
          }

          // 检查是否需要触发总结
          if (newMessages.length >= summarizeThreshold && !isSummarizing.current) {
            setSummary(currentSummary => {
              triggerSummarize(newMessages, currentSummary);
              return currentSummary;
            });
          }

          // 使用函数式更新获取最新 summary
          setSummary(currentSummary => {
            saveState(newMessages, currentSummary);
            return currentSummary;
          });

          return newMessages;
        });
      } else {
        const errorText = await response.text();
        console.error('[useAIChat] API request failed:', response.status, errorText);
        // 设置错误状态
        const statusMessages = {
          400: '请求格式错误',
          401: '认证失败',
          403: '访问被禁止',
          404: '接口不存在',
          405: '方法不支持',
          429: '请求过于频繁',
          500: '服务器内部错误',
          502: '网关错误',
          503: '服务暂时不可用',
        };
        setLastError({
          status: response.status,
          message: statusMessages[response.status] || `HTTP ${response.status}`
        });
        // 使用 fallback 回复
        const persona = inferPersonaFromChatId(chatId);
        const fallbackContent = getFallbackReply(userContent, persona);
        setAiMessages(prev => {
          const current = prev || [];
          const fallbackMsg = { role: 'assistant', content: fallbackContent };
          const newMessages = [...current, fallbackMsg];
          setSummary(currentSummary => {
            saveState(newMessages, currentSummary);
            return currentSummary;
          });
          return newMessages;
        });
      }
    } catch (e) {
      console.error('[useAIChat] API request error:', e);
      // 设置网络错误状态
      setLastError({
        status: 0,
        message: e.message || '网络连接失败'
      });
      // 使用 fallback 回复
      const persona = inferPersonaFromChatId(chatId);
      const fallbackContent = getFallbackReply(userContent, persona);
      setAiMessages(prev => {
        const current = prev || [];
        const fallbackMsg = { role: 'assistant', content: fallbackContent };
        const newMessages = [...current, fallbackMsg];
        setSummary(currentSummary => {
          saveState(newMessages, currentSummary);
          return currentSummary;
        });
        return newMessages;
      });
    } finally {
      setIsAiThinking(false);
    }
  }, [buildApiMessages, summary, maxMessages, summarizeThreshold, saveState, triggerSummarize, chatId]);

  /**
   * 添加用户消息（支持10秒内合并）
   * @param {string} content - 用户消息内容
   */
  const addUserMessage = useCallback((content) => {
    if (!enabled) return;

    pendingUserMessages.current.push(content);
    setIsDebouncing(true);

    // 重置 debounce 计时器
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      const merged = pendingUserMessages.current.join('\n');
      pendingUserMessages.current = [];
      setIsDebouncing(false);
      sendToApi(merged);
    }, debounceMs);
  }, [enabled, debounceMs, sendToApi]);

  /**
   * 重置聊天状态（切换 persona 时使用）
   */
  const resetChat = useCallback((newChatId) => {
    setAiMessages([]);
    setSummary('');
    pendingUserMessages.current = [];
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
      debounceTimer.current = null;
    }
    setIsAiThinking(false);
    setIsDebouncing(false);
    // 清除旧的 localStorage
    if (typeof window !== 'undefined' && newChatId) {
      try {
        const stored = localStorage.getItem(STORAGE_PREFIX + newChatId);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.messages) setAiMessages(parsed.messages);
          if (parsed.summary) setSummary(parsed.summary);
        }
      } catch (e) {
        // ignore
      }
    }
  }, []);

  // 清理定时器
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  return {
    aiMessages,
    isAiThinking,
    isDebouncing,
    isInitialized,
    lastError,
    clearError: () => setLastError(null),
    addUserMessage,
    resetChat,
  };
}

export default useAIChat;
