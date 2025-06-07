
import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar, 
  Plus, 
  Minus,
  ArrowUpCircle,
  ArrowDownCircle,
  Target,
  PieChart,
  BarChart3,
  Download
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useToast } from '@/hooks/use-toast';

const CashFlowModule = () => {
  const { toast } = useToast();
  const [transactions, setTransactions] = useState([
    { id: 1, type: 'Entrada', description: 'Pagamento empréstimo - João Silva', amount: 5000, date: '15/06/2024', category: 'Pagamentos' },
    { id: 2, type: 'Saída', description: 'Aluguel escritório', amount: 35000, date: '15/06/2024', category: 'Despesas Operacionais' },
    { id: 3, type: 'Entrada', description: 'Pagamento empréstimo - Maria Santos', amount: 3500, date: '14/06/2024', category: 'Pagamentos' },
    { id: 4, type: 'Saída', description: 'Salários funcionários', amount: 125000, date: '14/06/2024', category: 'Folha de Pagamento' },
    { id: 5, type: 'Entrada', description: 'Juros de mora - Carlos Mussa', amount: 1200, date: '13/06/2024', category: 'Juros' },
  ]);

  const [cashForm, setCashForm] = useState({
    type: '',
    description: '',
    amount: '',
    category: '',
    date: ''
  });

  const [balance] = useState({
    current: 485000,
    projected: 520000,
    monthly: {
      income: 245000,
      expenses: 180000
    }
  });

  const categories = {
    entrada: ['Pagamentos', 'Juros', 'Multas', 'Novos Empréstimos', 'Outros Recebimentos'],
    saida: ['Despesas Operacionais', 'Folha de Pagamento', 'Impostos', 'Marketing', 'Combustível', 'Outros']
  };

  const handleAddTransaction = () => {
    if (!cashForm.type || !cashForm.description || !cashForm.amount) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    const newTransaction = {
      id: transactions.length + 1,
      type: cashForm.type,
      description: cashForm.description,
      amount: parseFloat(cashForm.amount),
      date: cashForm.date || new Date().toLocaleDateString('pt-BR'),
      category: cashForm.category
    };

    setTransactions([newTransaction, ...transactions]);
    setCashForm({ type: '', description: '', amount: '', category: '', date: '' });
    
    toast({
      title: "Transação Registrada",
      description: `${cashForm.type} de MZN ${cashForm.amount} registrada com sucesso.`,
    });
  };

  const getTotalIncome = () => {
    return transactions
      .filter(t => t.type === 'Entrada')
      .reduce((total, t) => total + t.amount, 0);
  };

  const getTotalExpenses = () => {
    return transactions
      .filter(t => t.type === 'Saída')
      .reduce((total, t) => total + t.amount, 0);
  };

  const getNetFlow = () => {
    return getTotalIncome() - getTotalExpenses();
  };

  const getTransactionIcon = (type: string) => {
    return type === 'Entrada' 
      ? <ArrowUpCircle className="h-4 w-4 text-green-600" />
      : <ArrowDownCircle className="h-4 w-4 text-red-600" />;
  };

  const getTransactionColor = (type: string) => {
    return type === 'Entrada' ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Fluxo de Caixa</h1>
        <Button onClick={() => toast({ title: "Relatório Exportado", description: "Relatório de fluxo de caixa exportado." })}>
          <Download className="mr-2 h-4 w-4" />
          Exportar Relatório
        </Button>
      </div>

      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="transactions">Transações</TabsTrigger>
          <TabsTrigger value="projections">Projeções</TabsTrigger>
          <TabsTrigger value="analysis">Análise</TabsTrigger>
          <TabsTrigger value="reports">Relatórios</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Saldo Atual</p>
                    <p className="text-2xl font-bold">MZN {balance.current.toLocaleString()}</p>
                  </div>
                  <Wallet className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Entradas do Mês</p>
                    <p className="text-2xl font-bold text-green-600">MZN {balance.monthly.income.toLocaleString()}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Saídas do Mês</p>
                    <p className="text-2xl font-bold text-red-600">MZN {balance.monthly.expenses.toLocaleString()}</p>
                  </div>
                  <TrendingDown className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Fluxo Líquido</p>
                    <p className={`text-2xl font-bold ${getNetFlow() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      MZN {getNetFlow().toLocaleString()}
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Transações Recentes</CardTitle>
                <CardDescription>Últimas movimentações financeiras</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {transactions.slice(0, 5).map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        {getTransactionIcon(transaction.type)}
                        <div>
                          <p className="font-medium">{transaction.description}</p>
                          <p className="text-sm text-gray-600">{transaction.category} - {transaction.date}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold ${getTransactionColor(transaction.type)}`}>
                          {transaction.type === 'Entrada' ? '+' : '-'}MZN {transaction.amount.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Nova Transação</CardTitle>
                <CardDescription>Registrar entrada ou saída de caixa</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="transactionType">Tipo</Label>
                  <Select onValueChange={(value) => setCashForm({...cashForm, type: value, category: ''})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Entrada">Entrada</SelectItem>
                      <SelectItem value="Saída">Saída</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {cashForm.type && (
                  <div>
                    <Label htmlFor="transactionCategory">Categoria</Label>
                    <Select onValueChange={(value) => setCashForm({...cashForm, category: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        {(cashForm.type === 'Entrada' ? categories.entrada : categories.saida).map(category => (
                          <SelectItem key={category} value={category}>{category}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div>
                  <Label htmlFor="transactionDescription">Descrição</Label>
                  <Input 
                    id="transactionDescription"
                    value={cashForm.description}
                    onChange={(e) => setCashForm({...cashForm, description: e.target.value})}
                    placeholder="Ex: Pagamento de empréstimo"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="transactionAmount">Valor (MZN)</Label>
                    <Input 
                      id="transactionAmount"
                      type="number"
                      value={cashForm.amount}
                      onChange={(e) => setCashForm({...cashForm, amount: e.target.value})}
                      placeholder="Ex: 5000"
                    />
                  </div>
                  <div>
                    <Label htmlFor="transactionDate">Data</Label>
                    <Input 
                      id="transactionDate"
                      type="date"
                      value={cashForm.date}
                      onChange={(e) => setCashForm({...cashForm, date: e.target.value})}
                    />
                  </div>
                </div>

                <Button onClick={handleAddTransaction} className="w-full">
                  {cashForm.type === 'Entrada' ? <Plus className="mr-2 h-4 w-4" /> : <Minus className="mr-2 h-4 w-4" />}
                  Registrar {cashForm.type}
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Lista de Transações</CardTitle>
              <CardDescription>Histórico completo de movimentações</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <Input placeholder="Buscar transação..." className="w-64" />
                  <div className="flex space-x-2">
                    <Select>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Filtrar por tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="entrada">Entradas</SelectItem>
                        <SelectItem value="saida">Saídas</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="outline">Filtrar</Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="grid grid-cols-6 gap-4 p-3 bg-gray-50 rounded font-medium">
                    <span>Tipo</span>
                    <span>Descrição</span>
                    <span>Categoria</span>
                    <span>Data</span>
                    <span>Valor</span>
                    <span>Ações</span>
                  </div>
                  {transactions.map((transaction) => (
                    <div key={transaction.id} className="grid grid-cols-6 gap-4 p-3 border-b items-center">
                      <div className="flex items-center space-x-2">
                        {getTransactionIcon(transaction.type)}
                        <span>{transaction.type}</span>
                      </div>
                      <span>{transaction.description}</span>
                      <span className="text-sm">{transaction.category}</span>
                      <span>{transaction.date}</span>
                      <span className={`font-bold ${getTransactionColor(transaction.type)}`}>
                        {transaction.type === 'Entrada' ? '+' : '-'}MZN {transaction.amount.toLocaleString()}
                      </span>
                      <div className="flex space-x-1">
                        <Button size="sm" variant="outline">Editar</Button>
                        <Button size="sm" variant="destructive">Excluir</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projections" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Projeções de Fluxo de Caixa</CardTitle>
              <CardDescription>Previsões baseadas em histórico e empréstimos ativos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-medium text-center">Próximos 30 dias</h3>
                    <div className="mt-2 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Entradas previstas:</span>
                        <span className="text-green-600 font-medium">MZN 180,000</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Saídas previstas:</span>
                        <span className="text-red-600 font-medium">MZN 145,000</span>
                      </div>
                      <div className="flex justify-between border-t pt-2">
                        <span className="font-medium">Saldo projetado:</span>
                        <span className="text-green-600 font-bold">MZN 35,000</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h3 className="font-medium text-center">Próximos 60 dias</h3>
                    <div className="mt-2 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Entradas previstas:</span>
                        <span className="text-green-600 font-medium">MZN 360,000</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Saídas previstas:</span>
                        <span className="text-red-600 font-medium">MZN 290,000</span>
                      </div>
                      <div className="flex justify-between border-t pt-2">
                        <span className="font-medium">Saldo projetado:</span>
                        <span className="text-green-600 font-bold">MZN 70,000</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h3 className="font-medium text-center">Próximos 90 dias</h3>
                    <div className="mt-2 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Entradas previstas:</span>
                        <span className="text-green-600 font-medium">MZN 540,000</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Saídas previstas:</span>
                        <span className="text-red-600 font-medium">MZN 435,000</span>
                      </div>
                      <div className="flex justify-between border-t pt-2">
                        <span className="font-medium">Saldo projetado:</span>
                        <span className="text-green-600 font-bold">MZN 105,000</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h3 className="font-medium text-blue-800 mb-2">Cenários de Risco</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Cenário otimista (100% recebimentos):</span>
                      <span className="text-green-600 font-medium">MZN 620,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Cenário realista (85% recebimentos):</span>
                      <span className="text-blue-600 font-medium">MZN 527,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Cenário pessimista (70% recebimentos):</span>
                      <span className="text-red-600 font-medium">MZN 434,000</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Análise por Categoria</CardTitle>
                <CardDescription>Distribuição de entradas e saídas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-2 border rounded">
                    <span>Pagamentos</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div className="bg-green-600 h-2 rounded-full" style={{width: '60%'}}></div>
                      </div>
                      <span className="text-sm font-medium">60%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center p-2 border rounded">
                    <span>Despesas Operacionais</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div className="bg-red-600 h-2 rounded-full" style={{width: '45%'}}></div>
                      </div>
                      <span className="text-sm font-medium">45%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center p-2 border rounded">
                    <span>Folha de Pagamento</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div className="bg-red-600 h-2 rounded-full" style={{width: '35%'}}></div>
                      </div>
                      <span className="text-sm font-medium">35%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Indicadores Financeiros</CardTitle>
                <CardDescription>Métricas importantes do fluxo de caixa</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Margem Líquida:</span>
                    <span className="font-bold text-green-600">26.5%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Liquidez Atual:</span>
                    <span className="font-bold text-blue-600">2.7x</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Ciclo de Caixa:</span>
                    <span className="font-bold">15 dias</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Taxa de Crescimento:</span>
                    <span className="font-bold text-green-600">+12%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Relatório Diário</CardTitle>
                <CardDescription>Movimentações do dia</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">
                  <Calendar className="mr-2 h-4 w-4" />
                  Gerar Relatório
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Relatório Mensal</CardTitle>
                <CardDescription>Fluxo de caixa mensal</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Gerar Relatório
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Análise de Projeções</CardTitle>
                <CardDescription>Relatório de projeções vs realizações</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">
                  <Target className="mr-2 h-4 w-4" />
                  Gerar Relatório
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Dashboard Executivo</CardTitle>
                <CardDescription>Resumo executivo do fluxo de caixa</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">
                  <PieChart className="mr-2 h-4 w-4" />
                  Gerar Dashboard
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CashFlowModule;
