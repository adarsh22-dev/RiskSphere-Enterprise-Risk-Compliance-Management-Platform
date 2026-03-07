import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  ShieldAlert, 
  Activity, 
  Clock, 
  Search, 
  Filter,
  ArrowRight,
  Plus
} from 'lucide-react';
import { Incident } from '../types';
import { MOCK_INCIDENTS } from '../constants/mockData';
import { motion } from 'motion/react';

const IncidentPage = () => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'security_breach',
    severity: 'medium'
  });

  useEffect(() => {
    fetchIncidents();
  }, []);

  const fetchIncidents = async () => {
    try {
      const res = await fetch('/api/incidents', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (!res.ok) throw new Error('API unavailable');
      const data = await res.json();
      setIncidents(data);
    } catch (err) {
      console.warn('Backend connection failed, using Mock Data for Incidents...', err);
      setIncidents(MOCK_INCIDENTS);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/incidents', {
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
          title: '',
          description: '',
          type: 'security_breach',
          severity: 'medium'
        });
        fetchIncidents();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Incident Management</h1>
          <p className="text-slate-500">Track and investigate operational incidents and security breaches</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
        >
          <Plus size={16} />
          Report Incident
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        {[
          { label: 'Total Incidents', value: '24', icon: Activity, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Critical Severity', value: '2', icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50' },
          { label: 'Under Investigation', value: '8', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Avg Resolution Time', value: '4.2h', icon: ShieldAlert, color: 'text-emerald-600', bg: 'bg-emerald-50' },
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

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-bold text-slate-900">Active Incidents</h3>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input type="text" placeholder="Search incidents..." className="pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>
        </div>
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <th className="px-6 py-4">ID</th>
              <th className="px-6 py-4">Title & Type</th>
              <th className="px-6 py-4">Severity</th>
              <th className="px-6 py-4">Reporter</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Reported At</th>
              <th className="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              <tr><td colSpan={7} className="px-6 py-10 text-center text-slate-500">Loading...</td></tr>
            ) : incidents.length === 0 ? (
              <tr><td colSpan={7} className="px-6 py-10 text-center text-slate-500">No incidents reported.</td></tr>
            ) : incidents.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50 transition-colors group">
                <td className="px-6 py-4 text-sm font-mono text-slate-400">#INC-{item.id.toString().padStart(4, '0')}</td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-slate-900">{item.title}</div>
                  <div className="text-xs text-slate-500 uppercase font-bold">{item.type.replace('_', ' ')}</div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                    item.severity === 'critical' ? 'bg-red-100 text-red-700' : 
                    item.severity === 'high' ? 'bg-orange-100 text-orange-700' : 
                    item.severity === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {item.severity}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">{item.reporter_name}</td>
                <td className="px-6 py-4">
                  <span className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
                    <div className={`w-1.5 h-1.5 rounded-full ${
                      item.status === 'reported' ? 'bg-blue-500' : 
                      item.status === 'investigating' ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}></div>
                    {item.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-slate-500">{new Date(item.created_at).toLocaleDateString()}</td>
                <td className="px-6 py-4 text-right">
                  <button className="text-slate-400 hover:text-indigo-600 transition-colors">
                    <ArrowRight size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal for Reporting Incident */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-900">Report Operational Incident</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-1 hover:bg-slate-100 rounded-lg">
                <Plus className="rotate-45" />
              </button>
            </div>
            <form className="p-6 space-y-4" onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Incident Title</label>
                  <input 
                    type="text" 
                    required
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
                    placeholder="e.g. Database Connection Timeout" 
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                  <select 
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                  >
                    <option value="security_breach">Security Breach</option>
                    <option value="system_outage">System Outage</option>
                    <option value="operational_failure">Operational Failure</option>
                    <option value="fraud">Fraud Case</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Severity</label>
                  <select 
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={formData.severity}
                    onChange={(e) => setFormData({...formData, severity: e.target.value})}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                  <textarea 
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none h-24" 
                    placeholder="Provide details about the incident, impact, and immediate actions taken..."
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                  ></textarea>
                </div>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2 border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">Submit Report</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default IncidentPage;
