import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import GestorLoginForm from '../components/auth/GestorLoginForm';
import Dashboard from '../components/dashboard/Dashboard';
import UserManagementModule from '../components/users/UserManagementModule';
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
import CreditSimulatorModule from '../components/credit-simulator/CreditSimulatorModule';
import CreditFormModule from '../components/credit-form/CreditFormModule';
import SubsystemsControl from '../components/admin/SubsystemsControl';
import CashFlowModule from '../components/cashflow/CashFlowModule';
import ChatModule from '../components/chat/ChatModule';
import ContractModule from '../components/contracts/ContractModule';
import NotificationsModule from '../components/notifications/NotificationsModule';
import Layout from '../components/layout/Layout';
import { Loader2 } from 'lucide-react';

const GestorApp = () => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-pulse flex flex-col items-center">
          <img src="/logo-bochel.png?v=3" alt="Bochel Microcrédito" className="h-16 md:h-20 object-contain mb-4" />
          <div className="w-12 h-1 bg-gray-200 mt-4 rounded overflow-hidden">
            <div className="h-full bg-[#1b5e20] w-full" style={{ animation: 'progress 1.5s infinite ease-in-out' }}></div>
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

  if (!isAuthenticated || user?.role !== 'gestor') {
    return <GestorLoginForm />;
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/gestor/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/usuarios/*" element={<UserManagementModule />} />
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
        <Route path="/credit-simulator/*" element={<CreditSimulatorModule />} />
        <Route path="/credit-form/*" element={<CreditFormModule />} />
        <Route path="/subsistemas/*" element={<SubsystemsControl />} />
        <Route path="/cashflow/*" element={<CashFlowModule />} />
        <Route path="/notifications/*" element={<NotificationsModule />} />
        <Route path="/chat/*" element={<ChatModule />} />
        <Route path="/contratos/*" element={<ContractModule />} />
        <Route path="*" element={<Navigate to="/gestor/dashboard" replace />} />
      </Routes>
    </Layout>
  );
};

export default GestorApp;
