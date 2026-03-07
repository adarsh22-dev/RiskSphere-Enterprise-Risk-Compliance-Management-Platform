import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  FileText, 
  Search, 
  Filter,
  ArrowUpRight,
  Zap,
  BarChart2,
  Download,
  RefreshCw
} from 'lucide-react';
import { Compliance } from '../types';
import { MOCK_COMPLIANCE } from '../constants/mockData';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
  Tooltip as RechartsTooltip,
  Bar, BarChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts';

const CompliancePage = () => {
  const [compliance, setCompliance] = useState<Compliance[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [activeTab, setActiveTab] = useState<'tracking' | 'reporting'>('tracking');
  const [formData, setFormData] = useState({
    framework: 'ISO 27001',
    requirement: '',
    description: '',
    status: 'under_review',
    progress: 0
  });

  const runAutomatedChecks = () => {
    setIsChecking(true);
    setTimeout(() => {
      setIsChecking(false);
      // Simulate updates
      setCompliance(prev => prev.map(item => {
        if (Math.random() > 0.7) {
          return { ...item, status: 'compliant', progress: 100 };
        }
        return item;
      }));
    }, 2000);
  };

  const radarData = Object.entries(
    compliance.reduce((acc, item) => {
      if (!acc[item.framework]) acc[item.framework] = { sum: 0, count: 0 };
      acc[item.framework].sum += item.progress;
      acc[item.framework].count += 1;
      return acc;
    }, {} as Record<string, { sum: number, count: number }>)
  ).map(([name, data]) => ({
    subject: name,
    A: Math.round(data.sum / data.count),
    fullMark: 100
  }));

  useEffect(() => {
    fetchCompliance();
  }, []);

  const fetchCompliance = async () => {
    try {
      const res = await fetch('/api/compliance', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (!res.ok) throw new Error('API unavailable');
      const data = await res.json();
      setCompliance(data);
    } catch (err) {
      console.warn('Backend connection failed, using Mock Data for Compliance...', err);
      setCompliance(MOCK_COMPLIANCE);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/compliance', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setIsModalOpen(false);
        setFormData({
          framework: 'ISO 27001',
          requirement: '',
          description: '',
          status: 'under_review',
          progress: 0
        });
        fetchCompliance();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Compliance Management</h1>
          <p className="text-slate-500">Track regulatory requirements and internal policy adherence</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={runAutomatedChecks}
            disabled={isChecking}
            className={`flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium transition-all ${isChecking ? 'bg-slate-100 text-slate-400' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
          >
            <RefreshCw size={16} className={isChecking ? 'animate-spin' : ''} />
            {isChecking ? 'Checking...' : 'Run Automated Checks'}
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
          >
            Add Requirement
          </button>
        </div>
      </header>

      <div className="flex gap-1 mb-8 bg-slate-200/50 p-1 rounded-xl w-fit">
        <button 
          onClick={() => setActiveTab('tracking')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'tracking' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <Zap size={16} />
          Compliance Tracking
        </button>
        <button 
          onClick={() => setActiveTab('reporting')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'reporting' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <BarChart2 size={16} />
          Reporting & Analytics
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'tracking' ? (
          <motion.div
            key="tracking"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        {[
          { label: 'Overall Progress', value: '84%', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Non-Compliant', value: '3', icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50' },
          { label: 'Under Review', value: '12', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Evidence Files', value: '156', icon: FileText, color: 'text-indigo-600', bg: 'bg-indigo-50' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className={`w-10 h-10 ${stat.bg} ${stat.color} rounded-lg flex items-center justify-center mb-4`}>
              <stat.icon size={20} />
            </div>
            <p className="text-sm font-medium text-slate-500">{stat.label}</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Compliance Maturity by Framework</h3>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid stroke="#f1f5f9" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <Radar
                  name="Maturity"
                  dataKey="A"
                  stroke="#6366f1"
                  fill="#6366f1"
                  fillOpacity={0.5}
                />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Compliance Status</h3>
          <div className="space-y-4">
            {['Compliant', 'Partially Compliant', 'Non-Compliant', 'Under Review'].map((status) => {
              const count = compliance.filter(c => c.status === status.toLowerCase().replace(' ', '_')).length;
              const total = compliance.length || 1;
              const percentage = Math.round((count / total) * 100);
              
              return (
                <div key={status}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-600 font-medium">{status}</span>
                    <span className="text-slate-900 font-bold">{count}</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${
                        status === 'Compliant' ? 'bg-emerald-500' : 
                        status === 'Non-Compliant' ? 'bg-red-500' : 
                        status === 'Partially Compliant' ? 'bg-amber-500' : 'bg-indigo-500'
                      }`} 
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="mt-8 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
            <p className="text-xs text-indigo-700 font-medium leading-relaxed">
              <span className="font-bold">Pro Tip:</span> Upload evidence files for "Under Review" items to accelerate the audit process.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-bold text-slate-900">Regulatory Frameworks</h3>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input type="text" placeholder="Search..." className="pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>
        </div>
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <th className="px-6 py-4">Framework</th>
              <th className="px-6 py-4">Requirement</th>
              <th className="px-6 py-4">Owner</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Progress</th>
              <th className="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              <tr><td colSpan={6} className="px-6 py-10 text-center text-slate-500">Loading...</td></tr>
            ) : compliance.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded text-[10px] font-bold uppercase">
                    {item.framework}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-slate-900">{item.requirement}</div>
                  <div className="text-xs text-slate-500">{item.description}</div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">{item.owner_name}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                    item.status === 'compliant' ? 'bg-emerald-100 text-emerald-700' : 
                    item.status === 'non_compliant' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {item.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden min-w-[100px]">
                      <div className="h-full bg-indigo-600" style={{ width: `${item.progress}%` }}></div>
                    </div>
                    <span className="text-xs font-bold text-slate-700">{item.progress}%</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-slate-400 hover:text-indigo-600">
                    <ArrowUpRight size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  ) : (
    <motion.div
      key="reporting"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-8"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-bold text-slate-900">Compliance Trends</h3>
            <button className="flex items-center gap-2 text-sm font-bold text-indigo-600 hover:underline">
              <Download size={14} />
              Export PDF
            </button>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={radarData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="subject" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                />
                <Bar dataKey="A" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-xl font-bold text-slate-900 mb-8">Executive Summary</h3>
          <div className="space-y-6">
            <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl">
              <h4 className="font-bold text-emerald-900 flex items-center gap-2 mb-2">
                <CheckCircle2 size={18} />
                Framework Maturity
              </h4>
              <p className="text-sm text-emerald-700 leading-relaxed">
                Your organization has achieved 100% compliance in <strong>ISO 27001 Access Control</strong>. This is a significant improvement from last quarter.
              </p>
            </div>
            <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl">
              <h4 className="font-bold text-amber-900 flex items-center gap-2 mb-2">
                <AlertCircle size={18} />
                Attention Required
              </h4>
              <p className="text-sm text-amber-700 leading-relaxed">
                <strong>GDPR Data Portability</strong> requirements are currently at 45% progress. Automated checks indicate missing evidence for data deletion protocols.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-xl">
                <div className="text-2xl font-bold text-slate-900">12</div>
                <div className="text-xs text-slate-500 font-bold uppercase mt-1">Days to next audit</div>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl">
                <div className="text-2xl font-bold text-slate-900">84%</div>
                <div className="text-xs text-slate-500 font-bold uppercase mt-1">Overall Health</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )}
</AnimatePresence>

      {/* Modal for Adding Compliance Requirement */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-900">Add Compliance Requirement</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-1 hover:bg-slate-100 rounded-lg">
                <AlertCircle className="rotate-45" />
              </button>
            </div>
            <form className="p-6 space-y-4" onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Framework</label>
                  <select 
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={formData.framework}
                    onChange={(e) => setFormData({...formData, framework: e.target.value})}
                  >
                    <option>ISO 27001</option>
                    <option>SOC 2</option>
                    <option>GDPR</option>
                    <option>HIPAA</option>
                    <option>Internal Policy</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                  <select 
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                  >
                    <option value="compliant">Compliant</option>
                    <option value="partially_compliant">Partially Compliant</option>
                    <option value="non_compliant">Non-Compliant</option>
                    <option value="under_review">Under Review</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Requirement Title</label>
                  <input 
                    type="text" 
                    required
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
                    placeholder="e.g. Multi-Factor Authentication" 
                    value={formData.requirement}
                    onChange={(e) => setFormData({...formData, requirement: e.target.value})}
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                  <textarea 
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none h-24" 
                    placeholder="Describe the requirement and implementation details..."
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                  ></textarea>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Progress ({formData.progress}%)</label>
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600" 
                    value={formData.progress}
                    onChange={(e) => setFormData({...formData, progress: parseInt(e.target.value)})}
                  />
                </div>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2 border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">Save Requirement</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompliancePage;
