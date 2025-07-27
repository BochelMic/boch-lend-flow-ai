
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import LoginForm from '../components/auth/LoginForm';
import Dashboard from '../components/dashboard/Dashboard';
import ClientDashboard from '../components/dashboard/ClientDashboard';
import CreditRequestManager from '../components/credit-requests/CreditRequestManager';
import AgentDashboard from '../components/dashboard/AgentDashboard';
import AdminModule from '../components/admin/AdminModule';
import CreditModule from '../components/credit/CreditModule';
import CreditSimulatorModule from '../components/credit-simulator/CreditSimulatorModule';
import ReportsModule from '../components/reports/ReportsModule';
import BankReportModule from '../components/bank-report/BankReportModule';
import SettingsModule from '../components/settings/SettingsModule';
import NotificationsModule from '../components/notifications/NotificationsModule';
import AuditModule from '../components/audit/AuditModule';
import CashFlowModule from '../components/cashflow/CashFlowModule';
import CreditFormModule from '../components/credit-form/CreditFormModule';
import ClientsModule from '../components/clients/ClientsModule';
import LoansModule from '../components/loans/LoansModule';
import CollectionsModule from '../components/collections/CollectionsModule';
import CashierModule from '../components/cashier/CashierModule';
import AgentsModule from '../components/agents/AgentsModule';
import PaymentsModule from '../components/payments/PaymentsModule';
import ClientAccountModule from '../components/client-account/ClientAccountModule';
import ClientHistoryModule from '../components/client-history/ClientHistoryModule';
import ClientRequestsModule from '../components/client-requests/ClientRequestsModule';
import Layout from '../components/layout/Layout';

const Index = () => {
  const { isAuthenticated, user, hasPermission } = useAuth();

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  // Redirecionar para dashboard específico baseado no papel do usuário
  const getDashboardPath = () => {
    if (!user) return '/dashboard';
    
    switch (user.role) {
      case 'gestor':
        return '/dashboard';
      case 'agente':
        return '/dashboard-agente';
      case 'cliente':
        return '/dashboard-cliente';
      default:
        return '/dashboard';
    }
  };

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to={getDashboardPath()} replace />} />
        
        {/* Dashboards específicos por papel */}
        {hasPermission('all') && <Route path="/dashboard" element={<Dashboard />} />}
        {hasPermission('clientes') && <Route path="/dashboard-agente" element={<AgentDashboard />} />}
        {hasPermission('conta') && <Route path="/dashboard-cliente" element={<ClientDashboard />} />}
        
        {/* Rotas para Gestor - Acesso total */}
        {hasPermission('all') && (
          <>
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
          </>
        )}
        
        {/* Rotas para Agente - Acesso limitado */}
        {hasPermission('clientes') && !hasPermission('all') && (
          <>
            <Route path="/credit-requests/*" element={<CreditRequestManager />} />
            <Route path="/clientes/*" element={<ClientsModule />} />
          </>
        )}
        {hasPermission('emprestimos') && !hasPermission('all') && (
          <Route path="/emprestimos/*" element={<LoansModule />} />
        )}
        {hasPermission('cobrancas') && !hasPermission('all') && (
          <Route path="/cobrancas/*" element={<CollectionsModule />} />
        )}
        {hasPermission('pagamentos') && !hasPermission('all') && (
          <Route path="/pagamentos/*" element={<PaymentsModule />} />
        )}
        {(hasPermission('clientes') || hasPermission('emprestimos')) && !hasPermission('all') && (
          <>
            <Route path="/credit-simulator/*" element={<CreditSimulatorModule />} />
            <Route path="/credit-form/*" element={<CreditFormModule />} />
          </>
        )}
        
        {/* Rotas para Cliente - Acesso restrito */}
        {hasPermission('conta') && !hasPermission('all') && (
          <>
            <Route path="/conta/*" element={<ClientAccountModule />} />
            <Route path="/historico/*" element={<ClientHistoryModule />} />
            <Route path="/pedidos/*" element={<ClientRequestsModule />} />
            <Route path="/credit-form/*" element={<CreditFormModule />} />
          </>
        )}
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to={getDashboardPath()} replace />} />
      </Routes>
    </Layout>
  );
};

export default Index;
