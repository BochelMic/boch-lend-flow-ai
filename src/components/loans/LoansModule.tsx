
import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CreditCard, Search, AlertTriangle, RefreshCw } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';

interface Loan {
  id: string;
  client_id: string;
  client_name?: string;
  amount: number;
  interest_rate: number;
  installments: number;
  total_amount: number;
  remaining_amount: number;
  status: string;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
}

const QUERY_KEY = 'loans';

const processLoan = (l: any): Loan => {
  // Normalise DB status values → canonical app values
  const rawStatus: string = l.status ?? 'pending';
  const normaliseStatus = (s: string): string => {
    if (s === 'active') return 'active';
    if (s === 'completed' || s === 'paid') return 'completed';
    if (s === 'overdue') return 'overdue';
    return 'pending'; // anything else (approved, inactive, pending, etc.)
  };

  let total = Number(l.total_amount);
  let remaining = Number(l.remaining_amount);
  let status = normaliseStatus(rawStatus);

  // Auto-detect overdue: active loan with past due date and remaining balance
  if (l.end_date && remaining > 0 && status === 'active') {
    const end = new Date(l.end_date);
    const today = new Date();
    const diffDays = Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      status = 'overdue';
      const lateDays = Math.abs(diffDays);
      const penalty = remaining * (0.015 * lateDays);
      total += penalty;
      remaining += penalty;
    }
  }

  return {
    id: l.id,
    client_id: l.client_id,
    amount: l.amount,
    interest_rate: l.interest_rate,
    installments: l.installments,
    start_date: l.start_date,
    end_date: l.end_date,
    created_at: l.created_at,
    total_amount: total,
    remaining_amount: remaining,
    status,
    client_name: l.clients?.name || 'Cliente desconhecido',
  };
};

const statusLabel = (status: string) => {
  switch (status) {
    case 'active':    return 'Ativo';
    case 'overdue':   return 'Em Atraso';
    case 'completed': return 'Quitado';
    default:          return 'Pendente';
  }
};

const statusClass = (status: string) => {
  switch (status) {
    case 'active':    return 'bg-green-100 text-green-800';
    case 'overdue':   return 'bg-red-100 text-red-800';
    case 'completed': return 'bg-blue-100 text-blue-800';
    default:          return 'bg-yellow-100 text-yellow-800';
  }
};

