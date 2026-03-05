import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import AgentDashboard from '../components/dashboard/AgentDashboard';
import CreditRequestManager from '../components/credit-requests/CreditRequestManager';
import ClientsModule from '../components/clients/ClientsModule';
import LoansModule from '../components/loans/LoansModule';
import CollectionsModule from '../components/collections/CollectionsModule';
import PaymentsModule from '../components/payments/PaymentsModule';
import CreditSimulatorModule from '../components/credit-simulator/CreditSimulatorModule';
import CreditFormModule from '../components/credit-form/CreditFormModule';
import ChatModule from '../components/chat/ChatModule';
import ContractModule from '../components/contracts/ContractModule';
import Layout from '../components/layout/Layout';
import { Loader2 } from 'lucide-react';

const AgentApp = () => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center">
          <img src="/logo-bochel.png?v=3" alt="Bochel Microcrédito" className="h-16 md:h-20 object-contain mb-4 animate-pulse" />
          <div className="w-8 h-8 border-3 border-gray-200 border-t-[#1b5e20] rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  // Agent must be authenticated with role 'agente'
  // They enter through the unified login at /gestor, which redirects them here
  if (!isAuthenticated || user?.role !== 'agente') {
    return <Navigate to="/" replace />;
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/agente/dashboard" replace />} />
        <Route path="/dashboard" element={<AgentDashboard />} />
        <Route path="/credit-requests/*" element={<CreditRequestManager />} />
        <Route path="/clientes/*" element={<ClientsModule />} />
        <Route path="/emprestimos/*" element={<LoansModule />} />
        <Route path="/cobrancas/*" element={<CollectionsModule />} />
        <Route path="/pagamentos/*" element={<PaymentsModule />} />
        <Route path="/credit-simulator/*" element={<CreditSimulatorModule />} />
        <Route path="/credit-form/*" element={<CreditFormModule />} />
        <Route path="/chat/*" element={<ChatModule />} />
        <Route path="/contratos/*" element={<ContractModule />} />
        <Route path="*" element={<Navigate to="/agente/dashboard" replace />} />
      </Routes>
    </Layout>
  );
};

export default AgentApp;
