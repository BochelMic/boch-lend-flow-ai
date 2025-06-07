
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
import Layout from '../components/layout/Layout';

const Index = () => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admin/*" element={<AdminModule />} />
        <Route path="/credit/*" element={<CreditModule />} />
        <Route path="/credit-simulator/*" element={<CreditSimulatorModule />} />
        <Route path="/legal/*" element={<LegalModule />} />
        <Route path="/operations/*" element={<OperationsModule />} />
        <Route path="/marketing/*" element={<MarketingModule />} />
        <Route path="/reports/*" element={<ReportsModule />} />
        <Route path="/bank-report/*" element={<BankReportModule />} />
        <Route path="/settings/*" element={<SettingsModule />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Layout>
  );
};

export default Index;
