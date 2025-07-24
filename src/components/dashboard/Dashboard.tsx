
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
  // Dashboard em branco - sistema limpo para dados reais
  const loanStats = {
    totalLoans: 0,
    totalInterest: 0,
    lateInterest: 0,
    totalValue: 0,
    activeLoans: 0,
    pendingLoans: 0,
    notificationsSent: 0,
    messagesReceived: 0,
    creditRequests: 0
  };

  return (
    <div className="space-y-6">
      {/* Métricas principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Clientes Ativos"
          value="0"
          icon={Users}
          trend="+0%"
          description="Sistema em branco"
        />
        <MetricCard
          title="Carteira de Crédito"
          value="MZN 0.0M"
          icon={CreditCard}
          trend="+0%"
          description="Aguardando dados reais"
        />
        <MetricCard
          title="Taxa de Inadimplência"
          value="0%"
          icon={AlertTriangle}
          trend="+0%"
          description="Sistema limpo"
          variant="warning"
        />
        <MetricCard
          title="ROI Mensal"
          value="0%"
          icon={TrendingUp}
          trend="+0%"
          description="Pronto para operar"
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

      {/* Sistema em branco - pronto para dados reais */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Sistema Limpo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="text-center py-8">
                <p className="text-gray-500">Nenhum alerta de cobrança</p>
                <p className="text-sm text-gray-400">Sistema pronto para operar</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pedidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="text-center py-8">
                <p className="text-gray-500">Nenhum pedido pendente</p>
                <p className="text-sm text-gray-400">Aguardando novos clientes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status do Sistema</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span>Sistema</span>
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">Operacional</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Base de Dados</span>
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">Limpa</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Configurações</span>
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">Prontas</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
