import React, { useState, useEffect } from 'react';
import { 
  ClipboardList, 
  Calendar, 
  Search, 
  Plus, 
  MoreVertical, 
  CheckCircle2, 
  Clock,
  User as UserIcon,
  X,
  Filter
} from 'lucide-react';
import { Audit } from '../types';
import { MOCK_AUDITS } from '../constants/mockData';
import { motion, AnimatePresence } from 'motion/react';

const Audits = () => {
  const [audits, setAudits] = useState<Audit[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAudit, setSelectedAudit] = useState<Audit | null>(null);

  const fetchAudits = async () => {
    try {
      const res = await fetch('/api/audits', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (!res.ok) throw new Error('API unavailable');
      const data = await res.json();
      setAudits(data);
    } catch (err) {
      console.warn('Backend connection failed, using Mock Data for Audits...', err);
      setAudits(MOCK_AUDITS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAudits();
  }, []);

  const handleScheduleAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const auditData = {
      title: formData.get('title'),
      plan_description: formData.get('description'),
      schedule_date: formData.get('date'),
      status: 'planning'
    };

    try {
      const res = await fetch('/api/audits', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(auditData)
      });
      if (res.ok) {
        setIsModalOpen(false);
        fetchAudits();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Audit Management</h1>
          <p className="text-slate-500">Schedule, track, and manage organizational audits</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          <Plus size={16} />
          Schedule Audit
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {[
          { label: 'Planned Audits', value: audits.filter(a => a.status === 'planning').length, icon: Calendar, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'In Progress', value: audits.filter(a => a.status === 'fieldwork' || a.status === 'review').length, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Completed', value: audits.filter(a => a.status === 'closed').length, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
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
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input type="text" placeholder="Search audits..." className="pl-9 pr-4 py-1.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full" />
          </div>
          <button className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50">
            <Filter size={14} />
            Filter
          </button>
        </div>
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50/50 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <th className="px-6 py-4">Audit Title</th>
              <th className="px-6 py-4">Auditor</th>
              <th className="px-6 py-4">Schedule Date</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              <tr><td colSpan={5} className="px-6 py-10 text-center text-slate-500">Loading audits...</td></tr>
            ) : audits.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-10 text-center text-slate-500">No audits scheduled.</td></tr>
            ) : audits.map((audit) => (
              <tr 
                key={audit.id} 
                className="hover:bg-slate-50 transition-colors group cursor-pointer"
                onClick={() => setSelectedAudit(audit)}
              >
                <td className="px-6 py-4">
                  <div className="text-sm font-bold text-slate-900">{audit.title}</div>
                  <div className="text-xs text-slate-500 line-clamp-1">{audit.plan_description}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center">
                      <UserIcon size={12} className="text-slate-500" />
                    </div>
                    <span className="text-sm text-slate-600">{audit.auditor_name || 'Unassigned'}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">
                  {new Date(audit.schedule_date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                    audit.status === 'closed' ? 'bg-emerald-100 text-emerald-700' : 
                    audit.status === 'review' ? 'bg-amber-100 text-amber-700' : 
                    audit.status === 'fieldwork' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {audit.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      alert(`Actions menu for: ${audit.title}`);
                    }}
                    className="p-1 text-slate-400 hover:text-slate-600 rounded hover:bg-slate-100"
                  >
                    <MoreVertical size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Schedule Audit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h2 className="text-xl font-bold text-slate-900">Schedule New Audit</h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleScheduleAudit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Audit Title</label>
                  <input name="title" required type="text" className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="e.g., Annual IT Security Audit" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Schedule Date</label>
                  <input name="date" required type="date" className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Plan Description</label>
                  <textarea name="description" className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none h-24" placeholder="Outline the audit scope and objectives..."></textarea>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-50 rounded-lg">Cancel</button>
                  <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700">Schedule Audit</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Audit Detail Modal */}
      <AnimatePresence>
        {selectedAudit && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center">
                    <ClipboardList size={20} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">{selectedAudit.title}</h2>
                    <p className="text-sm text-slate-500">Audit ID: #AUD-{selectedAudit.id}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedAudit(null)} className="p-2 hover:bg-slate-200 rounded-lg transition-colors">
                  <X size={20} />
                </button>
              </div>
              <div className="p-8 space-y-6">
                <div className="grid grid-cols-3 gap-6">
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-xs font-bold text-slate-400 uppercase mb-1">Status</p>
                    <p className="font-bold text-indigo-600 uppercase text-xs">{selectedAudit.status}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-xs font-bold text-slate-400 uppercase mb-1">Date</p>
                    <p className="font-bold text-slate-900">{new Date(selectedAudit.schedule_date).toLocaleDateString()}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-xs font-bold text-slate-400 uppercase mb-1">Auditor</p>
                    <p className="font-bold text-slate-900">{selectedAudit.auditor_name || 'Unassigned'}</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 mb-2">Audit Plan</h4>
                  <p className="text-slate-600 leading-relaxed">{selectedAudit.plan_description || 'No plan description provided.'}</p>
                </div>
                {selectedAudit.findings && (
                  <div>
                    <h4 className="font-bold text-slate-900 mb-2">Findings</h4>
                    <p className="text-slate-600 leading-relaxed">{selectedAudit.findings}</p>
                  </div>
                )}
                <div className="pt-6 border-t border-slate-100 flex justify-end gap-3">
                  <button className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm font-bold hover:bg-slate-50">Download Report</button>
                  <button className="px-6 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700">Update Status</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Audits;
