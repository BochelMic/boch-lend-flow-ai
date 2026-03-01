
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { RefreshCw } from 'lucide-react';
import CreditApplicationForm from './CreditApplicationForm';
import CreditRequestForm from '../credit-requests/CreditRequestForm';
import CreditRequestManager from '../credit-requests/CreditRequestManager';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

const CreditFormModule = () => {
  const { user } = useAuth();
  const isGestor = user?.role === 'gestor';
  const isAgent = user?.role === 'agente';
  const [hasCompletedProfile, setHasCompletedProfile] = useState<boolean | null>(null);
  const [hasDebt, setHasDebt] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) checkClientStatus();
    else setLoading(false);
  }, [user]);

  const checkClientStatus = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // Check if client has a complete profile (id_number = completed full form)
      const { data: client } = await supabase
        .from('clients')
        .select('id, id_number, phone, address')
        .eq('user_id', user.id)
        .single();

      if (client) {
        setHasCompletedProfile(!!(client.id_number && client.phone));

        // Check if they have active debt
        const { data: activeLoans } = await supabase
          .from('loans')
          .select('remaining_amount')
          .eq('client_id', client.id)
          .in('status', ['active', 'overdue']);

        const totalDebt = (activeLoans || []).reduce((s, l) => s + (l.remaining_amount || 0), 0);
        setHasDebt(totalDebt > 0);
      } else {
        setHasCompletedProfile(false);
        setHasDebt(false);
      }
    } catch (e) {
      console.error('Error checking client status:', e);
      setHasCompletedProfile(false);
    } finally {
      setLoading(false);
    }
  };

  // Gestor and Agent: always show the manager + simple form
  if (isGestor || isAgent) {
    return (
      <div className="container mx-auto p-4 md:p-6 space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Pedidos de Crédito</h1>
          <p className="text-muted-foreground text-sm">Gerencie pedidos de crédito</p>
        </div>
        <CreditRequestManager />
      </div>
    );
  }

  // Client: check loading
  if (loading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
  }

  // Client has debt: show message
  if (hasDebt) {
    return (
      <div className="max-w-lg mx-auto p-6">
        <Card className="border-0 shadow-xl overflow-hidden">
          <div className="h-2 bg-amber-400" />
          <CardContent className="p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto text-3xl">⚠️</div>
            <h2 className="text-xl font-bold text-gray-900">Crédito Indisponível</h2>
            <p className="text-sm text-gray-500">
              Só poderá solicitar um novo crédito após quitar toda a dívida actual.
              Entre em contacto com o suporte para mais informações.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Client first-time: show full wizard form
  if (!hasCompletedProfile) {
    return <CreditApplicationForm />;
  }

  // Client repeat: show simple form  
  return <CreditRequestForm />;
};

export default CreditFormModule;
