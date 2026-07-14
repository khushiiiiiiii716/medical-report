import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Sparkles, MessageSquare, Loader2, User, Bot, StopCircle } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// ── Markdown renderer ────────────────────────────────────────────────────────
const formatMarkdown = (text) => {
  if (!text) return '';
  let h = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  h = h.replace(/^### (.+)$/gm, '<h3 class="font-bold text-xs text-blue-600 dark:text-blue-400 uppercase tracking-widest mt-3 mb-1">$1</h3>');
  h = h.replace(/^## (.+)$/gm, '<h2 class="font-bold text-sm text-slate-800 dark:text-slate-100 mt-3 mb-1">$1</h2>');
  h = h.replace(/\*\*(.+?)\*\*/g, '<strong class="font-bold text-slate-900 dark:text-white">$1</strong>');
  h = h.replace(/\*(.+?)\*/g, '<em class="italic text-slate-500 dark:text-slate-400">$1</em>');
  h = h.replace(/^---$/gm, '<hr class="my-2 border-slate-200 dark:border-white/10"/>');
  h = h.replace(/^- (.+)$/gm, '<li class="ml-4 list-disc py-0.5 text-xs leading-relaxed text-slate-700 dark:text-slate-300">$1</li>');
  h = h.replace(/\n/g, '<br/>');
  return h;
};

// ── Preset question keys (matched against translations) ──────────────────────
const PRESET_KEYS = [
  { key: 'preset_check',  fallback: 'Check my results' },
  { key: 'preset_hba1c',  fallback: 'What is HbA1c?' },
  { key: 'preset_ldl',    fallback: 'Explain LDL Cholesterol' },
  { key: 'preset_sugar',  fallback: 'How can I lower my blood sugar?' },
  { key: 'preset_tsh',    fallback: 'Explain Thyroid TSH' },
];

// ── Typing animation hook ────────────────────────────────────────────────────
function useTypingEffect(fullText, enabled, speed = 8) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);
  const frameRef = useRef(null);
  const indexRef = useRef(0);

  useEffect(() => {
    if (!enabled || !fullText) {
      setDisplayed(fullText || '');
      setDone(true);
      return;
    }
    setDisplayed('');
    setDone(false);
    indexRef.current = 0;

    const step = () => {
      indexRef.current = Math.min(indexRef.current + speed, fullText.length);
      setDisplayed(fullText.slice(0, indexRef.current));
      if (indexRef.current < fullText.length) {
        frameRef.current = requestAnimationFrame(step);
      } else {
        setDone(true);
      }
    };
    frameRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameRef.current);
  }, [fullText, enabled, speed]);

  return { displayed, done };
}

// ── Single bot message with typing effect ────────────────────────────────────
function BotMessage({ content, animate }) {
  const { displayed } = useTypingEffect(content, animate, 10);
  return (
    <div
      dangerouslySetInnerHTML={{ __html: formatMarkdown(displayed) }}
      className="space-y-1 text-sm text-slate-700 dark:text-slate-300"
    />
  );
}

