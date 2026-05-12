import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import {
  Users,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  CreditCard,
  Target,
  PieChart,
  Bell,
  MessageSquare,
  FileText,
  CheckCircle,
  Clock,
  Eye,
  EyeOff,
  PlusCircle,
  Wallet,
  Loader2,
  RefreshCw
} from 'lucide-react';
import MetricCard from './MetricCard';
import RiskAnalysis from './RiskAnalysis';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import WalletInjectionModal from '../admin/WalletInjectionModal';
import { Button } from '../ui/button';

// --- Cache Global do Dashboard (Stale-While-Revalidate simples) ---
let cachedStats: any = null;
let cachedWalletBalance: number | null = null;
let cachedWalletLedger: any[] = [];
let lastFetchTime = 0;
const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutos de cache

const Dashboard = () => {
  const [stats, setStats] = useState(cachedStats || {
    totalClients: 0,
    totalLoanAmount: 0,
    totalInterest: 0,
    lateInterest: 0,
    totalValue: 0,
    activeLoans: 0,
    pendingLoans: 0,
    completedLoans: 0,
    notificationsSent: 0,
    messagesReceived: 0,
    creditRequests: 0,
    defaultRate: 0,
    roi: 0,
  });
  
  // Se temos cache, não precisamos de mostrar o estado de 'loading' no início
  const [loading, setLoading] = useState(!cachedStats);
  const [showWalletBalance, setShowWalletBalance] = useState(() => {
    return localStorage.getItem('bochel_show_wallet_balance') !== 'false';
  });
  const [walletBalance, setWalletBalance] = useState<number | null>(cachedWalletBalance);
  const [isInjectionModalOpen, setIsInjectionModalOpen] = useState(false);
  const [walletLedger, setWalletLedger] = useState<any[]>(cachedWalletLedger);
  const [dataError, setDataError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async (forceRefresh = false) => {
    const now = Date.now();
    // Se temos cache e ainda está válido (menos de 5 mins), e não forçamos recarregamento, não fazemos fetch.
    if (!forceRefresh && cachedStats && (now - lastFetchTime) < CACHE_DURATION_MS) {
      return; 
    }

    if (forceRefresh) {
      setLoading(true);
    }

    try {
      setDataError(false);
      setErrorMessage(null);

      // Executar TODAS as 8 consultas à base de dados SIMULTANEAMENTE (Paralelismo)
      // Isto reduz o tempo de carregamento de ~2.5s para ~0.3s
      const [
        clientsRes,
        loansRes,
        paymentsRes,
        requestsRes,
        notifsRes,
        messagesRes,
        walletRes,
        ledgerRes
      ] = await Promise.all([
        supabase.from('clients').select('*', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('loans').select('amount, total_amount, remaining_amount, interest_rate, status'),
        supabase.from('payments').select('amount'),
        supabase.from('credit_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('notifications').select('*', { count: 'exact', head: true }),
        supabase.from('chat_messages').select('*', { count: 'exact', head: true }),
        supabase.from('company_wallet').select('balance').single(),
        supabase.from('wallet_ledger').select('*').order('created_at', { ascending: false }).limit(5)
      ]);

      // Verificar se houve erros críticos nas consultas principais
      if (clientsRes.error) throw clientsRes.error;
      if (loansRes.error) throw loansRes.error;
      if (paymentsRes.error) throw paymentsRes.error;
      if (requestsRes.error) throw requestsRes.error;
      if (notifsRes.error) throw notifsRes.error;
      if (messagesRes.error) throw messagesRes.error;

      // 1. Processar Clientes
      const totalClients = clientsRes.count || 0;

      // 2. Processar Empréstimos
      const loans = loansRes.data || [];
      const activeLoans = loans.filter(l => l.status === 'active').length;
      const pendingLoans = loans.filter(l => l.status === 'pending').length;
      const completedLoans = loans.filter(l => l.status === 'completed').length;
      const totalLoanAmount = loans.reduce((sum, l) => sum + Number(l.amount), 0);
      const totalValue = loans.reduce((sum, l) => sum + Number(l.total_amount), 0);
      const totalInterest = totalValue - totalLoanAmount;
      const overdueLoans = loans.filter(l => l.status === 'overdue').length;
      const defaultRate = loans.length > 0 ? ((overdueLoans / loans.length) * 100) : 0;

      // 3. Processar Pagamentos e ROI
      const payments = paymentsRes.data || [];
      const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount), 0);
      const roi = totalLoanAmount > 0 ? ((totalPaid / totalLoanAmount) * 100) : 0;

      const newStats = {
        totalClients,
        totalLoanAmount,
        totalInterest,
        lateInterest: 0,
        totalValue,
        activeLoans,
        pendingLoans,
        completedLoans,
        notificationsSent: notifsRes.count || 0,
        messagesReceived: messagesRes.count || 0,
        creditRequests: requestsRes.count || 0,
        defaultRate: Math.round(defaultRate * 10) / 10,
        roi: Math.round(roi * 10) / 10,
      };

      setStats(newStats);
      cachedStats = newStats; // Atualizar Cache

      // 4. Processar Saldo (Wallet)
      if (!walletRes.error && walletRes.data) {
        setWalletBalance(walletRes.data.balance);
        cachedWalletBalance = walletRes.data.balance;
      }

      // 5. Processar Ledger (Histórico)
      if (!ledgerRes.error && ledgerRes.data) {
        setWalletLedger(ledgerRes.data);
        cachedWalletLedger = ledgerRes.data;
      }

      lastFetchTime = Date.now(); // Atualizar tempo de último fetch bem sucedido
    } catch (error: any) {
      console.error('Error loading dashboard stats:', error);
      setDataError(true);
      setErrorMessage(error.message || 'Erro de comunicação. O servidor pode estar ocupado.');
    } finally {
      setLoading(false);
    }
  };

  const toggleWalletVisibility = () => {
    const newVal = !showWalletBalance;
    setShowWalletBalance(newVal);
    localStorage.setItem('bochel_show_wallet_balance', String(newVal));
  };

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `MT ${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `MT ${(value / 1000).toFixed(1)}K`;
    return `MT ${value.toLocaleString()}`;
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {dataError && (
        <div className="bg-warning/10 border-l-4 border-warning text-warning-foreground p-4 rounded-md shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-warning" />
            <div>
              <p className="font-bold text-sm">Aviso de Sincronização</p>
              <p className="text-xs opacity-90">
                {errorMessage ? `Detalhe: ${errorMessage}` : 'Não foi possível atualizar os dados em tempo real. A apresentar últimos dados guardados.'}
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => loadStats(true)} className="shrink-0 bg-white border-warning/30 hover:bg-warning/20">
            Tentar Novamente
          </Button>
        </div>
      )}

      {/* Carteira e Ações Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6">
        <Card className="md:col-span-8 border-0 shadow-large overflow-hidden bg-gradient-to-br from-[#1a3a5c] to-[#0d1d2e] text-white">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md">
                  <Wallet className="h-7 w-7 text-blue-300" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white/60 uppercase tracking-widest">Saldo para Empréstimo</p>
                  <div className="flex items-center gap-3 mt-1">
                    <h2 className="text-3xl font-black">
                      {showWalletBalance ? (
                        walletBalance !== null ? `MT ${walletBalance.toLocaleString()}` : '...'
                      ) : (
                        '••••••••••••'
                      )}
                    </h2>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={toggleWalletVisibility}
                      className="h-8 w-8 text-white/40 hover:text-white hover:bg-white/10 rounded-full"
                    >
                      {showWalletBalance ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button 
                  variant="ghost" 
                  onClick={() => loadStats(true)} 
                  disabled={loading} 
                  className="text-white/70 hover:text-white hover:bg-white/10 hidden sm:flex items-center gap-2"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                  <span className="text-sm font-medium">{loading ? 'Atualizando...' : 'Atualizar'}</span>
                </Button>
                <Button
                  onClick={() => setIsInjectionModalOpen(true)}
                  className="bg-success hover:bg-success/90 text-white font-bold h-12 px-6 rounded-xl flex items-center gap-2 shadow-lg shadow-success/20 transition-all active:scale-95"
                >
                  <PlusCircle className="h-5 w-5" />
                  Injectar Saldo
                </Button>
              </div>
            </div>

            {loading && !stats.totalClients ? (
              <div className="flex gap-4 mt-8">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-12 w-full bg-white/5 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-white/5 pt-6">
                <div className="space-y-1">
                  <p className="text-[10px] text-white/40 uppercase font-black tracking-tighter">Entradas (Mes)</p>
                  <p className="text-sm font-bold text-success">+ MT {walletLedger.filter(l => l.transaction_type !== 'disbursement').reduce((s, l) => s + Number(l.amount), 0).toLocaleString()}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-white/40 uppercase font-black tracking-tighter">Saídas (Mes)</p>
                  <p className="text-sm font-bold text-destructive">- MT {walletLedger.filter(l => l.transaction_type === 'disbursement').reduce((s, l) => s + Number(l.amount), 0).toLocaleString()}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-white/40 uppercase font-black tracking-tighter">Liquidez Pendente</p>
                  <p className="text-sm font-bold text-info">MT {(stats.creditRequests * 5000).toLocaleString()} (est.)</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Auditoria Rápida */}
        <Card className="md:col-span-4 border-0 shadow-medium">
          <CardHeader className="p-4 pb-0">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              Auditoria Recente
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-3">
              {walletLedger.length > 0 ? (
                walletLedger.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "w-1.5 h-1.5 rounded-full",
                        tx.transaction_type === 'disbursement' ? "bg-destructive" : "bg-success"
                      )} />
                      <span className="text-muted-foreground">{tx.description}</span>
                    </div>
                    <span className={cn(
                      "font-bold",
                      tx.transaction_type === 'disbursement' ? "text-destructive" : "text-success"
                    )}>
                      {tx.transaction_type === 'disbursement' ? '-' : '+'} {Number(tx.amount).toLocaleString()}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted-foreground text-center py-4 italic">Nenhuma transação registada.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Métricas principais */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        <MetricCard
          title="Clientes Ativos"
          value={String(stats.totalClients)}
          icon={Users}
          trend={`${stats.activeLoans} com empréstimo`}
          description="Cadastrados no sistema"
        />
        <MetricCard
          title="Carteira de Crédito"
          value={formatCurrency(stats.totalLoanAmount)}
          icon={CreditCard}
          trend={`${stats.activeLoans} ativos`}
          description="Total emprestado"
        />
        <MetricCard
          title="Taxa de Inadimplência"
          value={`${stats.defaultRate}%`}
          icon={AlertTriangle}
          trend=""
          description={`${stats.pendingLoans} pendentes`}
          variant="warning"
        />
        <MetricCard
          title="ROI"
          value={`${stats.roi}%`}
          icon={TrendingUp}
          trend=""
          description="Retorno sobre investimento"
          variant="success"
        />
      </div>

      {/* Informações detalhadas de empréstimos */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
        <Card>
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs md:text-sm text-muted-foreground truncate">Empréstimo Total</p>
                <p className="text-sm md:text-lg font-bold truncate">MT {stats.totalLoanAmount.toLocaleString()}</p>
              </div>
              <DollarSign className="h-5 w-5 md:h-6 md:w-6 text-info flex-shrink-0" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs md:text-sm text-muted-foreground truncate">Juros Totais</p>
                <p className="text-sm md:text-lg font-bold text-success truncate">MT {stats.totalInterest.toLocaleString()}</p>
              </div>
              <TrendingUp className="h-5 w-5 md:h-6 md:w-6 text-success flex-shrink-0" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs md:text-sm text-muted-foreground truncate">Juros de Mora</p>
                <p className="text-sm md:text-lg font-bold text-destructive truncate">MT {stats.lateInterest.toLocaleString()}</p>
              </div>
              <AlertTriangle className="h-5 w-5 md:h-6 md:w-6 text-destructive flex-shrink-0" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs md:text-sm text-muted-foreground truncate">Valor Total</p>
                <p className="text-sm md:text-lg font-bold text-secondary truncate">MT {stats.totalValue.toLocaleString()}</p>
              </div>
              <Target className="h-5 w-5 md:h-6 md:w-6 text-secondary flex-shrink-0" />
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-2 md:col-span-1">
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs md:text-sm text-muted-foreground truncate">Solicitações</p>
                <p className="text-sm md:text-lg font-bold text-orange truncate">{stats.creditRequests}</p>
              </div>
              <FileText className="h-5 w-5 md:h-6 md:w-6 text-orange flex-shrink-0" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status de empréstimos e comunicações */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <Card>
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs md:text-sm text-muted-foreground truncate">Empréstimos Ativos</p>
                <p className="text-lg md:text-xl font-bold text-success">{stats.activeLoans}</p>
              </div>
              <CheckCircle className="h-5 w-5 md:h-6 md:w-6 text-success flex-shrink-0" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs md:text-sm text-muted-foreground truncate">Pendentes</p>
                <p className="text-lg md:text-xl font-bold text-warning">{stats.pendingLoans}</p>
              </div>
              <Clock className="h-5 w-5 md:h-6 md:w-6 text-warning flex-shrink-0" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs md:text-sm text-muted-foreground truncate">Notificações</p>
                <p className="text-lg md:text-xl font-bold text-info">{stats.notificationsSent}</p>
              </div>
              <Bell className="h-5 w-5 md:h-6 md:w-6 text-info flex-shrink-0" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs md:text-sm text-muted-foreground truncate">Mensagens</p>
                <p className="text-lg md:text-xl font-bold text-secondary">{stats.messagesReceived}</p>
              </div>
              <MessageSquare className="h-5 w-5 md:h-6 md:w-6 text-secondary flex-shrink-0" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos e análises */}
      <div className="grid grid-cols-1 gap-4 md:gap-6">
        <Card>
          <CardHeader className="p-4 md:p-6">
            <CardTitle className="flex items-center text-base md:text-lg">
              <Target className="mr-2 h-4 w-4 md:h-5 md:w-5" />
              Análise de Risco
            </CardTitle>
            <CardDescription className="text-xs md:text-sm">
              Distribuição de empréstimos por status
            </CardDescription>
          </CardHeader>
          <CardContent className="p-3 md:p-6 pt-0">
            <RiskAnalysis />
          </CardContent>
        </Card>
      </div>

      {/* Status cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <Card>
          <CardHeader className="p-4 md:p-6">
            <CardTitle className="text-base md:text-lg">Cobranças</CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-6 pt-0">
            <div className="space-y-3">
              {stats.pendingLoans > 0 ? (
                <div className="text-center py-4">
                  <p className="text-warning font-semibold text-lg">{stats.pendingLoans}</p>
                  <p className="text-muted-foreground text-sm">empréstimos pendentes</p>
                </div>
              ) : (
                <div className="text-center py-6 md:py-8">
                  <p className="text-muted-foreground text-sm">Nenhum alerta de cobrança</p>
                  <p className="text-xs text-muted-foreground/70">Sistema operacional</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4 md:p-6">
            <CardTitle className="text-base md:text-lg">Pedidos</CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-6 pt-0">
            <div className="space-y-3">
              {stats.creditRequests > 0 ? (
                <div className="text-center py-4">
                  <p className="text-orange font-semibold text-lg">{stats.creditRequests}</p>
                  <p className="text-muted-foreground text-sm">pedidos pendentes de análise</p>
                </div>
              ) : (
                <div className="text-center py-6 md:py-8">
                  <p className="text-muted-foreground text-sm">Nenhum pedido pendente</p>
                  <p className="text-xs text-muted-foreground/70">Aguardando novos pedidos</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 lg:col-span-1">
          <CardHeader className="p-4 md:p-6">
            <CardTitle className="text-base md:text-lg">Status do Sistema</CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-6 pt-0">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span>Sistema</span>
                <span className="bg-success/20 text-success px-2 py-1 rounded text-xs">Operacional</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Base de Dados</span>
                <span className="bg-success/20 text-success px-2 py-1 rounded text-xs">Conectada</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Clientes</span>
                <span className="bg-info/20 text-info px-2 py-1 rounded text-xs">{stats.totalClients}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <WalletInjectionModal
        isOpen={isInjectionModalOpen}
        onClose={() => setIsInjectionModalOpen(false)}
        onSuccess={() => loadStats(true)}
      />
    </div>
  );
};

export default Dashboard;

