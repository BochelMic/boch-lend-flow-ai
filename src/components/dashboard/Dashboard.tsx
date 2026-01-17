
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
    <div className="space-y-4 md:space-y-6">
      {/* Métricas principais */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
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
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
        <Card>
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs md:text-sm text-muted-foreground truncate">Empréstimo Total</p>
                <p className="text-sm md:text-lg font-bold truncate">MZN {loanStats.totalLoans.toLocaleString()}</p>
              </div>
              <DollarSign className="h-5 w-5 md:h-6 md:w-6 text-info flex-shrink-0" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs md:text-sm text-muted-foreground truncate">Juros Totais</p>
                <p className="text-sm md:text-lg font-bold text-success truncate">MZN {loanStats.totalInterest.toLocaleString()}</p>
              </div>
              <TrendingUp className="h-5 w-5 md:h-6 md:w-6 text-success flex-shrink-0" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs md:text-sm text-muted-foreground truncate">Juros de Mora</p>
                <p className="text-sm md:text-lg font-bold text-destructive truncate">MZN {loanStats.lateInterest.toLocaleString()}</p>
              </div>
              <AlertTriangle className="h-5 w-5 md:h-6 md:w-6 text-destructive flex-shrink-0" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs md:text-sm text-muted-foreground truncate">Valor Total</p>
                <p className="text-sm md:text-lg font-bold text-secondary truncate">MZN {loanStats.totalValue.toLocaleString()}</p>
              </div>
              <Target className="h-5 w-5 md:h-6 md:w-6 text-secondary flex-shrink-0" />
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-2 md:col-span-1">
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs md:text-sm text-muted-foreground truncate">Solicitações</p>
                <p className="text-sm md:text-lg font-bold text-orange truncate">{loanStats.creditRequests}</p>
              </div>
              <FileText className="h-5 w-5 md:h-6 md:w-6 text-orange flex-shrink-0" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status de empréstimos e comunicações */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <Card>
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs md:text-sm text-muted-foreground truncate">Empréstimos Ativos</p>
                <p className="text-lg md:text-xl font-bold text-success">{loanStats.activeLoans}</p>
              </div>
              <CheckCircle className="h-5 w-5 md:h-6 md:w-6 text-success flex-shrink-0" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs md:text-sm text-muted-foreground truncate">Pendentes</p>
                <p className="text-lg md:text-xl font-bold text-warning">{loanStats.pendingLoans}</p>
              </div>
              <Clock className="h-5 w-5 md:h-6 md:w-6 text-warning flex-shrink-0" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs md:text-sm text-muted-foreground truncate">Notificações</p>
                <p className="text-lg md:text-xl font-bold text-info">{loanStats.notificationsSent}</p>
              </div>
              <Bell className="h-5 w-5 md:h-6 md:w-6 text-info flex-shrink-0" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs md:text-sm text-muted-foreground truncate">Mensagens</p>
                <p className="text-lg md:text-xl font-bold text-secondary">{loanStats.messagesReceived}</p>
              </div>
              <MessageSquare className="h-5 w-5 md:h-6 md:w-6 text-secondary flex-shrink-0" />
            </div>
          </CardContent>
        </Card>
      </div>


      {/* Gráficos e análises */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <Card>
          <CardHeader className="p-4 md:p-6">
            <CardTitle className="flex items-center text-base md:text-lg">
              <PieChart className="mr-2 h-4 w-4 md:h-5 md:w-5" />
              Fluxo de Caixa
            </CardTitle>
            <CardDescription className="text-xs md:text-sm">
              Projeção dos próximos 6 meses
            </CardDescription>
          </CardHeader>
          <CardContent className="p-3 md:p-6 pt-0">
            <CashFlowChart />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4 md:p-6">
            <CardTitle className="flex items-center text-base md:text-lg">
              <Target className="mr-2 h-4 w-4 md:h-5 md:w-5" />
              Análise de Risco
            </CardTitle>
            <CardDescription className="text-xs md:text-sm">
              Distribuição de clientes por categoria
            </CardDescription>
          </CardHeader>
          <CardContent className="p-3 md:p-6 pt-0">
            <RiskAnalysis />
          </CardContent>
        </Card>
      </div>

      {/* Sistema em branco - pronto para dados reais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <Card>
          <CardHeader className="p-4 md:p-6">
            <CardTitle className="text-base md:text-lg">Sistema Limpo</CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-6 pt-0">
            <div className="space-y-3">
              <div className="text-center py-6 md:py-8">
                <p className="text-muted-foreground text-sm">Nenhum alerta de cobrança</p>
                <p className="text-xs text-muted-foreground/70">Sistema pronto para operar</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4 md:p-6">
            <CardTitle className="text-base md:text-lg">Pedidos</CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-6 pt-0">
            <div className="space-y-3">
              <div className="text-center py-6 md:py-8">
                <p className="text-muted-foreground text-sm">Nenhum pedido pendente</p>
                <p className="text-xs text-muted-foreground/70">Aguardando novos clientes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 lg:col-span-1">
          <CardHeader className="p-4 md:p-6">
            <CardTitle className="text-base md:text-lg">Status do Sistema</CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-6 pt-0">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span>Sistema</span>
                <span className="bg-success/20 text-success px-2 py-1 rounded text-xs">Operacional</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Base de Dados</span>
                <span className="bg-success/20 text-success px-2 py-1 rounded text-xs">Limpa</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Configurações</span>
                <span className="bg-info/20 text-info px-2 py-1 rounded text-xs">Prontas</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
