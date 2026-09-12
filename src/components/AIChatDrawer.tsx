import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Send,
  Sparkles,
  Bot,
  User,
  Loader2,
  HelpCircle,
  Code2
} from 'lucide-react';
import { ChatMessage, StaticAnalysisResult } from '../types';

interface AIChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  code: string;
  staticAnalysis: StaticAnalysisResult | null;
}

const SUGGESTED_QUESTIONS = [
  'What does this script do?',
  'Explain function 12 or the main loop.',
  'Which function appears to handle the player?',
  'Which strings were decoded?',
  'Why is this section obfuscated?',
  'Explain this like I\'m a beginner.',
  'Show the important parts and security risks.'
];

export const AIChatDrawer: React.FC<AIChatDrawerProps> = ({
  isOpen,
  onClose,
  code,
  staticAnalysis
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: 'Hello! I am your AI Lua/Luau Code Analysis Assistant. Ask me anything about this script, its decoded strings, detected functions, or obfuscation mechanics.',
      timestamp: Date.now()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (!isOpen) return null;

  const handleSendMessage = async (customPrompt?: string) => {
    const textToSend = customPrompt || inputMessage.trim();
    if (!textToSend || isSending) return;

    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsSending(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          code: code || '',
          staticAnalysis,
          history: messages.map(m => ({
            role: m.sender === 'user' ? 'user' : 'model',
            text: m.text
          }))
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to get answer from AI');
      }

      const botMsg: ChatMessage = {
        id: `bot_${Date.now()}`,
        sender: 'assistant',
        text: data.reply || 'Analysis completed.',
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `err_${Date.now()}`,
        sender: 'assistant',
        text: `Error: ${err.message || 'Unable to connect to AI assistant.'}`,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div
      id="ai-chat-drawer"
      className="fixed inset-y-0 right-0 w-full sm:w-[420px] md:w-[460px] bg-neutral-900 border-l border-neutral-800 z-50 shadow-2xl flex flex-col text-neutral-100"
    >
      {/* Drawer Header */}
      <div className="bg-neutral-950 px-4 py-3 border-b border-neutral-800 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold tracking-wide">AI Code Assistant</h3>
            <p className="text-[11px] text-neutral-400 font-mono">
              Ask about variables, functions &amp; behavior
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-750 text-neutral-400 hover:text-neutral-200 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Suggested Quick Prompts */}
      <div className="bg-neutral-950/50 p-2.5 border-b border-neutral-800/80">
        <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider block mb-1.5">
          Quick Inquiries:
        </span>
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {SUGGESTED_QUESTIONS.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(q)}
              disabled={isSending}
              className="text-[11px] px-2.5 py-1 rounded-full bg-neutral-800 hover:bg-neutral-750 text-neutral-300 hover:text-neutral-100 border border-neutral-700 whitespace-nowrap shrink-0 transition cursor-pointer disabled:opacity-50"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Messages List */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex items-start space-x-2.5 ${
              m.sender === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {m.sender === 'assistant' && (
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-[82%] p-3 rounded-xl leading-relaxed whitespace-pre-wrap font-sans ${
                m.sender === 'user'
                  ? 'bg-emerald-600 text-white rounded-br-none'
                  : 'bg-neutral-950 border border-neutral-800 text-neutral-200 rounded-bl-none font-mono text-[11px]'
              }`}
            >
              {m.text}
            </div>

            {m.sender === 'user' && (
              <div className="w-7 h-7 rounded-lg bg-neutral-800 border border-neutral-700 flex items-center justify-center text-neutral-300 shrink-0 mt-0.5">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {isSending && (
          <div className="flex items-center space-x-2 text-neutral-400 text-xs font-mono p-2 bg-neutral-950/40 rounded-lg">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />
            <span>AI is analyzing script context...</span>
          </div>
        )}
      </div>

      {/* Input Form */}
      <div className="p-3 bg-neutral-950 border-t border-neutral-800">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center space-x-2"
        >
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Ask anything about this Lua script..."
            disabled={isSending}
            className="flex-1 bg-neutral-900 border border-neutral-750 focus:border-emerald-500 text-neutral-100 placeholder-neutral-500 text-xs rounded-lg px-3 py-2.5 outline-none font-mono"
          />
          <button
            type="submit"
            disabled={isSending || !inputMessage.trim()}
            className="h-9 px-3.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white rounded-lg flex items-center justify-center transition disabled:opacity-50 cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
