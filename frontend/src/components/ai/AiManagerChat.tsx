import React, { useState, useRef, useEffect } from 'react';
import { apiClient } from '../../api/client';
import { useDataSource } from '../../context/DataSourceContext';
import { useLocation } from 'react-router-dom';
import { AIReportMarkdown } from './AIReportMarkdown';
import remarkGfm from 'remark-gfm';
import { X, Send } from 'lucide-react';

interface Message {
  role: 'user' | 'ai';
  content: string;
}

export function AiManagerChat() {
  const { sourceValue } = useDataSource();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId] = useState(() => crypto.randomUUID());
  const [showTooltip, setShowTooltip] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside the floating chat box
  useEffect(() => {
    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (chatRef.current && !chatRef.current.contains(event.target as Node)) {
        const target = event.target as HTMLElement;
        if (!target.closest('button[aria-label="Open Git Assistant"]')) {
          setIsOpen(false);
        }
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Animated popup appears after 3.5s and stays visible floating gently for 10s
  useEffect(() => {
    const showTimer = setTimeout(() => {
      setShowTooltip(true);
    }, 3500);

    const hideTimer = setTimeout(() => {
      setShowTooltip(false);
    }, 8500);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  // Auto-focus input when chat is opened
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Refocus input whenever AI finishes responding
  useEffect(() => {
    if (!isLoading && isOpen) {
      inputRef.current?.focus();
    }
  }, [isLoading, isOpen]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    // Keep focus inside input after submitting
    inputRef.current?.focus();

    try {
      const response = await apiClient.post('/api/ai/chat', {
        conversationId,
        message: userMessage,
        activeOwner: sourceValue || '',
        currentPath: location.pathname,
      });
      setMessages((prev) => [
        ...prev,
        { role: 'ai', content: response.data.response },
      ]);
    } catch (error) {
      console.error('AI Chat Error:', error);
      setMessages((prev) => [
        ...prev,
        { role: 'ai', content: '**Error:** Failed to connect to Git Assistant. Is the backend running?' },
      ]);
    } finally {
      setIsLoading(false);
      // Ensure focus remains after loading completes
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  return (
    <>
      {/* Animated Onboarding Tooltip Popup with smooth entrance, exit, and jump animation */}
      <style>{`
        @keyframes gibs-jump {
          0%, 100% {
            transform: translateY(0);
          }
          28% {
            transform: translateY(-20px) scale(1.03);
          }
          48% {
            transform: translateY(0) scale(0.97);
          }
          62% {
            transform: translateY(-9px);
          }
          75% {
            transform: translateY(0) scale(1);
          }
        }
        .animate-gibs-jump {
          animation: gibs-jump 1.9s ease-in-out infinite !important;
        }
      `}</style>

      <div
        className={`fixed bottom-20 right-4 sm:bottom-24 sm:right-6 z-50 transition-all duration-700 ease-out ${
          showTooltip && !isOpen
            ? 'opacity-100 scale-100 pointer-events-auto'
            : 'opacity-0 scale-95 pointer-events-none translate-y-3'
        }`}
      >
        <div
          onClick={() => {
            setShowTooltip(false);
            setIsOpen(true);
          }}
          className={`max-w-[260px] sm:max-w-[290px] p-3 rounded-2xl bg-slate-900/95 backdrop-blur-xl border border-blue-500/30 cursor-pointer group select-none hover:border-blue-400/50 ${
            showTooltip && !isOpen ? 'animate-gibs-jump' : ''
          }`}
          style={{
            boxShadow:
              '0 20px 40px -10px rgba(0, 0, 0, 0.8), 0 0 20px rgba(59, 130, 246, 0.25), inset 1px 1px 2px rgba(255, 255, 255, 0.1)',
          }}
        >
          <div className="flex items-start gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center shrink-0 mt-0.5 shadow-sm group-hover:scale-105 transition-transform">
              <img src="/nerd.png" alt="GIBs Assistant" className="w-5 h-5 drop-shadow-sm" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-bold text-white leading-tight">
                  GIBs Assistant
                </p>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              </div>
              <p className="text-[11px] text-slate-300 leading-snug mt-1">
                Here is your GIBs assistant! Tap to ask anything about your repos.
              </p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowTooltip(false);
              }}
              className="text-slate-400 hover:text-white p-0.5 -mt-1 -mr-1 cursor-pointer transition-colors"
              aria-label="Close popup"
            >
              <X size={14} />
            </button>
          </div>
          {/* Downward pointer arrow */}
          <div className="absolute -bottom-1.5 right-6 w-3 h-3 bg-slate-900 border-r border-b border-blue-500/30 rotate-45" />
        </div>
      </div>

      {/* Floating Trigger Button with nerdy emoji */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          setShowTooltip(false);
        }}
        className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 w-12 h-12 sm:w-14 sm:h-14 rounded-full shadow-[0_0_25px_rgba(37,99,235,0.45)] z-50 flex items-center justify-center group transition-all duration-300 cursor-pointer ${
          isOpen
            ? 'scale-90 opacity-0 pointer-events-none'
            : 'bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 text-white hover:shadow-[0_0_35px_rgba(99,102,241,0.6)] hover:scale-105 active:scale-95'
        }`}
        title="Talk to your Git Assistant"
        aria-label="Open Git Assistant"
      >
        <img
          src="/nerd.png"
          alt="Git Assistant"
          className="w-7 h-7 sm:w-8 sm:h-8 group-hover:scale-110 transition-transform drop-shadow-md"
        />
      </button>

      {/* Chat Window - floating claymorphism box */}
      {isOpen && (
        <div 
          ref={chatRef}
          className="fixed top-[25%] left-[10%] right-[2%] bottom-[2%] sm:top-auto sm:left-auto sm:bottom-6 sm:right-6 sm:w-[24rem] sm:h-[32rem] rounded-2xl sm:rounded-3xl flex flex-col z-50 overflow-hidden text-gray-200 origin-bottom-right transition-all duration-300"
          style={{ 
            background: 'linear-gradient(145deg, #172238 0%, #0c1424 100%)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: `
              0 24px 48px -12px rgba(0, 0, 0, 0.8),
              0 8px 24px rgba(0, 0, 0, 0.5),
              inset 1.5px 1.5px 3px rgba(255, 255, 255, 0.12),
              inset -2px -2px 6px rgba(0, 0, 0, 0.5)
            `,
            animation: 'var(--animate-fade-in, none) 0.25s ease-out'
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-3.5 sm:p-4 bg-gradient-to-r from-blue-950/70 to-indigo-950/70 border-b border-white/5 relative overflow-hidden shrink-0">
            <div className="absolute inset-0 bg-white/5 opacity-10 mix-blend-overlay"></div>
            <div className="flex items-center gap-2.5 sm:gap-3 relative z-10">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-blue-500/25 to-indigo-500/25 flex items-center justify-center border border-blue-400/30 shadow-[inset_1px_1px_2px_rgba(255,255,255,0.2)]">
                <img src="/nerd.png" alt="Git Assistant" className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-xs sm:text-sm text-white leading-tight tracking-wide">
                  Git Assistant
                </h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <p className="text-[10px] text-blue-300/80 font-medium tracking-wider uppercase truncate max-w-[130px] sm:max-w-none">
                    {sourceValue ? `Context: ${sourceValue}` : 'Online & Ready'}
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition-colors relative z-10 cursor-pointer"
              aria-label="Close Chat"
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-3.5 sm:p-4 space-y-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center px-4 py-6" style={{ animation: 'var(--animate-fade-in, none) 0.5s ease-out' }}>
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500/20 to-indigo-500/10 border border-blue-400/30 rounded-2xl flex items-center justify-center mb-3.5 shadow-[0_0_30px_rgba(59,130,246,0.2)]">
                  <img src="/nerd.png" alt="Git Assistant" className="w-9 h-9 sm:w-10 sm:h-10 drop-shadow-md" />
                </div>
                <h4 className="text-sm sm:text-base font-bold text-white mb-1">How can I help you?</h4>
                <p className="text-xs text-slate-400 max-w-[220px] leading-relaxed">
                  Ask me about repository health, commits, pull requests, or team activity.
                </p>
              </div>
            )}
            
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-2.5 ${
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
                style={{ animation: 'var(--animate-fade-in, none) 0.2s ease-out' }}
              >
                {msg.role === 'ai' && (
                  <div className="w-7 h-7 rounded-lg bg-blue-500/15 border border-blue-400/20 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                    <img src="/nerd.png" alt="AI" className="w-4 h-4" />
                  </div>
                )}
                <div
                  className={`px-3.5 py-2.5 rounded-2xl max-w-[85%] text-xs sm:text-sm shadow-md flex-col overflow-hidden ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-br-sm'
                      : 'bg-[#151b2b] text-gray-300 rounded-bl-sm border border-white/5'
                  }`}
                >
                  {msg.role === 'user' ? (
                    msg.content
                  ) : (
                    <div className="w-full break-words overflow-x-auto">
                      <AIReportMarkdown content={msg.content} remarkPlugins={[remarkGfm]} />
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-2.5 justify-start" style={{ animation: 'var(--animate-fade-in, none) 0.2s ease-out' }}>
                <div className="w-7 h-7 rounded-lg bg-blue-500/15 border border-blue-400/20 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                  <img src="/nerd.png" alt="AI" className="w-4 h-4" />
                </div>
                <div className="px-3.5 py-2.5 rounded-xl bg-[#151b2b] rounded-bl-sm border border-white/5 flex items-center gap-2 shadow-md">
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-1.5 h-1.5 bg-blue-300 rounded-full animate-bounce"></div>
                  </div>
                  <span className="text-[11px] text-slate-400 ml-1">Analyzing...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} className="h-px" />
          </div>

          {/* Input Area */}
          <div className="p-3 sm:p-3.5 bg-[#0a0f1d]/90 border-t border-white/5 shrink-0">
            <form onSubmit={handleSend} className="relative flex items-center">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isLoading ? "Analyzing..." : "Ask about repos, commits, PRs..."}
                className="w-full bg-[#11192c] border border-white/10 rounded-full pl-4 pr-11 py-2 sm:py-2.5 text-xs sm:text-sm focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/50 transition-all text-white placeholder-gray-500 shadow-[inset_1px_1px_3px_rgba(0,0,0,0.4)]"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="absolute right-1.5 p-2 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full text-white hover:scale-105 hover:shadow-[0_0_15px_rgba(37,99,235,0.5)] disabled:opacity-40 disabled:hover:scale-100 disabled:cursor-not-allowed transition-all cursor-pointer"
                aria-label="Send message"
              >
                <Send size={14} className="ml-0.5" />
              </button>
            </form>
            <div className="text-center mt-1.5">
              <span className="text-[9px] text-gray-500 uppercase tracking-widest font-semibold">Repository Insights & Assistance</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
