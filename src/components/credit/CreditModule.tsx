
import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { 
  CreditCard, 
  Users, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Search,
  Plus,
  Eye
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

const CreditDashboard = () => {
  const [selectedClient, setSelectedClient] = useState(null);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Crédito e Risco</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nova Análise
        </Button>
      </div>

      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="clients">Clientes</TabsTrigger>
          <TabsTrigger value="analysis">Análise</TabsTrigger>
          <TabsTrigger value="collection">Cobrança</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pedidos Pendentes</p>
                    <p className="text-2xl font-bold">23</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Aprovados Hoje</p>
                    <p className="text-2xl font-bold">8</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Rejeitados</p>
                    <p className="text-2xl font-bold">3</p>
                  </div>
                  <XCircle className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Taxa Aprovação</p>
                    <p className="text-2xl font-bold">73%</p>
                  </div>
                  <CreditCard className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Análise de Crédito Pendente</CardTitle>
              <CardDescription>
                Pedidos aguardando análise e aprovação
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { name: "Ana Sita", amount: "MZN 25,000", score: 720, risk: "Baixo" },
                  { name: "João Mussa", amount: "MZN 15,000", score: 650, risk: "Médio" },
                  { name: "Maria Silva", amount: "MZN 30,000", score: 780, risk: "Baixo" },
                ].map((client, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">{client.name}</p>
                      <p className="text-sm text-gray-600">Score: {client.score} | Risco: {client.risk}</p>
                    </div>
                    <div className="text-right mr-4">
                      <p className="font-bold">{client.amount}</p>
                    </div>
                    <div className="space-x-2">
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="default">Analisar</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clients" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Cadastro de Clientes</CardTitle>
              <CardDescription>
                Gestão e classificação de clientes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between mb-4">
                <div className="flex space-x-2">
                  <Input placeholder="Buscar cliente..." className="w-64" />
                  <Button variant="outline">
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
                <Button>Novo Cliente</Button>
              </div>

              <div className="space-y-2">
                <div className="grid grid-cols-5 gap-4 p-3 bg-gray-50 rounded font-medium">
                  <span>Nome</span>
                  <span>Classificação</span>
                  <span>Score</span>
                  <span>Última Operação</span>
                  <span>Ações</span>
                </div>
                {[
                  { name: "António Silva", classification: "Fiel", score: 850, lastOp: "15/03/2024" },
                  { name: "Beatriz Costa", classification: "Fiel", score: 780, lastOp: "10/03/2024" },
                  { name: "Carlos Mussa", classification: "Não Fiel", score: 520, lastOp: "02/02/2024" },
                ].map((client, index) => (
                  <div key={index} className="grid grid-cols-5 gap-4 p-3 border-b items-center">
                    <span>{client.name}</span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      client.classification === 'Fiel' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {client.classification}
                    </span>
                    <span>{client.score}</span>
                    <span>{client.lastOp}</span>
                    <Button size="sm" variant="outline">Ver Detalhes</Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Análise de Capacidade Financeira</CardTitle>
              <CardDescription>
                Avaliação detalhada do cliente para concessão de crédito
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="income">Renda Mensal (MZN)</Label>
                    <Input id="income" placeholder="Ex: 15000" />
                  </div>
                  <div>
                    <Label htmlFor="expenses">Despesas Mensais (MZN)</Label>
                    <Input id="expenses" placeholder="Ex: 8000" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="collateral">Valor do Penhor (MZN)</Label>
                    <Input id="collateral" placeholder="Ex: 50000" />
                  </div>
                  <div>
                    <Label htmlFor="requested">Valor Solicitado (MZN)</Label>
                    <Input id="requested" placeholder="Ex: 20000" />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Descrição do Penhor</Label>
                  <Textarea id="description" placeholder="Descreva o bem oferecido como garantia..." />
                </div>

                <div className="p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold mb-2">Resultado da Análise</h3>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Capacidade de Pagamento</p>
                      <p className="font-bold text-green-600">82%</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Risco Calculado</p>
                      <p className="font-bold text-yellow-600">Médio</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Recomendação</p>
                      <p className="font-bold text-green-600">Aprovar</p>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button className="flex-1">Aprovar Crédito</Button>
                  <Button variant="destructive" className="flex-1">Rejeitar</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="collection" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Sistema de Cobrança</CardTitle>
              <CardDescription>
                Alertas e lembretes de pagamento
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <h3 className="font-semibold text-red-800 mb-2">Vencidos</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span>João Silva - Venceu há 5 dias</span>
                      <span className="font-bold">MZN 15,000</span>
                      <Button size="sm" variant="destructive">Contactar</Button>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h3 className="font-semibold text-yellow-800 mb-2">Vencem Hoje</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span>Maria Santos - Vence hoje</span>
                      <span className="font-bold">MZN 8,500</span>
                      <Button size="sm" variant="outline">Lembrar</Button>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h3 className="font-semibold text-blue-800 mb-2">Vencem em 3 dias</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span>Ana Costa - Vence em 3 dias</span>
                      <span className="font-bold">MZN 12,000</span>
                      <Button size="sm" variant="outline">Pré-aviso</Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

const CreditModule = () => {
  return (
    <Routes>
      <Route path="/" element={<CreditDashboard />} />
      <Route path="/*" element={<CreditDashboard />} />
    </Routes>
  );
};

export default CreditModule;
