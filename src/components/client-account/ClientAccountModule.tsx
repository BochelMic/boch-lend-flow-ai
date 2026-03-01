
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, CreditCard, Phone, Mail, MapPin, RefreshCw, MessageCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface ClientData {
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  id_number: string | null;
  status: string;
}

const ClientAccountModule = () => {
  const { user } = useAuth();
  const [clientData, setClientData] = useState<ClientData | null>(null);
  const [stats, setStats] = useState({ totalLoans: 0, activeLoans: 0, totalBorrowed: 0, totalPaid: 0, currentDebt: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // Client profile
      const { data: client } = await supabase.from('clients').select('*').eq('user_id', user.id).single();

      if (client) {
        setClientData({
          name: client.name, email: client.email, phone: client.phone,
          address: client.address, id_number: client.id_number, status: client.status,
        });
      } else {
        // Fallback to profiles
        const { data: profile } = await supabase.from('profiles').select('name, email').eq('user_id', user.id).single();
        setClientData({
          name: profile?.name || user.name, email: profile?.email || user.email,
          phone: null, address: null, id_number: null, status: 'active',
        });
      }

      // Loan stats
      const { data: loans } = await supabase.from('loans').select('amount, total_amount, remaining_amount, status')
        .or(`client_id.eq.${user.id},client_id.in.(select id from clients where user_id = '${user.id}')`);

      const clientLoans = loans || [];

      // Also try fetching loans where client name matches
      const { data: clientRecord } = await supabase.from('clients').select('id').eq('user_id', user.id).single();
      let allLoans = clientLoans;

      if (clientRecord) {
        const { data: loansByClientId } = await supabase.from('loans').select('amount, total_amount, remaining_amount, status').eq('client_id', clientRecord.id);
        if (loansByClientId && loansByClientId.length > 0) {
          allLoans = loansByClientId;
        }
      }

      const totalBorrowed = allLoans.reduce((s, l) => s + (l.amount || 0), 0);
      const totalDebt = allLoans.filter(l => l.status === 'active' || l.status === 'overdue').reduce((s, l) => s + (l.remaining_amount || 0), 0);
      const totalPaid = totalBorrowed - totalDebt;

      setStats({
        totalLoans: allLoans.length,
        activeLoans: allLoans.filter(l => l.status === 'active' || l.status === 'overdue').length,
        totalBorrowed,
        totalPaid: Math.max(totalPaid, 0),
        currentDebt: totalDebt,
      });
    } catch (e) {
      console.error('Error loading client data:', e);
    } finally {
      setLoading(false);
    }
  };

  const fmt = (v: number) => v.toLocaleString('pt-MZ', { minimumFractionDigits: 0 });

  if (loading) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center min-h-[40vh]">
        <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Minha Conta</h1>
          <p className="text-muted-foreground text-sm">Informações pessoais e dados de crédito</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Info */}
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="h-5 w-5 text-[#1b5e20]" />
                Informações Pessoais
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Nome</label>
                  <p className="font-medium mt-0.5">{clientData?.name || '—'}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Documento (BI)</label>
                  <p className="font-medium mt-0.5">{clientData?.id_number || 'Não informado'}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Email</label>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                    <p className="font-medium">{clientData?.email || 'Não informado'}</p>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Telefone</label>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                    <p className="font-medium">{clientData?.phone || 'Não informado'}</p>
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Endereço</label>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                    <p className="font-medium">{clientData?.address || 'Não informado'}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Credit Info */}
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <CreditCard className="h-5 w-5 text-[#1b5e20]" />
                Informações de Crédito
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <p className="text-xs text-muted-foreground">Total Empréstimos</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalLoans}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <p className="text-xs text-muted-foreground">Ativos</p>
                  <p className="text-2xl font-bold text-[#1b5e20]">{stats.activeLoans}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <p className="text-xs text-muted-foreground">Emprestado</p>
                  <p className="text-lg font-bold text-gray-700">{fmt(stats.totalBorrowed)} MZN</p>
                </div>
                <div className="bg-green-50 rounded-xl p-4 text-center">
                  <p className="text-xs text-green-700">Pago</p>
                  <p className="text-lg font-bold text-green-700">{fmt(stats.totalPaid)} MZN</p>
                </div>
                <div className={`rounded-xl p-4 text-center ${stats.currentDebt > 0 ? 'bg-orange-50' : 'bg-green-50'}`}>
                  <p className={`text-xs ${stats.currentDebt > 0 ? 'text-orange-700' : 'text-green-700'}`}>Dívida Atual</p>
                  <p className={`text-lg font-bold ${stats.currentDebt > 0 ? 'text-orange-700' : 'text-green-700'}`}>{fmt(stats.currentDebt)} MZN</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <p className="text-xs text-muted-foreground">Status</p>
                  <Badge className={clientData?.status === 'active' ? 'bg-green-100 text-green-800 mt-1' : 'bg-red-100 text-red-800 mt-1'}>
                    {clientData?.status === 'active' ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-base">Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {stats.currentDebt === 0 ? (
                <Link to="/credit-form">
                  <Button className="w-full text-white font-semibold" style={{ backgroundColor: '#d37c22' }}>
                    Solicitar Novo Crédito
                  </Button>
                </Link>
              ) : (
                <Button className="w-full" disabled variant="outline">
                  Quite a dívida para novo crédito
                </Button>
              )}
              <Link to="/historico">
                <Button className="w-full mt-2" variant="outline">Ver Histórico</Button>
              </Link>
              <Link to="/pedidos">
                <Button className="w-full mt-2" variant="outline">Meus Pedidos</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-base">Suporte</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground">Precisa de ajuda?</p>
              <Link to="/chat">
                <Button variant="outline" size="sm" className="w-full">
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Contactar Suporte
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ClientAccountModule;
