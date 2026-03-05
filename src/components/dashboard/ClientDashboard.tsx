
import React, { useState, useEffect } from 'react';
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
import { supabase } from '@/integrations/supabase/client';

interface LoanData {
  amount: number;
  totalAmount: number;
  remainingAmount: number;
  installments: number;
  startDate: string | null;
  endDate?: string | null;
}

const ClientDashboard = () => {
  const { user } = useAuth();
  const { clientStatus, hasActiveLoan, currentLoan, loading: accessLoading, canViewHistory, canRequestNewLoan } = useClientAccess();
  const [loanData, setLoanData] = useState<LoanData | null>(null);
  const [paymentHistory, setPaymentHistory] = useState<any[]>([]);
  const [paymentStats, setPaymentStats] = useState<any[]>([]);
  const [totalPaid, setTotalPaid] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!accessLoading && currentLoan) {
      loadClientData();
    } else if (!accessLoading) {
      setLoading(false);
    }
  }, [accessLoading, currentLoan]);

  const loadClientData = async () => {
    if (!currentLoan) {
      setLoading(false);
      return;
    }

    try {
      let totalAmount = Number(currentLoan.total_amount);
      let remainingAmount = Number(currentLoan.remaining_amount);

      if (currentLoan.end_date && remainingAmount > 0) {
        const end = new Date(currentLoan.end_date);
        const today = new Date();
        const diffTime = end.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) {
          const lateDays = Math.abs(diffDays);
          const penalty = remainingAmount * (0.015 * lateDays); // 1.5% penalty per day of delay
          totalAmount += penalty;
          remainingAmount += penalty;
        }
      }

      // Loan details
      setLoanData({
        amount: Number(currentLoan.amount),
        totalAmount,
        remainingAmount,
        installments: currentLoan.installments || 12,
        startDate: currentLoan.start_date || null,
        endDate: currentLoan.end_date || null,
      });

      // Pagamentos deste empréstimo
      const { data: payments } = await supabase
        .from('payments')
        .select('amount, payment_date')
        .eq('loan_id', currentLoan.id)
        .order('payment_date', { ascending: true });

      const paid = payments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;
      setTotalPaid(paid);

      // Build monthly chart data
      if (payments && payments.length > 0) {
        const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
        const monthlyMap: Record<string, number> = {};
        payments.forEach(p => {
          const d = new Date(p.payment_date);
          const key = monthNames[d.getMonth()];
          monthlyMap[key] = (monthlyMap[key] || 0) + Number(p.amount);
        });
        const history = Object.entries(monthlyMap).map(([month, paid]) => ({
          month,
          paid,
          due: Math.round(Number(currentLoan.total_amount) / (currentLoan.installments || 12)),
        }));
        setPaymentHistory(history);
      }

      // Pie chart
      const paidPercent = totalAmount > 0 ? Math.round(((totalAmount - remainingAmount) / totalAmount) * 100) : 0;
      const pendingPercent = 100 - paidPercent;

      setPaymentStats([
        { name: 'Pago', value: paidPercent, color: 'hsl(var(--success))' },
        { name: 'Pendente', value: pendingPercent, color: 'hsl(var(--warning))' },
      ]);
    } catch (error) {
      console.error('Error loading client data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (accessLoading || loading) {
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
          <div className="rounded-2xl p-6 text-white shadow-lg" style={{ background: 'linear-gradient(135deg, #d37c22 0%, #e8943a 50%, #c06a18 100%)' }}>
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">Olá, {user?.name || 'Cliente'}</h1>
                <p className="text-white/80">Seu portal de microcrédito</p>
              </div>
              <Badge className="bg-white/20 text-white border border-white/30 backdrop-blur-sm">
                {clientStatus === 'limited' ? 'Acesso Limitado' : 'Aguardando Aprovação'}
              </Badge>
            </div>
          </div>

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
              {canRequestNewLoan() && (
                <Link to="/credit-form">
                  <Button className="w-full justify-start text-white font-semibold" style={{ backgroundColor: '#d37c22' }}>
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
        </div>
      </div>
    );
  }

  const monthlyPayment = loanData ? Math.round(loanData.totalAmount / loanData.installments) : 0;
  const paidPercentage = loanData && loanData.totalAmount > 0
    ? Math.round(((loanData.totalAmount - loanData.remainingAmount) / loanData.totalAmount) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-gradient-subtle p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="rounded-2xl p-4 md:p-6 text-white shadow-lg" style={{ background: 'linear-gradient(135deg, #d37c22 0%, #e8943a 50%, #c06a18 100%)' }}>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Olá, {user?.name || 'Cliente'}</h1>
              <p className="text-white/80 text-sm md:text-lg">Seu portal de microcrédito</p>
            </div>
            <div className="text-left md:text-right">
              <Badge className="bg-white/20 text-white border border-white/30 mb-1">Empréstimo Ativo</Badge>
              {loanData?.startDate && (
                <>
                  <p className="text-sm text-white/80">Início</p>
                  <p className="text-lg md:text-xl font-semibold">{new Date(loanData.startDate).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Countdown Banner */}
        {loanData?.endDate && loanData.remainingAmount > 0 && (() => {
          const end = new Date(loanData.endDate);
          const today = new Date();
          const diffTime = end.getTime() - today.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          const isLate = diffDays < 0;

          return (
            <Card className={`border-0 shadow-lg text-white ${isLate ? 'bg-red-600' : 'bg-[#1b5e20]'}`}>
              <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 rounded-full">
                    {isLate ? <AlertTriangle className="h-8 w-8" /> : <Clock className="h-8 w-8" />}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">{isLate ? 'Empréstimo em Atraso!' : 'Prazo de Pagamento'}</h2>
                    <p className="text-white/90 mt-1">
                      {isLate
                        ? `A sua dívida está em atraso há ${Math.abs(diffDays)} dias.`
                        : `Faltam ${diffDays} dias para o encerramento do empréstimo de 30 dias.`}
                    </p>
                  </div>
                </div>
                <div className="text-left md:text-right">
                  <p className="text-sm text-white/80">Data Limite</p>
                  <p className="text-2xl font-black">{end.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })}</p>
                </div>
              </CardContent>
            </Card>
          );
        })()}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border border-[#d37c22]/20 shadow-md bg-white hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Empréstimo Atual</CardTitle>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#d37c22' + '15' }}>
                <CreditCard className="h-5 w-5" style={{ color: '#d37c22' }} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" style={{ color: '#d37c22' }}>MZN {loanData?.totalAmount.toLocaleString() || '0'}</div>
              <p className="text-xs text-gray-400 mt-1">Saldo: MZN {loanData?.remainingAmount.toLocaleString() || '0'}</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-medium bg-gradient-to-br from-white to-success/10">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Próximo Pagamento</CardTitle>
              <Calendar className="h-5 w-5 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">MZN {monthlyPayment.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Prestação mensal</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-medium bg-gradient-to-br from-white to-accent/10">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Pago</CardTitle>
              <CheckCircle className="h-5 w-5 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent">MZN {totalPaid.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">{paidPercentage}% do empréstimo</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-medium bg-gradient-to-br from-white to-orange/10">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Progresso</CardTitle>
              <TrendingUp className="h-5 w-5 text-orange" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange">{paidPercentage}%</div>
              <Progress value={paidPercentage} className="mt-2" />
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
              <CardDescription>Acompanhe seus pagamentos ao longo do tempo</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                {paymentHistory.length > 0 ? (
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
                      <Line type="monotone" dataKey="paid" stroke="hsl(var(--success))" strokeWidth={3} name="Pago" />
                      <Line type="monotone" dataKey="due" stroke="hsl(var(--warning))" strokeWidth={2} strokeDasharray="5 5" name="Devido" />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    Nenhum pagamento registrado ainda
                  </div>
                )}
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
              <CardDescription>Distribuição dos seus pagamentos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                {paymentStats.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={paymentStats}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {paymentStats.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    Sem dados
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="border-0 shadow-medium">
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
            <CardDescription>Acesso rápido às principais funcionalidades</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Link to="/credit-form">
              <Button className="w-full justify-start shadow-md hover:shadow-lg text-white font-semibold" style={{ backgroundColor: '#d37c22' }}>
                <DollarSign className="mr-2 h-4 w-4" />
                Solicitar Crédito
              </Button>
            </Link>
            <Link to="/historico">
              <Button variant="outline" className="w-full justify-start border-accent text-accent hover:bg-accent/10">
                <FileText className="mr-2 h-4 w-4" />
                Ver Histórico
              </Button>
            </Link>
            <Link to="/chat">
              <Button variant="outline" className="w-full justify-start border-secondary text-secondary hover:bg-secondary/10">
                <MessageCircle className="mr-2 h-4 w-4" />
                Contactar Suporte
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ClientDashboard;