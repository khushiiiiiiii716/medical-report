import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, MessageSquare, Loader2, User, Bot } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const formatMarkdown = (text) => {
  if (!text) return '';
  let formatted = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  formatted = formatted.replace(/^### (.*?)$/gm, '<h3 class="font-bold text-sm text-blue-600 dark:text-blue-400 uppercase tracking-wider mt-3 mb-1.5">$1</h3>');
  formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-slate-900 dark:text-white">$1</strong>');
  formatted = formatted.replace(/\*(.*?)\*/g, '<em class="italic text-slate-500">$1</em>');
  formatted = formatted.replace(/^- (.*?)$/gm, '<li class="ml-4 list-disc py-0.5 text-xs text-slate-700 dark:text-slate-300">$1</li>');
  formatted = formatted.replace(/\n/g, '<br/>');
  return formatted;
};

const PRESETS = [
  'Check my results',
  'What is HbA1c?',
  'Explain LDL Cholesterol',
  'How can I lower my blood sugar?',
  'Explain Thyroid TSH',
];

function ChatBot({ report, t }) {
  const [messages, setMessages] = useState([{
    role: 'assistant',
    content: t('chat_welcome') || 'Hello! I am your AI Medical Assistant. Ask me about your lab results, medical terms, or health recommendations.',
    timestamp: new Date().toISOString(),
  }]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend) => {
    const text = textToSend || input;
    if (!text.trim()) return;
    if (!textToSend) setInput('');

    setMessages((prev) => [...prev, { role: 'user', content: text, timestamp: new Date().toISOString() }]);
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      });
      if (response.ok) {
        const data = await response.json();
        setMessages((prev) => [...prev, { role: 'assistant', content: data.response, timestamp: data.timestamp }]);
      } else {
        setMessages((prev) => [...prev, { role: 'assistant', content: 'Server error. Please try again.', timestamp: new Date().toISOString() }]);
      }
    } catch {
      setMessages((prev) => [...prev, { role: 'assistant', content: t('chat_error') || 'Network error. Ensure backend is running.', timestamp: new Date().toISOString() }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="glass-panel flex h-[calc(100vh-8rem)] flex-col overflow-hidden rounded-3xl sm:h-[calc(100vh-9rem)]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200/60 bg-gradient-to-r from-blue-50/50 to-cyan-50/30 p-4 dark:border-white/8 dark:from-blue-950/20 dark:to-cyan-950/10">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-600 p-2.5 text-white shadow-glow-cyan">
            <MessageSquare size={18} />
          </div>
          <div>
            <h3 className="font-display text-sm font-bold text-slate-900 dark:text-white">{t('chat_title') || 'AI Health Assistant'}</h3>
            <p className="text-[10px] text-slate-500">{t('chat_subtitle') || 'Contextual medical report explainer'}</p>
          </div>
        </div>
        {report && (
          <span className="hidden max-w-[180px] truncate rounded-full border border-blue-200/60 bg-blue-50 px-3 py-1 text-[10px] font-bold text-blue-600 sm:inline dark:border-blue-900/30 dark:bg-blue-950/30 dark:text-blue-400">
            {report.filename}
          </span>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-5 overflow-y-auto p-4 sm:p-6" role="log" aria-live="polite">
        {messages.map((msg, index) => {
          const isBot = msg.role === 'assistant';
          return (
            <div key={index} className={`flex max-w-[90%] items-start gap-3 animate-fade-in-up sm:max-w-[85%] ${isBot ? 'mr-auto' : 'ml-auto flex-row-reverse'}`}>
              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-white shadow-sm ${isBot ? 'bg-gradient-to-br from-blue-600 to-cyan-600' : 'bg-gradient-to-br from-emerald-500 to-teal-500'}`}>
                {isBot ? <Bot size={14} /> : <User size={14} />}
              </div>
              <div className={`rounded-2xl border px-4 py-3 text-sm leading-relaxed shadow-sm ${
                isBot
                  ? 'rounded-tl-sm border-slate-200/60 bg-white dark:border-white/8 dark:bg-[#141f33]'
                  : 'rounded-tr-sm border-blue-200/60 bg-blue-50 dark:border-blue-900/30 dark:bg-blue-950/20'
              }`}>
                {isBot ? (
                  <div dangerouslySetInnerHTML={{ __html: formatMarkdown(msg.content) }} className="space-y-1 text-slate-700 dark:text-slate-300" />
                ) : (
                  <p className="font-medium text-slate-900 dark:text-white">{msg.content}</p>
                )}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="mr-auto flex max-w-[80%] items-start gap-3 animate-pulse">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-600 text-white">
              <Sparkles size={14} />
            </div>
            <div className="flex items-center gap-2 rounded-2xl rounded-tl-sm border border-slate-200/60 bg-white px-4 py-3 text-xs text-slate-500 dark:border-white/8 dark:bg-[#141f33]">
              <Loader2 size={14} className="animate-spin text-blue-500" />
              {t('chat_analyzing') || 'Formulating response…'}
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Presets */}
      <div className="flex flex-wrap gap-2 border-t border-slate-200/60 bg-slate-50/50 p-3 dark:border-white/8 dark:bg-white/3 sm:p-4">
        {PRESETS.map((p) => (
          <button
            key={p}
            disabled={isLoading}
            onClick={() => handleSendMessage(t(p) || p)}
            className="rounded-xl border border-slate-200/60 bg-white px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-600 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600 disabled:opacity-40 dark:border-white/10 dark:bg-white/5 dark:text-slate-400 dark:hover:border-blue-500/30 dark:hover:text-blue-400"
          >
            {t(p) || p}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="border-t border-slate-200/60 bg-white/80 p-3 dark:border-white/8 dark:bg-[#0f1729]/80 sm:p-4">
        <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="flex gap-2 sm:gap-3">
          <input
            type="text"
            placeholder={t('chat_placeholder') || 'Ask about your medical report…'}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            className="input-field flex-1 py-3"
            aria-label="Chat message"
          />
          <button type="submit" disabled={isLoading || !input.trim()} className="btn-primary px-4 py-3 disabled:opacity-40" aria-label="Send message">
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}

export default ChatBot;
