import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import RiskRegister from './pages/RiskRegister';
import CompliancePage from './pages/Compliance';
import IncidentPage from './pages/IncidentPage';
import TaskManagement from './pages/TaskManagement';
import UserManagement from './pages/UserManagement';
import Automation from './pages/Automation';
import Audits from './pages/Audits';
import Documents from './pages/Documents';
import RiskAssessment from './pages/RiskAssessment';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Login from './pages/Login';
import AIRiskAssistant from './components/AIRiskAssistant';
import { Bot, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

const Layout = ({ children }: { children: React.ReactNode }) => {
  const [isAiOpen, setIsAiOpen] = React.useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar />
      <main className="flex-1 overflow-y-auto relative">
        {children}
        
        {/* Floating AI Assistant Trigger */}
        <div className="fixed bottom-6 right-6 z-40">
          <button 
            onClick={() => setIsAiOpen(!isAiOpen)}
            className="w-14 h-14 bg-indigo-600 text-white rounded-full shadow-lg shadow-indigo-500/40 flex items-center justify-center hover:scale-110 transition-transform"
          >
            {isAiOpen ? <X size={24} /> : <Bot size={24} />}
          </button>
        </div>

        {/* AI Assistant Modal */}
        <AnimatePresence>
          {isAiOpen && (
            <motion.div 
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="fixed bottom-24 right-6 z-50 w-[400px]"
            >
              <AIRiskAssistant />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={
            <ProtectedRoute>
              <Layout><Dashboard /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/risks" element={
            <ProtectedRoute>
              <Layout><RiskRegister /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/assessment" element={
            <ProtectedRoute>
              <Layout><RiskAssessment /></Layout>
            </ProtectedRoute>
          } />
          {/* Fallback routes for other modules - using Dashboard as placeholder for now */}
          <Route path="/compliance" element={
            <ProtectedRoute>
              <Layout><CompliancePage /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/audits" element={
            <ProtectedRoute>
              <Layout><Audits /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/incidents" element={
            <ProtectedRoute>
              <Layout><IncidentPage /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/tasks" element={
            <ProtectedRoute>
              <Layout><TaskManagement /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/documents" element={
            <ProtectedRoute>
              <Layout><Documents /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/reports" element={
            <ProtectedRoute>
              <Layout><Reports /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute>
              <Layout><Settings /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/users" element={
            <ProtectedRoute>
              <Layout><UserManagement /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/automation" element={
            <ProtectedRoute>
              <Layout><Automation /></Layout>
            </ProtectedRoute>
          } />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
