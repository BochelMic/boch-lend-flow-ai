
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, FileText, Clock, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface CreditRequest {
  id: string;
  client_name: string;
  amount: number;
  purpose: string | null;
  term: number | null;
  status: string;
  created_at: string;
}

const ClientRequestsModule = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<CreditRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasDebt, setHasDebt] = useState(true);
  const [hasCompletedProfile, setHasCompletedProfile] = useState(false);

  useEffect(() => {
    if (user) loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // Fetch credit requests
      const { data: reqs } = await supabase
        .from('credit_requests')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      setRequests(reqs || []);

      // Check if has debt (to control new credit button)
      const { data: client } = await supabase.from('clients').select('id').eq('user_id', user.id).single();
      if (client) {
        const { data: activeLoans } = await supabase
          .from('loans')
          .select('remaining_amount')
          .eq('client_id', client.id)
          .in('status', ['active', 'overdue']);

        const totalDebt = (activeLoans || []).reduce((s, l) => s + (l.remaining_amount || 0), 0);
        setHasDebt(totalDebt > 0);

        // Check if client has full profile (id_number filled = completed full form)
        const { data: clientInfo } = await supabase.from('clients').select('id_number, phone, address').eq('user_id', user.id).single();
        setHasCompletedProfile(!!(clientInfo?.id_number && clientInfo?.phone));
      } else {
        setHasDebt(false);
        setHasCompletedProfile(false);
      }
    } catch (e) {
      console.error('Error loading requests:', e);
    } finally {
      setLoading(false);
    }
  };

  const fmt = (v: number) => v.toLocaleString('pt-MZ', { minimumFractionDigits: 0 });
  const formatDate = (d: string) => new Date(d).toLocaleDateString('pt-MZ');

  const getStatusBadge = (status: string) => {
    const map: Record<string, { label: string; cls: string; icon: React.ReactNode }> = {
      pending: { label: 'Em Análise', cls: 'bg-yellow-100 text-yellow-800', icon: <Clock className="h-3 w-3" /> },
      approved: { label: 'Aprovado', cls: 'bg-green-100 text-green-800', icon: <CheckCircle className="h-3 w-3" /> },
      rejected: { label: 'Rejeitado', cls: 'bg-red-100 text-red-800', icon: <XCircle className="h-3 w-3" /> },
    };
    const s = map[status] || { label: status, cls: 'bg-gray-100 text-gray-800', icon: <FileText className="h-3 w-3" /> };
    return (
      <Badge className={s.cls}>
        <span className="flex items-center gap-1">{s.icon}{s.label}</span>
      </Badge>
    );
  };

  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    approved: requests.filter(r => r.status === 'approved').length,
    rejected: requests.filter(r => r.status === 'rejected').length,
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center min-h-[40vh]">
        <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
  }

  // Determine which form to show:
  // - First time (no completed profile): full form (CreditApplicationForm)
  // - Repeat (has profile): simple form (CreditRequestForm via /credit-form tab)
  const creditFormPath = '/credit-form';

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Meus Pedidos</h1>
          <p className="text-sm text-muted-foreground">Acompanhe seus pedidos de crédito</p>
        </div>
        {!hasDebt ? (
          <Link to={creditFormPath}>
            <Button className="text-white font-semibold" style={{ backgroundColor: '#d37c22' }}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Pedido
            </Button>
          </Link>
        ) : (
          <Button disabled variant="outline" title="Quite a dívida actual para solicitar novo crédito">
            <Plus className="mr-2 h-4 w-4" />
            Novo Pedido
          </Button>
        )}
      </div>

      {hasDebt && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
          ⚠️ Só poderá solicitar novo crédito após quitar toda a dívida actual.
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground">Total</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 text-center">
            <p className="text-xs text-yellow-700">Em Análise</p>
            <p className="text-2xl font-bold text-yellow-700">{stats.pending}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 text-center">
            <p className="text-xs text-green-700">Aprovados</p>
            <p className="text-2xl font-bold text-green-700">{stats.approved}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 text-center">
            <p className="text-xs text-red-600">Rejeitados</p>
            <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
          </CardContent>
        </Card>
      </div>

      {/* Requests List */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">Todos</TabsTrigger>
          <TabsTrigger value="pending">Em Análise</TabsTrigger>
          <TabsTrigger value="approved">Aprovados</TabsTrigger>
          <TabsTrigger value="rejected">Rejeitados</TabsTrigger>
        </TabsList>

        {['all', 'pending', 'approved', 'rejected'].map(tab => {
          const filtered = tab === 'all' ? requests : requests.filter(r => r.status === tab);
          return (
            <TabsContent key={tab} value={tab}>
              {filtered.length === 0 ? (
                <Card className="border-0 shadow-md">
                  <CardContent className="py-12 text-center text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-3 opacity-40" />
                    <p>Nenhum pedido encontrado</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {filtered.map(req => (
                    <Card key={req.id} className="border-0 shadow-md">
                      <CardContent className="p-4 md:p-6">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="font-semibold text-lg">{fmt(req.amount)} MZN</p>
                            <p className="text-xs text-muted-foreground">{formatDate(req.created_at)} {req.term ? `• ${req.term} meses` : ''}</p>
                          </div>
                          {getStatusBadge(req.status)}
                        </div>
                        {req.purpose && (
                          <p className="text-sm text-muted-foreground">{req.purpose}</p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
};

export default ClientRequestsModule;
