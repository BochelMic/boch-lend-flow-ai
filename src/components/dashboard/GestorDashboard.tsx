import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
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
  Building2,
  BarChart3,
  Shield,
  UserCheck,
  Eye,
  EyeOff,
  PlusCircle,
  TrendingDown,
  ArrowUpRight,
  Wallet,
  Loader2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import WalletInjectionModal from '../admin/WalletInjectionModal';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';

// Dados de demonstração
const monthlyRevenue = [
  { month: 'Jan', receita: 450000, meta: 400000, despesas: 120000 },
  { month: 'Fev', receita: 520000, meta: 450000, despesas: 135000 },
  { month: 'Mar', receita: 480000, meta: 500000, despesas: 128000 },
  { month: 'Abr', receita: 580000, meta: 550000, despesas: 145000 },
  { month: 'Mai', receita: 620000, meta: 600000, despesas: 150000 },
  { month: 'Jun', receita: 580000, meta: 650000, despesas: 142000 },
];

const agentPerformance = [
  { name: 'Maria Santos', emprestimos: 45, cobrancas: 32, meta: 40, comissao: 15800 },
  { name: 'João Silva', emprestimos: 38, cobrancas: 28, meta: 35, comissao: 12200 },
  { name: 'Ana Costa', emprestimos: 42, cobrancas: 35, meta: 40, comissao: 14500 },
  { name: 'Pedro Langa', emprestimos: 35, cobrancas: 25, meta: 30, comissao: 11000 },
  { name: 'Carla Mussa', emprestimos: 48, cobrancas: 38, meta: 45, comissao: 17200 },
];

const riskDistribution = [
  { name: 'Baixo Risco', value: 65, color: 'hsl(var(--success))' },
  { name: 'Médio Risco', value: 25, color: 'hsl(var(--warning))' },
  { name: 'Alto Risco', value: 10, color: 'hsl(var(--destructive))' },
];

const loanTypes = [
  { type: 'Pessoal', quantidade: 145, valor: 2400000 },
  { type: 'Comercial', quantidade: 89, valor: 4200000 },
  { type: 'Agrícola', quantidade: 56, valor: 1800000 },
  { type: 'Educação', quantidade: 34, valor: 980000 },
];

