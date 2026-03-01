import React from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import ClientLoginForm from '../components/auth/ClientLoginForm';
import ClientDashboard from '../components/dashboard/ClientDashboard';
import ClientAccountModule from '../components/client-account/ClientAccountModule';
import ClientHistoryModule from '../components/client-history/ClientHistoryModule';
import ClientRequestsModule from '../components/client-requests/ClientRequestsModule';
import CreditFormModule from '../components/credit-form/CreditFormModule';
import ChatModule from '../components/chat/ChatModule';
import ContractModule from '../components/contracts/ContractModule';
import Layout from '../components/layout/Layout';
import { Loader2 } from 'lucide-react';
import LandingPage from './LandingPage';
import RegisterForm from '../components/auth/RegisterForm';

const ClientApp = () => {
  const { isAuthenticated, user, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-pulse flex flex-col items-center">
          <img src="/logo-bochel.png?v=3" alt="Bochel Microcrédito" className="h-16 md:h-20 object-contain mb-4" />
          <div className="w-12 h-1 bg-gray-200 mt-4 rounded overflow-hidden">
            <div className="h-full bg-[#1b5e20] animate-[pulse_1s_ease-in-out_infinite] w-full origin-left scale-x-0" style={{ animation: 'progress 1.5s infinite ease-in-out' }}></div>
          </div>
          <style>{`
             @keyframes progress {
               0% { transform: scaleX(0); transform-origin: left; }
               50% { transform: scaleX(1); transform-origin: left; }
               50.1% { transform: scaleX(1); transform-origin: right; }
               100% { transform: scaleX(0); transform-origin: right; }
             }
           `}</style>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'cliente') {
    return (
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<ClientLoginForm />} />
        <Route path="/register" element={<RegisterForm onSwitchToLogin={() => navigate('/login')} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard-cliente" replace />} />
        <Route path="/dashboard-cliente" element={<ClientDashboard />} />
        <Route path="/conta/*" element={<ClientAccountModule />} />
        <Route path="/historico/*" element={<ClientHistoryModule />} />
        <Route path="/pedidos/*" element={<ClientRequestsModule />} />
        <Route path="/credit-form/*" element={<CreditFormModule />} />
        <Route path="/chat/*" element={<ChatModule />} />
        <Route path="/contratos/*" element={<ContractModule />} />
        <Route path="*" element={<Navigate to="/dashboard-cliente" replace />} />
      </Routes>
    </Layout>
  );
};

export default ClientApp;
