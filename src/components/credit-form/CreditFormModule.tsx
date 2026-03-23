import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { RefreshCw, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CreditApplicationForm from './CreditApplicationForm';
import CreditRequestForm from '../credit-requests/CreditRequestForm';
import CreditRequestManager from '../credit-requests/CreditRequestManager';
import CreditSimulatorModule from '../credit-simulator/CreditSimulatorModule';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useLocation } from 'react-router-dom';

const CreditFormModule = () => {
  const { user } = useAuth();
  const location = useLocation();
  const isGestor = user?.role === 'gestor';
  const isAgent = user?.role === 'agente';

  const [hasCompletedProfile, setHasCompletedProfile] = useState<boolean | null>(null);
  const [hasDebt, setHasDebt] = useState(false);
  const [loading, setLoading] = useState(true);

  // Simulation Flow State
  const [flowStep, setFlowStep] = useState<'simulate' | 'apply'>(() => {
    // If coming from landing page with state, skip to apply
    return location.state ? 'apply' : 'simulate';
  });
  const [simulationData, setSimulationData] = useState<any>(location.state || null);

  useEffect(() => {
    if (user) checkClientStatus();
    else setLoading(false);
  }, [user]);

  const checkClientStatus = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data: client } = await supabase
        .from('clients')
        .select('id, id_number, phone, address, agent_id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (client) {
        setHasCompletedProfile(!!(client.id_number && client.phone));

        // Merge agent_id into simulationData for better propagation
        if (client.agent_id) {
          setSimulationData((prev: any) => ({
            ...(prev || {}),
            agentId: client.agent_id
          }));
        }

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

  const handleSimulationApply = (data: any) => {
    setSimulationData(data);
    setFlowStep('apply');
  };

  const handleGoBack = () => {
    setFlowStep('simulate');
  };

  // Only restrict Gestor/Agent if NOT starting a new application flow (no location.state)
  if ((isGestor || isAgent) && !location.state && flowStep === 'simulate' && !simulationData) {
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

  if (loading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
  }

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

  // Step 1: Simulation (Mandatory)
  if (flowStep === 'simulate') {
    return (
      <div className="space-y-6">
        <div className="bg-white p-4 border-b flex items-center justify-between sticky top-0 z-10 shadow-sm">
          <div>
            <h2 className="text-xl font-bold text-[#1a3a5c]">Passo 1: Simulação</h2>
            <p className="text-xs text-gray-500">Entenda as opções A, B e C antes de solicitar</p>
          </div>
        </div>
        <CreditSimulatorModule onApply={handleSimulationApply} />
      </div>
    );
  }

  // Step 2: Application Form
  return (
    <div className="space-y-4">
      <div className="bg-white p-4 border-b flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={handleGoBack} className="text-gray-500 hover:text-[#1a3a5c]">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para Simulação
        </Button>
      </div>

      {!hasCompletedProfile ? (
        <CreditApplicationForm initialData={simulationData} />
      ) : (
        <CreditRequestForm initialData={simulationData} />
      )}
    </div>
  );
};

export default CreditFormModule;
