import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import {
  Users,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  CreditCard,
  Calendar,
  Target,
  PieChart,
  Bell,
  MessageSquare,
  FileText,
  CheckCircle,
  Clock,
  XCircle,
  Eye,
  EyeOff,
  PlusCircle,
  Wallet,
  Loader2,
  ArrowRight
} from 'lucide-react';
import MetricCard from './MetricCard';
import RiskAnalysis from './RiskAnalysis';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import WalletInjectionModal from '../admin/WalletInjectionModal';
import AuditModule from '../components/audit/AuditModule';
import { Button } from '../ui/button';

const Dashboard = () => {
  const [stats, setStats] = useState({
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
  const [loading, setLoading] = useState(true);
  const [showWalletBalance, setShowWalletBalance] = useState(() => {
    return localStorage.getItem('bochel_show_wallet_balance') !== 'false';
  });
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [isInjectionModalOpen, setIsInjectionModalOpen] = useState(false);
  const [walletLedger, setWalletLedger] = useState<any[]>([]);
  const [dataError, setDataError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [diagnostic, setDiagnostic] = useState<string[]>([]);

  useEffect(() => {
    loadStats();
  }, []);

  const addDiag = (msg: string) => {
    setDiagnostic(prev => [...prev, `${new Date().toLocaleTimeString()} - ${msg}`]);
  };

  const loadStats = async () => {
    const diag: string[] = [];
    const log = (msg: string) => {
      const entry = `${new Date().toLocaleTimeString()} - ${msg}`;
      diag.push(entry);
      setDiagnostic([...diag]);
      console.log('[Dashboard Diag]', msg);
    };

    // Timeout helper: rejeita se a promise demorar mais que ms
    const withTimeout = <T,>(promise: Promise<T>, ms: number, label: string): Promise<T> => {
      return Promise.race([
        promise,
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error(`Timeout: ${label} demorou mais de ${ms/1000}s`)), ms)
        )
      ]);
    };

    try {
      // NÃO chamar getSession() - congela em alguns computadores.
      // As queries usam o token já guardado pelo AuthContext.
      log('Iniciando carregamento de dados (sem verificar sessão)...');

      // Testar query simples com timeout
      log('Testando ligação à base de dados...');
      const testStart = Date.now();
      const { count: testCount, error: testErr } = await withTimeout(
        supabase
          .from('clients')
          .select('*', { count: 'exact', head: true })
          .limit(1),
        10000,
        'Teste BD'
      );
      const testTime = Date.now() - testStart;

      if (testErr) {
        log(`❌ Falha na BD (${testTime}ms): ${testErr.message} [code: ${testErr.code}]`);
        setDataError(true);
        setErrorMessage(`BD: ${testErr.message} (code: ${testErr.code})`);
        setLoading(false);
        return;
      }
      log(`✅ BD OK (${testTime}ms) - Clientes encontrados: ${testCount}`);

      // Clientes ativos
      log('Buscando clientes ativos...');
      const { count: totalClients, error: err1 } = await withTimeout(
        supabase
          .from('clients')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'active'),
        10000,
        'Clientes Ativos'
      );
      if (err1) throw err1;
      log(`✅ Clientes: ${totalClients}`);

      // Empréstimos
      log('Buscando empréstimos...');
      const { data: loans, error: err2 } = await withTimeout(
        supabase
          .from('loans')
          .select('amount, total_amount, remaining_amount, interest_rate, status'),
        10000,
        'Empréstimos'
      );
      if (err2) throw err2;
      log(`✅ Empréstimos: ${loans?.length || 0}`);

      const activeLoans = loans?.filter(l => l.status === 'active').length || 0;
      const pendingLoans = loans?.filter(l => l.status === 'pending').length || 0;
      const completedLoans = loans?.filter(l => l.status === 'completed').length || 0;
      const totalLoanAmount = loans?.reduce((sum, l) => sum + Number(l.amount), 0) || 0;
      const totalValue = loans?.reduce((sum, l) => sum + Number(l.total_amount), 0) || 0;
      const totalInterest = totalValue - totalLoanAmount;
      const overdueLoans = loans?.filter(l => l.status === 'overdue').length || 0;
      const defaultRate = loans && loans.length > 0 ? ((overdueLoans / loans.length) * 100) : 0;

      // Pagamentos
      log('Buscando pagamentos...');
      const { data: payments, error: err3 } = await withTimeout(
        supabase
          .from('payments')
          .select('amount'),
        10000,
        'Pagamentos'
      );
      if (err3) throw err3;
      const totalPaid = payments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;
      log(`✅ Pagamentos: ${payments?.length || 0}`);

      // Pedidos de crédito pendentes
      log('Buscando pedidos...');
      const { count: creditRequests, error: err4 } = await withTimeout(
        supabase
          .from('credit_requests')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending'),
        10000,
        'Pedidos'
      );
      if (err4) throw err4;
      log(`✅ Pedidos: ${creditRequests}`);

      // Notificações
      log('Buscando notificações...');
      const { count: notificationsSent, error: err5 } = await withTimeout(
        supabase
          .from('notifications')
          .select('*', { count: 'exact', head: true }),
        10000,
        'Notificações'
      );
      if (err5) throw err5;
      log(`✅ Notificações: ${notificationsSent}`);

      // Mensagens
      log('Buscando mensagens...');
      const { count: messagesReceived, error: err6 } = await withTimeout(
        supabase
          .from('chat_messages')
          .select('*', { count: 'exact', head: true }),
        10000,
        'Mensagens'
      );
      if (err6) throw err6;
      log(`✅ Mensagens: ${messagesReceived}`);

      const roi = totalLoanAmount > 0 ? ((totalPaid / totalLoanAmount) * 100) : 0;

      setStats({
        totalClients: totalClients || 0,
        totalLoanAmount,
        totalInterest,
        lateInterest: 0,
        totalValue,
        activeLoans,
        pendingLoans,
        completedLoans,
        notificationsSent: notificationsSent || 0,
        messagesReceived: messagesReceived || 0,
        creditRequests: creditRequests || 0,
        defaultRate: Math.round(defaultRate * 10) / 10,
        roi: Math.round(roi * 10) / 10,
      });

      // Fetch Wallet Balance
      log('Buscando saldo...');
      const { data: walletData, error: err7 } = await withTimeout(
        supabase
          .from('company_wallet')
          .select('balance')
          .single(),
        10000,
        'Saldo'
      );
      
      if (err7) log(`⚠️ Saldo: ${err7.message}`);
      if (walletData) setWalletBalance(walletData.balance);

      // Fetch Recent Ledger
      const { data: ledgerData, error: err8 } = await withTimeout(
        supabase
          .from('wallet_ledger')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5),
        10000,
        'Ledger'
      );
        
      if (err8) log(`⚠️ Ledger: ${err8.message}`);
      if (ledgerData) setWalletLedger(ledgerData);

      log('🎉 Tudo carregado com sucesso!');
    } catch (error: any) {
      console.error('Error loading dashboard stats:', error);
      log(`❌ ERRO FATAL: ${error.message || 'desconhecido'}`);
      setDataError(true);
      setErrorMessage(error.message || 'Erro desconhecido');
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
    if (value >= 1000000) return `MZN ${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `MZN ${(value / 1000).toFixed(1)}K`;
    return `MZN ${value.toLocaleString()}`;
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {dataError && (
        <div className="bg-warning/10 border-l-4 border-warning text-warning-foreground p-4 rounded-md shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-warning" />
            <div>
              <p className="font-bold text-sm">Falha ao carregar dados do painel</p>
              <p className="text-xs opacity-90">
                {errorMessage ? `Detalhe técnico: ${errorMessage}` : 'Houve um erro ao comunicar com a base de dados. Os números apresentados podem ser 0 ou desatualizados.'}
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => { setDiagnostic([]); setDataError(false); setErrorMessage(null); setLoading(true); loadStats(); }} className="shrink-0 bg-white border-warning/30 hover:bg-warning/20">
            Tentar Novamente
          </Button>
        </div>
      )}

      {/* PAINEL DE DIAGNÓSTICO TEMPORÁRIO - REMOVER DEPOIS */}
      {diagnostic.length > 0 && (
        <div className="bg-gray-900 text-green-400 p-4 rounded-lg text-xs font-mono max-h-48 overflow-y-auto border border-green-500/30">
          <p className="text-white font-bold mb-2">🔍 DIAGNÓSTICO DO SISTEMA (temporário)</p>
          {diagnostic.map((line, i) => (
            <p key={i} className={line.includes('❌') ? 'text-red-400' : line.includes('⚠️') ? 'text-yellow-400' : ''}>{line}</p>
          ))}
          {loading && <p className="animate-pulse text-blue-400">⏳ A processar...</p>}
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
                        walletBalance !== null ? `MZN ${walletBalance.toLocaleString()}` : '...'
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

              <Button
                onClick={() => setIsInjectionModalOpen(true)}
                className="bg-success hover:bg-success/90 text-white font-bold h-12 px-6 rounded-xl flex items-center gap-2 shadow-lg shadow-success/20 transition-all active:scale-95"
              >
                <PlusCircle className="h-5 w-5" />
                Injectar Saldo
              </Button>
            </div>

            {loading ? (
              <div className="flex gap-4 mt-8">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-12 w-full bg-white/5 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-white/5 pt-6">
                <div className="space-y-1">
                  <p className="text-[10px] text-white/40 uppercase font-black tracking-tighter">Entradas (Mes)</p>
                  <p className="text-sm font-bold text-success">+ MZN {walletLedger.filter(l => l.transaction_type !== 'disbursement').reduce((s, l) => s + Number(l.amount), 0).toLocaleString()}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-white/40 uppercase font-black tracking-tighter">Saídas (Mes)</p>
                  <p className="text-sm font-bold text-destructive">- MZN {walletLedger.filter(l => l.transaction_type === 'disbursement').reduce((s, l) => s + Number(l.amount), 0).toLocaleString()}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-white/40 uppercase font-black tracking-tighter">Liquidez Pendente</p>
                  <p className="text-sm font-bold text-info">MZN {(stats.creditRequests * 5000).toLocaleString()} (est.)</p>
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
                <p className="text-sm md:text-lg font-bold truncate">MZN {stats.totalLoanAmount.toLocaleString()}</p>
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
                <p className="text-sm md:text-lg font-bold text-success truncate">MZN {stats.totalInterest.toLocaleString()}</p>
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
                <p className="text-sm md:text-lg font-bold text-destructive truncate">MZN {stats.lateInterest.toLocaleString()}</p>
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
                <p className="text-sm md:text-lg font-bold text-secondary truncate">MZN {stats.totalValue.toLocaleString()}</p>
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
        onSuccess={loadStats}
      />
    </div>
  );
};

export default Dashboard;
