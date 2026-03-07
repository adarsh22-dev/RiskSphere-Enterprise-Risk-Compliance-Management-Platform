import React, { useState } from 'react';
import { 
  BarChart3, 
  Download, 
  FileText, 
  TrendingUp, 
  Shield, 
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Loader2
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend, AreaChart, Area
} from 'recharts';

const Reports = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [generatingReport, setGeneratingReport] = useState<string | null>(null);

  const data = [
    { name: 'Jan', risks: 40, compliance: 24, incidents: 10 },
    { name: 'Feb', risks: 30, compliance: 13, incidents: 8 },
    { name: 'Mar', risks: 20, compliance: 98, incidents: 15 },
    { name: 'Apr', risks: 27, compliance: 39, incidents: 12 },
    { name: 'May', risks: 18, compliance: 48, incidents: 5 },
    { name: 'Jun', risks: 23, compliance: 38, incidents: 7 },
  ];

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      alert("Data export successful! Your download will begin shortly.");
    }, 2000);
  };

  const handleGenerateReport = (title: string) => {
    setGeneratingReport(title);
    setTimeout(() => {
      setGeneratingReport(null);
      alert(`${title} has been generated and sent to your email.`);
    }, 2500);
  };

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Reporting Center</h1>
          <p className="text-slate-500">Generate and export comprehensive risk and compliance reports</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => alert("Date range selector opened")}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
          >
            <Calendar size={16} />
            Last 30 Days
          </button>
          <button 
            onClick={handleExport}
            disabled={isExporting}
            className={`flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-all ${isExporting ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {isExporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
            {isExporting ? 'Exporting...' : 'Export All Data'}
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[
          { title: 'Executive Summary', desc: 'High-level overview for board members and stakeholders.', icon: FileText },
          { title: 'Risk Heatmap Report', desc: 'Detailed analysis of risk concentration and severity.', icon: Shield },
          { title: 'Compliance Audit', desc: 'Status report on all active regulatory frameworks.', icon: CheckCircle2 },
        ].map((report, i) => (
          <div 
            key={i} 
            onClick={() => handleGenerateReport(report.title)}
            className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 group hover:border-indigo-200 hover:shadow-md transition-all cursor-pointer"
          >
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <report.icon size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">{report.title}</h3>
            <p className="text-sm text-slate-500 mb-4">{report.desc}</p>
            <button className="text-indigo-600 text-sm font-bold flex items-center gap-1 hover:underline">
              {generatingReport === report.title ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  Generate Report <TrendingUp size={14} />
                </>
              )}
            </button>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-xl font-bold text-slate-900 mb-8">Quarterly Performance</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                />
                <Legend />
                <Bar dataKey="risks" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="compliance" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="incidents" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-xl font-bold text-slate-900 mb-8">Risk Mitigation Efficiency</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorRisks" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip />
                <Area type="monotone" dataKey="risks" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorRisks)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
