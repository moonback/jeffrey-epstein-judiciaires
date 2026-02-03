/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User, Loader2 } from 'lucide-react';
import { askAssistant } from '../services/openRouterService';

export const LiveAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: string, text: string }[]>([
    { role: 'model', text: 'Bonjour. Je suis connecté aux archives du DOJ. Posez-moi une question sur un document PDF spécifique ou un fait du dossier.' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
      // Filter history for the API to avoid context bloat if needed, 
      // but usually passing full history is fine for short sessions.
      const responseText = await askAssistant(messages, userMsg);
      setMessages(prev => [...prev, { role: 'model', text: responseText }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', text: "Désolé, une erreur de connexion est survenue lors de l'accès aux archives." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 w-[350px] md:w-[400px] h-[500px] bg-[#1E1E1E] rounded-2xl border border-[#444746] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-300">

          {/* Header */}
          <div className="bg-[#370003] p-4 flex justify-between items-center border-b border-[#601410]">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#601410] flex items-center justify-center border border-[#F2B8B5]/30">
                <Bot size={18} className="text-[#F2B8B5]" />
              </div>
              <div>
                <h3 className="text-[#E3E3E3] font-bold text-sm">Assistant Dossier DOJ</h3>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#4BB543] animate-pulse"></span>
                  <span className="text-[10px] text-[#C4C7C5]">En ligne • Accès PDF</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-[#C4C7C5] hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#121212]" ref={scrollRef}>
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${msg.role === 'user'
                      ? 'bg-[#370003] text-[#F2B8B5] rounded-br-none border border-[#601410]'
                      : 'bg-[#2B2B2B] text-[#E3E3E3] rounded-bl-none border border-[#444746]'
                    }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-[#2B2B2B] rounded-2xl rounded-bl-none p-3 border border-[#444746] flex items-center gap-2">
                  <Loader2 size={14} className="animate-spin text-[#F2B8B5]" />
                  <span className="text-xs text-[#C4C7C5]">Recherche dans les documents...</span>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-3 bg-[#1E1E1E] border-t border-[#444746]">
            <div className="relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Posez une question sur le dossier..."
                className="w-full bg-[#121212] text-[#E3E3E3] text-sm rounded-xl pl-4 pr-10 py-3 border border-[#444746] focus:outline-none focus:border-[#F2B8B5] placeholder-[#757775]"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-[#F2B8B5] rounded-lg text-[#370003] hover:bg-[#F9DEDC] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 ${isOpen ? 'bg-[#444746] text-[#C4C7C5]' : 'bg-[#F2B8B5] text-[#370003] border-2 border-[#370003]'}`}
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} fill="currentColor" />}
      </button>
    </div>
  );
};
