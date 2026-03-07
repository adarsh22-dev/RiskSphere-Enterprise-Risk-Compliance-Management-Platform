import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  Plus, 
  Play, 
  Pause, 
  Trash2, 
  Bell, 
  Mail, 
  CheckSquare,
  ChevronRight,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Rule {
  id: number;
  name: string;
  trigger: string;
  action: string;
  status: 'active' | 'paused';
}

const Automation = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rules, setRules] = useState<Rule[]>([
    { id: 1, name: 'Critical Risk Alert', trigger: 'Risk Score > 20', action: 'Notify Compliance Officer', status: 'active' },
    { id: 2, name: 'Incident Escalation', trigger: 'Severity = Critical', action: 'Create Investigation Task', status: 'active' },
    { id: 3, name: 'Audit Reminder', trigger: 'Deadline < 7 days', action: 'Send Email to Auditor', status: 'paused' },
  ]);

  const toggleStatus = (id: number) => {
    setRules(rules.map(r => r.id === id ? { ...r, status: r.status === 'active' ? 'paused' : 'active' } : r));
  };

  const deleteRule = (id: number) => {
    if (confirm("Are you sure you want to delete this automation rule?")) {
      setRules(rules.filter(r => r.id !== id));
    }
  };

  const handleCreateRule = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const newRule: Rule = {
      id: Date.now(),
      name: formData.get('name') as string,
      trigger: formData.get('trigger') as string,
      action: formData.get('action') as string,
      status: 'active'
    };
    setRules([...rules, newRule]);
    setIsModalOpen(false);
  };

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Workflow Automation</h1>
          <p className="text-slate-500">Define rules to automate risk responses and notifications</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          <Plus size={16} />
          Create Rule
        </button>
      </header>

      <div className="grid grid-cols-1 gap-6">
        <AnimatePresence mode="popLayout">
          {rules.map((rule) => (
            <motion.div 
              key={rule.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between group hover:border-indigo-100 transition-colors"
            >
              <div className="flex items-center gap-6">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${rule.status === 'active' ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>
                  <Zap size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{rule.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">If</span>
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-bold">{rule.trigger}</span>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Then</span>
                    <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded text-[10px] font-bold">{rule.action}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 mr-4">
                  <div className={`w-2 h-2 rounded-full ${rule.status === 'active' ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                  <span className="text-xs font-medium text-slate-500 capitalize">{rule.status}</span>
                </div>
                
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => toggleStatus(rule.id)}
                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    title={rule.status === 'active' ? 'Pause' : 'Activate'}
                  >
                    {rule.status === 'active' ? <Pause size={18} /> : <Play size={18} />}
                  </button>
                  <button 
                    onClick={() => deleteRule(rule.id)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
                  <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { title: 'Notification Rules', desc: 'Manage email and system alerts', icon: Bell },
          { title: 'Task Triggers', desc: 'Auto-assign tasks based on events', icon: CheckSquare },
          { title: 'Email Templates', desc: 'Customize automated communications', icon: Mail },
        ].map((item) => (
          <div 
            key={item.title} 
            onClick={() => alert(`Opening ${item.title} settings...`)}
            className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md hover:border-indigo-200 transition-all cursor-pointer group"
          >
            <div className="w-10 h-10 bg-slate-50 text-slate-600 rounded-lg flex items-center justify-center mb-4 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
              <item.icon size={20} />
            </div>
            <h4 className="font-bold text-slate-900">{item.title}</h4>
            <p className="text-sm text-slate-500 mt-1">{item.desc}</p>
          </div>
        ))}
      </div>

      {/* Create Rule Modal */}
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
                <h2 className="text-xl font-bold text-slate-900">Create Automation Rule</h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleCreateRule} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Rule Name</label>
                  <input name="name" required type="text" className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="e.g., High Priority Incident Alert" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Trigger Condition (If)</label>
                    <input name="trigger" required type="text" className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="e.g., Score > 15" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Action (Then)</label>
                    <input name="action" required type="text" className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="e.g., Email CEO" />
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-50 rounded-lg">Cancel</button>
                  <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700">Create Rule</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Automation;
