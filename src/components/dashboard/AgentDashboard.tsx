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
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-gradient-accent rounded-2xl p-6 text-white shadow-large">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Dashboard do Agente</h1>
              <p className="text-white/80 text-lg">Maria Santos - Zona Norte</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-white/80">Meta Mensal</p>
              <p className="text-xl font-semibold">85% Concluída</p>
              <Progress value={85} className="mt-2 w-32" />
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-0 shadow-medium bg-gradient-to-br from-white to-primary/10">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Clientes Ativos
              </CardTitle>
              <Users className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">127</div>
              <p className="text-xs text-muted-foreground">
                +12 este mês
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-medium bg-gradient-to-br from-white to-success/10">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Cobranças Hoje
              </CardTitle>
              <DollarSign className="h-5 w-5 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">MZN 47,000</div>
              <p className="text-xs text-muted-foreground">
                Meta: MZN 50,000
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-medium bg-gradient-to-br from-white to-warning/10">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Empréstimos Pendentes
              </CardTitle>
              <AlertCircle className="h-5 w-5 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">8</div>
              <p className="text-xs text-muted-foreground">
                Requerem aprovação
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-medium bg-gradient-to-br from-white to-orange/10">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Comissão Mensal
              </CardTitle>
              <Target className="h-5 w-5 text-orange" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange">MZN 15,800</div>
              <p className="text-xs text-muted-foreground">
                +18% vs mês anterior
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
    </div>
  );
};

export default AgentDashboard;