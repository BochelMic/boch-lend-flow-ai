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
  UserCheck
} from 'lucide-react';
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

  return (
    <div className="min-h-screen bg-gradient-subtle p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-gradient-primary rounded-2xl p-6 text-white shadow-primary">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Dashboard do Gestor</h1>
              <p className="text-white/80 text-lg">Visão executiva - BOCHEL Microcrédito</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-white/80">ROI Mensal</p>
              <p className="text-2xl font-semibold">18.5%</p>
              <p className="text-sm text-white/80">+2.1% vs mês anterior</p>
            </div>
          </div>
        </div>

        {/* Métricas Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-0 shadow-medium bg-gradient-to-br from-white to-primary/10">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Carteira Total
              </CardTitle>
              <CreditCard className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">MZN 8.4M</div>
              <p className="text-xs text-muted-foreground">+12% vs mês anterior</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-medium bg-gradient-to-br from-white to-success/10">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Receita Mensal
              </CardTitle>
              <DollarSign className="h-5 w-5 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">MZN 580K</div>
              <p className="text-xs text-muted-foreground">Meta: MZN 650K</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-medium bg-gradient-to-br from-white to-warning/10">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Taxa Inadimplência
              </CardTitle>
              <AlertTriangle className="h-5 w-5 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">3.2%</div>
              <p className="text-xs text-muted-foreground">-0.5% vs mês anterior</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-medium bg-gradient-to-br from-white to-accent/10">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Clientes Ativos
              </CardTitle>
              <Users className="h-5 w-5 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent">1,247</div>
              <p className="text-xs text-muted-foreground">+23 novos este mês</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="financeiro" className="space-y-6">
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
                          formatter={(value: number) => [`MZN ${(value/1000).toFixed(0)}K`, '']}
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
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                          index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-amber-600' : 'bg-muted-foreground'
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
      </div>
    </div>
  );
};

export default GestorDashboard;