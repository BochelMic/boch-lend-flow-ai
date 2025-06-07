
import React from 'react';
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
  XCircle
} from 'lucide-react';
import MetricCard from './MetricCard';
import CashFlowChart from './CashFlowChart';
import RiskAnalysis from './RiskAnalysis';

const Dashboard = () => {
  // Dados de empréstimos e estatísticas
  const loanStats = {
    totalLoans: 2400000, // MZN
    totalInterest: 432000, // MZN
    lateInterest: 25600, // MZN
    totalValue: 2857600, // MZN (total + juros + mora)
    activeLoans: 145,
    pendingLoans: 23,
    notificationsSent: 1247,
    messagesReceived: 892,
    creditRequests: 67
  };

  return (
    <div className="space-y-6">
      {/* Métricas principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Clientes Ativos"
          value="1,247"
          icon={Users}
          trend="+12%"
          description="vs mês anterior"
        />
        <MetricCard
          title="Carteira de Crédito"
          value={`MZN ${(loanStats.totalLoans / 1000000).toFixed(1)}M`}
          icon={CreditCard}
          trend="+8%"
          description="Total emprestado"
        />
        <MetricCard
          title="Taxa de Inadimplência"
          value="3.2%"
          icon={AlertTriangle}
          trend="-0.5%"
          description="Redução mensal"
          variant="warning"
        />
        <MetricCard
          title="ROI Mensal"
          value="18.5%"
          icon={TrendingUp}
          trend="+2.1%"
          description="Retorno sobre investimento"
          variant="success"
        />
      </div>

      {/* Informações detalhadas de empréstimos */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Empréstimo Total</p>
                <p className="text-lg font-bold">MZN {loanStats.totalLoans.toLocaleString()}</p>
              </div>
              <DollarSign className="h-6 w-6 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Juros Totais</p>
                <p className="text-lg font-bold text-green-600">MZN {loanStats.totalInterest.toLocaleString()}</p>
              </div>
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Juros de Mora</p>
                <p className="text-lg font-bold text-red-600">MZN {loanStats.lateInterest.toLocaleString()}</p>
              </div>
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Valor Total</p>
                <p className="text-lg font-bold text-purple-600">MZN {loanStats.totalValue.toLocaleString()}</p>
              </div>
              <Target className="h-6 w-6 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Solicitações</p>
                <p className="text-lg font-bold text-orange-600">{loanStats.creditRequests}</p>
              </div>
              <FileText className="h-6 w-6 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status de empréstimos e comunicações */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Empréstimos Ativos</p>
                <p className="text-xl font-bold text-green-600">{loanStats.activeLoans}</p>
              </div>
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pendentes</p>
                <p className="text-xl font-bold text-yellow-600">{loanStats.pendingLoans}</p>
              </div>
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Notificações Enviadas</p>
                <p className="text-xl font-bold text-blue-600">{loanStats.notificationsSent}</p>
              </div>
              <Bell className="h-6 w-6 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Mensagens Recebidas</p>
                <p className="text-xl font-bold text-purple-600">{loanStats.messagesReceived}</p>
              </div>
              <MessageSquare className="h-6 w-6 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos e análises */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <PieChart className="mr-2 h-5 w-5" />
              Fluxo de Caixa
            </CardTitle>
            <CardDescription>
              Projeção dos próximos 6 meses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CashFlowChart />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="mr-2 h-5 w-5" />
              Análise de Risco
            </CardTitle>
            <CardDescription>
              Distribuição de clientes por categoria
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RiskAnalysis />
          </CardContent>
        </Card>
      </div>

      {/* Alertas e ações */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Alertas de Cobrança</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-red-50 rounded">
                <div>
                  <p className="font-medium">João Silva</p>
                  <p className="text-sm text-gray-600">Venceu há 5 dias</p>
                </div>
                <span className="text-red-600 font-bold">MZN 15,000</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded">
                <div>
                  <p className="font-medium">Maria Santos</p>
                  <p className="text-sm text-gray-600">Vence hoje</p>
                </div>
                <span className="text-yellow-600 font-bold">MZN 8,500</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Novos Pedidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded">
                <div>
                  <p className="font-medium">Ana Costa</p>
                  <p className="text-sm text-gray-600">Aguarda análise</p>
                </div>
                <span className="text-blue-600 font-bold">MZN 25,000</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded">
                <div>
                  <p className="font-medium">Pedro Mussa</p>
                  <p className="text-sm text-gray-600">Pré-aprovado</p>
                </div>
                <span className="text-green-600 font-bold">MZN 12,000</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Compliance Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span>Verificação AML</span>
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">Ativo</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Relatório Mensal</span>
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">Em dia</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Licença Banco Central</span>
                <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm">Renovar</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
