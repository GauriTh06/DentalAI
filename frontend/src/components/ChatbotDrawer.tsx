import React, { useState, useRef, useEffect } from 'react';
import { api } from '../services/api';
import { MessageSquare, X, Send, Bot, User, Sparkles } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export const ChatbotDrawer: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init',
      text: "Hello! I'm your **AI Oral Health Assistant**. Ask me anything about your recent scan results, your Dental Health Index, or general questions about cavities, alignment, and oral cancer prevention.",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessageText = input.trim();
    setInput('');
    
    // Add user message
    const userMsg: Message = {
      id: Math.random().toString(),
      text: userMessageText,
      sender: 'user',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await api.sendChatMessage(userMessageText);
      const botMsg: Message = {
        id: Math.random().toString(),
        text: res.response,
        sender: 'bot',
        timestamp: new Date(res.timestamp || new Date())
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      console.error(err);
      const botMsg: Message = {
        id: Math.random().toString(),
        text: "I'm having trouble connecting to the medical core right now. Please check if the backend service is running or try again.",
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="glow-btn flex items-center justify-center h-14 w-14 rounded-full bg-gradient-to-tr from-medical-600 to-primary-600 text-white shadow-xl hover:scale-105 active:scale-95 transition-transform"
          title="Chat with DentalAI Assistant"
        >
          <MessageSquare className="h-6 w-6" />
        </button>
      )}

      {/* Chat Window Panel */}
      {isOpen && (
        <div className="glass-panel w-80 sm:w-96 h-[500px] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-700/50 animate-in slide-in-from-bottom-5 duration-300">
          {/* Header */}
          <div className="bg-gradient-to-r from-medical-700 to-primary-800 px-4 py-3.5 flex items-center justify-between border-b border-slate-700/30">
            <div className="flex items-center gap-2">
              <div className="bg-white/10 p-1.5 rounded-lg text-teal-300">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white leading-none">Oral AI Assistant</h3>
                <span className="text-[10px] text-teal-300 font-semibold flex items-center gap-0.5 mt-1">
                  <Sparkles className="h-3 w-3" /> Online & Personalized
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-300 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-900/60">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2.5 max-w-[85%] ${
                  m.sender === 'user' ? 'ml-auto flex-row-reverse' : ''
                }`}
              >
                {/* Avatar */}
                <div
                  className={`h-7 w-7 rounded-lg flex items-center justify-center shrink-0 text-xs ${
                    m.sender === 'bot' 
                      ? 'bg-medical-900 text-teal-300 border border-teal-500/20' 
                      : 'bg-primary-900 text-blue-300 border border-blue-500/20'
                  }`}
                >
                  {m.sender === 'bot' ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
                </div>

                {/* Bubble */}
                <div
                  className={`rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-primary-600 text-white rounded-tr-none'
                      : 'bg-slate-800/80 text-slate-100 border border-slate-700/40 rounded-tl-none'
                  }`}
                >
                  {/* Safely output formatting since chatbot responses might contain HTML */}
                  <div dangerouslySetInnerHTML={{ __html: m.text }} />
                </div>
              </div>
            ))}
            
            {/* Loading Indicator */}
            {loading && (
              <div className="flex gap-2.5 max-w-[85%]">
                <div className="h-7 w-7 rounded-lg flex items-center justify-center bg-medical-900 text-teal-300 border border-teal-500/20">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="bg-slate-800/80 rounded-2xl rounded-tl-none px-4 py-3 border border-slate-700/40 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Form Input */}
          <form onSubmit={handleSend} className="p-3 bg-slate-900/90 border-t border-slate-800 flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question..."
              className="flex-1 bg-slate-800/60 border border-slate-700/50 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-medical-500 transition-colors"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="bg-gradient-to-r from-medical-600 to-primary-600 text-white p-2 rounded-xl hover:from-medical-500 hover:to-primary-500 shadow-md shadow-medical-600/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
