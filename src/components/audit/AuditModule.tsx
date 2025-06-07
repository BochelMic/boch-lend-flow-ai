
import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { 
  ShieldCheck, 
  Eye, 
  Search, 
  Filter, 
  Download, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Activity,
  FileText,
  Calendar
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useToast } from '@/hooks/use-toast';

const AuditModule = () => {
  const { toast } = useToast();
  const [auditLogs, setAuditLogs] = useState([
    { id: 1, user: 'João Silva', action: 'Criou empréstimo', details: 'Cliente: Maria Santos, Valor: MZN 50,000', timestamp: '15/06/2024 10:30', ip: '192.168.1.100', status: 'Sucesso' },
    { id: 2, user: 'Ana Costa', action: 'Atualizou cliente', details: 'Cliente: Carlos Mussa, Campo: Telefone', timestamp: '15/06/2024 09:15', ip: '192.168.1.101', status: 'Sucesso' },
    { id: 3, user: 'Pedro Santos', action: 'Tentativa login', details: 'Login falhado - senha incorreta', timestamp: '15/06/2024 08:45', ip: '192.168.1.102', status: 'Falha' },
    { id: 4, user: 'Maria Oliveira', action: 'Registrou pagamento', details: 'Empréstimo ID: 123, Valor: MZN 5,000', timestamp: '14/06/2024 16:20', ip: '192.168.1.103', status: 'Sucesso' },
  ]);

  const [securityAlerts, setSecurityAlerts] = useState([
    { id: 1, type: 'Tentativa de acesso não autorizado', description: 'Múltiplas tentativas de login falhadas para usuário admin', severity: 'Alto', timestamp: '15/06/2024 11:00', status: 'Ativo' },
    { id: 2, type: 'Alteração de dados sensíveis', description: 'Alteração em massa de dados de clientes', severity: 'Médio', timestamp: '14/06/2024 14:30', status: 'Investigando' },
    { id: 3, type: 'Acesso fora do horário', description: 'Login realizado fora do horário comercial', severity: 'Baixo', timestamp: '13/06/2024 22:15', status: 'Resolvido' },
  ]);

  const [filters, setFilters] = useState({
    user: '',
    action: '',
    dateFrom: '',
    dateTo: '',
    status: ''
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Sucesso': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'Falha': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'Pendente': return <Clock className="h-4 w-4 text-yellow-600" />;
      default: return <AlertTriangle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Alto': return 'bg-red-100 text-red-800 border-red-200';
      case 'Médio': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Baixo': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getAlertStatusColor = (status: string) => {
    switch (status) {
      case 'Ativo': return 'bg-red-100 text-red-800';
      case 'Investigando': return 'bg-yellow-100 text-yellow-800';
      case 'Resolvido': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const exportAuditReport = () => {
    toast({
      title: "Relatório Exportado",
      description: "Relatório de auditoria foi exportado com sucesso.",
    });
  };

  const resolveAlert = (alertId: number) => {
    setSecurityAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, status: 'Resolvido' } : alert
    ));
    
    toast({
      title: "Alerta Resolvido",
      description: "O alerta de segurança foi marcado como resolvido.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Sistema de Auditoria</h1>
        <Button onClick={exportAuditReport}>
          <Download className="mr-2 h-4 w-4" />
          Exportar Relatório
        </Button>
      </div>

      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="logs">Logs de Auditoria</TabsTrigger>
          <TabsTrigger value="security">Alertas de Segurança</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="reports">Relatórios</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Ações Hoje</p>
                    <p className="text-2xl font-bold">147</p>
                  </div>
                  <Activity className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Usuários Ativos</p>
                    <p className="text-2xl font-bold">23</p>
                  </div>
                  <User className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Alertas Ativos</p>
                    <p className="text-2xl font-bold">{securityAlerts.filter(alert => alert.status === 'Ativo').length}</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Taxa Conformidade</p>
                    <p className="text-2xl font-bold">98%</p>
                  </div>
                  <ShieldCheck className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Atividades Recentes</CardTitle>
                <CardDescription>Últimas ações registradas no sistema</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {auditLogs.slice(0, 5).map((log) => (
                    <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(log.status)}
                        <div>
                          <p className="font-medium">{log.action}</p>
                          <p className="text-sm text-gray-600">{log.user} - {log.timestamp}</p>
                          <p className="text-xs text-gray-500">{log.details}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Alertas de Segurança</CardTitle>
                <CardDescription>Alertas que requerem atenção</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {securityAlerts.filter(alert => alert.status !== 'Resolvido').map((alert) => (
                    <div key={alert.id} className={`p-3 border rounded-lg ${getSeverityColor(alert.severity)}`}>
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{alert.type}</p>
                          <p className="text-sm mt-1">{alert.description}</p>
                          <p className="text-xs mt-2">{alert.timestamp}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded text-xs ${getAlertStatusColor(alert.status)}`}>
                            {alert.status}
                          </span>
                          {alert.status !== 'Resolvido' && (
                            <Button size="sm" onClick={() => resolveAlert(alert.id)}>
                              Resolver
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="logs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Logs de Auditoria</CardTitle>
              <CardDescription>Registro completo de todas as atividades do sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div>
                    <Label htmlFor="filterUser">Usuário</Label>
                    <Select onValueChange={(value) => setFilters({...filters, user: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Todos" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="joao">João Silva</SelectItem>
                        <SelectItem value="ana">Ana Costa</SelectItem>
                        <SelectItem value="pedro">Pedro Santos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="filterAction">Ação</Label>
                    <Select onValueChange={(value) => setFilters({...filters, action: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Todas" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas</SelectItem>
                        <SelectItem value="login">Login</SelectItem>
                        <SelectItem value="create">Criar</SelectItem>
                        <SelectItem value="update">Atualizar</SelectItem>
                        <SelectItem value="delete">Excluir</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="filterDateFrom">Data Início</Label>
                    <Input 
                      id="filterDateFrom"
                      type="date"
                      value={filters.dateFrom}
                      onChange={(e) => setFilters({...filters, dateFrom: e.target.value})}
                    />
                  </div>

                  <div>
                    <Label htmlFor="filterDateTo">Data Fim</Label>
                    <Input 
                      id="filterDateTo"
                      type="date"
                      value={filters.dateTo}
                      onChange={(e) => setFilters({...filters, dateTo: e.target.value})}
                    />
                  </div>

                  <div className="flex items-end">
                    <Button>
                      <Filter className="mr-2 h-4 w-4" />
                      Filtrar
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="grid grid-cols-6 gap-4 p-3 bg-gray-50 rounded font-medium">
                    <span>Usuário</span>
                    <span>Ação</span>
                    <span>Detalhes</span>
                    <span>Data/Hora</span>
                    <span>IP</span>
                    <span>Status</span>
                  </div>
                  {auditLogs.map((log) => (
                    <div key={log.id} className="grid grid-cols-6 gap-4 p-3 border-b items-center">
                      <span className="font-medium">{log.user}</span>
                      <span>{log.action}</span>
                      <span className="text-sm text-gray-600">{log.details}</span>
                      <span className="text-sm">{log.timestamp}</span>
                      <span className="text-sm font-mono">{log.ip}</span>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(log.status)}
                        <span className="text-sm">{log.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Alertas de Segurança</CardTitle>
              <CardDescription>Monitoramento de eventos de segurança</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {securityAlerts.map((alert) => (
                  <div key={alert.id} className={`p-4 border rounded-lg ${getSeverityColor(alert.severity)}`}>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <AlertTriangle className="h-5 w-5" />
                          <h3 className="font-medium">{alert.type}</h3>
                          <span className={`px-2 py-1 rounded text-xs ${getSeverityColor(alert.severity)}`}>
                            {alert.severity}
                          </span>
                        </div>
                        <p className="text-sm mb-2">{alert.description}</p>
                        <p className="text-xs text-gray-600">{alert.timestamp}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded text-xs ${getAlertStatusColor(alert.status)}`}>
                          {alert.status}
                        </span>
                        {alert.status !== 'Resolvido' && (
                          <div className="flex space-x-1">
                            <Button size="sm" variant="outline">
                              <Eye className="h-3 w-3 mr-1" />
                              Investigar
                            </Button>
                            <Button size="sm" onClick={() => resolveAlert(alert.id)}>
                              Resolver
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Verificações de Compliance</CardTitle>
              <CardDescription>Status de conformidade com regulamentações</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">Proteção de Dados</h3>
                    <p className="text-sm text-gray-600">Conformidade com lei de proteção de dados</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-green-600 font-medium">Conforme</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">Anti-Lavagem de Dinheiro</h3>
                    <p className="text-sm text-gray-600">Verificações AML em dia</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-green-600 font-medium">Conforme</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">Backup de Dados</h3>
                    <p className="text-sm text-gray-600">Último backup realizado</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                    <span className="text-yellow-600 font-medium">Atenção</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">Controle de Acesso</h3>
                    <p className="text-sm text-gray-600">Revisão de permissões de usuários</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-green-600 font-medium">Conforme</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Relatório de Auditoria Completo</CardTitle>
                <CardDescription>Relatório detalhado de todas as atividades</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" onClick={exportAuditReport}>
                  <FileText className="mr-2 h-4 w-4" />
                  Gerar Relatório
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Relatório de Segurança</CardTitle>
                <CardDescription>Análise de eventos de segurança</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" onClick={exportAuditReport}>
                  <ShieldCheck className="mr-2 h-4 w-4" />
                  Gerar Relatório
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Relatório de Compliance</CardTitle>
                <CardDescription>Status de conformidade regulatória</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" onClick={exportAuditReport}>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Gerar Relatório
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Relatório de Atividade por Usuário</CardTitle>
                <CardDescription>Atividades por usuário em período</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" onClick={exportAuditReport}>
                  <User className="mr-2 h-4 w-4" />
                  Gerar Relatório
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AuditModule;
