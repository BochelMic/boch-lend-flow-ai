import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Loader2 } from 'lucide-react';
import Layout from '../components/layout/Layout';

// Lazy-load all route modules — reduces initial bundle significantly
const ClientLoginForm = lazy(() => import('../components/auth/ClientLoginForm'));
const ClientDashboard = lazy(() => import('../components/dashboard/ClientDashboard'));
const ClientAccountModule = lazy(() => import('../components/client-account/ClientAccountModule'));
const ClientHistoryModule = lazy(() => import('../components/client-history/ClientHistoryModule'));
const ClientRequestsModule = lazy(() => import('../components/client-requests/ClientRequestsModule'));
const CreditFormModule = lazy(() => import('../components/credit-form/CreditFormModule'));
const ChatModule = lazy(() => import('../components/chat/ChatModule'));
const ContractModule = lazy(() => import('../components/contracts/ContractModule'));
const ClientPaymentsModule = lazy(() => import('../components/client-payments/ClientPaymentsModule'));
const LandingPage = lazy(() => import('./LandingPage'));
const RegisterForm = lazy(() => import('../components/auth/RegisterForm'));
const PrivacyPolicy = lazy(() => import('./PrivacyPolicy'));
const TermsOfUse = lazy(() => import('./TermsOfUse'));

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <Loader2 className="h-7 w-7 animate-spin text-[#1b5e20]" />
  </div>
);

const ClientApp = () => {
  const { isAuthenticated, user, loading } = useAuth();
  const navigate = useNavigate();

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

  if (!isAuthenticated || user?.role !== 'cliente') {
    return (
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<ClientLoginForm />} />
          <Route path="/register" element={<RegisterForm onSwitchToLogin={() => navigate('/login')} />} />
          <Route path="/politicas-de-privacidade" element={<PrivacyPolicy />} />
          <Route path="/termos-de-uso" element={<TermsOfUse />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    );
  }

  return (
    <Layout>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard-cliente" replace />} />
          <Route path="/dashboard-cliente" element={<ClientDashboard />} />
          <Route path="/conta/*" element={<ClientAccountModule />} />
          <Route path="/historico/*" element={<ClientHistoryModule />} />
          <Route path="/pedidos/*" element={<ClientRequestsModule />} />
          <Route path="/credit-form/*" element={<CreditFormModule />} />
          <Route path="/chat/*" element={<ChatModule />} />
          <Route path="/contratos/*" element={<ContractModule />} />
          <Route path="/pagamentos/*" element={<ClientPaymentsModule />} />
          <Route path="*" element={<Navigate to="/dashboard-cliente" replace />} />
        </Routes>
      </Suspense>
    </Layout>
  );
};

export default ClientApp;
