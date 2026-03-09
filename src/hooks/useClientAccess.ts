import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';

interface Loan {
  id: string;
  client_id: string;
  status: string;
  amount: number;
  remaining_amount: number;
  total_amount: number;
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

  const checkClientStatus = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      // Encontrar o client record associado a este user_id
      const { data: clientRecord } = await supabase
        .from('clients')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!clientRecord) {
        // Cliente sem registro, acesso bloqueado
        setHasActiveLoan(false);
        setCurrentLoan(null);
        setClientStatus('blocked');
        setLoading(false);
        return;
      }

      // Buscar empréstimos do cliente
      const { data: loans } = await supabase
        .from('loans')
        .select('*')
        .eq('client_id', clientRecord.id);

      const clientLoans = loans || [];

      // Verificar se tem empréstimo ativo ou aprovado
      const activeLoan = clientLoans.find(
        (loan) => loan.status === 'active' || loan.status === 'approved'
      );

      // Verificar se tem empréstimo pendente
      const pendingLoan = clientLoans.find(
        (loan) => loan.status === 'pending'
      );

      // Verificar histórico de empréstimos completados
      const hasCompletedLoans = clientLoans.some(
        (loan) => loan.status === 'completed'
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
        setHasActiveLoan(false);
        setCurrentLoan(null);
        setClientStatus('limited');
      } else {
        setHasActiveLoan(false);
        setCurrentLoan(null);
        setClientStatus('blocked');
      }
    } catch (error) {
      console.error('Error checking client status:', error);
      setClientStatus('blocked');
    } finally {
      setLoading(false);
    }
  };

  const canAccessFullFeatures = () => {
    return clientStatus === 'active';
  };

  const canViewHistory = () => {
    return clientStatus === 'active' || clientStatus === 'limited';
  };

  const canRequestNewLoan = () => {
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
