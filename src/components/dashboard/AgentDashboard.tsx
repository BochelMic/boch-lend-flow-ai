
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
  RefreshCw
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

const AgentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    activeClients: 0,
    todayCollections: 0,
    pendingLoans: 0,
    totalCommission: 0,
  });
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
        .select('*')
        .eq('agent_id', user!.id);

      const pendingLoans = loans?.filter(l => l.status === 'pending').length || 0;

      // Pagamentos de hoje dos empréstimos do agente
      const today = new Date().toISOString().split('T')[0];
      const loanIds = loans?.map(l => l.id) || [];
      let todayCollections = 0;
      if (loanIds.length > 0) {
        const { data: todayPayments } = await supabase
          .from('payments')
          .select('amount')
          .in('loan_id', loanIds)
          .eq('payment_date', today);
        todayCollections = todayPayments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;
      }

      // Total de pagamentos recebidos (para comissão estimada 5%)
      let totalReceived = 0;
      if (loanIds.length > 0) {
        const { data: allPayments } = await supabase
          .from('payments')
          .select('amount')
          .in('loan_id', loanIds);
        totalReceived = allPayments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;
      }
      const totalCommission = Math.round(totalReceived * 0.05);

      setStats({
        activeClients: activeClients || 0,
        todayCollections,
        pendingLoans,
        totalCommission,
      });

      // Dados mensais (últimos 6 meses)
      const months: any[] = [];
      const now = new Date();
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

      // Dados semanais
      const days = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab', 'Dom'];
      const weekData = days.map(day => ({ day, collected: 0 }));
      if (loanIds.length > 0) {
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);
        const { data: weekPayments } = await supabase
          .from('payments')
          .select('amount, payment_date')
          .in('loan_id', loanIds)
          .gte('payment_date', weekStart.toISOString().split('T')[0]);

        weekPayments?.forEach(p => {
          const dayIndex = new Date(p.payment_date).getDay();
          const adjustedIndex = dayIndex === 0 ? 6 : dayIndex - 1;
          if (adjustedIndex < 7) {
            weekData[adjustedIndex].collected += Number(p.amount);
          }
        });
      }
      setWeeklyData(weekData);
    } catch (error) {
      console.error('Error loading agent data:', error);
    } finally {
      setLoading(false);
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
              Cobranças Hoje
            </CardTitle>
            <div className="p-2 rounded-lg bg-success/15">
              <DollarSign className="h-4 w-4 text-success" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-black text-success">{stats.todayCollections.toLocaleString()}</div>
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

        <Card className="border-secondary/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2 p-4">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Comissão
            </CardTitle>
            <div className="p-2 rounded-lg bg-secondary/15">
              <Target className="h-4 w-4 text-secondary" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-black text-secondary">{stats.totalCommission.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">MZN (5%)</p>
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
              Cobranças da Semana
            </CardTitle>
            <CardDescription>
              Valores cobrados esta semana
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
                    dataKey="collected"
                    stroke="hsl(var(--success))"
                    strokeWidth={3}
                    name="Coletado"
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
        <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Button className="justify-start bg-gradient-primary hover:opacity-90 shadow-primary" onClick={() => navigate('/agente/emprestimos')}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Empréstimo
          </Button>
          <Button variant="outline" className="justify-start border-success text-success hover:bg-success/10" onClick={() => navigate('/agente/cobrancas')}>
            <DollarSign className="mr-2 h-4 w-4" />
            Registrar Cobrança
          </Button>
          <Button variant="outline" className="justify-start border-accent text-accent hover:bg-accent/10" onClick={() => navigate('/agente/clientes')}>
            <Users className="mr-2 h-4 w-4" />
            Listar Clientes
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AgentDashboard;