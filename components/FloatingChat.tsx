
import React, { useState, useEffect, useRef } from 'react';
import { Transaction, Budget, SavingsGoal, TransactionCategory } from '../types';
import { geminiService, UserProfile } from '../services/geminiService';

interface FloatingChatProps {
  transactions: Transaction[];
  budgets: Budget[];
  goals: SavingsGoal[];
  profile: UserProfile;
}

const FloatingChat: React.FC<FloatingChatProps> = ({ transactions, budgets, goals, profile }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [question, setQuestion] = useState('');
  const [chatHistory, setChatHistory] = useState<{role: 'user' | 'advisor', text: string}[]>([]);
  const [asking, setAsking] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [chatHistory, asking, isOpen]);

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;
    
    const userMsg = question;
    setQuestion('');
    setChatHistory(prev => [...prev, { role: 'user', text: userMsg }]);
    setAsking(true);
    
    try {
      const res = await geminiService.askFinanceQuestion(userMsg, { transactions, budgets, goals }, profile);
      setChatHistory(prev => [...prev, { role: 'advisor', text: res }]);
    } catch (error) {
      setChatHistory(prev => [...prev, { role: 'advisor', text: "I'm having trouble connecting to my strategic core. Please try again." }]);
    }
    setAsking(false);
  };

  const parseMarkdown = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="text-white font-black">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  return (
    <div className={`fixed bottom-10 right-10 z-[100] transition-all duration-700 ease-[cubic-bezier(0.2,1.2,0.3,1)] ${isOpen ? 'w-[420px] h-[600px]' : 'w-20 h-20'}`}>
      {!isOpen ? (
        <button 
          onClick={() => setIsOpen(true)}
          className="w-full h-full bg-slate-900 border border-slate-800 rounded-[2.5rem] flex items-center justify-center text-3xl shadow-2xl hover:scale-110 active:scale-90 transition-all group overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-transparent"></div>
          <span className="relative z-10">💬</span>
          <div className="absolute top-0 right-0 w-5 h-5 bg-blue-500 border-4 border-slate-900 rounded-full animate-pulse"></div>
        </button>
      ) : (
        <div className="w-full h-full bg-[#020617] border border-slate-800 rounded-[3rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden animate-in fade-in zoom-in-90 duration-500">
          <div className="p-6 border-b border-slate-800/60 bg-slate-900/40 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-xl shadow-lg shadow-blue-500/20">✨</div>
              <div>
                <h4 className="text-sm font-black text-white">Senior Advisor</h4>
                <p className="text-[8px] text-emerald-400 font-black uppercase tracking-widest mt-0.5">Live Intelligence</p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-white bg-slate-800/40 rounded-full transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" /></svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-[radial-gradient(circle_at_50%_0%,_rgba(37,99,235,0.05)_0%,_transparent_100%)]">
            {chatHistory.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-40 space-y-4">
                <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center text-2xl border border-slate-800">💡</div>
                <p className="text-slate-300 text-xs font-bold px-10">Ask me about your budget, anomalies, or savings goals.</p>
              </div>
            )}
            {chatHistory.map((chat, i) => (
              <div key={i} className={`flex ${chat.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-4 rounded-2xl text-xs leading-relaxed ${chat.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-slate-900 text-slate-300 rounded-tl-none border border-slate-800/60'}`}>
                  {parseMarkdown(chat.text)}
                </div>
              </div>
            ))}
            {asking && (
              <div className="flex justify-start">
                <div className="bg-slate-900/60 p-4 rounded-2xl rounded-tl-none flex gap-1.5 border border-slate-800/50">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce delay-100"></div>
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce delay-200"></div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <div className="p-6 bg-slate-950 border-t border-slate-800/60">
            <form onSubmit={handleAsk} className="relative">
              <input 
                type="text" 
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask your advisor..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-xs outline-none focus:border-blue-500/50 text-white placeholder:text-slate-600"
              />
              <button 
                disabled={asking || !question.trim()}
                className="absolute right-2 top-2 bottom-2 px-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-800 rounded-lg transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FloatingChat;
