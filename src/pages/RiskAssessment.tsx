import React, { useState } from 'react';
import { 
  Search, 
  Plus, 
  ArrowRight, 
  Shield, 
  Zap, 
  BarChart2, 
  Target,
  CheckCircle2,
  AlertTriangle,
  Info,
  X,
  Clock as ClockIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const RiskAssessment = () => {
  const [step, setStep] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState<any>(null);
  const [assessments, setAssessments] = useState([
    { id: 1, title: 'Cloud Infrastructure Review', date: '2024-03-05', status: 'In Progress', score: 12, owner: 'IT Security', desc: 'Comprehensive review of AWS security groups and IAM policies.' },
    { id: 2, title: 'Supply Chain Audit', date: '2024-02-28', status: 'Completed', score: 8, owner: 'Procurement', desc: 'Evaluating critical vendor dependencies and business continuity plans.' },
    { id: 3, title: 'Annual Financial Risk Assessment', date: '2024-03-10', status: 'Planned', score: 0, owner: 'Finance', desc: 'Yearly assessment of market volatility and credit risks.' },
  ]);

  const handleNewAssessment = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const newAssessment = {
      id: assessments.length + 1,
      title: formData.get('title') as string,
      date: new Date().toISOString().split('T')[0],
      status: 'Planned',
      score: 0,
      owner: formData.get('owner') as string,
      desc: formData.get('desc') as string
    };
    setAssessments([newAssessment, ...assessments]);
    setIsModalOpen(false);
  };

  const startScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      alert("AI Scan complete! 3 new potential risks identified.");
    }, 3000);
  };

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Risk Assessment</h1>
          <p className="text-slate-500">Systematic identification, analysis, and evaluation of organizational risks</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          <Plus size={16} />
          New Assessment
        </button>
      </header>

      {/* Assessment Workflow Steps */}
      <div className="flex items-center gap-4 mb-8 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm overflow-x-auto">
        {[
          { id: 1, label: 'Identification', icon: Search },
          { id: 2, label: 'Analysis', icon: BarChart2 },
          { id: 3, label: 'Evaluation', icon: Target },
          { id: 4, label: 'Treatment', icon: Shield },
        ].map((s, i) => (
          <React.Fragment key={s.id}>
            <button 
              onClick={() => setStep(s.id)}
              className={`flex items-center gap-3 px-4 py-2 rounded-xl transition-all whitespace-nowrap ${step === s.id ? 'bg-indigo-50 text-indigo-600 ring-1 ring-indigo-200' : 'text-slate-400 hover:bg-slate-50'}`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold ${step === s.id ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                {s.id}
              </div>
              <span className="font-bold text-sm">{s.label}</span>
            </button>
            {i < 3 && <ArrowRight size={16} className="text-slate-300 flex-shrink-0" />}
          </React.Fragment>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-xl font-bold text-slate-900 mb-4">Active Assessments</h3>
            <div className="space-y-4">
              {assessments.map((a) => (
                <div 
                  key={a.id} 
                  onClick={() => setSelectedAssessment(a)}
                  className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-indigo-100 hover:bg-indigo-50/30 transition-all group cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${a.status === 'Completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-indigo-50 text-indigo-600'}`}>
                      <Zap size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">{a.title}</h4>
                      <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                        <span className="flex items-center gap-1"><ClockIcon size={12} /> {a.date}</span>
                        <span className="flex items-center gap-1"><Target size={12} /> {a.owner}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right mr-4">
                      <div className={`text-xs font-bold uppercase tracking-wider ${a.status === 'Completed' ? 'text-emerald-600' : 'text-indigo-600'}`}>
                        {a.status}
                      </div>
                      {a.score > 0 && <div className="text-lg font-bold text-slate-900">Score: {a.score}</div>}
                    </div>
                    <ArrowRight size={20} className="text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-indigo-900 text-white p-8 rounded-2xl shadow-lg relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-2xl font-bold mb-2">AI-Assisted Identification</h3>
              <p className="text-indigo-100 mb-6 max-w-md">Our AI engine can scan your infrastructure and documents to automatically identify emerging risks.</p>
              <button 
                onClick={startScan}
                disabled={isScanning}
                className={`px-6 py-2 bg-white text-indigo-900 rounded-lg font-bold hover:bg-indigo-50 transition-all flex items-center gap-2 ${isScanning ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isScanning ? (
                  <>
                    <div className="w-4 h-4 border-2 border-indigo-900 border-t-transparent rounded-full animate-spin"></div>
                    Scanning...
                  </>
                ) : (
                  <>
                    <Zap size={16} />
                    Start AI Scan
                  </>
                )}
              </button>
            </div>
            <Zap className="absolute -right-8 -bottom-8 w-48 h-48 text-white/10" />
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Info size={18} className="text-indigo-600" />
              Assessment Guide
            </h4>
            <div className="space-y-4">
              {[
                { title: 'Identification', desc: 'Find, recognize and describe risks that might prevent your organization from achieving its objectives.' },
                { title: 'Analysis', desc: 'Understand the nature of risk and its characteristics including, where appropriate, the level of risk.' },
                { title: 'Evaluation', desc: 'Compare the results of risk analysis with risk criteria to determine whether the risk is acceptable.' },
              ].map((item, i) => (
                <div key={i} className="relative pl-6 border-l-2 border-slate-100">
                  <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-white border-2 border-indigo-600"></div>
                  <h5 className="text-sm font-bold text-slate-900">{item.title}</h5>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h4 className="font-bold text-slate-900 mb-4">Recent Findings</h4>
            <div className="space-y-3">
              {[
                { text: 'New vulnerability in legacy API', type: 'High' },
                { text: 'Incomplete documentation for SOC2', type: 'Medium' },
                { text: 'Third-party vendor contract expired', type: 'Low' },
              ].map((f, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <span className="text-xs font-medium text-slate-700">{f.text}</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    f.type === 'High' ? 'bg-red-100 text-red-700' : 
                    f.type === 'Medium' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {f.type}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* New Assessment Modal */}
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
                <h2 className="text-xl font-bold text-slate-900">New Risk Assessment</h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleNewAssessment} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Assessment Title</label>
                  <input name="title" required type="text" className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="e.g., Q3 Security Review" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Department / Owner</label>
                  <input name="owner" required type="text" className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="e.g., IT Security" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                  <textarea name="desc" className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none h-24" placeholder="Briefly describe the scope of this assessment..."></textarea>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-50 rounded-lg">Cancel</button>
                  <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700">Create Assessment</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedAssessment && (
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
                    <Zap size={20} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">{selectedAssessment.title}</h2>
                    <p className="text-sm text-slate-500">Assessment ID: #RA-{selectedAssessment.id}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedAssessment(null)} className="p-2 hover:bg-slate-200 rounded-lg transition-colors">
                  <X size={20} />
                </button>
              </div>
              <div className="p-8 space-y-6">
                <div className="grid grid-cols-3 gap-6">
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-xs font-bold text-slate-400 uppercase mb-1">Status</p>
                    <p className="font-bold text-indigo-600">{selectedAssessment.status}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-xs font-bold text-slate-400 uppercase mb-1">Risk Score</p>
                    <p className="font-bold text-slate-900">{selectedAssessment.score || 'N/A'}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-xs font-bold text-slate-400 uppercase mb-1">Owner</p>
                    <p className="font-bold text-slate-900">{selectedAssessment.owner}</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 mb-2">Description</h4>
                  <p className="text-slate-600 leading-relaxed">{selectedAssessment.desc}</p>
                </div>
                <div className="pt-6 border-t border-slate-100 flex justify-end gap-3">
                  <button className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm font-bold hover:bg-slate-50">Download PDF</button>
                  <button className="px-6 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700">Continue Assessment</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RiskAssessment;
