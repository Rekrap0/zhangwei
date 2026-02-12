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
  debounceMs = 10000,
  maxMessages = 10,
  summarizeThreshold = 6,
}) {
  // AI 会话状态
  const [aiMessages, setAiMessages] = useState([]); // [{role: 'user'|'assistant', content}]
  const [summary, setSummary] = useState('');
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

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

    // 添加消息历史
    for (const msg of messages) {
      apiMessages.push({ role: msg.role, content: msg.content });
    }

    return apiMessages;
  }, [firstMessage]);

  // 触发异步总结
  const triggerSummarize = useCallback(async (messages, currentSummary) => {
    if (isSummarizing.current) return;
    isSummarizing.current = true;

    try {
      const chatLog = messages
        .map(m => `${m.role === 'user' ? '用户' : 'AI'}: ${m.content}`)
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

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: summaryMessages }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.content) {
          setSummary(data.content);
          // 总结完成后削减消息到最近4条
          setAiMessages(prev => {
            const trimmed = prev.slice(-4);
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

  // 发送消息到 Groq API
  const sendToApi = useCallback(async (userContent) => {
    console.log('[useAIChat] sendToApi called with:', userContent);
    setIsAiThinking(true);

    // 将用户消息加入记录
    const userMsg = { role: 'user', content: userContent };

    // 先同步更新用户消息
    let updatedMessages;
    setAiMessages(prev => {
      updatedMessages = [...prev, userMsg];
      console.log('[useAIChat] updatedMessages:', updatedMessages);
      return updatedMessages;
    });

    // 等待状态更新完成
    await new Promise(resolve => setTimeout(resolve, 0));

    try {
      // 使用 ref 获取最新的 systemPrompt
      const apiMessages = buildApiMessages(updatedMessages, summary);
      console.log('[useAIChat] Sending API request, messages count:', apiMessages.length);

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages }),
      });

      console.log('[useAIChat] API response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('[useAIChat] API response data:', data);
        const assistantContent = data.content || '...';
        const assistantMsg = { role: 'assistant', content: assistantContent };

        setAiMessages(prev => {
          let newMessages = [...prev, assistantMsg];
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
        // 添加错误提示消息
        setAiMessages(prev => {
          const errorMsg = { role: 'assistant', content: '（连接出现问题，请稍后再试）' };
          return [...prev, errorMsg];
        });
      }
    } catch (e) {
      console.error('[useAIChat] API request error:', e);
      // 添加错误提示消息
      setAiMessages(prev => {
        const errorMsg = { role: 'assistant', content: '（网络连接失败，请检查网络后重试）' };
        return [...prev, errorMsg];
      });
    } finally {
      setIsAiThinking(false);
    }
  }, [buildApiMessages, summary, maxMessages, summarizeThreshold, saveState, triggerSummarize]);

  /**
   * 添加用户消息（支持10秒内合并）
   * @param {string} content - 用户消息内容
   */
  const addUserMessage = useCallback((content) => {
    if (!enabled) return;

    pendingUserMessages.current.push(content);

    // 重置 debounce 计时器
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      const merged = pendingUserMessages.current.join('\n');
      pendingUserMessages.current = [];
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
    isInitialized,
    addUserMessage,
    resetChat,
  };
}

export default useAIChat;
