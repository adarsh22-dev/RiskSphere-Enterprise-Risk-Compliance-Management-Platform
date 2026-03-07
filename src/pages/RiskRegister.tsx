import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  ShieldAlert, 
  ChevronDown,
  ArrowUpDown,
  Download
} from 'lucide-react';
import { Risk } from '../types';
import { MOCK_RISKS } from '../constants/mockData';
import { motion, AnimatePresence } from 'motion/react';
import RiskHeatmap from '../components/RiskHeatmap';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const COLORS = ['#6366f1', '#f59e0b', '#ef4444', '#10b981', '#8b5cf6', '#ec4899'];

const RiskRegister = () => {
  const [risks, setRisks] = useState<Risk[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedRisk, setSelectedRisk] = useState<Risk | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: keyof Risk | 'score' | 'priority'; direction: 'asc' | 'desc' } | null>(null);
  const [filters, setFilters] = useState({
    category: '',
    department: '',
    priority: ''
  });

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Operational',
    department: 'IT Security',
    likelihood: 3,
    impact: 3,
    mitigation_plan: '',
    owner_id: 0,
    status: 'active'
  });

  useEffect(() => {
    fetchRisks();
    fetchUsers();
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const res = await fetch('/api/risk-templates', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (!res.ok) throw new Error('API unavailable');
      const data = await res.json();
      setTemplates(data);
    } catch (err) {
      console.warn('Backend unavailable, using empty templates', err);
      setTemplates([]);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (!res.ok) throw new Error('API unavailable');
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.warn('Backend unavailable, using demo user', err);
      setUsers([{ id: 1, username: 'Demo Admin', department: 'Executive' }]);
    }
  };

  const fetchRisks = async () => {
    try {
      const res = await fetch('/api/risks', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (!res.ok) throw new Error('API unavailable');
      const data = await res.json();
      setRisks(data);
    } catch (err) {
      console.warn('Backend connection failed, using Mock Data for Risk Register...', err);
      setRisks(MOCK_RISKS);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = isEditing ? `/api/risks/${selectedRisk?.id}` : '/api/risks';
      const method = isEditing ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setIsModalOpen(false);
        setIsEditing(false);
        setFormData({
          title: '',
          description: '',
          category: 'Operational',
          department: 'IT Security',
          likelihood: 3,
          impact: 3,
          mitigation_plan: '',
          owner_id: 0,
          status: 'active'
        });
        fetchRisks();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (risk: Risk) => {
    setSelectedRisk(risk);
    setFormData({
      title: risk.title,
      description: risk.description || '',
      category: risk.category,
      department: risk.department,
      likelihood: risk.likelihood,
      impact: risk.impact,
      mitigation_plan: risk.mitigation_plan || '',
      owner_id: risk.owner_id || 0,
      status: risk.status
    });
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleSort = (key: keyof Risk | 'score' | 'priority') => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleSaveAsTemplate = async () => {
    const templateName = prompt("Enter template name:");
    if (!templateName) return;

    try {
      const res = await fetch('/api/risk-templates', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          name: templateName,
          description: formData.description,
          category: formData.category,
          department: formData.department,
          likelihood: formData.likelihood,
          impact: formData.impact,
          mitigation_plan: formData.mitigation_plan
        })
      });
      if (res.ok) {
        alert("Template saved successfully!");
        fetchTemplates();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleApplyTemplate = (templateId: number) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setFormData({
        ...formData,
        description: template.description || '',
        category: template.category,
        department: template.department,
        likelihood: template.likelihood,
        impact: template.impact,
        mitigation_plan: template.mitigation_plan || ''
      });
    }
  };

  const filteredRisks = risks
    .filter(risk => {
      const matchesSearch = risk.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        risk.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (risk.owner_name && risk.owner_name.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = !filters.category || risk.category === filters.category;
      const matchesDepartment = !filters.department || risk.department === filters.department;
      const matchesPriority = !filters.priority || risk.priority === filters.priority;

      return matchesSearch && matchesCategory && matchesDepartment && matchesPriority;
    })
    .sort((a, b) => {
      if (!sortConfig) return 0;
      const { key, direction } = sortConfig;
      
      let valA = a[key as keyof Risk];
      let valB = b[key as keyof Risk];

      if (key === 'priority') {
        const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        valA = priorityOrder[a.priority as keyof typeof priorityOrder] || 0;
        valB = priorityOrder[b.priority as keyof typeof priorityOrder] || 0;
      }

      if (valA < valB) return direction === 'asc' ? -1 : 1;
      if (valA > valB) return direction === 'asc' ? 1 : -1;
      return 0;
    });

  const exportToCSV = () => {
    const headers = ['Risk ID', 'Title', 'Category', 'Department', 'Score', 'Priority', 'Status'];
    const rows = filteredRisks.map(r => [
      `R-${r.id}`,
      r.title,
      r.category,
      r.department,
      r.score,
      r.priority,
      r.status
    ]);
    
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "risk_register.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Risk Register</h1>
          <p className="text-slate-500">Comprehensive log of all identified organizational risks</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50"
          >
            <Download size={16} />
            Export CSV
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
          >
            <Plus size={16} />
            Add New Risk
          </button>
        </div>
      </header>

      {/* Advanced Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <RiskHeatmap risks={risks} />
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Risks by Category</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={Object.entries(
                    risks.reduce((acc, risk) => {
                      acc[risk.category] = (acc[risk.category] || 0) + 1;
                      return acc;
                    }, {} as Record<string, number>)
                  ).map(([name, value]) => ({ name, value }))}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {risks.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 mb-6 flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 min-w-[300px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search risks, departments, or owners..." 
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <select 
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-100 outline-none"
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
          >
            <option value="">All Categories</option>
            {Array.from(new Set(risks.map(r => r.category))).map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <select 
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-100 outline-none"
            value={filters.priority}
            onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
          >
            <option value="">All Priorities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <button 
            onClick={() => setFilters({ category: '', department: '', priority: '' })}
            className="px-3 py-2 text-sm text-indigo-600 font-medium hover:underline"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Risk Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Risk ID</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Title & Description</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Category</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Owner</th>
              <th 
                className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors"
                onClick={() => handleSort('score')}
              >
                <div className="flex items-center gap-1">
                  Score
                  <ArrowUpDown size={12} className={sortConfig?.key === 'score' ? 'text-indigo-600' : 'text-slate-300'} />
                </div>
              </th>
              <th 
                className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors"
                onClick={() => handleSort('priority')}
              >
                <div className="flex items-center gap-1">
                  Priority
                  <ArrowUpDown size={12} className={sortConfig?.key === 'priority' ? 'text-indigo-600' : 'text-slate-300'} />
                </div>
              </th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Mitigation Plan</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              <tr><td colSpan={9} className="px-6 py-10 text-center text-slate-500">Loading risks...</td></tr>
            ) : filteredRisks.length === 0 ? (
              <tr><td colSpan={9} className="px-6 py-10 text-center text-slate-500">No risks found matching your criteria.</td></tr>
            ) : (
              filteredRisks.map((risk) => (
                <tr 
                  key={risk.id} 
                  onClick={() => setSelectedRisk(risk)}
                  className="hover:bg-slate-50 transition-colors group cursor-pointer"
                >
                  <td className="px-6 py-4 text-sm font-mono text-slate-400">#R-{risk.id.toString().padStart(4, '0')}</td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-bold text-slate-900">{risk.title}</div>
                    <div className="text-xs text-slate-500 line-clamp-1">{risk.description}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-[10px] font-bold uppercase">
                      {risk.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-[10px] font-bold">
                        {risk.owner_name?.[0] || 'U'}
                      </div>
                      <span className="text-sm text-slate-600">{risk.owner_name || 'Unassigned'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-12 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${
                            risk.score >= 20 ? 'bg-red-500' : 
                            risk.score >= 12 ? 'bg-orange-400' : 'bg-amber-400'
                          }`} 
                          style={{ width: `${(risk.score / 25) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-xs font-bold text-slate-700">{risk.score}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                      risk.priority === 'critical' ? 'bg-red-100 text-red-700' : 
                      risk.priority === 'high' ? 'bg-orange-100 text-orange-700' : 
                      risk.priority === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {risk.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-xs text-slate-600 line-clamp-2 max-w-[200px]">
                      {risk.mitigation_plan || 'No plan defined'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
                      <div className={`w-1.5 h-1.5 rounded-full ${risk.status === 'active' ? 'bg-emerald-500' : 'bg-slate-400'}`}></div>
                      {risk.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(risk);
                      }}
                      className="p-1 text-slate-400 hover:text-slate-600 rounded hover:bg-slate-100 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <MoreVertical size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Simple Modal for Adding Risk */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h2 className="text-xl font-bold text-slate-900">{isEditing ? 'Edit Risk' : 'Identify New Risk'}</h2>
                <button 
                  onClick={() => {
                    setIsModalOpen(false);
                    setIsEditing(false);
                  }} 
                  className="p-1 hover:bg-slate-100 rounded-lg"
                >
                  <Plus className="rotate-45" />
                </button>
              </div>
              <form className="p-6 space-y-4" onSubmit={handleSubmit}>
                {!isEditing && templates.length > 0 && (
                  <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100 mb-4">
                    <label className="block text-xs font-bold text-indigo-700 uppercase mb-2">Use Assessment Template</label>
                    <select 
                      className="w-full px-3 py-2 bg-white border border-indigo-200 rounded-lg text-sm outline-none"
                      onChange={(e) => handleApplyTemplate(parseInt(e.target.value))}
                      defaultValue=""
                    >
                      <option value="" disabled>Select a template...</option>
                      {templates.map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Risk Title</label>
                    <input 
                      type="text" 
                      required
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
                      placeholder="e.g. Unauthorized Access to Financial Records" 
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                    <textarea 
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none h-24" 
                      placeholder="Describe the risk event and potential consequences..."
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                    ></textarea>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                    <select 
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                    >
                      <option>Operational</option>
                      <option>Financial</option>
                      <option>Cybersecurity</option>
                      <option>Legal</option>
                      <option>Compliance</option>
                      <option>Strategic</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Department</label>
                    <select 
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                      value={formData.department}
                      onChange={(e) => setFormData({...formData, department: e.target.value})}
                    >
                      <option>IT Security</option>
                      <option>Finance</option>
                      <option>Operations</option>
                      <option>Legal</option>
                      <option>Human Resources</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Likelihood (1-5)</label>
                    <input 
                      type="number" 
                      min="1" 
                      max="5" 
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
                      value={formData.likelihood}
                      onChange={(e) => setFormData({...formData, likelihood: parseInt(e.target.value)})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Impact (1-5)</label>
                    <input 
                      type="number" 
                      min="1" 
                      max="5" 
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
                      value={formData.impact}
                      onChange={(e) => setFormData({...formData, impact: parseInt(e.target.value)})}
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Owner / Assignee</label>
                    <select 
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                      value={formData.owner_id}
                      onChange={(e) => setFormData({...formData, owner_id: parseInt(e.target.value)})}
                    >
                      <option value={0}>Select Owner</option>
                      {users.map(user => (
                        <option key={user.id} value={user.id}>{user.username} ({user.department})</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Mitigation Plan</label>
                    <textarea 
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none h-24" 
                      placeholder="Outline the steps to mitigate this risk..."
                      value={formData.mitigation_plan}
                      onChange={(e) => setFormData({...formData, mitigation_plan: e.target.value})}
                    ></textarea>
                  </div>
                </div>
                <div className="pt-4 flex justify-end gap-3">
                  <button 
                    type="button" 
                    onClick={() => {
                      setIsModalOpen(false);
                      setIsEditing(false);
                    }} 
                    className="px-6 py-2 border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">
                    {isEditing ? 'Update Risk' : 'Save Risk'}
                  </button>
                </div>
                {!isEditing && (
                  <div className="pt-4 border-t border-slate-100 flex justify-center">
                    <button 
                      type="button" 
                      onClick={handleSaveAsTemplate}
                      className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1"
                    >
                      <Plus size={12} /> Save current assessment as template
                    </button>
                  </div>
                )}
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Risk Detail Modal */}
      <AnimatePresence>
        {selectedRisk && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    selectedRisk.priority === 'critical' ? 'bg-red-100 text-red-600' : 
                    selectedRisk.priority === 'high' ? 'bg-orange-100 text-orange-600' : 'bg-indigo-100 text-indigo-600'
                  }`}>
                    <ShieldAlert size={20} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">{selectedRisk.title}</h2>
                    <p className="text-xs text-slate-500 font-mono">ID: #R-{selectedRisk.id.toString().padStart(4, '0')}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedRisk(null)} className="p-2 hover:bg-slate-200 rounded-lg transition-colors">
                  <Plus className="rotate-45" size={20} />
                </button>
              </div>
              
              <div className="p-8 space-y-6">
                <div className="grid grid-cols-3 gap-6">
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Risk Score</p>
                    <p className="text-2xl font-bold text-slate-900">{selectedRisk.score}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Likelihood</p>
                    <p className="text-2xl font-bold text-slate-900">{selectedRisk.likelihood}/5</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Impact</p>
                    <p className="text-2xl font-bold text-slate-900">{selectedRisk.impact}/5</p>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-slate-900 mb-2 uppercase tracking-tight">Description</h4>
                  <p className="text-slate-600 text-sm leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                    {selectedRisk.description || 'No description provided.'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 mb-2 uppercase tracking-tight">Mitigation Plan</h4>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      {selectedRisk.mitigation_plan || 'No mitigation plan defined yet. Action required.'}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 mb-2 uppercase tracking-tight">Ownership</h4>
                    <div className="flex items-center gap-3 p-3 bg-indigo-50 rounded-xl border border-indigo-100">
                      <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                        {selectedRisk.owner_name?.[0] || 'U'}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{selectedRisk.owner_name || 'Unassigned'}</p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase">{selectedRisk.department}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100 flex justify-between items-center">
                  <div className="flex gap-2">
                    <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-[10px] font-bold uppercase">
                      {selectedRisk.category}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                      selectedRisk.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {selectedRisk.status}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => {
                        handleEdit(selectedRisk);
                        setSelectedRisk(null);
                      }}
                      className="px-6 py-2 border border-slate-200 rounded-lg text-sm font-bold hover:bg-slate-50 transition-colors"
                    >
                      Edit Risk
                    </button>
                    <button 
                      onClick={() => setSelectedRisk(null)}
                      className="px-6 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition-colors"
                    >
                      Close Details
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RiskRegister;
