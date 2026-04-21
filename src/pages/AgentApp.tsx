import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Layout from '../components/layout/Layout';
import { Loader2 } from 'lucide-react';

const AgentDashboard = lazy(() => import('../components/dashboard/AgentDashboard'));
const CreditRequestManager = lazy(() => import('../components/credit-requests/CreditRequestManager'));
const ClientsModule = lazy(() => import('../components/clients/ClientsModule'));
const LoansModule = lazy(() => import('../components/loans/LoansModule'));
const CollectionsModule = lazy(() => import('../components/collections/CollectionsModule'));
const PaymentsModule = lazy(() => import('../components/payments/PaymentsModule'));
const CreditSimulatorModule = lazy(() => import('../components/credit-simulator/CreditSimulatorModule'));
const CreditFormModule = lazy(() => import('../components/credit-form/CreditFormModule'));
const SettingsModule = lazy(() => import('../components/settings/SettingsModule'));
const ChatModule = lazy(() => import('../components/chat/ChatModule'));
const ContractModule = lazy(() => import('../components/contracts/ContractModule'));

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
      <Suspense fallback={
        <div className="flex h-[80vh] w-full items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#1b5e20]" />
        </div>
      }>
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
      </Suspense>
    </Layout>
  );
};

export default AgentApp;
