
import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { 
  Receipt, 
  Plus, 
  Search, 
  Edit, 
  Trash, 
  Download, 
  Calendar,
  DollarSign,
  FileText,
  Building,
  Car,
  Lightbulb,
  Users,
  Phone
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useToast } from '@/hooks/use-toast';

const ExpensesDashboard = () => {
  const { toast } = useToast();
  const [expenses, setExpenses] = useState([
    { id: 1, category: 'Aluguel', description: 'Aluguel do escritório', amount: 35000, date: '01/06/2024', status: 'Pago', responsible: 'João Silva' },
    { id: 2, category: 'Salários', description: 'Salários funcionários', amount: 125000, date: '30/05/2024', status: 'Pago', responsible: 'RH' },
    { id: 3, category: 'Combustível', description: 'Combustível veículos', amount: 8500, date: '15/06/2024', status: 'Pendente', responsible: 'Carlos Mussa' },
    { id: 4, category: 'Telefone', description: 'Conta telefone/internet', amount: 3200, date: '10/06/2024', status: 'Pago', responsible: 'Ana Costa' },
  ]);

  const [expenseForm, setExpenseForm] = useState({
    category: '',
    description: '',
    amount: '',
    date: '',
    responsible: '',
    receipt: null
  });

  const [categories] = useState([
    'Aluguel', 'Salários', 'Combustível', 'Telefone', 'Internet', 'Água', 'Luz',
    'Material de Escritório', 'Marketing', 'Manutenção', 'Seguros', 'Impostos',
    'Consultoria', 'Viagens', 'Alimentação', 'Outros'
  ]);

  const handleCreateExpense = () => {
    if (!expenseForm.category || !expenseForm.description || !expenseForm.amount) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    const newExpense = {
      id: expenses.length + 1,
      category: expenseForm.category,
      description: expenseForm.description,
      amount: parseFloat(expenseForm.amount),
      date: expenseForm.date || new Date().toLocaleDateString('pt-BR'),
      status: 'Pendente',
      responsible: expenseForm.responsible
    };

    setExpenses([...expenses, newExpense]);
    setExpenseForm({ category: '', description: '', amount: '', date: '', responsible: '', receipt: null });
    
    toast({
      title: "Despesa Criada",
      description: `Despesa de MZN ${expenseForm.amount} criada com sucesso.`,
    });
  };

  const getTotalExpenses = () => {
    return expenses.reduce((total, expense) => total + expense.amount, 0);
  };

  const getPendingExpenses = () => {
    return expenses.filter(expense => expense.status === 'Pendente').length;
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Aluguel': return <Building className="h-4 w-4" />;
      case 'Combustível': return <Car className="h-4 w-4" />;
      case 'Luz': return <Lightbulb className="h-4 w-4" />;
      case 'Salários': return <Users className="h-4 w-4" />;
      case 'Telefone': return <Phone className="h-4 w-4" />;
      default: return <Receipt className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Gestão de Despesas</h1>
        <Button onClick={() => toast({ title: "Nova Despesa", description: "Criando nova despesa." })}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Despesa
        </Button>
      </div>

      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="expenses">Despesas</TabsTrigger>
          <TabsTrigger value="categories">Categorias</TabsTrigger>
          <TabsTrigger value="reports">Relatórios</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Despesas</p>
                    <p className="text-2xl font-bold">MZN {getTotalExpenses().toLocaleString()}</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pendentes</p>
                    <p className="text-2xl font-bold">{getPendingExpenses()}</p>
                  </div>
                  <Calendar className="h-8 w-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Este Mês</p>
                    <p className="text-2xl font-bold">MZN 172K</p>
                  </div>
                  <FileText className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Categorias</p>
                    <p className="text-2xl font-bold">{categories.length}</p>
                  </div>
                  <Receipt className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Despesas Recentes</CardTitle>
                <CardDescription>Últimas despesas registradas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {expenses.slice(0, 5).map((expense) => (
                    <div key={expense.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        {getCategoryIcon(expense.category)}
                        <div>
                          <p className="font-medium">{expense.description}</p>
                          <p className="text-sm text-gray-600">{expense.category} - {expense.date}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">MZN {expense.amount.toLocaleString()}</p>
                        <span className={`px-2 py-1 rounded text-xs ${
                          expense.status === 'Pago' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {expense.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Nova Despesa</CardTitle>
                <CardDescription>Registrar nova despesa</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="expenseCategory">Categoria</Label>
                  <Select onValueChange={(value) => setExpenseForm({...expenseForm, category: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="expenseDescription">Descrição</Label>
                  <Input 
                    id="expenseDescription"
                    value={expenseForm.description}
                    onChange={(e) => setExpenseForm({...expenseForm, description: e.target.value})}
                    placeholder="Ex: Aluguel do escritório"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="expenseAmount">Valor (MZN)</Label>
                    <Input 
                      id="expenseAmount"
                      type="number"
                      value={expenseForm.amount}
                      onChange={(e) => setExpenseForm({...expenseForm, amount: e.target.value})}
                      placeholder="Ex: 35000"
                    />
                  </div>
                  <div>
                    <Label htmlFor="expenseDate">Data</Label>
                    <Input 
                      id="expenseDate"
                      type="date"
                      value={expenseForm.date}
                      onChange={(e) => setExpenseForm({...expenseForm, date: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="expenseResponsible">Responsável</Label>
                  <Input 
                    id="expenseResponsible"
                    value={expenseForm.responsible}
                    onChange={(e) => setExpenseForm({...expenseForm, responsible: e.target.value})}
                    placeholder="Ex: João Silva"
                  />
                </div>

                <Button onClick={handleCreateExpense} className="w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  Criar Despesa
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="expenses" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Lista de Despesas</CardTitle>
              <CardDescription>Gestão completa de despesas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <Input placeholder="Buscar despesa..." className="w-64" />
                  <Button variant="outline">
                    <Search className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-2">
                  <div className="grid grid-cols-7 gap-4 p-3 bg-gray-50 rounded font-medium">
                    <span>Categoria</span>
                    <span>Descrição</span>
                    <span>Valor</span>
                    <span>Data</span>
                    <span>Status</span>
                    <span>Responsável</span>
                    <span>Ações</span>
                  </div>
                  {expenses.map((expense) => (
                    <div key={expense.id} className="grid grid-cols-7 gap-4 p-3 border-b items-center">
                      <div className="flex items-center space-x-2">
                        {getCategoryIcon(expense.category)}
                        <span>{expense.category}</span>
                      </div>
                      <span>{expense.description}</span>
                      <span className="font-bold">MZN {expense.amount.toLocaleString()}</span>
                      <span>{expense.date}</span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        expense.status === 'Pago' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {expense.status}
                      </span>
                      <span>{expense.responsible}</span>
                      <div className="flex space-x-1">
                        <Button size="sm" variant="outline">
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="destructive">
                          <Trash className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Categorias de Despesas</CardTitle>
              <CardDescription>Gestão de categorias</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {categories.map(category => (
                  <div key={category} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-2">
                      {getCategoryIcon(category)}
                      <span>{category}</span>
                    </div>
                    <Button size="sm" variant="outline">
                      <Edit className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Relatório Mensal</CardTitle>
                <CardDescription>Despesas por mês</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">
                  <Download className="mr-2 h-4 w-4" />
                  Gerar Relatório
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Relatório por Categoria</CardTitle>
                <CardDescription>Análise por categorias</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">
                  <Download className="mr-2 h-4 w-4" />
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

const ExpensesModule = () => {
  return (
    <Routes>
      <Route path="/" element={<ExpensesDashboard />} />
      <Route path="/*" element={<ExpensesDashboard />} />
    </Routes>
  );
};

export default ExpensesModule;
