import React, { useState } from 'react';
import { Settings as SettingsIcon, Shield, Bell, Users, Globe, Lock, ChevronLeft, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const Settings = () => {
  const [activeTab, setActiveTab] = useState<string | null>(null);

  const settingsItems = [
    { id: 'profile', icon: Globe, title: 'Organization Profile', desc: 'Update your company name, logo, and contact information.' },
    { id: 'risks', icon: Shield, title: 'Risk Parameters', desc: 'Configure likelihood and impact scales for risk assessments.' },
    { id: 'notifications', icon: Bell, title: 'Notifications', desc: 'Manage email and system alerts for critical risk events.' },
    { id: 'roles', icon: Users, title: 'Roles & Permissions', desc: 'Define access levels for different user groups.' },
    { id: 'security', icon: Lock, title: 'Security & Privacy', desc: 'Configure SSO, 2FA, and data retention policies.' },
  ];

  const renderActiveSetting = () => {
    const item = settingsItems.find(i => i.id === activeTab);
    if (!item) return null;

    return (
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden"
      >
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-4">
            <button onClick={() => setActiveTab(null)} className="p-2 hover:bg-slate-200 rounded-lg transition-colors">
              <ChevronLeft size={20} />
            </button>
            <div>
              <h2 className="text-xl font-bold text-slate-900">{item.title}</h2>
              <p className="text-sm text-slate-500">{item.desc}</p>
            </div>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition-colors">
            <Save size={16} />
            Save Changes
          </button>
        </div>
        
        <div className="p-8 space-y-8">
          {activeTab === 'profile' && (
            <div className="space-y-6 max-w-2xl">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Organization Name</label>
                  <input type="text" defaultValue="RiskSphere Corp" className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Industry</label>
                  <select className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none">
                    <option>Technology</option>
                    <option>Finance</option>
                    <option>Healthcare</option>
                    <option>Manufacturing</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Company Description</label>
                <textarea className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none h-32" defaultValue="Global Enterprise Risk Management and Compliance Solutions."></textarea>
              </div>
            </div>
          )}

          {activeTab === 'risks' && (
            <div className="space-y-6">
              <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                <p className="text-sm text-amber-800">
                  <strong>Note:</strong> Changing risk parameters will recalculate scores for all existing risks in the register.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <h4 className="font-bold text-slate-900 mb-4">Likelihood Scale (1-5)</h4>
                  <div className="space-y-3">
                    {['Rare', 'Unlikely', 'Possible', 'Likely', 'Almost Certain'].map((label, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <span className="w-6 h-6 bg-slate-100 rounded flex items-center justify-center text-xs font-bold">{i+1}</span>
                        <input type="text" defaultValue={label} className="flex-1 px-3 py-1.5 border border-slate-200 rounded-lg text-sm" />
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 mb-4">Impact Scale (1-5)</h4>
                  <div className="space-y-3">
                    {['Insignificant', 'Minor', 'Moderate', 'Major', 'Catastrophic'].map((label, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <span className="w-6 h-6 bg-slate-100 rounded flex items-center justify-center text-xs font-bold">{i+1}</span>
                        <input type="text" defaultValue={label} className="flex-1 px-3 py-1.5 border border-slate-200 rounded-lg text-sm" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-4 max-w-xl">
              {[
                'Email alerts for critical risks',
                'Weekly summary reports',
                'Audit deadline reminders',
                'Incident escalation notifications',
                'Task assignment alerts'
              ].map((label, i) => (
                <label key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 cursor-pointer hover:bg-slate-100 transition-colors">
                  <span className="text-sm font-medium text-slate-700">{label}</span>
                  <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-indigo-600">
                    <span className="inline-block h-4 w-4 translate-x-6 transform rounded-full bg-white transition" />
                  </div>
                </label>
              ))}
            </div>
          )}

          {activeTab === 'roles' && (
            <div className="space-y-6">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="pb-4 text-sm font-bold text-slate-500 uppercase">Role</th>
                    <th className="pb-4 text-sm font-bold text-slate-500 uppercase">Permissions</th>
                    <th className="pb-4 text-sm font-bold text-slate-500 uppercase">Users</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {[
                    { role: 'Risk Manager', perms: 'Full access to risks, assessments, and reporting', users: 3 },
                    { role: 'Compliance Officer', perms: 'Manage frameworks, evidence, and audits', users: 2 },
                    { role: 'Department Lead', perms: 'View and mitigate risks for assigned department', users: 12 },
                    { role: 'Employee', perms: 'Report incidents and view assigned tasks', users: 145 },
                  ].map((row, i) => (
                    <tr key={i}>
                      <td className="py-4 font-bold text-slate-900">{row.role}</td>
                      <td className="py-4 text-sm text-slate-600">{row.perms}</td>
                      <td className="py-4 text-sm font-bold text-indigo-600">{row.users} users</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6 max-w-2xl">
              <div className="p-6 bg-indigo-50 rounded-2xl border border-indigo-100 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-indigo-900">Two-Factor Authentication (2FA)</h4>
                  <p className="text-sm text-indigo-700">Add an extra layer of security to your organization accounts.</p>
                </div>
                <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold">Enable 2FA</button>
              </div>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Session Timeout (Minutes)</label>
                  <input type="number" defaultValue={30} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Password Expiry (Days)</label>
                  <input type="number" defaultValue={90} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-500">Manage your organization preferences and security settings</p>
      </header>

      <div className="max-w-6xl">
        <AnimatePresence mode="wait">
          {!activeTab ? (
            <motion.div 
              key="list"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {settingsItems.map((item, i) => (
                <div 
                  key={i} 
                  onClick={() => setActiveTab(item.id)}
                  className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between hover:border-indigo-200 hover:shadow-md transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                      <item.icon size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">{item.title}</h3>
                      <p className="text-sm text-slate-500">{item.desc}</p>
                    </div>
                  </div>
                  <div className="text-slate-300 group-hover:text-indigo-600 transition-colors">
                    <SettingsIcon size={20} />
                  </div>
                </div>
              ))}
            </motion.div>
          ) : (
            renderActiveSetting()
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Settings;
