
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import LoginForm from '../components/auth/LoginForm';
import Dashboard from '../components/dashboard/Dashboard';
import AdminModule from '../components/admin/AdminModule';
import CreditModule from '../components/credit/CreditModule';
import LegalModule from '../components/legal/LegalModule';
import OperationsModule from '../components/operations/OperationsModule';
import MarketingModule from '../components/marketing/MarketingModule';
import CreditSimulatorModule from '../components/credit-simulator/CreditSimulatorModule';
import ReportsModule from '../components/reports/ReportsModule';
import BankReportModule from '../components/bank-report/BankReportModule';
import SettingsModule from '../components/settings/SettingsModule';
import ExpensesModule from '../components/expenses/ExpensesModule';
import CollectionModule from '../components/collection/CollectionModule';
import NotificationsModule from '../components/notifications/NotificationsModule';
import AuditModule from '../components/audit/AuditModule';
import CashFlowModule from '../components/cashflow/CashFlowModule';
import BalanceModule from '../components/balance/BalanceModule';
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

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        
        {/* Rotas para Gestor */}
        {hasPermission('all') && (
          <>
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
          </>
        )}
        
        {/* Rotas para Agente */}
        {hasPermission('clientes') && (
          <Route path="/clientes/*" element={<ClientsModule />} />
        )}
        {hasPermission('emprestimos') && (
          <Route path="/emprestimos/*" element={<LoansModule />} />
        )}
        {hasPermission('cobrancas') && (
          <Route path="/cobrancas/*" element={<CollectionsModule />} />
        )}
        {hasPermission('pagamentos') && (
          <Route path="/pagamentos/*" element={<PaymentsModule />} />
        )}
        
        {/* Rotas para Cliente */}
        {hasPermission('conta') && (
          <Route path="/conta/*" element={<ClientAccountModule />} />
        )}
        {hasPermission('historico') && (
          <Route path="/historico/*" element={<ClientHistoryModule />} />
        )}
        {hasPermission('pedidos') && (
          <Route path="/pedidos/*" element={<ClientRequestsModule />} />
        )}
        
        {/* Rotas compartilhadas */}
        <Route path="/credit-simulator/*" element={<CreditSimulatorModule />} />
        <Route path="/credit-form/*" element={<CreditFormModule />} />
        
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Layout>
  );
};

export default Index;