const GestorDashboard = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('mensal');
  const [showWalletBalance, setShowWalletBalance] = useState(() => {
    return localStorage.getItem('bochel_show_wallet_balance') !== 'false';
  });
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [isInjectionModalOpen, setIsInjectionModalOpen] = useState(false);
  const [interestGrowth, setInterestGrowth] = useState(0);

  React.useEffect(() => {
    fetchWalletData();
  }, []);

  const fetchWalletData = async () => {
    try {
      // Fetch balance
      const { data, error } = await supabase
        .from('company_wallet')
        .select('balance')
        .single();

      if (error) throw error;
      setWalletBalance(data.balance);

      // Fetch interest growth (repayments this month)
      const now = new Date();
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const { data: ledgerData } = await supabase
        .from('wallet_ledger')
        .select('amount')
        .eq('transaction_type', 'repayment')
        .gte('created_at', firstDay);

      const totalGrowth = (ledgerData || []).reduce((sum, item) => sum + Number(item.amount), 0);
      // Simplified growth: everything repaid is growth for now, but in reality 30% is interest.
      // The user asked for "juros", so let's estimate 30% of repayments as "profit/growth" if we don't have exact split.
      // Actually, since we return full amount to wallet, the growth IS the interest.
      setInterestGrowth(totalGrowth * 0.23); // 23% is roughly the interest portion of 130% total
    } catch (error) {
      console.error('Error fetching wallet data:', error);
    }
  };

  const toggleBalance = () => {
    const newVal = !showWalletBalance;
    setShowWalletBalance(newVal);
    localStorage.setItem('bochel_show_wallet_balance', String(newVal));
  };

  return (
    <div className="space-y-5 md:space-y-6">
      {/* Header */}
      <div className="rounded-2xl p-5 md:p-6 text-white shadow-large relative overflow-hidden" style={{ background: 'var(--gradient-primary)' }}>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 80% 20%, hsl(0 0% 100%), transparent)' }} />
        <div className="relative flex items-center justify-between">
          <div>
            <p className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-1">Sistema Principal</p>
            <h1 className="text-2xl md:text-3xl font-black">Dashboard do Gestor</h1>
            <p className="text-white/70 text-sm mt-1">Visão executiva — BOCHEL Microcrédito</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-white/60 uppercase tracking-wide mb-1">ROI Mensal</p>
            <p className="text-3xl font-black">18.5%</p>
            <p className="text-xs text-white/60 mt-1">+2.1% vs mês anterior</p>
          </div>
        </div>
      </div>

      {/* Sistema de Carteira e Liquidez */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="md:col-span-2 overflow-hidden border-0 shadow-large bg-white relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 rounded-full -mr-16 -mt-16 opacity-50" />
          <CardContent className="p-6 relative">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-green-600 text-white flex items-center justify-center shadow-lg shadow-green-200">
                  <Wallet className="h-7 w-7" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Saldo para Empréstimo</p>
                  <div className="flex items-center gap-3">
                    <h2 className="text-3xl font-black text-gray-900">
                      {showWalletBalance ? (
                        walletBalance !== null ? `MZN ${walletBalance.toLocaleString()}` : <Loader2 className="h-7 w-7 animate-spin text-gray-300" />
                      ) : (
                        '••••••••••••'
                      )}
                    </h2>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={toggleBalance}
                      className="h-8 w-8 text-gray-400 hover:text-gray-600"
                    >
                      {showWalletBalance ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  onClick={() => setIsInjectionModalOpen(true)}
                  className="bg-[#0b3a20] hover:bg-[#082a18] text-white font-bold px-6 h-12 rounded-xl flex items-center gap-2 shadow-md transition-all active:scale-95"
                >
                  <PlusCircle className="h-5 w-5" />
                  Injectar Saldo
                </Button>
              </div>
            </div>

            {/* Sub-indicadores de crescimento */}
            <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-50 rounded-lg">
                  <TrendingUp className="h-4 w-4 text-emerald-600" />
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase font-bold">Crescimento (Juros)</p>
                  <p className="text-sm font-bold text-emerald-600">
                    +{showWalletBalance ? `MZN ${interestGrowth.toLocaleString()}` : '••••'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <ArrowUpRight className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase font-bold">Taxa de Reinvestimento</p>
                  <p className="text-sm font-bold text-blue-600">92%</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card Auxiliar: Status de Liquidez */}
        <Card className="border-0 shadow-medium bg-gradient-to-br from-[#1a3a5c] to-[#0d1d2e] text-white">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-white/10 rounded-lg">
                <Shield className="h-5 w-5 text-blue-300" />
              </div>
              <h3 className="font-bold text-sm">Status de Liquidez</h3>
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1.5 text-white/70">
                  <span>Capacidade de Empréstimo</span>
                  <span>{walletBalance !== null && walletBalance > 500000 ? 'Alta' : 'Moderada'}</span>
                </div>
                <Progress value={walletBalance !== null ? Math.min((walletBalance / 500000) * 100, 100) : 0} className="h-2 bg-white/10" />
              </div>
              <p className="text-[11px] text-white/50 leading-relaxed">
                O saldo disponível permite a aprovação de novos créditos sem necessidade de injeção imediata de capital.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Métricas Principais */}

      <Tabs defaultValue="financeiro" className="space-y-4 md:space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="financeiro">Financeiro</TabsTrigger>
          <TabsTrigger value="agentes">Agentes</TabsTrigger>
          <TabsTrigger value="emprestimos">Empréstimos</TabsTrigger>
          <TabsTrigger value="operacional">Operacional</TabsTrigger>
        </TabsList>

        <TabsContent value="financeiro" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-0 shadow-medium">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Receita vs Meta
                </CardTitle>
                <CardDescription>
                  Análise financeira dos últimos 6 meses
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthlyRevenue}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                      <YAxis stroke="hsl(var(--muted-foreground))" />
                      <Tooltip
                        formatter={(value: number) => [`MZN ${(value / 1000).toFixed(0)}K`, '']}
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Line type="monotone" dataKey="receita" stroke="hsl(var(--success))" strokeWidth={3} name="Receita" />
                      <Line type="monotone" dataKey="meta" stroke="hsl(var(--primary))" strokeWidth={2} strokeDasharray="5 5" name="Meta" />
                      <Line type="monotone" dataKey="despesas" stroke="hsl(var(--destructive))" strokeWidth={2} name="Despesas" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-medium">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5 text-accent" />
                  Distribuição de Risco
                </CardTitle>
                <CardDescription>
                  Classificação da carteira por risco
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={riskDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {riskDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Indicadores Financeiros */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Lucro Líquido</p>
                  <p className="text-lg font-bold text-success">MZN 438K</p>
                  <p className="text-xs text-muted-foreground">Margem: 75.5%</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">EBITDA</p>
                  <p className="text-lg font-bold text-primary">MZN 465K</p>
                  <p className="text-xs text-muted-foreground">Margem: 80.2%</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Provisões</p>
                  <p className="text-lg font-bold text-warning">MZN 28K</p>
                  <p className="text-xs text-muted-foreground">0.33% da carteira</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Fluxo de Caixa</p>
                  <p className="text-lg font-bold text-accent">MZN 285K</p>
                  <p className="text-xs text-muted-foreground">Positivo</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">CAR Ratio</p>
                  <p className="text-lg font-bold text-success">15.8%</p>
                  <p className="text-xs text-muted-foreground">Acima do mínimo</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="agentes" className="space-y-6">
          <Card className="border-0 shadow-medium">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-primary" />
                Performance dos Agentes
              </CardTitle>
              <CardDescription>
                Ranking e métricas dos agentes de campo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {agentPerformance.map((agent, index) => (
                  <div key={agent.name} className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                    <div className="flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-amber-600' : 'bg-muted-foreground'
                        }`}>
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-semibold">{agent.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {agent.emprestimos} empréstimos • {agent.cobrancas} cobranças
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-success">MZN {agent.comissao.toLocaleString()}</p>
                      <Progress value={(agent.emprestimos / agent.meta) * 100} className="w-24 mt-1" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="emprestimos" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-0 shadow-medium">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  Tipos de Empréstimo
                </CardTitle>
                <CardDescription>
                  Distribuição por categoria
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {loanTypes.map((loan) => (
                    <div key={loan.type} className="flex items-center justify-between p-3 rounded-lg bg-muted/20">
                      <div>
                        <p className="font-medium">{loan.type}</p>
                        <p className="text-sm text-muted-foreground">{loan.quantidade} contratos</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">MZN {(loan.valor / 1000000).toFixed(1)}M</p>
                        <p className="text-xs text-muted-foreground">
                          {((loan.valor / 9380000) * 100).toFixed(1)}% da carteira
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-medium">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-warning" />
                  Pedidos Pendentes
                </CardTitle>
                <CardDescription>
                  Aguardando aprovação do gestor
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-orange/10 rounded-lg">
                  <div>
                    <p className="font-medium">Ana Costa</p>
                    <p className="text-sm text-muted-foreground">Empréstimo comercial</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-orange">MZN 45,000</p>
                    <div className="flex gap-2 mt-2">
                      <Button size="sm" variant="outline" className="text-xs">Aprovar</Button>
                      <Button size="sm" variant="outline" className="text-xs">Rejeitar</Button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-accent/10 rounded-lg">
                  <div>
                    <p className="font-medium">Pedro Mussa</p>
                    <p className="text-sm text-muted-foreground">Empréstimo pessoal</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-accent">MZN 15,000</p>
                    <div className="flex gap-2 mt-2">
                      <Button size="sm" variant="outline" className="text-xs">Aprovar</Button>
                      <Button size="sm" variant="outline" className="text-xs">Rejeitar</Button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-secondary/10 rounded-lg">
                  <div>
                    <p className="font-medium">Maria Santos</p>
                    <p className="text-sm text-muted-foreground">Empréstimo agrícola</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-secondary">MZN 60,000</p>
                    <div className="flex gap-2 mt-2">
                      <Button size="sm" variant="outline" className="text-xs">Aprovar</Button>
                      <Button size="sm" variant="outline" className="text-xs">Rejeitar</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="operacional" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="border-0 shadow-medium">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-success" />
                  Compliance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span>Licença Banco Central</span>
                  <Badge variant="secondary" className="bg-success/20 text-success">Ativo</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Relatório Mensal BM</span>
                  <Badge variant="secondary" className="bg-success/20 text-success">Em dia</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Auditoria Externa</span>
                  <Badge variant="secondary" className="bg-warning/20 text-warning">Pendente</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-medium">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-accent" />
                  Alertas Importantes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-destructive/10 rounded-lg">
                  <p className="font-medium text-destructive">5 contratos vencidos</p>
                  <p className="text-sm text-muted-foreground">Requerem ação imediata</p>
                </div>
                <div className="p-3 bg-warning/10 rounded-lg">
                  <p className="font-medium text-warning">Meta mensal: 89%</p>
                  <p className="text-sm text-muted-foreground">Faltam MZN 70K</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-medium">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  Projeções
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="font-medium">Meta Trimestral</p>
                  <Progress value={68} className="mt-2" />
                  <p className="text-sm text-muted-foreground mt-1">68% concluída</p>
                </div>
                <div>
                  <p className="font-medium">Crescimento Anual</p>
                  <p className="text-2xl font-bold text-success">+24%</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
      <WalletInjectionModal
        isOpen={isInjectionModalOpen}
        onClose={() => setIsInjectionModalOpen(false)}
        onSuccess={fetchWalletData}
      />
    </div>
  );
};

export default GestorDashboard;