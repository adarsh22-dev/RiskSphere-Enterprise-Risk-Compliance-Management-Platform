import React, { useState, useEffect } from 'react';
import { Sparkles, TrendingUp, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { Risk, Incident, Compliance } from '../types';

interface AIInsightsProps {
  risks: Risk[];
  incidents: Incident[];
  compliance: Compliance[];
}

const AIInsights: React.FC<AIInsightsProps> = ({ risks, incidents, compliance }) => {
  const [insight, setInsight] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const generateInsight = async () => {
    setLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: (process.env.GEMINI_API_KEY as string) });
      const prompt = `
        As an expert Enterprise Risk Management (ERM) consultant, analyze the following organizational data and provide 3-4 high-level executive insights.
        
        DATA:
        - Risks: ${JSON.stringify(risks.map(r => ({ title: r.title, score: r.score, category: r.category })))}
        - Incidents: ${JSON.stringify(incidents.map(i => ({ title: i.title, severity: i.severity, type: i.type })))}
        - Compliance: ${JSON.stringify(compliance.map(c => ({ framework: c.framework, progress: c.progress, status: c.status })))}
        
        FORMAT:
        Provide the response in a structured JSON format:
        {
          "summary": "One sentence overview of the current risk posture",
          "insights": [
            { "type": "warning" | "opportunity" | "trend", "title": "Short Title", "description": "Detailed insight and recommendation" }
          ]
        }
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });

      setInsight(response.text);
    } catch (err) {
      console.error("AI Insight Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (risks.length > 0) {
      generateInsight();
    }
  }, [risks.length]);

  const parsedInsight = insight ? JSON.parse(insight) : null;

  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 overflow-hidden relative">
      <div className="absolute top-0 right-0 p-8 opacity-5">
        <Sparkles size={120} className="text-indigo-600" />
      </div>
      
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
          <Sparkles size={20} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900">AI Executive Insights</h3>
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Powered by Gemini 3 Flash</p>
        </div>
        {loading && <Loader2 className="ml-auto animate-spin text-indigo-600" size={20} />}
      </div>

      {!parsedInsight ? (
        <div className="py-12 text-center">
          <p className="text-slate-400 text-sm italic">Analyzing organizational risk posture...</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
            <p className="text-sm text-slate-700 font-medium leading-relaxed">
              "{parsedInsight.summary}"
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {parsedInsight.insights.map((item: any, i: number) => (
              <div key={i} className="p-4 rounded-xl border border-slate-100 hover:border-indigo-100 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  {item.type === 'warning' ? <AlertCircle size={16} className="text-red-500" /> : 
                   item.type === 'trend' ? <TrendingUp size={16} className="text-indigo-500" /> : 
                   <CheckCircle2 size={16} className="text-emerald-500" />}
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-tight">{item.title}</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="mt-6 pt-6 border-t border-slate-50 flex justify-end">
        <button 
          onClick={generateInsight}
          disabled={loading}
          className="text-xs font-bold text-indigo-600 hover:text-indigo-700 uppercase tracking-widest flex items-center gap-2 disabled:opacity-50"
        >
          Refresh Analysis
        </button>
      </div>
    </div>
  );
};

export default AIInsights;
