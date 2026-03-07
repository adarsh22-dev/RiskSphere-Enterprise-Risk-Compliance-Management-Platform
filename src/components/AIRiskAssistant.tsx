import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Sparkles, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from "@google/genai";

const AIRiskAssistant = () => {
  const [messages, setMessages] = useState<{ role: 'user' | 'ai', content: string }[]>([
    { role: 'ai', content: 'Hello! I am your RiskSphere AI Assistant. I can help you analyze risks, suggest mitigation strategies, or summarize your compliance status. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      // Fetch context from our API first
      const statsRes = await fetch('/api/stats', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const stats = await statsRes.json();
      
      const risksRes = await fetch('/api/risks', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const risks = await risksRes.json();

      const ai = new GoogleGenAI({ apiKey: (process.env as any).GEMINI_API_KEY });
      const model = "gemini-3-flash-preview";
      
      const context = `
        Organization Stats: ${JSON.stringify(stats)}
        Active Risks: ${JSON.stringify(risks.slice(0, 10))}
        User Question: ${userMessage}
      `;

      const response = await ai.models.generateContent({
        model,
        contents: [{ parts: [{ text: context }] }],
        config: {
          systemInstruction: "You are RiskSphere AI, an expert enterprise risk and compliance assistant. Provide professional, data-driven advice based on the provided context. Be concise and actionable. Use markdown for formatting."
        }
      });

      setMessages(prev => [...prev, { role: 'ai', content: response.text || 'I encountered an error analyzing that request.' }]);
    } catch (err) {
      console.error("AI Error:", err);
      setMessages(prev => [...prev, { role: 'ai', content: 'Sorry, I am having trouble connecting to the AI service right now.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
      <div className="p-4 bg-indigo-600 text-white flex items-center gap-3">
        <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
          <Bot size={20} />
        </div>
        <div>
          <h3 className="font-bold text-sm">RiskSphere AI Assistant</h3>
          <p className="text-[10px] text-indigo-100">Powered by Gemini 2.0</p>
        </div>
        <Sparkles size={16} className="ml-auto text-indigo-200" />
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
        {messages.map((msg, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            key={i} 
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
              msg.role === 'user' 
                ? 'bg-indigo-600 text-white rounded-tr-none' 
                : 'bg-white text-slate-800 shadow-sm border border-slate-100 rounded-tl-none'
            }`}>
              <div className="prose prose-sm max-w-none">
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              </div>
            </div>
          </motion.div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100 rounded-tl-none flex items-center gap-2">
              <Loader2 size={16} className="animate-spin text-indigo-600" />
              <span className="text-xs text-slate-500 italic">Analyzing data...</span>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-white border-t border-slate-100">
        <div className="relative">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about risks, compliance, or incidents..." 
            className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
          />
          <button 
            onClick={handleSend}
            disabled={isLoading}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-indigo-600 text-white rounded-lg flex items-center justify-center hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIRiskAssistant;
