import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

interface Loan {
  id: string;
  clientId: string;
  status: 'pending' | 'approved' | 'active' | 'completed' | 'rejected';
  amount: number;
  remainingAmount: number;
}

export const useClientAccess = () => {
  const { user } = useAuth();
  const [hasActiveLoan, setHasActiveLoan] = useState(false);
  const [clientStatus, setClientStatus] = useState<'active' | 'limited' | 'blocked'>('blocked');
  const [currentLoan, setCurrentLoan] = useState<Loan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role === 'cliente') {
      checkClientStatus();
    } else {
      setLoading(false);
    }
  }, [user]);

  const checkClientStatus = () => {
    if (!user) {
      setLoading(false);
      return;
    }

    const loans = JSON.parse(localStorage.getItem('loans') || '[]');
    const clientLoans = loans.filter((loan: Loan) => loan.clientId === user.id);
    
    // Verificar se tem empréstimo ativo ou aprovado
    const activeLoan = clientLoans.find(
      (loan: Loan) => loan.status === 'active' || loan.status === 'approved'
    );
    
    // Verificar se tem empréstimo pendente
    const pendingLoan = clientLoans.find(
      (loan: Loan) => loan.status === 'pending'
    );
    
    // Verificar histórico de empréstimos completados
    const hasCompletedLoans = clientLoans.some(
      (loan: Loan) => loan.status === 'completed'
    );

    if (activeLoan) {
      setHasActiveLoan(true);
      setCurrentLoan(activeLoan);
      setClientStatus('active');
    } else if (pendingLoan) {
      setHasActiveLoan(false);
      setCurrentLoan(pendingLoan);
      setClientStatus('limited');
    } else if (hasCompletedLoans) {
      // Cliente terminou de pagar - acesso limitado
      setHasActiveLoan(false);
      setCurrentLoan(null);
      setClientStatus('limited');
    } else {
      // Novo cliente ou sem empréstimos
      setHasActiveLoan(false);
      setCurrentLoan(null);
      setClientStatus('blocked');
    }

    setLoading(false);
  };

  const canAccessFullFeatures = () => {
    return clientStatus === 'active';
  };

  const canViewHistory = () => {
    return clientStatus === 'active' || clientStatus === 'limited';
  };

  const canRequestNewLoan = () => {
    // Só pode pedir novo empréstimo se não tiver empréstimo ativo
    return clientStatus === 'limited' || clientStatus === 'blocked';
  };

  return {
    hasActiveLoan,
    clientStatus,
    currentLoan,
    loading,
    canAccessFullFeatures,
    canViewHistory,
    canRequestNewLoan,
    refreshStatus: checkClientStatus
  };
};
