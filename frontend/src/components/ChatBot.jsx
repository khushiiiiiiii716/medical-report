import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, MessageSquare, Loader2, Info, User } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Helper function to format basic markdown strings to HTML safely
const formatMarkdown = (text) => {
  if (!text) return '';
  
  // Escaping basic HTML to prevent XSS
  let formatted = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  
  // Format Headings: ### Title
  formatted = formatted.replace(/^### (.*?)$/gm, '<h3 class="font-extrabold text-sm text-neonCyan uppercase tracking-wider mt-3 mb-1.5">$1</h3>');
  
  // Format Bold: **text**
  formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-white">$1</strong>');
  
  // Format Italic: *text*
  formatted = formatted.replace(/\*(.*?)\*/g, '<em class="italic text-slate-400">$1</em>');
  
  // Format Bullet lists: - item
  formatted = formatted.replace(/^- (.*?)$/gm, '<li class="ml-4 list-disc pl-1 py-0.5 text-xs">$1</li>');
  
  // Format line breaks
  formatted = formatted.replace(/\n/g, '<br/>');
  
  return formatted;
};

const PRESETS = [
  "Check my results",
  "What is HbA1c?",
  "Explain LDL Cholesterol",
  "How can I lower my blood sugar?",
  "Explain Thyroid TSH"
];

function ChatBot({ report }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hello! I am your AI Medical Assistant. I can help explain laboratory medical terms, analyze your uploaded blood test results, and provide recommendations.\n\nAsk me something or click a suggestion below!",
      timestamp: new Date().toISOString()
    }
  ]);
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

    // Append user message
    const userMsg = {
      role: 'user',
      content: text,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text })
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: data.response,
          timestamp: data.timestamp
        }]);
      } else {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: "Sorry, I encountered an error. The database or server might be updating.",
          timestamp: new Date().toISOString()
        }]);
      }
    } catch (e) {
      console.log(e);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "Network error. Make sure the backend server is running on port 5000.",
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="glass-panel rounded-2xl border border-darkCardBorder flex flex-col h-[calc(100vh-140px)] overflow-hidden">
      
      {/* Header */}
      <div className="p-4 border-b border-darkCardBorder bg-[#0D1424]/50 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-neonCyan/10 text-neonCyan rounded-xl border border-neonCyan/15">
            <MessageSquare size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white leading-tight">AI Health Assistant</h3>
            <p className="text-[10px] text-slate-400">Contextual Medical Reports Explainer</p>
          </div>
        </div>
        
        {report && (
          <span className="bg-white/5 border border-white/5 text-[9px] px-2.5 py-1 rounded-lg text-slate-400 truncate max-w-[200px]">
            Context: {report.filename}
          </span>
        )}
      </div>

      {/* Chat Messages Log */}
      <div className="flex-1 p-6 overflow-y-auto space-y-4">
        {messages.map((msg, index) => {
          const isBot = msg.role === 'assistant';
          return (
            <div 
              key={index}
              className={`flex items-start gap-3 max-w-[85%] ${isBot ? 'mr-auto' : 'ml-auto flex-row-reverse'}`}
            >
              {/* Avatar Icon */}
              <div className={`p-1.5 rounded-lg shrink-0 border ${
                isBot 
                  ? 'bg-neonCyan/10 text-neonCyan border-neonCyan/15' 
                  : 'bg-neonIndigo/10 text-neonIndigo border-neonIndigo/15'
              }`}>
                {isBot ? <Sparkles size={14} /> : <User size={14} />}
              </div>

              {/* Message Bubble */}
              <div className={`p-4 rounded-2xl border text-xs leading-relaxed ${
                isBot 
                  ? 'bg-white/5 border-white/5 text-slate-300 rounded-tl-none' 
                  : 'bg-neonIndigo/10 border-neonIndigo/20 text-white rounded-tr-none'
              }`}>
                {isBot ? (
                  <div 
                    dangerouslySetInnerHTML={{ __html: formatMarkdown(msg.content) }}
                    className="space-y-1.5"
                  />
                ) : (
                  <p>{msg.content}</p>
                )}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-start gap-3 mr-auto max-w-[80%]">
            <div className="p-1.5 rounded-lg shrink-0 border bg-neonCyan/10 text-neonCyan border-neonCyan/15">
              <Sparkles size={14} />
            </div>
            <div className="p-4 rounded-2xl border border-white/5 bg-white/5 text-slate-400 rounded-tl-none flex items-center space-x-2 text-xs">
              <Loader2 size={14} className="animate-spin text-neonCyan" />
              <span>Analyzing medical knowledge base...</span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Suggestion Presets */}
      <div className="p-4 border-t border-darkCardBorder bg-[#0B0F19]/40 flex flex-wrap gap-2">
        {PRESETS.map(p => (
          <button
            key={p}
            disabled={isLoading}
            onClick={() => handleSendMessage(p)}
            className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg text-[10px] font-bold text-slate-300 hover:text-white transition-all uppercase tracking-wider"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <div className="p-4 border-t border-darkCardBorder bg-[#0D1424]/80">
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex space-x-3"
        >
          <input
            type="text"
            placeholder="Ask about a biomarker, healthy ranges, or dietary advice..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            className="flex-1 bg-darkBg border border-darkCardBorder rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-neonCyan text-white"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="p-3 bg-gradient-to-r from-neonCyan to-neonTeal text-darkBg rounded-xl font-bold hover:opacity-90 hover:shadow-glow-cyan transition-all disabled:opacity-40 disabled:hover:shadow-none"
          >
            <Send size={16} />
          </button>
        </form>
      </div>

    </div>
  );
}

export default ChatBot;
