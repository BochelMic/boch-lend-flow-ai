import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import GestorLoginForm from '../components/auth/GestorLoginForm';
import Layout from '../components/layout/Layout';
import { Loader2 } from 'lucide-react';

const Dashboard = lazy(() => import('../components/dashboard/Dashboard'));
const CreditRequestManager = lazy(() => import('../components/credit-requests/CreditRequestManager'));
const AdminModule = lazy(() => import('../components/admin/AdminModule'));
const ClientsModule = lazy(() => import('../components/clients/ClientsModule'));
const LoansModule = lazy(() => import('../components/loans/LoansModule'));
const CollectionsModule = lazy(() => import('../components/collections/CollectionsModule'));
const CashierModule = lazy(() => import('../components/cashier/CashierModule'));
const AgentsModule = lazy(() => import('../components/agents/AgentsModule'));
const AuditModule = lazy(() => import('../components/audit/AuditModule'));
const ReportsModule = lazy(() => import('../components/reports/ReportsModule'));
const BankReportModule = lazy(() => import('../components/bank-report/BankReportModule'));
const SettingsModule = lazy(() => import('../components/settings/SettingsModule'));
const CreditFormModule = lazy(() => import('../components/credit-form/CreditFormModule'));
const SubsystemsControl = lazy(() => import('../components/admin/SubsystemsControl'));
const ChatModule = lazy(() => import('../components/chat/ChatModule'));
const ContractModule = lazy(() => import('../components/contracts/ContractModule'));
const DocumentGenerator = lazy(() => import('../components/documents/DocumentGenerator'));
const PaymentsModule = lazy(() => import('../components/payments/PaymentsModule'));
const NotificationsModule = lazy(() => import('../components/notifications/NotificationsModule'));

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
      <Suspense fallback={
        <div className="flex h-[80vh] w-full items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#1b5e20]" />
        </div>
      }>
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
      </Suspense>
    </Layout>
  );
};

export default GestorApp;
