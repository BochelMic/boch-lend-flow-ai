
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CreditCard, Plus, Search, FileText, Calculator, AlertTriangle } from 'lucide-react';

const LoansModule = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Mock data para demonstração
  const loans = [
    {
      id: 1,
      clientName: 'João Silva',
      amount: 50000,
      interestRate: 15,
      term: 12,
      status: 'ativo',
      remainingAmount: 35000,
      nextPayment: '2024-01-15',
      type: 'pessoal'
    },
    {
      id: 2,
      clientName: 'Maria Santos',
      amount: 25000,
      interestRate: 12,
      term: 6,
      status: 'em_atraso',
      remainingAmount: 15000,
      nextPayment: '2023-12-20',
      type: 'comercial'
    }
  ];

  const filteredLoans = loans.filter(loan => {
    const matchesSearch = loan.clientName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || loan.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestão de Empréstimos</h1>
          <p className="text-muted-foreground">
            Gerencie contratos e acompanhe pagamentos
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Novo Empréstimo
        </Button>
      </div>

      <Tabs defaultValue="active" className="space-y-6">
        <TabsList>
          <TabsTrigger value="active">Empréstimos Ativos</TabsTrigger>
          <TabsTrigger value="create">Criar Empréstimo</TabsTrigger>
          <TabsTrigger value="calculator">Calculadora</TabsTrigger>
          <TabsTrigger value="types">Tipos de Crédito</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Contratos de Empréstimo
                </CardTitle>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Search className="h-4 w-4" />
                    <Input
                      placeholder="Pesquisar por cliente..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-64"
                    />
                  </div>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="ativo">Ativo</SelectItem>
                      <SelectItem value="em_atraso">Em Atraso</SelectItem>
                      <SelectItem value="quitado">Quitado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredLoans.map((loan) => (
                  <div key={loan.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">{loan.clientName}</h3>
                        <p className="text-sm text-muted-foreground">
                          Tipo: {loan.type} | Taxa: {loan.interestRate}% | Prazo: {loan.term} meses
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            loan.status === 'ativo' ? 'bg-green-100 text-green-800' : 
                            loan.status === 'em_atraso' ? 'bg-red-100 text-red-800' : 
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {loan.status.replace('_', ' ')}
                          </span>
                          {loan.status === 'em_atraso' && (
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Valor Original</p>
                        <p className="font-medium">{loan.amount.toLocaleString()} MZN</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Saldo Devedor</p>
                        <p className="font-medium">{loan.remainingAmount.toLocaleString()} MZN</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Próximo Pagamento</p>
                        <p className="font-medium">{loan.nextPayment}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Progresso</p>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${((loan.amount - loan.remainingAmount) / loan.amount) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" size="sm">
                        <FileText className="mr-1 h-3 w-3" />
                        Ver Contrato
                      </Button>
                      <Button variant="outline" size="sm">
                        <Calculator className="mr-1 h-3 w-3" />
                        Cronograma
                      </Button>
                      <Button variant="outline" size="sm">
                        Registrar Pagamento
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="create">
          <Card>
            <CardHeader>
              <CardTitle>Criar Novo Empréstimo</CardTitle>
              <CardDescription>
                Preencha os dados do contrato de empréstimo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="client">Cliente</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecionar cliente" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="joao">João Silva</SelectItem>
                        <SelectItem value="maria">Maria Santos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">Tipo de Crédito</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecionar tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pessoal">Pessoal</SelectItem>
                        <SelectItem value="comercial">Comercial</SelectItem>
                        <SelectItem value="agricola">Agrícola</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="amount">Valor do Empréstimo (MZN)</Label>
                    <Input id="amount" type="number" placeholder="50000" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rate">Taxa de Juros (%)</Label>
                    <Input id="rate" type="number" placeholder="15" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="term">Prazo (meses)</Label>
                    <Input id="term" type="number" placeholder="12" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="grace">Carência (dias)</Label>
                    <Input id="grace" type="number" placeholder="0" />
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-3">Cálculo Automático</h3>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="text-muted-foreground">Prestação Mensal</p>
                      <p className="text-lg font-semibold">4.850 MZN</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="text-muted-foreground">Total a Pagar</p>
                      <p className="text-lg font-semibold">58.200 MZN</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="text-muted-foreground">Total de Juros</p>
                      <p className="text-lg font-semibold">8.200 MZN</p>
                    </div>
                  </div>
                </div>
                
                <Button type="submit" className="w-full">
                  Criar Contrato de Empréstimo
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calculator">
          <Card>
            <CardHeader>
              <CardTitle>Calculadora de Empréstimos</CardTitle>
              <CardDescription>
                Calcule prestações e simule diferentes cenários
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="calc-amount">Valor (MZN)</Label>
                    <Input id="calc-amount" type="number" placeholder="50000" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="calc-rate">Taxa de Juros (% ao mês)</Label>
                    <Input id="calc-rate" type="number" placeholder="1.5" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="calc-term">Prazo (meses)</Label>
                    <Input id="calc-term" type="number" placeholder="12" />
                  </div>
                  <Button className="w-full">Calcular</Button>
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-semibold">Resultado da Simulação</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Prestação Mensal:</span>
                      <span className="font-semibold">4.850 MZN</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total a Pagar:</span>
                      <span className="font-semibold">58.200 MZN</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total de Juros:</span>
                      <span className="font-semibold">8.200 MZN</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Taxa Efetiva:</span>
                      <span className="font-semibold">16.4% ao ano</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="types">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: 'Crédito Pessoal',
                description: 'Para necessidades pessoais e familiares',
                maxAmount: '100.000 MZN',
                minRate: '12%',
                maxTerm: '24 meses'
              },
              {
                name: 'Crédito Comercial',
                description: 'Para investimento em negócios',
                maxAmount: '500.000 MZN',
                minRate: '10%',
                maxTerm: '36 meses'
              },
              {
                name: 'Crédito Agrícola',
                description: 'Para atividades agrícolas',
                maxAmount: '250.000 MZN',
                minRate: '8%',
                maxTerm: '18 meses'
              }
            ].map((type) => (
              <Card key={type.name}>
                <CardHeader>
                  <CardTitle className="text-lg">{type.name}</CardTitle>
                  <CardDescription>{type.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Valor Máximo:</span>
                    <span className="text-sm font-medium">{type.maxAmount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Taxa Mínima:</span>
                    <span className="text-sm font-medium">{type.minRate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Prazo Máximo:</span>
                    <span className="text-sm font-medium">{type.maxTerm}</span>
                  </div>
                  <Button variant="outline" className="w-full mt-4">
                    Configurar Tipo
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LoansModule;
