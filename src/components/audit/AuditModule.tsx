import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  Users, UserCheck, AlertTriangle, TrendingUp, TrendingDown, DollarSign,
  Clock, Activity, FileText, Loader2, RefreshCw, Briefcase, CreditCard, Wallet, BarChart3
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { supabase } from '@/integrations/supabase/client';

interface ClientRow {
  id: string; name: string; status: string; phone: string | null;
  agent_id: string | null; created_at: string;
  loan_count: number; total_borrowed: number; total_remaining: number;
  days_overdue: number;
}
interface AgentRow {
  user_id: string; name: string; client_count: number;
  total_volume: number; total_collected: number;
}
interface LedgerRow {
  id: string; amount: number; transaction_type: string;
  description: string | null; created_at: string;
}

const AuditModule = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalClients: 0, activeClients: 0, clientsWithDebt: 0,
    clientsOverdue: 0, clientsNoOrders: 0, totalAgents: 0,
    totalLoaned: 0, totalCollected: 0, activeLoans: 0,
    pendingRequests: 0, walletBalance: 0,
  });
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [agents, setAgents] = useState<AgentRow[]>([]);
  const [ledger, setLedger] = useState<LedgerRow[]>([]);
  const [clientFilter, setClientFilter] = useState<'all'|'active'|'overdue'|'no-orders'>('all');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [clientsRes, loansRes, paymentsRes, requestsRes, rolesRes, profilesRes, walletRes, ledgerRes] = await Promise.all([
        supabase.from('clients').select('*'),
        supabase.from('loans').select('*'),
        supabase.from('payments').select('*'),
        supabase.from('credit_requests').select('id, status'),
        supabase.from('user_roles').select('user_id, role').eq('role', 'agente'),
        supabase.from('profiles').select('user_id, name, email'),
        supabase.from('company_wallet').select('balance').single(),
        supabase.from('wallet_ledger').select('*').order('created_at', { ascending: false }).limit(50),
      ]);

      const allClients = clientsRes.data || [];
      const allLoans = loansRes.data || [];
      const allPayments = paymentsRes.data || [];
      const allRequests = requestsRes.data || [];
      const agentRoles = rolesRes.data || [];
      const profiles = profilesRes.data || [];
      const walletBalance = Number(walletRes.data?.balance) || 0;
      const ledgerData = (ledgerRes.data || []) as LedgerRow[];

      const profileMap = new Map(profiles.map(p => [p.user_id, p]));
      const today = new Date();

      // Build client rows with loan info
      const clientRows: ClientRow[] = allClients.map(c => {
        const clientLoans = allLoans.filter(l => l.client_id === c.id);
        const activeLoans = clientLoans.filter(l => l.status === 'active');
        const totalBorrowed = clientLoans.reduce((s, l) => s + Number(l.amount || 0), 0);
        const totalRemaining = activeLoans.reduce((s, l) => s + Number(l.remaining_amount || 0), 0);

        let maxOverdue = 0;
        activeLoans.forEach(l => {
          if (l.end_date) {
            const endDate = new Date(l.end_date);
            if (today > endDate) {
              maxOverdue = Math.max(maxOverdue, Math.floor((today.getTime() - endDate.getTime()) / 86400000));
            }
          }
        });

        return {
          id: c.id, name: c.name, status: c.status, phone: c.phone,
          agent_id: c.agent_id, created_at: c.created_at,
          loan_count: clientLoans.length, total_borrowed: totalBorrowed,
          total_remaining: totalRemaining, days_overdue: maxOverdue,
        };
      });

      // Build agent rows
      const agentRows: AgentRow[] = agentRoles.map(ar => {
        const profile = profileMap.get(ar.user_id);
        const agentClients = allClients.filter(c => c.agent_id === ar.user_id);
        const agentClientIds = new Set(agentClients.map(c => c.id));
        const agentLoans = allLoans.filter(l => agentClientIds.has(l.client_id));
        const agentLoanIds = new Set(agentLoans.map(l => l.id));
        const agentPayments = allPayments.filter(p => agentLoanIds.has(p.loan_id));

        return {
          user_id: ar.user_id,
          name: profile?.name || 'Agente',
          client_count: agentClients.length,
          total_volume: agentLoans.reduce((s, l) => s + Number(l.amount || 0), 0),
          total_collected: agentPayments.reduce((s, p) => s + Number(p.amount || 0), 0),
        };
      });

      const activeClients = clientRows.filter(c => c.status === 'active').length;
      const clientsWithDebt = clientRows.filter(c => c.total_remaining > 0).length;
      const clientsOverdue = clientRows.filter(c => c.days_overdue > 0).length;
      const clientIdsWithRequests = new Set(allRequests.map(r => r.id));
      const clientsNoOrders = clientRows.filter(c => c.loan_count === 0).length;
      const activeLoansCount = allLoans.filter(l => l.status === 'active').length;
      const pendingRequests = allRequests.filter(r => r.status === 'pending').length;
      const totalLoaned = allLoans.reduce((s, l) => s + Number(l.amount || 0), 0);
      const totalCollected = allPayments.reduce((s, p) => s + Number(p.amount || 0), 0);

      setStats({
        totalClients: allClients.length, activeClients, clientsWithDebt,
        clientsOverdue, clientsNoOrders, totalAgents: agentRoles.length,
        totalLoaned, totalCollected, activeLoans: activeLoansCount,
        pendingRequests, walletBalance,
      });

      setClients(clientRows);
      setAgents(agentRows);
      setLedger(ledgerData);
    } catch (err) {
      console.error('AuditModule load error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const filteredClients = clients.filter(c => {
    if (clientFilter === 'active') return c.status === 'active';
    if (clientFilter === 'overdue') return c.days_overdue > 0;
    if (clientFilter === 'no-orders') return c.loan_count === 0;
    return true;
  });

  if (loading) {
    return <div className="flex items-center justify-center h-[60vh]"><Loader2 className="h-8 w-8 animate-spin text-[#1b5e20]" /></div>;
  }

  const KpiCard = ({ icon: Icon, label, value, color, sub }: { icon: React.ElementType; label: string; value: string | number; color: string; sub?: string }) => (
    <Card className={`border-l-4 border-l-${color}-500`}>
      <CardContent className="p-4">
        <div className="flex items-center gap-2">
          <Icon className={`h-5 w-5 text-${color}-500 shrink-0`} />
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground truncate">{label}</p>
            <p className="text-lg font-bold truncate">{value}</p>
            {sub && <p className="text-[10px] text-muted-foreground">{sub}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-5">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Auditoria do Sistema</h1>
          <p className="text-muted-foreground text-sm">Controlo e monitorização de toda a operação</p>
        </div>
        <Button variant="outline" size="sm" onClick={loadData} disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Atualizar
        </Button>
      </div>

      <Tabs defaultValue="dashboard" className="space-y-4">
        <TabsList className="flex flex-wrap h-auto gap-1">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="clients">Clientes</TabsTrigger>
          <TabsTrigger value="agents">Agentes</TabsTrigger>
          <TabsTrigger value="financial">Financeiro</TabsTrigger>
        </TabsList>

        {/* DASHBOARD */}
        <TabsContent value="dashboard" className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            <KpiCard icon={Users} label="Total Clientes" value={stats.totalClients} color="blue" sub={`${stats.activeClients} activos`} />
            <KpiCard icon={CreditCard} label="Com Dívidas" value={stats.clientsWithDebt} color="amber" />
            <KpiCard icon={AlertTriangle} label="Em Atraso" value={stats.clientsOverdue} color="red" />
            <KpiCard icon={Clock} label="Sem Empréstimos" value={stats.clientsNoOrders} color="gray" />
            <KpiCard icon={UserCheck} label="Agentes" value={stats.totalAgents} color="blue" />
            <KpiCard icon={Activity} label="Empréstimos Activos" value={stats.activeLoans} color="green" />
            <KpiCard icon={FileText} label="Pedidos Pendentes" value={stats.pendingRequests} color="amber" />
            <KpiCard icon={Wallet} label="Saldo Carteira" value={`${stats.walletBalance.toLocaleString()} MT`} color="green" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Resumo Financeiro</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2"><TrendingUp className="h-4 w-4 text-green-600" /><span className="text-sm">Total Emprestado</span></div>
                  <span className="font-bold text-green-700">MT {stats.totalLoaned.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2"><TrendingDown className="h-4 w-4 text-blue-600" /><span className="text-sm">Total Cobrado</span></div>
                  <span className="font-bold text-blue-700">MT {stats.totalCollected.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-amber-50 rounded-lg">
                  <div className="flex items-center gap-2"><DollarSign className="h-4 w-4 text-amber-600" /><span className="text-sm">A Receber</span></div>
                  <span className="font-bold text-amber-700">MT {(stats.totalLoaned - stats.totalCollected).toLocaleString()}</span>
                </div>
                {stats.totalLoaned > 0 && (
                  <div className="pt-2">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground">Taxa de Cobrança</span>
                      <span className="font-bold">{Math.round((stats.totalCollected / stats.totalLoaned) * 100)}%</span>
                    </div>
                    <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full transition-all" style={{ width: `${Math.min((stats.totalCollected / stats.totalLoaned) * 100, 100)}%` }} />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Agentes — Top Performance</CardTitle>
              </CardHeader>
              <CardContent>
                {agents.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">Nenhum agente registado.</p>
                ) : (
                  <div className="space-y-2">
                    {agents.sort((a, b) => b.total_volume - a.total_volume).slice(0, 5).map(agent => (
                      <div key={agent.user_id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                            <span className="text-xs font-bold text-blue-700">{agent.name[0]?.toUpperCase()}</span>
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">{agent.name}</p>
                            <p className="text-[10px] text-muted-foreground">{agent.client_count} clientes</p>
                          </div>
                        </div>
                        <span className="text-sm font-bold text-green-700 shrink-0">MT {agent.total_volume.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* CLIENTS TAB */}
        <TabsContent value="clients" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-lg">Painel de Clientes</CardTitle>
                  <CardDescription>Estado detalhado de cada cliente</CardDescription>
                </div>
                <div className="flex gap-1 flex-wrap">
                  {(['all', 'active', 'overdue', 'no-orders'] as const).map(f => (
                    <Button key={f} size="sm" variant={clientFilter === f ? 'default' : 'outline'}
                      className={clientFilter === f ? 'bg-[#1b5e20] hover:bg-[#145a32]' : ''}
                      onClick={() => setClientFilter(f)}>
                      {{ all: 'Todos', active: 'Activos', overdue: 'Em Atraso', 'no-orders': 'Sem Emp.' }[f]}
                      <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-[10px]">
                        {{ all: clients.length, active: clients.filter(c => c.status === 'active').length, overdue: clients.filter(c => c.days_overdue > 0).length, 'no-orders': clients.filter(c => c.loan_count === 0).length }[f]}
                      </Badge>
                    </Button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto border rounded-lg">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-xs text-gray-500">
                    <tr>
                      <th className="px-4 py-3 text-left">Cliente</th>
                      <th className="px-4 py-3 text-left">Estado</th>
                      <th className="px-4 py-3 text-right">Emprestado</th>
                      <th className="px-4 py-3 text-right">Em Dívida</th>
                      <th className="px-4 py-3 text-center">Atraso</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filteredClients.map(c => (
                      <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <p className="font-medium">{c.name}</p>
                          <p className="text-[10px] text-muted-foreground">{c.phone || 'Sem telefone'}</p>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={c.status === 'active' ? 'default' : 'secondary'} className="capitalize text-[10px]">{c.status}</Badge>
                        </td>
                        <td className="px-4 py-3 text-right font-medium">{c.total_borrowed.toLocaleString()} MT</td>
                        <td className="px-4 py-3 text-right">
                          <span className={c.total_remaining > 0 ? 'text-red-600 font-bold' : 'text-green-600'}>{c.total_remaining.toLocaleString()} MT</span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          {c.days_overdue > 0 ? (
                            <Badge variant="destructive" className="text-[10px]">{c.days_overdue} dias</Badge>
                          ) : (
                            <span className="text-green-600 text-xs">Em dia</span>
                          )}
                        </td>
                      </tr>
                    ))}
                    {filteredClients.length === 0 && (
                      <tr><td colSpan={5} className="text-center py-8 text-muted-foreground">Nenhum cliente nesta categoria.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AGENTS TAB */}
        <TabsContent value="agents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Painel de Agentes</CardTitle>
              <CardDescription>Performance e carteira de cada agente</CardDescription>
            </CardHeader>
            <CardContent>
              {agents.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">Nenhum agente registado no sistema.</p>
              ) : (
                <div className="overflow-x-auto border rounded-lg">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-xs text-gray-500">
                      <tr>
                        <th className="px-4 py-3 text-left">Agente</th>
                        <th className="px-4 py-3 text-center">Clientes</th>
                        <th className="px-4 py-3 text-right">Volume Total</th>
                        <th className="px-4 py-3 text-right">Cobrado</th>
                        <th className="px-4 py-3 text-center">Taxa Cobrança</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {agents.sort((a, b) => b.total_volume - a.total_volume).map(agent => {
                        const rate = agent.total_volume > 0 ? Math.round((agent.total_collected / agent.total_volume) * 100) : 0;
                        return (
                          <tr key={agent.user_id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                                  <span className="text-xs font-bold text-blue-700">{agent.name[0]?.toUpperCase()}</span>
                                </div>
                                <span className="font-medium">{agent.name}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-center"><Badge variant="secondary">{agent.client_count}</Badge></td>
                            <td className="px-4 py-3 text-right font-medium">{agent.total_volume.toLocaleString()} MT</td>
                            <td className="px-4 py-3 text-right text-green-700 font-medium">{agent.total_collected.toLocaleString()} MT</td>
                            <td className="px-4 py-3 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                                  <div className="h-full bg-green-500 rounded-full" style={{ width: `${rate}%` }} />
                                </div>
                                <span className="text-xs font-bold">{rate}%</span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* FINANCIAL TAB */}
        <TabsContent value="financial" className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <KpiCard icon={Wallet} label="Saldo Carteira" value={`${stats.walletBalance.toLocaleString()} MT`} color="green" />
            <KpiCard icon={TrendingUp} label="Total Emprestado" value={`${stats.totalLoaned.toLocaleString()} MT`} color="blue" />
            <KpiCard icon={TrendingDown} label="Total Cobrado" value={`${stats.totalCollected.toLocaleString()} MT`} color="emerald" />
            <KpiCard icon={DollarSign} label="A Receber" value={`${(stats.totalLoaned - stats.totalCollected).toLocaleString()} MT`} color="amber" />
          </div>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Últimas Transacções</CardTitle>
              <CardDescription>Movimentações recentes na carteira</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-[50vh] overflow-y-auto">
                {ledger.map(entry => {
                  const isIn = entry.transaction_type !== 'disbursement';
                  const amt = Math.abs(Number(entry.amount));
                  return (
                    <div key={entry.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50/50 transition-colors">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`p-2 rounded-full shrink-0 ${isIn ? 'bg-green-100' : 'bg-red-100'}`}>
                          {isIn ? <TrendingUp className="h-4 w-4 text-green-600" /> : <TrendingDown className="h-4 w-4 text-red-600" />}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{entry.description || entry.transaction_type}</p>
                          <p className="text-[10px] text-muted-foreground">
                            {new Date(entry.created_at).toLocaleDateString('pt-MZ')} {new Date(entry.created_at).toLocaleTimeString('pt-MZ', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                      <p className={`font-bold text-sm shrink-0 ml-2 ${isIn ? 'text-green-600' : 'text-red-600'}`}>
                        {isIn ? '+' : '-'}{amt.toLocaleString()} MT
                      </p>
                    </div>
                  );
                })}
                {ledger.length === 0 && <p className="text-center py-8 text-muted-foreground text-sm">Nenhuma transacção registada.</p>}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AuditModule;
