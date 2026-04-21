
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CreditCard, Search, AlertTriangle, CheckCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '../../hooks/use-toast';
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

interface Client {
  id: string;
  name: string;
}

const LoansModule = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [clients, setClients] = useState<Client[]>([]);

  const isAgent = user?.role === 'agente';

  useEffect(() => {
    loadClients();
  }, []);

  const { data: loans = [], isLoading: loading, refetch: loadLoans } = useQuery({
    queryKey: ['loans', user?.role, user?.id],
    queryFn: async () => {
      let query = supabase
        .from('loans')
        .select('*, clients(name, agent_id)')
        .order('created_at', { ascending: false });

      // Agents only see loans for their own clients
      if (isAgent) {
        query = query.eq('clients.agent_id', user.id);
      }

      const { data, error } = await query;

      if (error) throw error;

      const mapped = (data || []).map((l: any) => {
        let total = Number(l.total_amount);
        let remaining = Number(l.remaining_amount);
        let status = l.status;

        if (l.end_date && remaining > 0) {
          const end = new Date(l.end_date);
          const today = new Date();
          const diffDays = Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

          if (diffDays < 0 && status !== 'completed') {
            status = 'overdue';
            const lateDays = Math.abs(diffDays);
            const penalty = remaining * (0.015 * lateDays); // 1.5% penalty per day of delay
            total += penalty;
            remaining += penalty;
          }
        }

        return {
          ...l,
          total_amount: total,
          remaining_amount: remaining,
          status,
          client_name: l.clients?.name || 'Cliente desconhecido',
        };
      });
      return mapped as Loan[];
    },
    enabled: !!user,
  });

  const loadClients = async () => {
    try {
      const { data } = await supabase.from('clients').select('id, name').eq('status', 'active');
      setClients(data || []);
    } catch (error) {
      console.error('Error loading clients:', error);
    }
  };

  const filteredLoans = loans.filter(loan => {
    const matchesSearch = (loan.client_name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || loan.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-3xl font-bold tracking-tight">
            {isAgent ? 'Empréstimos dos Meus Clientes' : 'Gestão de Empréstimos'}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isAgent ? 'Acompanhe os empréstimos dos seus clientes' : 'Gerencie contratos e acompanhe pagamentos'}
          </p>
        </div>
      </div>

      <div className="space-y-4 md:space-y-6">
        <Card>
          <CardHeader className="p-4 md:p-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                <CreditCard className="h-4 w-4 md:h-5 md:w-5" />
                Contratos ({filteredLoans.length})
              </CardTitle>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  <Input
                    placeholder="Pesquisar por cliente..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full sm:w-48 md:w-64"
                  />
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-full sm:w-32 md:w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="active">Ativo</SelectItem>
                    <SelectItem value="pending">Pendente</SelectItem>
                    <SelectItem value="completed">Quitado</SelectItem>
                    <SelectItem value="overdue">Em Atraso</SelectItem>
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
                  <p>Nenhum empréstimo encontrado</p>
                </div>
              ) : (
                filteredLoans.map((loan) => (
                  <div key={loan.id} className="border rounded-lg p-3 md:p-4 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <h3 className="font-semibold">{loan.client_name}</h3>
                        <p className="text-sm text-muted-foreground">
                          Taxa: {loan.interest_rate}% | Prazo: {loan.installments} meses
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs ${loan.status === 'active' ? 'bg-green-100 text-green-800' :
                          loan.status === 'overdue' ? 'bg-red-100 text-red-800' :
                            loan.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                              'bg-yellow-100 text-yellow-800'
                          }`}>
                          {loan.status === 'active' ? 'Ativo' :
                            loan.status === 'overdue' ? 'Em Atraso' :
                              loan.status === 'completed' ? 'Quitado' : 'Pendente'}
                        </span>
                        {loan.status === 'overdue' && (
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      <div>
                        <p className="text-muted-foreground">Valor Original</p>
                        <p className="font-medium">{Number(loan.amount).toLocaleString()} MZN</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Total com Juros</p>
                        <p className="font-medium">{Number(loan.total_amount).toLocaleString()} MZN</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Saldo Devedor</p>
                        <p className="font-medium">{Number(loan.remaining_amount).toLocaleString()} MZN</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Progresso</p>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${Math.max(0, ((Number(loan.total_amount) - Number(loan.remaining_amount)) / Number(loan.total_amount)) * 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    {/* Actions - only for gestor */}
                    {!isAgent && (loan.status === 'active' || loan.status === 'overdue') && (
                      <div className="pt-3 mt-3 border-t border-gray-100 flex justify-end">
                        <Button
                          size="sm"
                          className="bg-[#1b5e20] hover:bg-[#124016] text-white font-semibold"
                          onClick={async () => {
                            try {
                              const { error } = await supabase
                                .from('loans')
                                .update({ status: 'completed', remaining_amount: 0 })
                                .eq('id', loan.id);
                              if (error) throw error;
                              toast({ title: 'Empréstimo liquidado e marcado como Pago!' });
                              loadLoans();
                            } catch (e: any) {
                              toast({ title: 'Erro', description: e.message, variant: 'destructive' });
                            }
                          }}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" /> Marcar como Pago
                        </Button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoansModule;

