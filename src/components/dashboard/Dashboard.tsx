
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
  PieChart
} from 'lucide-react';
import MetricCard from './MetricCard';
import CashFlowChart from './CashFlowChart';
import RiskAnalysis from './RiskAnalysis';

const Dashboard = () => {
  return (
    <div className="space-y-6">
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
          value="MZN 2.4M"
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
