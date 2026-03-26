import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import GestorLoginForm from '../components/auth/GestorLoginForm';
import Dashboard from '../components/dashboard/Dashboard';
import CreditRequestManager from '../components/credit-requests/CreditRequestManager';
import AdminModule from '../components/admin/AdminModule';
import ClientsModule from '../components/clients/ClientsModule';
import LoansModule from '../components/loans/LoansModule';
import CollectionsModule from '../components/collections/CollectionsModule';
import CashierModule from '../components/cashier/CashierModule';
import AgentsModule from '../components/agents/AgentsModule';
import AuditModule from '../components/audit/AuditModule';
import ReportsModule from '../components/reports/ReportsModule';
import BankReportModule from '../components/bank-report/BankReportModule';
import SettingsModule from '../components/settings/SettingsModule';
import CreditFormModule from '../components/credit-form/CreditFormModule';
import SubsystemsControl from '../components/admin/SubsystemsControl';
import CashFlowModule from '../components/cashflow/CashFlowModule';
import ChatModule from '../components/chat/ChatModule';
import ContractModule from '../components/contracts/ContractModule';
import DocumentGenerator from '../components/documents/DocumentGenerator';
import PaymentsModule from '../components/payments/PaymentsModule';
import NotificationsModule from '../components/notifications/NotificationsModule';
import Layout from '../components/layout/Layout';
import { Loader2 } from 'lucide-react';

const GestorApp = () => {
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

  // If authenticated as agente, redirect to agent panel
  if (isAuthenticated && user?.role === 'agente') {
    return <Navigate to="/agente" replace />;
  }

  // If not authenticated or not gestor, check secret access
  if (!isAuthenticated || user?.role !== 'gestor') {
    const hasSecretAccess = sessionStorage.getItem('secretAccess') === 'internal';
    if (!hasSecretAccess) {
      return <Navigate to="/" replace />;
    }
    return <GestorLoginForm />;
  }

  // Authenticated as gestor — clear flag and show dashboard
  sessionStorage.removeItem('secretAccess');

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/gestor/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/credit-requests/*" element={<CreditRequestManager />} />
        <Route path="/admin/*" element={<AdminModule />} />
        <Route path="/clientes/*" element={<ClientsModule />} />
        <Route path="/emprestimos/*" element={<LoansModule />} />
        <Route path="/cobrancas/*" element={<CollectionsModule />} />
        <Route path="/caixa/*" element={<CashierModule />} />
        <Route path="/agentes/*" element={<AgentsModule />} />
        <Route path="/audit/*" element={<AuditModule />} />
        <Route path="/reports/*" element={<ReportsModule />} />
        <Route path="/bank-report/*" element={<BankReportModule />} />
        <Route path="/settings/*" element={<SettingsModule />} />
        <Route path="/credit-form/*" element={<CreditFormModule />} />
        <Route path="/subsistemas/*" element={<SubsystemsControl />} />
        <Route path="/notifications/*" element={<NotificationsModule />} />
        <Route path="/chat/*" element={<ChatModule />} />
        <Route path="/contratos/*" element={<ContractModule />} />
        <Route path="/faturas/*" element={<DocumentGenerator />} />
        <Route path="/pagamentos/*" element={<PaymentsModule />} />
        <Route path="*" element={<Navigate to="/gestor/dashboard" replace />} />
      </Routes>
    </Layout>
  );
};

export default GestorApp;