// ── Main ChatBot component ────────────────────────────────────────────────────
function ChatBot({ report, lang = 'en', t }) {
  const welcomeMsg = {
    role: 'assistant',
    content: t('chat_welcome') || 'Hello! I am your AI Medical Assistant. Ask me about your lab results, medical terms, or health recommendations.',
    timestamp: new Date().toISOString(),
    animate: false,
  };

  const [messages, setMessages] = useState([welcomeMsg]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const abortRef = useRef(null);
  const chatEndRef = useRef(null);

  // Re-set welcome message when language changes
  useEffect(() => {
    setMessages([{
      role: 'assistant',
      content: t('chat_welcome') || welcomeMsg.content,
      timestamp: new Date().toISOString(),
      animate: false,
    }]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = useCallback(async (textOverride) => {
    const text = (textOverride ?? input).trim();
    if (!text || isLoading) return;
    if (!textOverride) setInput('');

    // Append user message
    setMessages((prev) => [...prev, {
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
      animate: false,
    }]);
    setIsLoading(true);

    // AbortController so user can cancel
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          message: text,
          lang,
          report_id: report?.id ?? null,
        }),
      });

      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const data = await res.json();

      setMessages((prev) => [...prev, {
        role: 'assistant',
        content: data.response,
        timestamp: data.timestamp || new Date().toISOString(),
        animate: true,   // trigger typing effect on new responses
      }]);
    } catch (err) {
      if (err.name === 'AbortError') return;
      setMessages((prev) => [...prev, {
        role: 'assistant',
        content: t('chat_error') || 'Network error. Make sure the backend is running on port 5000.',
        timestamp: new Date().toISOString(),
        animate: false,
      }]);
    } finally {
      setIsLoading(false);
      abortRef.current = null;
    }
  }, [input, isLoading, lang, report, t]);

  const handleStop = () => {
    abortRef.current?.abort();
    setIsLoading(false);
  };

  return (
    <div className="glass-panel flex h-[calc(100vh-8rem)] flex-col overflow-hidden rounded-3xl sm:h-[calc(100vh-9rem)]">

      {/* ── Header ── */}
      <div className="flex items-center justify-between border-b border-slate-200/60 bg-gradient-to-r from-blue-50/50 to-cyan-50/30 p-4 dark:border-white/8 dark:from-blue-950/20 dark:to-cyan-950/10">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-600 p-2.5 text-white shadow-glow-cyan">
            <MessageSquare size={18} />
          </div>
          <div>
            <h3 className="font-display text-sm font-bold text-slate-900 dark:text-white">
              {t('chat_title') || 'AI Health Assistant'}
            </h3>
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <p className="text-[10px] text-slate-500">
                {t('chat_subtitle') || 'Powered by Ollama · llama3'}
              </p>
            </div>
          </div>
        </div>
        {report && (
          <span className="hidden max-w-[180px] truncate rounded-full border border-blue-200/60 bg-blue-50 px-3 py-1 text-[10px] font-bold text-blue-600 sm:inline dark:border-blue-900/30 dark:bg-blue-950/30 dark:text-blue-400">
            {report.filename}
          </span>
        )}
      </div>

      {/* ── Messages ── */}
      <div
        className="flex-1 space-y-5 overflow-y-auto p-4 sm:p-6"
        role="log"
        aria-live="polite"
        aria-label="Chat messages"
      >
        {messages.map((msg, i) => {
          const isBot = msg.role === 'assistant';
          return (
            <div
              key={i}
              className={`flex max-w-[90%] items-start gap-3 animate-fade-in-up sm:max-w-[85%] ${
                isBot ? 'mr-auto' : 'ml-auto flex-row-reverse'
              }`}
            >
              {/* Avatar */}
              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-white shadow-sm ${
                isBot
                  ? 'bg-gradient-to-br from-blue-600 to-cyan-600'
                  : 'bg-gradient-to-br from-emerald-500 to-teal-500'
              }`}>
                {isBot ? <Bot size={14} /> : <User size={14} />}
              </div>

              {/* Bubble */}
              <div className={`rounded-2xl border px-4 py-3 shadow-sm ${
                isBot
                  ? 'rounded-tl-sm border-slate-200/60 bg-white dark:border-white/8 dark:bg-[#141f33]'
                  : 'rounded-tr-sm border-blue-200/60 bg-blue-50 dark:border-blue-900/30 dark:bg-blue-950/20'
              }`}>
                {isBot ? (
                  <BotMessage content={msg.content} animate={msg.animate} />
                ) : (
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{msg.content}</p>
                )}
              </div>
            </div>
          );
        })}

        {/* Loading indicator */}
        {isLoading && (
          <div className="mr-auto flex max-w-[80%] items-start gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-600 text-white">
              <Sparkles size={14} className="animate-pulse" />
            </div>
            <div className="flex items-center gap-2 rounded-2xl rounded-tl-sm border border-slate-200/60 bg-white px-4 py-3 text-xs text-slate-500 dark:border-white/8 dark:bg-[#141f33]">
              <Loader2 size={13} className="animate-spin text-blue-500" />
              <span>{t('chat_analyzing') || 'Thinking with llama3…'}</span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* ── Preset suggestions ── */}
      <div className="flex flex-wrap gap-2 border-t border-slate-200/60 bg-slate-50/50 p-3 dark:border-white/8 dark:bg-white/3 sm:p-4">
        {PRESET_KEYS.map(({ key, fallback }) => {
          const label = t(key) || fallback;
          return (
            <button
              key={key}
              disabled={isLoading}
              onClick={() => handleSend(label)}
              className="rounded-xl border border-slate-200/60 bg-white px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-600 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600 disabled:opacity-40 dark:border-white/10 dark:bg-white/5 dark:text-slate-400 dark:hover:border-blue-500/30 dark:hover:text-blue-400"
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* ── Input bar ── */}
      <div className="border-t border-slate-200/60 bg-white/80 p-3 dark:border-white/8 dark:bg-[#0f1729]/80 sm:p-4">
        <form
          onSubmit={(e) => { e.preventDefault(); handleSend(); }}
          className="flex gap-2 sm:gap-3"
        >
          <input
            type="text"
            placeholder={t('chat_placeholder') || 'Ask about your medical report…'}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            className="input-field flex-1 py-3 text-sm"
            aria-label="Chat message input"
          />

          {/* Stop button while loading */}
          {isLoading ? (
            <button
              type="button"
              onClick={handleStop}
              className="flex items-center gap-1.5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-bold text-rose-600 transition hover:bg-rose-100 dark:border-rose-800/40 dark:bg-rose-950/30 dark:text-rose-400"
              aria-label="Stop generation"
            >
              <StopCircle size={15} />
              Stop
            </button>
          ) : (
            <button
              type="submit"
              disabled={!input.trim()}
              className="btn-primary px-4 py-3 disabled:opacity-40"
              aria-label="Send message"
            >
              <Send size={16} />
            </button>
          )}
        </form>
      </div>
    </div>
  );
}

export default ChatBot;
