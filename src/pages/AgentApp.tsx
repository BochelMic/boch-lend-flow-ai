import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import AgentLoginForm from '../components/auth/AgentLoginForm';
import AgentDashboard from '../components/dashboard/AgentDashboard';
import CreditRequestManager from '../components/credit-requests/CreditRequestManager';
import ClientsModule from '../components/clients/ClientsModule';
import LoansModule from '../components/loans/LoansModule';
import CollectionsModule from '../components/collections/CollectionsModule';
import PaymentsModule from '../components/payments/PaymentsModule';
import CreditSimulatorModule from '../components/credit-simulator/CreditSimulatorModule';
import CreditFormModule from '../components/credit-form/CreditFormModule';
import ChatModule from '../components/chat/ChatModule';
import Layout from '../components/layout/Layout';
import { Loader2 } from 'lucide-react';

const AgentApp = () => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'agente') {
    return <AgentLoginForm />;
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
        <Route path="*" element={<Navigate to="/agente/dashboard" replace />} />
      </Routes>
    </Layout>
  );
};

export default AgentApp;
