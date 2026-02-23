import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import ClientLoginForm from '../components/auth/ClientLoginForm';
import ClientDashboard from '../components/dashboard/ClientDashboard';
import ClientAccountModule from '../components/client-account/ClientAccountModule';
import ClientHistoryModule from '../components/client-history/ClientHistoryModule';
import ClientRequestsModule from '../components/client-requests/ClientRequestsModule';
import CreditFormModule from '../components/credit-form/CreditFormModule';
import ChatModule from '../components/chat/ChatModule';
import Layout from '../components/layout/Layout';
import { Loader2 } from 'lucide-react';

const ClientApp = () => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'cliente') {
    return <ClientLoginForm />;
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
        <Route path="*" element={<Navigate to="/dashboard-cliente" replace />} />
      </Routes>
    </Layout>
  );
};

export default ClientApp;
