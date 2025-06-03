import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { 
  Users, 
  FileText, 
  Calculator, 
  Settings, 
  BarChart3,
  Download,
  Plus,
  Edit,
  Trash,
  Save,
  Eye,
  Upload
} from 'lucide-react';
import { toast } from '../ui/use-toast';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [employees, setEmployees] = useState([
    { id: 1, name: 'João Silva', position: 'Analista de Crédito', salary: '25000' },
    { id: 2, name: 'Maria Santos', position: 'Gerente de Operações', salary: '35000' },
    { id: 3, name: 'Ana Costa', position: 'Assistente Administrativa', salary: '18000' }
  ]);
  const [transactions, setTransactions] = useState([
    { id: 1, date: '2024-01-15', type: 'Entrada', description: 'Juros recebidos', amount: 5000 },
    { id: 2, date: '2024-01-15', type: 'Saída', description: 'Salários', amount: -78000 },
    { id: 3, date: '2024-01-14', type: 'Entrada', description: 'Pagamento de empréstimo', amount: 12000 }
  ]);

  const [newEmployee, setNewEmployee] = useState({ name: '', position: '', salary: '' });
  const [newTransaction, setNewTransaction] = useState({ type: 'Entrada', description: '', amount: '' });

  const handleExportReports = () => {
    toast({
      title: "Relatórios exportados",
      description: "Os relatórios foram exportados com sucesso.",
    });
  };

  const handleGenerateReport = (type: string) => {
    toast({
      title: "Relatório gerado",
      description: `Relatório de ${type} foi gerado com sucesso.`,
    });
  };

  const handleAccessModule = (module: string) => {
    toast({
      title: `Acesso ao ${module}`,
      description: `Redirecionando para o módulo de ${module}...`,
    });
  };

  const handleAddEmployee = () => {
    if (newEmployee.name && newEmployee.position && newEmployee.salary) {
      const employee = {
        id: employees.length + 1,
        ...newEmployee
      };
      setEmployees([...employees, employee]);
      setNewEmployee({ name: '', position: '', salary: '' });
      toast({
        title: "Funcionário adicionado",
        description: `${newEmployee.name} foi adicionado com sucesso.`,
      });
    } else {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
    }
  };

  const handleEditEmployee = (id: number) => {
    toast({
      title: "Editar funcionário",
      description: `Funcionalidade de edição será implementada para o funcionário ID: ${id}`,
    });
  };

  const handleDeleteEmployee = (id: number) => {
    setEmployees(employees.filter(emp => emp.id !== id));
    toast({
      title: "Funcionário removido",
      description: "Funcionário foi removido com sucesso.",
    });
  };

  const handleAddTransaction = () => {
    if (newTransaction.description && newTransaction.amount) {
      const transaction = {
        id: transactions.length + 1,
        date: new Date().toISOString().split('T')[0],
        type: newTransaction.type,
        description: newTransaction.description,
        amount: newTransaction.type === 'Entrada' ? 
          Math.abs(parseFloat(newTransaction.amount)) : 
          -Math.abs(parseFloat(newTransaction.amount))
      };
      setTransactions([transaction, ...transactions]);
      setNewTransaction({ type: 'Entrada', description: '', amount: '' });
      toast({
        title: "Transação adicionada",
        description: "Transação foi registrada no livro caixa.",
      });
    } else {
      toast({
        title: "Erro",
        description: "Preencha todos os campos da transação.",
        variant: "destructive"
      });
    }
  };

  const handleUploadDocument = (docType: string) => {
    toast({
      title: "Upload de documento",
      description: `Funcionalidade de upload para ${docType} será implementada.`,
    });
  };

  const handleViewDocument = (docType: string) => {
    toast({
      title: "Visualizar documento",
      description: `Abrindo ${docType}...`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Administração</h1>
        <Button onClick={handleExportReports}>
          <Download className="mr-2 h-4 w-4" />
          Exportar Relatórios
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="hr">Recursos Humanos</TabsTrigger>
          <TabsTrigger value="accounting">Contabilidade</TabsTrigger>
          <TabsTrigger value="reports">Relatórios</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="mr-2 h-5 w-5" />
                  Recursos Humanos
                </CardTitle>
                <CardDescription>
                  Gestão de funcionários e contratos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm">• Contratos de trabalho</p>
                  <p className="text-sm">• Manual do funcionário</p>
                  <p className="text-sm">• Regulamento interno</p>
                  <p className="text-sm">• Avaliações de desempenho</p>
                </div>
                <Button 
                  className="w-full mt-4" 
                  variant="outline"
                  onClick={() => handleAccessModule('Recursos Humanos')}
                >
                  Acessar RH
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calculator className="mr-2 h-5 w-5" />
                  Contabilidade
                </CardTitle>
                <CardDescription>
                  Livro caixa e demonstrações financeiras
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm">• Livro caixa diário</p>
                  <p className="text-sm">• Balancetes mensais</p>
                  <p className="text-sm">• Demonstração de resultados</p>
                  <p className="text-sm">• Controle fiscal</p>
                </div>
                <Button 
                  className="w-full mt-4" 
                  variant="outline"
                  onClick={() => handleAccessModule('Contabilidade')}
                >
                  Ver Contabilidade
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="mr-2 h-5 w-5" />
                  Documentação
                </CardTitle>
                <CardDescription>
                  Certidões e registos da empresa
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm">• Certidão de registo</p>
                  <p className="text-sm">• NUIT da empresa</p>
                  <p className="text-sm">• Licenças operacionais</p>
                  <p className="text-sm">• Políticas internas</p>
                </div>
                <Button 
                  className="w-full mt-4" 
                  variant="outline"
                  onClick={() => handleAccessModule('Documentação')}
                >
                  Documentos
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="hr" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Gestão de Funcionários</CardTitle>
              <CardDescription>
                Adicionar, editar e remover funcionários
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Formulário para adicionar funcionário */}
                <div className="border rounded-lg p-4 bg-gray-50">
                  <h3 className="font-semibold mb-4">Adicionar Novo Funcionário</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="name">Nome Completo</Label>
                      <Input 
                        id="name"
                        value={newEmployee.name}
                        onChange={(e) => setNewEmployee({...newEmployee, name: e.target.value})}
                        placeholder="Ex: João Silva"
                      />
                    </div>
                    <div>
                      <Label htmlFor="position">Cargo</Label>
                      <Input 
                        id="position"
                        value={newEmployee.position}
                        onChange={(e) => setNewEmployee({...newEmployee, position: e.target.value})}
                        placeholder="Ex: Analista de Crédito"
                      />
                    </div>
                    <div>
                      <Label htmlFor="salary">Salário (MZN)</Label>
                      <Input 
                        id="salary"
                        type="number"
                        value={newEmployee.salary}
                        onChange={(e) => setNewEmployee({...newEmployee, salary: e.target.value})}
                        placeholder="Ex: 25000"
                      />
                    </div>
                  </div>
                  <Button onClick={handleAddEmployee} className="mt-4">
                    <Plus className="mr-2 h-4 w-4" />
                    Adicionar Funcionário
                  </Button>
                </div>

                {/* Lista de funcionários */}
                <div className="space-y-2">
                  <h3 className="font-semibold">Funcionários Cadastrados</h3>
                  {employees.map((employee) => (
                    <div key={employee.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">{employee.name}</p>
                        <p className="text-sm text-gray-600">{employee.position}</p>
                      </div>
                      <div className="text-right mr-4">
                        <p className="font-bold">MZN {employee.salary}</p>
                      </div>
                      <div className="space-x-2">
                        <Button size="sm" variant="outline" onClick={() => handleEditEmployee(employee.id)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDeleteEmployee(employee.id)}>
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Documentos de RH */}
          <Card>
            <CardHeader>
              <CardTitle>Documentação de RH</CardTitle>
              <CardDescription>
                Contratos e políticas internas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  'Contratos de Trabalho',
                  'Manual do Funcionário', 
                  'Regulamento Interno',
                  'Avaliações de Desempenho'
                ].map((doc) => (
                  <div key={doc} className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2">{doc}</h3>
                    <div className="space-x-2">
                      <Button size="sm" variant="outline" onClick={() => handleViewDocument(doc)}>
                        <Eye className="mr-2 h-4 w-4" />
                        Ver
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleUploadDocument(doc)}>
                        <Upload className="mr-2 h-4 w-4" />
                        Upload
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="accounting" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Livro Caixa</CardTitle>
              <CardDescription>
                Registro diário de entradas e saídas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Formulário para nova transação */}
                <div className="border rounded-lg p-4 bg-gray-50">
                  <h3 className="font-semibold mb-4">Nova Transação</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="type">Tipo</Label>
                      <select 
                        id="type"
                        value={newTransaction.type}
                        onChange={(e) => setNewTransaction({...newTransaction, type: e.target.value})}
                        className="w-full p-2 border rounded-md"
                      >
                        <option value="Entrada">Entrada</option>
                        <option value="Saída">Saída</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="description">Descrição</Label>
                      <Input 
                        id="description"
                        value={newTransaction.description}
                        onChange={(e) => setNewTransaction({...newTransaction, description: e.target.value})}
                        placeholder="Ex: Pagamento de empréstimo"
                      />
                    </div>
                    <div>
                      <Label htmlFor="amount">Valor (MZN)</Label>
                      <Input 
                        id="amount"
                        type="number"
                        value={newTransaction.amount}
                        onChange={(e) => setNewTransaction({...newTransaction, amount: e.target.value})}
                        placeholder="Ex: 15000"
                      />
                    </div>
                  </div>
                  <Button onClick={handleAddTransaction} className="mt-4">
                    <Plus className="mr-2 h-4 w-4" />
                    Registrar Transação
                  </Button>
                </div>

                {/* Histórico de transações */}
                <div className="space-y-2">
                  <h3 className="font-semibold">Histórico de Transações</h3>
                  <div className="border rounded-lg">
                    <div className="grid grid-cols-4 gap-4 p-3 bg-gray-50 rounded-t font-medium">
                      <span>Data</span>
                      <span>Tipo</span>
                      <span>Descrição</span>
                      <span className="text-right">Valor (MZN)</span>
                    </div>
                    {transactions.map((transaction) => (
                      <div key={transaction.id} className="grid grid-cols-4 gap-4 p-3 border-b items-center">
                        <span>{transaction.date}</span>
                        <span className={`px-2 py-1 rounded text-xs ${
                          transaction.type === 'Entrada' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {transaction.type}
                        </span>
                        <span>{transaction.description}</span>
                        <span className={`text-right font-bold ${
                          transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.amount > 0 ? '+' : ''}{transaction.amount.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Relatórios Administrativos</CardTitle>
              <CardDescription>
                Relatórios mensais e anuais para gestão
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">Relatório Mensal</h3>
                  <p className="text-sm text-gray-600 mb-3">Balanço geral das operações</p>
                  <Button 
                    size="sm" 
                    className="w-full"
                    onClick={() => handleGenerateReport('Mensal')}
                  >
                    <BarChart3 className="mr-2 h-4 w-4" />
                    Gerar
                  </Button>
                </div>
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">Controle de Custos</h3>
                  <p className="text-sm text-gray-600 mb-3">Análise de despesas operacionais</p>
                  <Button 
                    size="sm" 
                    className="w-full"
                    onClick={() => handleGenerateReport('Custos')}
                  >
                    <Calculator className="mr-2 h-4 w-4" />
                    Gerar
                  </Button>
                </div>
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">Auditoria Interna</h3>
                  <p className="text-sm text-gray-600 mb-3">Verificação de conformidade</p>
                  <Button 
                    size="sm" 
                    className="w-full"
                    onClick={() => handleGenerateReport('Auditoria')}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Gerar
                  </Button>
                </div>
              </div>

              {/* Relatórios adicionais */}
              <div className="mt-6 space-y-4">
                <h3 className="font-semibold">Relatórios Especiais</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button 
                    variant="outline" 
                    className="p-4 h-auto flex-col"
                    onClick={() => handleGenerateReport('Balancete Mensal')}
                  >
                    <BarChart3 className="mb-2 h-6 w-6" />
                    <span className="font-semibold">Balancete Mensal</span>
                    <span className="text-sm text-gray-600">Demonstração financeira</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="p-4 h-auto flex-col"
                    onClick={() => handleGenerateReport('Demonstração de Resultados')}
                  >
                    <Calculator className="mb-2 h-6 w-6" />
                    <span className="font-semibold">Demonstração de Resultados</span>
                    <span className="text-sm text-gray-600">Receitas vs despesas</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

const AdminModule = () => {
  return (
    <Routes>
      <Route path="/" element={<AdminDashboard />} />
      <Route path="/*" element={<AdminDashboard />} />
    </Routes>
  );
};

export default AdminModule;
