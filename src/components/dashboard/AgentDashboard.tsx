
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import {
  Users,
  DollarSign,
  Target,
  Calendar,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Plus,
  RefreshCw,
  Download
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

const AgentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [stats, setStats] = useState({
    activeClients: 0,
    monthlySales: 0,
    monthlyGoal: 0,
    pendingLoans: 0,
    totalDebt: 0,
    recoveryRate: 0,
    overdueClients: 0,
    upcomingCollections: 0,
  });
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [loansList, setLoansList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingPdf, setGeneratingPdf] = useState(false);

  useEffect(() => {
    if (user) loadAgentData();
  }, [user]);

  const loadAgentData = async () => {
    try {
      // Clientes do agente
      const { count: activeClients } = await supabase
        .from('clients')
        .select('*', { count: 'exact', head: true })
        .eq('agent_id', user!.id)
        .eq('status', 'active');

      // Empréstimos do agente
      const { data: loans } = await supabase
        .from('loans')
        .select('*, clients(name)')
        .eq('agent_id', user!.id);

      const pendingLoans = loans?.filter(l => l.status === 'pending').length || 0;
      const overdueClients = loans?.filter(l => l.status === 'overdue').length || 0;
      const totalDebt = loans?.reduce((sum, l) => sum + Number(l.remaining_amount), 0) || 0;

      const totalDisbursed = loans?.reduce((sum, l) => sum + Number(l.total_amount), 0) || 0;
      const totalRemaining = loans?.reduce((sum, l) => sum + Number(l.remaining_amount), 0) || 0;
      const totalPaid = totalDisbursed - totalRemaining;
      const recoveryRate = totalDisbursed > 0 ? Math.round((totalPaid / totalDisbursed) * 100) : 0;

      const now = new Date();
      const nextWeek = new Date();
      nextWeek.setDate(now.getDate() + 7);

      let upcomingCollections = 0;
      loans?.forEach(l => {
        if (l.amortization_plan && Array.isArray(l.amortization_plan)) {
          l.amortization_plan.forEach((p: any) => {
            const pDate = new Date(p.date);
            if (pDate >= now && pDate <= nextWeek) {
              upcomingCollections += Number(p.total);
            }
          });
        }
      });

      // Vendas do mês (Total de empréstimos)
      const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthlySales = loans?.filter(l => new Date(l.created_at) >= currentMonthStart && l.status !== 'rejected')
        .reduce((sum, l) => sum + Number(l.amount), 0) || 0;

      // Goal do agente para este mês
      const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
      const { data: goals } = await supabase
        .from('agent_goals')
        .select('target_amount')
        .eq('agent_id', user!.id)
        .eq('month', currentMonth)
        .limit(1);

      const monthlyGoal = goals?.[0]?.target_amount || 0;

      setStats({
        activeClients: activeClients || 0,
        monthlySales,
        monthlyGoal,
        pendingLoans,
        totalDebt,
        recoveryRate,
        overdueClients,
        upcomingCollections,
      });

      // Dados mensais (últimos 6 meses)
      const months: any[] = [];
      const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const nextD = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
        const monthLoans = loans?.filter(l => {
          const cd = new Date(l.created_at);
          return cd >= d && cd < nextD;
        }).length || 0;
        months.push({
          month: monthNames[d.getMonth()],
          emprestimos: monthLoans,
        });
      }
      setMonthlyData(months);

      // Dados semanais (Valores emprestados, não cobrados)
      const days = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab', 'Dom'];
      const weekData = days.map(day => ({ day, sales: 0 }));
      if (loans && loans.length > 0) {
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);

        loans?.forEach(l => {
          if (new Date(l.created_at) >= weekStart && l.status !== 'rejected') {
            const dayIndex = new Date(l.created_at).getDay();
            const adjustedIndex = dayIndex === 0 ? 6 : dayIndex - 1;
            if (adjustedIndex < 7) {
              weekData[adjustedIndex].sales += Number(l.amount);
            }
          }
        });
      }
      setWeeklyData(weekData);
      setLoansList(loans || []);
    } catch (error) {
      console.error('Error loading agent data:', error);
    } finally {
      setLoading(false);
    }
  };

  type ReportPeriod = 'hoje' | 'este_mes' | 'mes_passado' | 'tudo';

  const generateAgentReport = async (period: ReportPeriod = 'este_mes') => {
    setGeneratingPdf(true);
    try {
      const doc = new jsPDF();
      const now = new Date();
      const monthStr = now.toLocaleDateString('pt-MZ', { month: 'long', year: 'numeric' });

      // Tentar carregar a logo (base64)
      try {
        const response = await fetch('/logo-bochel.png');
        const blob = await response.blob();
        const base64data = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });
        doc.addImage(base64data, 'PNG', 14, 10, 40, 15);
      } catch (e) {
        console.warn('Could not load logo for PDF', e);
      }

      // Header
      doc.setFontSize(22);
      doc.setTextColor(26, 58, 92); // #1a3a5c primary
      doc.text('Relatório Mensal de Agente', 14, 35);

      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      doc.text(`Agente: ${user?.name || 'Não identificado'}`, 14, 45);
      doc.text(`Mês/Ano: ${monthStr}`, 14, 51);
      doc.text(`Criado em: ${now.toLocaleDateString('pt-MZ')} às ${now.toLocaleTimeString('pt-MZ')}`, 14, 57);

      // Linha separadora
      doc.setDrawColor(211, 124, 34); // secondary
      doc.setLineWidth(1);
      doc.line(14, 63, 196, 63);

      // Resumo de Metricas (Caixas)
      doc.setFontSize(14);
      doc.setTextColor(30, 30, 30);
      doc.text('Resumo de Desempenho', 14, 73);

      doc.setFontSize(10);
      doc.setTextColor(60, 60, 60);

      const metrics = [
        ['Vendas no Mês (MZN)', `${stats.monthlySales.toLocaleString()}`],
        ['Meta do Mês (MZN)', `${stats.monthlyGoal.toLocaleString()}`],
        ['Progresso da Meta', `${stats.monthlyGoal > 0 ? Math.round((stats.monthlySales / stats.monthlyGoal) * 100) : 0}%`],
        ['Clientes Ativos', `${stats.activeClients}`],
        ['Carteira em Risco (MZN)', `${stats.totalDebt.toLocaleString()}`],
        ['Taxa de Recuperação', `${stats.recoveryRate}%`],
      ];

      autoTable(doc, {
        startY: 79,
        head: [['Métrica', 'Valor']],
        body: metrics,
        theme: 'grid',
        headStyles: { fillColor: [26, 58, 92], textColor: 255 },
        columnStyles: {
          0: { cellWidth: 100, fontStyle: 'bold' },
          1: { cellWidth: 80, halign: 'right' },
        },
        margin: { left: 14 }
      });

      // Filtragem por período escolhido
      let filteredLoans = [...loansList];

      if (period === 'hoje') {
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        filteredLoans = filteredLoans.filter(l => new Date(l.created_at) >= todayStart);
        doc.text(`Filtro: Vendas de Hoje`, 14, 51);
      } else if (period === 'este_mes') {
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        filteredLoans = filteredLoans.filter(l => {
          const d = new Date(l.created_at);
          return d >= monthStart && d < nextMonth;
        });
        doc.text(`Filtro: Este Mês`, 14, 51);
      } else if (period === 'mes_passado') {
        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        filteredLoans = filteredLoans.filter(l => {
          const d = new Date(l.created_at);
          return d >= lastMonthStart && d < thisMonthStart;
        });
        doc.text(`Filtro: Mês Passado`, 14, 51);
      } else if (period === 'tudo') {
        doc.text(`Filtro: Todo o Histórico`, 14, 51);
      }

      // Remover rejeitados
      filteredLoans = filteredLoans.filter(l => l.status !== 'rejected');

      const FinalY = (doc as any).lastAutoTable.finalY + 15;

      doc.setFontSize(14);
      doc.setTextColor(30, 30, 30);
      doc.text('Detalhes das Vendas do Período', 14, FinalY);

      if (filteredLoans.length > 0) {
        const tableData = filteredLoans.map(loan => {
          // Se tiver joined da tabela clients, usa clients.name, senão client_name, senão Desconhecido
          const cName = loan.clients?.name || loan.client_name || 'Desconhecido';
          return [
            cName,
            `${Number(loan.amount).toLocaleString()} MZN`,
            `${Number(loan.total_amount).toLocaleString()} MZN`,
            new Date(loan.created_at).toLocaleDateString('pt-MZ'),
            loan.status
          ];
        });

        autoTable(doc, {
          startY: FinalY + 6,
          head: [['Cliente', 'Valor Principal', 'Total c/ Juros', 'Data', 'Estado']],
          body: tableData,
          theme: 'striped',
          headStyles: { fillColor: [211, 124, 34], textColor: 255 },
          styles: { fontSize: 9 }
        });
      } else {
        doc.setFontSize(10);
        doc.setTextColor(150, 150, 150);
        doc.text('Nenhuma venda registrada este mês.', 14, FinalY + 10);
      }

      // Rodapé
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(`Página ${i} de ${pageCount} - Plataforma Bochel Microcrédito`, 14, 290);
      }

      // Gravar nome com mês
      const fileName = `Relatorio_Agente_${(user?.name || 'Agente').replace(/\s+/g, '_')}_${now.getMonth() + 1}_${now.getFullYear()}.pdf`;
      doc.save(fileName);

      toast({ title: 'Relatório Gerado!', description: 'O relatório foi baixado com sucesso.' });
    } catch (e) {
      console.error(e);
      toast({ title: 'Erro', description: 'Não foi possível gerar o relatório', variant: 'destructive' });
    } finally {
      setGeneratingPdf(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-5 md:space-y-6">
      {/* Header */}
      <div className="rounded-2xl p-5 md:p-6 text-white shadow-large relative overflow-hidden" style={{ background: 'var(--gradient-accent)' }}>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 80% 50%, hsl(0 0% 100%), transparent)' }} />
        <div className="relative flex items-center justify-between">
          <div>
            <p className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-1">Subsistema</p>
            <h1 className="text-2xl md:text-3xl font-black">Dashboard do Agente</h1>
            <p className="text-white/70 text-sm mt-1">{user?.name || 'Agente'}</p>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                disabled={loading || generatingPdf}
                variant="outline"
                className="bg-white/10 border-white/20 text-white hover:bg-white hover:text-[#1a3a5c] shadow-lg backdrop-blur-sm transition-all relative overflow-hidden group"
              >
                {generatingPdf ? (
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Download className="mr-2 h-4 w-4 group-hover:-translate-y-1 transition-transform" />
                )}
                {generatingPdf ? 'A processar...' : 'Baixar PDF'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => generateAgentReport('hoje')} className="cursor-pointer">
                Relatório de Hoje
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => generateAgentReport('este_mes')} className="cursor-pointer">
                Relatório Deste Mês
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => generateAgentReport('mes_passado')} className="cursor-pointer">
                Relatório Mês Passado
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => generateAgentReport('tudo')} className="cursor-pointer">
                Todo o Histórico
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <Card className="border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2 p-4">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Clientes Ativos
            </CardTitle>
            <div className="p-2 rounded-lg bg-primary/15">
              <Users className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-black text-primary">{stats.activeClients}</div>
          </CardContent>
        </Card>

        <Card className="border-success/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2 p-4">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Vendas no Mês
            </CardTitle>
            <div className="p-2 rounded-lg bg-success/15">
              <DollarSign className="h-4 w-4 text-success" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-black text-success">{stats.monthlySales.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">MZN</p>
          </CardContent>
        </Card>

        <Card className="border-warning/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2 p-4">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Pendentes
            </CardTitle>
            <div className="p-2 rounded-lg bg-warning/15">
              <AlertCircle className="h-4 w-4 text-warning" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-black text-warning">{stats.pendingLoans}</div>
            <p className="text-xs text-muted-foreground mt-1">Requerem ação</p>
          </CardContent>
        </Card>

        <Card className="border-secondary/20 relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2 p-4">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide leading-none">
              Progresso da Meta
            </CardTitle>
            <div className="p-1.5 rounded-lg bg-secondary/15">
              <Target className="h-4 w-4 text-secondary" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="flex items-baseline gap-1 mb-2">
              <span className="text-xl font-black text-secondary">{stats.monthlySales.toLocaleString()}</span>
              <span className="text-xs font-medium text-muted-foreground">/ {stats.monthlyGoal.toLocaleString()} MZN</span>
            </div>
            <Progress
              value={stats.monthlyGoal > 0 ? Math.min((stats.monthlySales / stats.monthlyGoal) * 100, 100) : 0}
              className="h-2"
              indicatorColor="bg-secondary"
            />
            <p className="text-[10px] text-muted-foreground mt-2">
              {stats.monthlyGoal > 0
                ? `${Math.round((stats.monthlySales / stats.monthlyGoal) * 100)}% da meta atingida`
                : 'Meta não definida'}
            </p>
          </CardContent>
        </Card>

        {/* New Advanced Recovery Stats */}
        <Card className="border-red-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2 p-4">
            <CardTitle className="text-xs font-medium text-red-600 uppercase tracking-wide">
              Clientes em Atraso
            </CardTitle>
            <div className="p-2 rounded-lg bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-black text-red-600">{stats.overdueClients}</div>
            <p className="text-xs text-red-500/70 mt-1 italic font-medium">Requerem cobrança</p>
          </CardContent>
        </Card>

        <Card className="border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2 p-4">
            <CardTitle className="text-xs font-medium text-blue-600 uppercase tracking-wide">
              Carteira em Risco
            </CardTitle>
            <div className="p-2 rounded-lg bg-blue-50">
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-black text-blue-800">{stats.totalDebt.toLocaleString()}</div>
            <p className="text-xs text-blue-400 mt-1">MZN Total em Dívida</p>
          </CardContent>
        </Card>

        <Card className="border-emerald-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2 p-4">
            <CardTitle className="text-xs font-medium text-emerald-600 uppercase tracking-wide">
              Taxa de Recuperação
            </CardTitle>
            <div className="p-2 rounded-lg bg-emerald-50">
              <CheckCircle className="h-4 w-4 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-black text-emerald-700">{stats.recoveryRate}%</div>
            <Progress value={stats.recoveryRate} className="h-1.5 mt-2 bg-emerald-100" indicatorColor="bg-emerald-500" />
          </CardContent>
        </Card>

        <Card className="border-amber-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2 p-4">
            <CardTitle className="text-xs font-medium text-amber-600 uppercase tracking-wide">
              Cobranças (7 dias)
            </CardTitle>
            <div className="p-2 rounded-lg bg-amber-50">
              <Calendar className="h-4 w-4 text-amber-600" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-black text-amber-900">{stats.upcomingCollections.toLocaleString()}</div>
            <p className="text-xs text-amber-600/70 mt-1 font-medium italic">Estimado MZN</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Monthly Performance */}
        <Card className="border-0 shadow-medium">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Empréstimos por Mês
            </CardTitle>
            <CardDescription>
              Empréstimos criados nos últimos 6 meses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="emprestimos" fill="hsl(var(--primary))" name="Empréstimos" radius={4} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Weekly Collection Trend */}
        <Card className="border-0 shadow-medium">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-success" />
              Vendas da Semana
            </CardTitle>
            <CardDescription>
              Empréstimos realizados esta semana
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    formatter={(value: number) => [`MZN ${value.toLocaleString()}`, '']}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="sales"
                    stroke="hsl(var(--success))"
                    strokeWidth={3}
                    name="Vendas"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="border-0 shadow-medium">
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
          <CardDescription>
            Acesso direto às funcionalidades principais
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-2 gap-4">
          <Button className="justify-start bg-gradient-primary hover:opacity-90 shadow-primary" onClick={() => navigate('/agente/clientes')}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Cliente
          </Button>
          <Button variant="outline" className="justify-start border-accent text-accent hover:bg-accent/10" onClick={() => navigate('/agente/pedidos')}>
            <Users className="mr-2 h-4 w-4" />
            Ver Pedidos
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AgentDashboard;