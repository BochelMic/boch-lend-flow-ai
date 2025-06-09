
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BarChart3, Users, TrendingUp, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const FormAnalytics = () => {
  // Dados mockados para demonstração
  const applications = [
    {
      id: 'CR001',
      name: 'João Silva',
      amount: 500000,
      status: 'APROVADO',
      riskScore: 85,
      submittedAt: '2024-01-15 14:30',
      analysisTime: '2h 15min',
    },
    {
      id: 'CR002',
      name: 'Maria Santos',
      amount: 750000,
      status: 'ANÁLISE_MANUAL',
      riskScore: 65,
      submittedAt: '2024-01-15 16:45',
      analysisTime: 'Pendente',
    },
    {
      id: 'CR003',
      name: 'Pedro Costa',
      amount: 300000,
      status: 'REJEITADO',
      riskScore: 35,
      submittedAt: '2024-01-14 09:20',
      analysisTime: '1h 30min',
    },
  ];

  const stats = {
    totalApplications: 15,
    approved: 8,
    pending: 4,
    rejected: 3,
    averageAmount: 450000,
    averageProcessingTime: '3h 20min',
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APROVADO':
        return <Badge className="bg-green-100 text-green-800">Aprovado</Badge>;
      case 'REJEITADO':
        return <Badge className="bg-red-100 text-red-800">Rejeitado</Badge>;
      case 'ANÁLISE_MANUAL':
        return <Badge className="bg-yellow-100 text-yellow-800">Em Análise</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getRiskColor = (score: number) => {
    if (score >= 70) return 'text-green-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Estatísticas Gerais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Pedidos</p>
                <p className="text-2xl font-bold">{stats.totalApplications}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Aprovados</p>
                <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Em Análise</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <XCircle className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Rejeitados</p>
                <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Métricas Detalhadas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Métricas de Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Montante Médio Solicitado</span>
              <span className="font-medium">{stats.averageAmount.toLocaleString()} AOA</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Tempo Médio de Processamento</span>
              <span className="font-medium">{stats.averageProcessingTime}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Taxa de Aprovação</span>
              <span className="font-medium text-green-600">
                {Math.round((stats.approved / stats.totalApplications) * 100)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Taxa de Rejeição</span>
              <span className="font-medium text-red-600">
                {Math.round((stats.rejected / stats.totalApplications) * 100)}%
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Análise Automática
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-gray-600">
              Sistema de análise automática ativo
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Pedidos processados automaticamente</span>
                <span className="font-medium">80%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Precisão da análise automática</span>
                <span className="font-medium text-green-600">92%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Tempo médio de análise</span>
                <span className="font-medium">2.5 segundos</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Pedidos Recentes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Pedidos Recentes
          </CardTitle>
          <CardDescription>
            Últimos pedidos de crédito recebidos e analisados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {applications.map((app) => (
              <div key={app.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className="font-medium">{app.name}</span>
                      <span className="text-sm text-gray-500">#{app.id}</span>
                      {getStatusBadge(app.status)}
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                      <span>Montante: {app.amount.toLocaleString()} AOA</span>
                      <span className={`font-medium ${getRiskColor(app.riskScore)}`}>
                        Score: {app.riskScore}/100
                      </span>
                      <span>Tempo: {app.analysisTime}</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Enviado em: {app.submittedAt}
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Ver Detalhes
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Configurações de Notificação */}
      <Card>
        <CardHeader>
          <CardTitle>Notificações Automáticas</CardTitle>
          <CardDescription>
            Sistema de alertas configurado para novos pedidos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <h4 className="font-medium">Email para Administradores</h4>
              <p className="text-sm text-gray-600">Notificação imediata por email</p>
            </div>
            <Badge className="bg-green-100 text-green-800">Ativo</Badge>
          </div>
          
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <h4 className="font-medium">WhatsApp Business API</h4>
              <p className="text-sm text-gray-600">Integração com WhatsApp</p>
            </div>
            <Badge className="bg-green-100 text-green-800">Ativo</Badge>
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <h4 className="font-medium">SMS para Equipe</h4>
              <p className="text-sm text-gray-600">Alertas por SMS</p>
            </div>
            <Badge variant="secondary">Configurar</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FormAnalytics;
