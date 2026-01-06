
import React, { useState } from 'react';
import { MessageSquarePlus, X, Send, Loader2, Sparkles } from 'lucide-react';
import { askAiQuestion } from '../services/geminiService';

const AIAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [chat, setChat] = useState<{ role: 'user' | 'ai', text: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!query.trim()) return;
    
    const userMsg = query;
    setChat(prev => [...prev, { role: 'user', text: userMsg }]);
    setQuery('');
    setIsLoading(true);

    const aiResponse = await askAiQuestion(userMsg, { dashboard: "active performance metrics" });
    setChat(prev => [...prev, { role: 'ai', text: aiResponse || "Sorry, I couldn't process that." }]);
    setIsLoading(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen ? (
        <div className="bg-white w-80 md:w-96 rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col h-[500px] animate-in slide-in-from-bottom-4 duration-300">
          <div className="p-4 bg-blue-600 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              <span className="font-bold">Dev Report Assistant</span>
            </div>
            <button onClick={() => setIsOpen(false)}><X className="w-5 h-5" /></button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {chat.length === 0 && (
              <div className="text-center py-8">
                <p className="text-sm text-slate-500">Ask me anything about your performance reports!</p>
              </div>
            )}
            {chat.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] px-3 py-2 rounded-xl text-sm ${
                  msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-800'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-slate-100 p-3 rounded-xl">
                  <Loader2 className="w-4 h-4 animate-spin text-slate-500" />
                </div>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-slate-100 flex gap-2">
            <input 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask a question..."
              className="flex-1 text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-blue-500 transition-colors"
            />
            <button 
              onClick={handleSend}
              className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <button 
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-full shadow-lg hover:shadow-blue-500/30 hover:-translate-y-1 transition-all duration-300 group"
        >
          <MessageSquarePlus className="w-5 h-5 group-hover:rotate-12 transition-transform" />
          <span className="font-bold">Ask Question</span>
        </button>
      )}
    </div>
  );
};

export default AIAssistant;
