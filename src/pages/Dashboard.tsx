import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldAlert, 
  CheckCircle2, 
  ClipboardList, 
  AlertTriangle,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area 
} from 'recharts';
import { motion } from 'motion/react';
import AIInsights from '../components/AIInsights';
import RiskHeatmap from '../components/RiskHeatmap';
import { Risk, Incident, Compliance } from '../types';
import { MOCK_STATS, MOCK_RISKS, MOCK_INCIDENTS, MOCK_COMPLIANCE } from '../constants/mockData';

const Dashboard = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [risks, setRisks] = useState<Risk[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [compliance, setCompliance] = useState<Compliance[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const headers = { 'Authorization': `Bearer ${localStorage.getItem('token')}` };
        const [statsRes, risksRes, incidentsRes, complianceRes] = await Promise.all([
          fetch('/api/stats', { headers }),
          fetch('/api/risks', { headers }),
          fetch('/api/incidents', { headers }),
          fetch('/api/compliance', { headers })
        ]);

        if (!statsRes.ok || !risksRes.ok || !incidentsRes.ok || !complianceRes.ok) {
          throw new Error('Backend unavailable');
        }

        const [statsData, risksData, incidentsData, complianceData] = await Promise.all([
          statsRes.json(),
          risksRes.json(),
          incidentsRes.json(),
          complianceRes.json()
        ]);

        setStats(statsData);
        setRisks(risksData);
        setIncidents(incidentsData);
        setCompliance(complianceData);
      } catch (err) {
        console.warn('Backend connection failed, using Mock Data for Dashboard...', err);
        // Fallback for Vercel/Static hosting where backend is not running
        setStats(MOCK_STATS);
        setRisks(MOCK_RISKS);
        setIncidents(MOCK_INCIDENTS);
        setCompliance(MOCK_COMPLIANCE);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const riskData = Object.entries(
    risks.reduce((acc, risk) => {
      acc[risk.category] = (acc[risk.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value }));

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  const trendData = [
    { month: 'Jan', score: 65 },
    { month: 'Feb', score: 68 },
    { month: 'Mar', score: 75 },
    { month: 'Apr', score: 72 },
    { month: 'May', score: 80 },
    { month: 'Jun', score: 85 },
  ];

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8 space-y-8 bg-slate-50 min-h-screen">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Enterprise Overview</h1>
          <p className="text-slate-500">Real-time risk and compliance metrics</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => window.print()}
            className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50"
          >
            Export PDF
          </button>
          <Link 
            to="/risks" 
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
          >
            New Risk
          </Link>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {[
          { label: 'Active Risks', value: stats?.totalRisks || 0, icon: ShieldAlert, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'High Priority', value: stats?.highPriorityRisks || 0, icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50' },
          { label: 'Open Audits', value: stats?.openAudits || 0, icon: ClipboardList, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Compliance Score', value: `${stats?.complianceScore || 0}%`, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Resolved Incidents', value: stats?.resolvedIncidents || 0, icon: CheckCircle2, color: 'text-blue-600', bg: 'bg-blue-50' },
        ].map((stat, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={stat.label} 
            className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100"
          >
            <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center mb-4`}>
              <stat.icon size={24} />
            </div>
            <p className="text-sm font-medium text-slate-500">{stat.label}</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</h3>
          </motion.div>
        ))}
      </div>

      {/* AI Insights Section */}
      <AIInsights risks={risks} incidents={incidents} compliance={compliance} />

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Risk Distribution by Category</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={riskData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {riskData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-4">
            {riskData.map((item, i) => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i] }}></div>
                <span className="text-xs text-slate-500">{item.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Risk Score Trend (6 Months)</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#6366f1" 
                  strokeWidth={4} 
                  dot={{ r: 6, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 8, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Activity & Heatmap Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-900">Top Departmental Risks</h3>
            <Link to="/risks" className="text-indigo-600 text-sm font-medium hover:underline">View All</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-slate-100">
                  <th className="pb-4 text-sm font-semibold text-slate-600">Risk Title</th>
                  <th className="pb-4 text-sm font-semibold text-slate-600">Department</th>
                  <th className="pb-4 text-sm font-semibold text-slate-600">Score</th>
                  <th className="pb-4 text-sm font-semibold text-slate-600">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {risks.slice(0, 5).sort((a, b) => b.score - a.score).map((risk, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 text-sm font-medium text-slate-900">{risk.title}</td>
                    <td className="py-4 text-sm text-slate-500">{risk.department}</td>
                    <td className="py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        risk.score >= 20 ? 'bg-red-100 text-red-700' : 
                        risk.score >= 12 ? 'bg-orange-100 text-orange-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {risk.score}
                      </span>
                    </td>
                    <td className="py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        risk.priority === 'critical' ? 'bg-red-100 text-red-700' : 
                        risk.priority === 'high' ? 'bg-orange-100 text-orange-700' : 
                        risk.priority === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {risk.priority}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <RiskHeatmap risks={risks} />
      </div>
    </div>
  );
};

export default Dashboard;
