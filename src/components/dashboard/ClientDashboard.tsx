import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { 
  CreditCard, 
  DollarSign, 
  Calendar, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  TrendingUp,
  FileText,
  Phone,
  MessageCircle,
  Lock,
  RefreshCw
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useClientAccess } from '@/hooks/useClientAccess';
import { useAuth } from '@/hooks/useAuth';
import { Link } from 'react-router-dom';

const paymentHistory = [
  { month: 'Jan', paid: 5000, due: 5000 },
  { month: 'Fev', paid: 5000, due: 5000 },
  { month: 'Mar', paid: 4500, due: 5000 },
  { month: 'Abr', paid: 5000, due: 5000 },
  { month: 'Mai', paid: 5000, due: 5000 },
  { month: 'Jun', paid: 0, due: 5000 },
];

const loanStatus = [
  { name: 'Pago', value: 65, color: 'hsl(var(--success))' },
  { name: 'Pendente', value: 25, color: 'hsl(var(--warning))' },
  { name: 'Em Atraso', value: 10, color: 'hsl(var(--destructive))' },
];

const ClientDashboard = () => {
  const { user } = useAuth();
  const { clientStatus, hasActiveLoan, currentLoan, loading, canViewHistory, canRequestNewLoan } = useClientAccess();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Se o cliente não tem acesso ativo, mostrar tela limitada
  if (clientStatus === 'limited' || clientStatus === 'blocked') {
    return (
      <div className="min-h-screen bg-gradient-subtle p-4 md:p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="bg-gradient-primary rounded-2xl p-6 text-white shadow-primary">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">Olá, {user?.name || 'Cliente'}</h1>
                <p className="text-white/80">Seu portal de microcrédito</p>
              </div>
              <Badge className="bg-white/20 text-white">
                {clientStatus === 'limited' ? 'Acesso Limitado' : 'Aguardando Aprovação'}
              </Badge>
            </div>
          </div>

          {/* Status Card */}
          <Card className="border-warning/50 bg-warning/5">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-warning/20 flex items-center justify-center">
                  <Lock className="h-6 w-6 text-warning" />
                </div>
                <div>
                  <CardTitle>Acesso Limitado</CardTitle>
                  <CardDescription>
                    {clientStatus === 'limited' 
                      ? 'Você terminou de pagar seu empréstimo. Para ter acesso completo, solicite um novo crédito.'
                      : 'Aguarde a aprovação do seu pedido de crédito para ter acesso completo ao sistema.'
                    }
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {canViewHistory() && (
                <Link to="/historico">
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="mr-2 h-4 w-4" />
                    Ver Histórico de Pagamentos
                  </Button>
                </Link>
              )}
              {canRequestNewLoan() && (
                <Link to="/formulario-credito">
                  <Button className="w-full justify-start bg-primary">
                    <CreditCard className="mr-2 h-4 w-4" />
                    Solicitar Novo Empréstimo
                  </Button>
                </Link>
              )}
              <Link to="/chat">
                <Button variant="outline" className="w-full justify-start">
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Contactar Suporte
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Info Cards */}
          {canViewHistory() && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-success" />
                    Empréstimos Concluídos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">1</p>
                  <p className="text-sm text-muted-foreground">Parabéns por completar seu empréstimo!</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Score de Crédito
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-success">Excelente</p>
                  <Progress value={90} className="mt-2" />
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-gradient-primary rounded-2xl p-4 md:p-6 text-white shadow-primary">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Olá, {user?.name || 'Cliente'}</h1>
              <p className="text-white/80 text-sm md:text-lg">Seu portal de microcrédito</p>
            </div>
            <div className="text-left md:text-right">
              <Badge className="bg-success/80 text-white mb-1">Empréstimo Ativo</Badge>
              <p className="text-sm text-white/80">Membro desde</p>
              <p className="text-lg md:text-xl font-semibold">Janeiro 2023</p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-0 shadow-medium bg-gradient-to-br from-white to-muted/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Empréstimo Atual
              </CardTitle>
              <CreditCard className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">MZN 45,000</div>
              <p className="text-xs text-muted-foreground">
                Restam 8 prestações
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-medium bg-gradient-to-br from-white to-success/10">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Próximo Pagamento
              </CardTitle>
              <Calendar className="h-5 w-5 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">MZN 5,000</div>
              <p className="text-xs text-muted-foreground">
                Vence em 5 dias
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-medium bg-gradient-to-br from-white to-accent/10">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Pago
              </CardTitle>
              <CheckCircle className="h-5 w-5 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent">MZN 29,500</div>
              <p className="text-xs text-muted-foreground">
                65% do empréstimo
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-medium bg-gradient-to-br from-white to-orange/10">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Score de Crédito
              </CardTitle>
              <TrendingUp className="h-5 w-5 text-orange" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange">Excelente</div>
              <Progress value={85} className="mt-2" />
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Payment Progress */}
          <Card className="border-0 shadow-medium">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" />
                Progresso do Empréstimo
              </CardTitle>
              <CardDescription>
                Acompanhe seus pagamentos ao longo do tempo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={paymentHistory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
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
                      dataKey="paid" 
                      stroke="hsl(var(--success))" 
                      strokeWidth={3}
                      name="Pago" 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="due" 
                      stroke="hsl(var(--warning))" 
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      name="Devido" 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Loan Status */}
          <Card className="border-0 shadow-medium">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-success" />
                Status dos Pagamentos
              </CardTitle>
              <CardDescription>
                Distribuição dos seus pagamentos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={loanStatus}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {loanStatus.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activities & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activities */}
          <Card className="border-0 shadow-medium">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-accent" />
                Atividades Recentes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-success/10">
                <CheckCircle className="h-5 w-5 text-success" />
                <div className="flex-1">
                  <p className="font-medium">Pagamento realizado</p>
                  <p className="text-sm text-muted-foreground">MZN 5,000 • 15 Mai 2024</p>
                </div>
                <Badge variant="secondary" className="bg-success/20 text-success">Pago</Badge>
              </div>
              
              <div className="flex items-center gap-3 p-3 rounded-lg bg-warning/10">
                <AlertTriangle className="h-5 w-5 text-warning" />
                <div className="flex-1">
                  <p className="font-medium">Lembrete de pagamento</p>
                  <p className="text-sm text-muted-foreground">Próximo pagamento em 5 dias</p>
                </div>
                <Badge variant="secondary" className="bg-warning/20 text-warning">Pendente</Badge>
              </div>
              
              <div className="flex items-center gap-3 p-3 rounded-lg bg-accent/10">
                <FileText className="h-5 w-5 text-accent" />
                <div className="flex-1">
                  <p className="font-medium">Contrato atualizado</p>
                  <p className="text-sm text-muted-foreground">Novos termos disponíveis</p>
                </div>
                <Badge variant="secondary" className="bg-accent/20 text-accent">Novo</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="border-0 shadow-medium">
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
              <CardDescription>
                Acesso rápido às principais funcionalidades
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="w-full justify-start bg-gradient-primary hover:opacity-90 shadow-primary">
                <DollarSign className="mr-2 h-4 w-4" />
                Realizar Pagamento
              </Button>
              
              <Button variant="outline" className="w-full justify-start border-accent text-accent hover:bg-accent/10">
                <FileText className="mr-2 h-4 w-4" />
                Ver Contratos
              </Button>
              
              <Button variant="outline" className="w-full justify-start border-secondary text-secondary hover:bg-secondary/10">
                <Calendar className="mr-2 h-4 w-4" />
                Histórico de Pagamentos
              </Button>
              
              <Button variant="outline" className="w-full justify-start border-orange text-orange hover:bg-orange/10">
                <MessageCircle className="mr-2 h-4 w-4" />
                Solicitar Novo Empréstimo
              </Button>
              
              <Button variant="outline" className="w-full justify-start">
                <Phone className="mr-2 h-4 w-4" />
                Contactar Suporte
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;