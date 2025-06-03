
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { 
  FileText, 
  CreditCard, 
  DollarSign, 
  Clock,
  CheckCircle,
  AlertCircle,
  Plus
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

const OperationsDashboard = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Operações</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nova Operação
        </Button>
      </div>

      <Tabs defaultValue="requests" className="w-full">
        <TabsList>
          <TabsTrigger value="requests">Pedidos</TabsTrigger>
          <TabsTrigger value="disbursement">Desembolso</TabsTrigger>
          <TabsTrigger value="payments">Pagamentos</TabsTrigger>
          <TabsTrigger value="reports">Relatórios</TabsTrigger>
        </TabsList>

        <TabsContent value="requests" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Novos Pedidos</p>
                    <p className="text-2xl font-bold">15</p>
                  </div>
                  <FileText className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Em Análise</p>
                    <p className="text-2xl font-bold">8</p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Aprovados</p>
                    <p className="text-2xl font-bold">12</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Processados Hoje</p>
                    <p className="text-2xl font-bold">23</p>
                  </div>
                  <CreditCard className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Formulário de Solicitação de Empréstimo</CardTitle>
              <CardDescription>
                Registro de novos pedidos de crédito
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="clientName">Nome do Cliente</Label>
                    <Input id="clientName" placeholder="Nome completo" />
                  </div>
                  <div>
                    <Label htmlFor="clientId">Bilhete de Identidade</Label>
                    <Input id="clientId" placeholder="Número do BI" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="amount">Valor Solicitado (MZN)</Label>
                    <Input id="amount" placeholder="Ex: 25000" type="number" />
                  </div>
                  <div>
                    <Label htmlFor="term">Prazo (meses)</Label>
                    <Input id="term" placeholder="Ex: 6" type="number" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="income">Renda Mensal (MZN)</Label>
                    <Input id="income" placeholder="Ex: 15000" type="number" />
                  </div>
                  <div>
                    <Label htmlFor="purpose">Finalidade do Empréstimo</Label>
                    <Input id="purpose" placeholder="Ex: Capital de giro" />
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold mb-3">Checklist de Documentação</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" />
                      Bilhete de Identidade
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" />
                      Comprovativo de Residência
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" />
                      Comprovativo de Renda
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" />
                      Garantias/Penhor
                    </label>
                  </div>
                </div>

                <Button className="w-full">Registrar Pedido</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="disbursement" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Desembolso de Recursos</CardTitle>
              <CardDescription>
                Processamento e liberação de créditos aprovados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Ana Silva</p>
                    <p className="text-sm text-gray-600">Aprovado em 15/03/2024</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">MZN 25,000</p>
                    <p className="text-sm text-gray-600">6 meses • 25% a.m.</p>
                  </div>
                  <Button>Desembolsar</Button>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">João Mussa</p>
                    <p className="text-sm text-gray-600">Aprovado em 14/03/2024</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">MZN 15,000</p>
                    <p className="text-sm text-gray-600">4 meses • 25% a.m.</p>
                  </div>
                  <Button>Desembolsar</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Controle de Pagamentos</CardTitle>
              <CardDescription>
                Registro e acompanhamento de pagamentos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Maria Santos</p>
                    <p className="text-sm text-gray-600">Parcela 2/6 • Vence: 20/03/2024</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">MZN 6,250</p>
                    <p className="text-sm text-gray-600">Capital + Juros</p>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">Registrar</Button>
                    <Button size="sm">Recebido</Button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg bg-green-50">
                  <div>
                    <p className="font-medium">Pedro Costa</p>
                    <p className="text-sm text-gray-600">Parcela 1/4 • Pago em: 15/03/2024</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">MZN 4,375</p>
                    <p className="text-sm text-gray-600">Quitado</p>
                  </div>
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Relatórios Operacionais</CardTitle>
              <CardDescription>
                Controle e análise das operações diárias
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">Operações Diárias</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Resumo das atividades do dia
                  </p>
                  <Button size="sm" className="w-full">Gerar Relatório</Button>
                </div>

                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">Relatório Mensal</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Consolidado mensal de operações
                  </p>
                  <Button size="sm" className="w-full">Gerar Relatório</Button>
                </div>

                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">Fluxo de Caixa</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Entradas e saídas de recursos
                  </p>
                  <Button size="sm" className="w-full">Gerar Relatório</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

const OperationsModule = () => {
  return (
    <Routes>
      <Route path="/" element={<OperationsDashboard />} />
      <Route path="/*" element={<OperationsDashboard />} />
    </Routes>
  );
};

export default OperationsModule;
