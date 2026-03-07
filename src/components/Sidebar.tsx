import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShieldAlert, 
  CheckCircle2, 
  ClipboardList, 
  AlertTriangle, 
  CheckSquare, 
  FileText, 
  BarChart3, 
  Users, 
  Settings,
  LogOut,
  Menu,
  X,
  Zap,
  Search
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'motion/react';

const Sidebar = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = React.useState(true);

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: Search, label: 'Risk Assessment', path: '/assessment' },
    { icon: ShieldAlert, label: 'Risk Register', path: '/risks' },
    { icon: CheckCircle2, label: 'Compliance', path: '/compliance' },
    { icon: ClipboardList, label: 'Audits', path: '/audits' },
    { icon: AlertTriangle, label: 'Incidents', path: '/incidents' },
    { icon: CheckSquare, label: 'Tasks', path: '/tasks' },
    { icon: Zap, label: 'Automation', path: '/automation' },
    { icon: FileText, label: 'Documents', path: '/documents' },
    { icon: BarChart3, label: 'Reports', path: '/reports' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  if (user?.role === 'super_admin') {
    menuItems.push({ icon: Users, label: 'User Management', path: '/users' });
  }

  return (
    <div className={`bg-slate-900 text-white h-screen transition-all duration-300 ${isOpen ? 'w-64' : 'w-20'} flex flex-col`}>
      <div className="p-6 flex items-center justify-between">
        {isOpen && <h1 className="text-xl font-bold tracking-tight">RiskSphere</h1>}
        <button onClick={() => setIsOpen(!isOpen)} className="p-1 hover:bg-slate-800 rounded">
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      <nav className="flex-1 mt-4 px-3 space-y-1">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center p-3 rounded-lg transition-colors ${
                isActive ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon size={20} />
              {isOpen && <span className="ml-3 font-medium">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center mb-4">
          <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center font-bold">
            {user?.username[0].toUpperCase()}
          </div>
          {isOpen && (
            <div className="ml-3">
              <p className="text-sm font-medium truncate">{user?.username}</p>
              <p className="text-xs text-slate-400 capitalize">{user?.role.replace('_', ' ')}</p>
            </div>
          )}
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center p-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
        >
          <LogOut size={20} />
          {isOpen && <span className="ml-3 font-medium">Logout</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
