import React, { useState } from 'react';
import { 
  FileText, 
  Search, 
  Plus, 
  MoreVertical, 
  Download, 
  Trash2, 
  ExternalLink,
  Filter,
  Folder,
  File,
  X,
  Clock as ClockIcon,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Document {
  id: number;
  name: string;
  type: string;
  size: string;
  owner: string;
  lastModified: string;
  category: string;
}

const Documents = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [documents, setDocuments] = useState<Document[]>([
    { id: 1, name: 'Risk Management Policy 2024.pdf', type: 'PDF', size: '2.4 MB', owner: 'Admin User', lastModified: '2024-03-01', category: 'Policy' },
    { id: 2, name: 'ISO 27001 Compliance Checklist.xlsx', type: 'XLSX', size: '1.1 MB', owner: 'Compliance Officer', lastModified: '2024-02-15', category: 'Compliance' },
    { id: 3, name: 'Incident Response Plan v2.docx', type: 'DOCX', size: '850 KB', owner: 'Risk Manager', lastModified: '2024-01-20', category: 'Incident' },
    { id: 4, name: 'Internal Audit Report Q4.pdf', type: 'PDF', size: '4.2 MB', owner: 'Auditor', lastModified: '2024-01-10', category: 'Audit' },
    { id: 5, name: 'Business Continuity Plan.pdf', type: 'PDF', size: '3.1 MB', owner: 'Admin User', lastModified: '2024-02-28', category: 'Policy' },
  ]);

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this document?")) {
      setDocuments(documents.filter(d => d.id !== id));
    }
  };

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const newDoc: Document = {
      id: Date.now(),
      name: formData.get('name') as string,
      type: 'PDF',
      size: '1.2 MB',
      owner: 'Admin User',
      lastModified: new Date().toISOString().split('T')[0],
      category: formData.get('category') as string
    };
    setDocuments([newDoc, ...documents]);
    setIsModalOpen(false);
  };

  const filteredDocs = documents.filter(doc => 
    doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Document Library</h1>
          <p className="text-slate-500">Centralized repository for policies, reports, and evidence</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          <Plus size={16} />
          Upload Document
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[
          { label: 'Total Documents', value: documents.length, icon: FileText, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Recent Uploads', value: '12', icon: ClockIcon, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Storage Used', value: '1.2 GB', icon: Folder, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Shared Files', value: '45', icon: ExternalLink, color: 'text-blue-600', bg: 'bg-blue-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
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
          <div className="flex gap-4">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Search documents..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-1.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full" 
              />
            </div>
            <button className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50">
              <Filter size={14} />
              Filter
            </button>
          </div>
        </div>
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50/50 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Category</th>
              <th className="px-6 py-4">Size</th>
              <th className="px-6 py-4">Last Modified</th>
              <th className="px-6 py-4">Owner</th>
              <th className="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            <AnimatePresence mode="popLayout">
              {filteredDocs.map((doc) => (
                <motion.tr 
                  key={doc.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="hover:bg-slate-50 transition-colors group"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center text-slate-500">
                        <File size={16} />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-900">{doc.name}</div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase">{doc.type}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-[10px] font-bold uppercase">
                      {doc.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">{doc.size}</td>
                  <td className="px-6 py-4 text-sm text-slate-500">{doc.lastModified}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{doc.owner}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => alert(`Downloading ${doc.name}...`)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                        title="Download"
                      >
                        <Download size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(doc.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                      <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors">
                        <MoreVertical size={16} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* Upload Modal */}
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
                <h2 className="text-xl font-bold text-slate-900">Upload Document</h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleUpload} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Document Name</label>
                  <input name="name" required type="text" className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="e.g., Security Policy 2024" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                  <select name="category" className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none">
                    <option>Policy</option>
                    <option>Compliance</option>
                    <option>Incident</option>
                    <option>Audit</option>
                    <option>Evidence</option>
                  </select>
                </div>
                <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center hover:border-indigo-300 transition-colors cursor-pointer group">
                  <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                    <Plus size={24} />
                  </div>
                  <p className="text-sm font-bold text-slate-900">Click or drag file to upload</p>
                  <p className="text-xs text-slate-500 mt-1">PDF, DOCX, XLSX up to 10MB</p>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-50 rounded-lg">Cancel</button>
                  <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700">Upload</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Documents;
