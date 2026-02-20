import React from 'react';
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
  MapPin,
  Phone,
  Plus
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

const monthlyPerformance = [
  { month: 'Jan', emprestimos: 12, cobrancas: 8, meta: 15 },
  { month: 'Fev', emprestimos: 18, cobrancas: 12, meta: 15 },
  { month: 'Mar', emprestimos: 14, cobrancas: 10, meta: 15 },
  { month: 'Abr', emprestimos: 22, cobrancas: 15, meta: 20 },
  { month: 'Mai', emprestimos: 19, cobrancas: 14, meta: 20 },
  { month: 'Jun', emprestimos: 16, cobrancas: 11, meta: 20 },
];

const collectionTrend = [
  { day: 'Seg', collected: 45000, target: 50000 },
  { day: 'Ter', collected: 38000, target: 50000 },
  { day: 'Qua', collected: 52000, target: 50000 },
  { day: 'Qui', collected: 47000, target: 50000 },
  { day: 'Sex', collected: 55000, target: 50000 },
  { day: 'Sab', collected: 32000, target: 30000 },
];

const AgentDashboard = () => {
  return (
    <div className="space-y-5 md:space-y-6">
      {/* Header */}
      <div className="rounded-2xl p-5 md:p-6 text-white shadow-large relative overflow-hidden" style={{ background: 'var(--gradient-accent)' }}>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 80% 50%, hsl(0 0% 100%), transparent)' }} />
        <div className="relative flex items-center justify-between">
          <div>
            <p className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-1">Subsistema</p>
            <h1 className="text-2xl md:text-3xl font-black">Dashboard do Agente</h1>
            <p className="text-white/70 text-sm mt-1">Maria Santos — Zona Norte</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-white/70 mb-1">Meta Mensal</p>
            <p className="text-2xl font-black">85%</p>
            <Progress value={85} className="mt-2 w-28 h-1.5" />
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
            <div className="text-2xl font-black text-primary">127</div>
            <p className="text-xs text-muted-foreground mt-1">+12 este mês</p>
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
            <div className="text-2xl font-black text-success">47K</div>
            <p className="text-xs text-muted-foreground mt-1">Meta: MZN 50,000</p>
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
            <div className="text-2xl font-black text-warning">8</div>
            <p className="text-xs text-muted-foreground mt-1">Requerem aprovação</p>
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
            <div className="text-2xl font-black text-secondary">15.8K</div>
            <p className="text-xs text-muted-foreground mt-1">+18% vs anterior</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {/* Monthly Performance */}
          <Card className="border-0 shadow-medium">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Performance Mensal
              </CardTitle>
              <CardDescription>
                Empréstimos processados vs Meta
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyPerformance}>
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
                    <Bar dataKey="meta" fill="hsl(var(--muted))" name="Meta" radius={4} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Collection Trend */}
          <Card className="border-0 shadow-medium">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-success" />
                Tendência de Cobranças
              </CardTitle>
              <CardDescription>
                Cobranças realizadas esta semana
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={collectionTrend}>
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
                    <Line 
                      type="monotone" 
                      dataKey="target" 
                      stroke="hsl(var(--warning))" 
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      name="Meta" 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
      </div>

      {/* Tasks & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {/* Today's Tasks */}
          <Card className="border-0 shadow-medium">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-accent" />
                Tarefas de Hoje
              </CardTitle>
              <CardDescription>
                8 de 12 tarefas concluídas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-success/10">
                <CheckCircle className="h-5 w-5 text-success" />
                <div className="flex-1">
                  <p className="font-medium">Visita - João Silva</p>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    Rua A, 123 - Maputo
                  </p>
                </div>
                <Badge variant="secondary" className="bg-success/20 text-success">Concluído</Badge>
              </div>
              
              <div className="flex items-center gap-3 p-3 rounded-lg bg-warning/10">
                <AlertCircle className="h-5 w-5 text-warning" />
                <div className="flex-1">
                  <p className="font-medium">Cobrança - Ana Costa</p>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    +258 84 123 4567
                  </p>
                </div>
                <Badge variant="secondary" className="bg-warning/20 text-warning">Pendente</Badge>
              </div>
              
              <div className="flex items-center gap-3 p-3 rounded-lg bg-accent/10">
                <Users className="h-5 w-5 text-accent" />
                <div className="flex-1">
                  <p className="font-medium">Avaliação - Pedro Langa</p>
                  <p className="text-sm text-muted-foreground">
                    Empréstimo de MZN 25,000
                  </p>
                </div>
                <Badge variant="secondary" className="bg-accent/20 text-accent">Nova</Badge>
              </div>
              
              <div className="flex items-center gap-3 p-3 rounded-lg bg-orange/10">
                <Target className="h-5 w-5 text-orange" />
                <div className="flex-1">
                  <p className="font-medium">Follow-up - Maria João</p>
                  <p className="text-sm text-muted-foreground">
                    Renovação de contrato
                  </p>
                </div>
                <Badge variant="secondary" className="bg-orange/20 text-orange">Urgente</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="border-0 shadow-medium">
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
              <CardDescription>
                Acesso direto às funcionalidades principais
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="w-full justify-start bg-gradient-primary hover:opacity-90 shadow-primary">
                <Plus className="mr-2 h-4 w-4" />
                Novo Empréstimo
              </Button>
              
              <Button variant="outline" className="w-full justify-start border-success text-success hover:bg-success/10">
                <DollarSign className="mr-2 h-4 w-4" />
                Registrar Cobrança
              </Button>
              
              <Button variant="outline" className="w-full justify-start border-accent text-accent hover:bg-accent/10">
                <Users className="mr-2 h-4 w-4" />
                Listar Clientes
              </Button>
              
              <Button variant="outline" className="w-full justify-start border-warning text-warning hover:bg-warning/10">
                <AlertCircle className="mr-2 h-4 w-4" />
                Pendências
              </Button>
              
              <Button variant="outline" className="w-full justify-start border-orange text-orange hover:bg-orange/10">
                <Target className="mr-2 h-4 w-4" />
                Relatórios
              </Button>
              
              <Button variant="outline" className="w-full justify-start">
                <MapPin className="mr-2 h-4 w-4" />
                Planejar Rota
              </Button>
            </CardContent>
          </Card>
        </div>
    </div>
  );
};

export default AgentDashboard;