const LoansModule = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const isAgent = user?.role === 'agente';

  const { data: loans = [], isLoading: loading, refetch } = useQuery({
    queryKey: [QUERY_KEY, user?.role, user?.id],
    queryFn: async () => {
      // 1. Fetch all loans with client info
      let loansQuery = supabase
        .from('loans')
        .select('id, client_id, amount, interest_rate, installments, total_amount, remaining_amount, status, start_date, end_date, created_at, clients(name, agent_id)')
        .order('created_at', { ascending: false });

      if (isAgent && user?.id) {
        loansQuery = loansQuery.eq('clients.agent_id', user.id);
      }

      const { data: loansData, error: loansError } = await loansQuery;
      if (loansError) throw loansError;

      const processedLoans = (loansData || []).map(processLoan);

      // 2. Fetch ALL clients to find ones without loans (= pendentes)
      let clientsQuery = supabase
        .from('clients')
        .select('id, name, agent_id, created_at')
        .eq('status', 'active');

      if (isAgent && user?.id) {
        clientsQuery = clientsQuery.eq('agent_id', user.id);
      }

      const { data: clientsData } = await clientsQuery;

      // IDs of clients that already have loans
      const clientsWithLoans = new Set(processedLoans.map(l => l.client_id));

      // Create "pending" entries for clients without any loan
      const pendingEntries: Loan[] = (clientsData || [])
        .filter(c => !clientsWithLoans.has(c.id))
        .map(c => ({
          id: `pending-${c.id}`,
          client_id: c.id,
          client_name: c.name,
          amount: 0,
          interest_rate: 0,
          installments: 0,
          total_amount: 0,
          remaining_amount: 0,
          status: 'pending',
          start_date: null,
          end_date: null,
          created_at: c.created_at,
        }));

      setLastRefresh(new Date());
      return [...processedLoans, ...pendingEntries];
    },
    enabled: !!user,
    refetchInterval: 2 * 60 * 1000,
    refetchOnWindowFocus: true,
  });

  // Real-time subscription: loans, payments AND clients table changes
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('loans-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'loans' },
        () => {
          queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'payments' },
        () => {
          queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'clients' },
        () => {
          // New client registered = new pending entry
          queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, queryClient]);

  // Filter: name search + status
  const filteredLoans = loans.filter(loan => {
    const matchesSearch = searchTerm.trim() === '' ||
      (loan.client_name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || loan.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  // Stats
  const stats = {
    total: loans.length,
    active: loans.filter(l => l.status === 'active').length,
    overdue: loans.filter(l => l.status === 'overdue').length,
    pending: loans.filter(l => l.status === 'pending').length,
    completed: loans.filter(l => l.status === 'completed').length,
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-3xl font-bold tracking-tight">
            {isAgent ? 'Empréstimos dos Meus Clientes' : 'Gestão de Empréstimos'}
          </h1>
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            <RefreshCw className="h-3 w-3" />
            Atualizado às {lastRefresh.toLocaleTimeString('pt-MZ', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </div>

      {/* Summary badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Ativos',     count: stats.active,    color: 'text-green-700 bg-green-50 border-green-200' },
          { label: 'Em Atraso',  count: stats.overdue,   color: 'text-red-700 bg-red-50 border-red-200' },
          { label: 'Pendentes',  count: stats.pending,   color: 'text-yellow-700 bg-yellow-50 border-yellow-200' },
          { label: 'Quitados',   count: stats.completed, color: 'text-blue-700 bg-blue-50 border-blue-200' },
        ].map(({ label, count, color }) => (
          <div key={label} className={`border rounded-lg p-3 text-center cursor-pointer hover:opacity-80 transition-opacity ${color}`}
            onClick={() => setFilterStatus(
              label === 'Ativos' ? 'active' :
              label === 'Em Atraso' ? 'overdue' :
              label === 'Pendentes' ? 'pending' : 'completed'
            )}
          >
            <p className="text-2xl font-bold">{count}</p>
            <p className="text-xs font-medium">{label}</p>
          </div>
        ))}
      </div>

      <Card>
        <CardHeader className="p-4 md:p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
              <CreditCard className="h-4 w-4 md:h-5 md:w-5" />
              Contratos ({filteredLoans.length}{filterStatus !== 'all' ? ` de ${loans.length}` : ''})
            </CardTitle>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Pesquisar por cliente..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full sm:w-48 md:w-64"
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full sm:w-36 md:w-44">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos ({stats.total})</SelectItem>
                  <SelectItem value="active">Ativo ({stats.active})</SelectItem>
                  <SelectItem value="pending">Pendente ({stats.pending})</SelectItem>
                  <SelectItem value="completed">Quitado ({stats.completed})</SelectItem>
                  <SelectItem value="overdue">Em Atraso ({stats.overdue})</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 md:p-6 pt-0">
          <div className="space-y-4">
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="border rounded-lg p-3 md:p-4 space-y-3">
                    <div className="flex justify-between">
                      <div className="space-y-2 w-1/3">
                        <Skeleton className="h-5 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                      </div>
                      <Skeleton className="h-6 w-20 rounded-full" />
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredLoans.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CreditCard className="mx-auto h-12 w-12 opacity-50 mb-2" />
                <p>
                  {searchTerm || filterStatus !== 'all'
                    ? 'Nenhum empréstimo corresponde ao filtro aplicado'
                    : 'Nenhum empréstimo encontrado'}
                </p>
              </div>
            ) : (
              filteredLoans.map((loan) => (
                <div key={loan.id} className="border rounded-lg p-3 md:p-4 space-y-3 hover:shadow-sm transition-shadow">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h3 className="font-semibold">{loan.client_name}</h3>
                      {loan.status === 'pending' ? (
                        <p className="text-sm text-muted-foreground">
                          Registado em {new Date(loan.created_at).toLocaleDateString('pt-MZ')}
                        </p>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          Taxa: {loan.interest_rate}% | Prazo: {loan.installments} meses
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusClass(loan.status)}`}>
                        {statusLabel(loan.status)}
                      </span>
                      {loan.status === 'overdue' && (
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                  </div>

                  {loan.status === 'pending' ? (
                    <div className="text-sm text-muted-foreground italic py-2">
                      Aguardando concessão de crédito pelo gestor
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      <div>
                        <p className="text-muted-foreground">Valor Original</p>
                        <p className="font-medium">{Number(loan.amount).toLocaleString('pt-MZ')} MZN</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Total com Juros</p>
                        <p className="font-medium">{Number(loan.total_amount).toLocaleString('pt-MZ')} MZN</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Saldo Devedor</p>
                        <p className={`font-medium ${loan.status === 'overdue' ? 'text-red-600' : ''}`}>
                          {Number(loan.remaining_amount).toLocaleString('pt-MZ')} MZN
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Progresso</p>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div
                            className={`h-2 rounded-full transition-all ${
                              loan.status === 'completed' ? 'bg-blue-600' :
                              loan.status === 'overdue' ? 'bg-red-500' : 'bg-green-500'
                            }`}
                            style={{
                              width: `${Math.min(100, Math.max(0,
                                Number(loan.total_amount) > 0
                                  ? ((Number(loan.total_amount) - Number(loan.remaining_amount)) / Number(loan.total_amount)) * 100
                                  : 0
                              ))}%`
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoansModule;
