
import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  Shield,
  UserPlus,
  CreditCard,
  FileText,
  Settings,
  BarChart3,
  AlertTriangle,
  UserCheck,
  Calendar,
  Award,
  Briefcase,
  GraduationCap
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { exportToExcel, exportToWord, ReportData } from '../../utils/exportUtils';
import { useAuth } from '../../hooks/useAuth';
import RegisterForm from '../auth/RegisterForm';

const AdminDashboard = () => {
  const { toast } = useToast();
  const { register } = useAuth();
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [newEmployee, setNewEmployee] = useState({
    name: '',
    email: '',
    role: '',
    department: ''
  });
  const [transaction, setTransaction] = useState({
    type: '',
    amount: '',
    description: '',
    category: ''
  });

  // HR related states
  const [hrEmployee, setHrEmployee] = useState({
    name: '',
    position: '',
    department: '',
    salary: '',
    startDate: ''
  });
  const [vacationRequest, setVacationRequest] = useState({
    employeeId: '',
    startDate: '',
    endDate: '',
    reason: ''
  });
  const [evaluation, setEvaluation] = useState({
    employeeId: '',
    period: '',
    rating: '',
    comments: ''
  });

  const handleAddEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmployee.name || !newEmployee.email || !newEmployee.role || !newEmployee.department) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    console.log('Adicionando funcionário:', newEmployee);
    toast({
      title: "Funcionário Adicionado",
      description: `${newEmployee.name} foi adicionado ao sistema.`,
    });
    
    setNewEmployee({
      name: '',
      email: '',
      role: '',
      department: ''
    });
  };

  const handleRegisterUser = (data: any) => {
    const result = register(data);
    
    if (result.success) {
      toast({
        title: "Usuário Cadastrado",
        description: result.message,
      });
      setShowRegisterForm(false);
    } else {
      toast({
        title: "Erro",
        description: result.message,
        variant: "destructive"
      });
    }
  };

  const handleHREmployeeAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hrEmployee.name || !hrEmployee.position || !hrEmployee.department || !hrEmployee.salary) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    console.log('Adicionando funcionário (RH):', hrEmployee);
    toast({
      title: "Funcionário Cadastrado (RH)",
      description: `${hrEmployee.name} foi cadastrado no sistema de RH.`,
    });
    
    setHrEmployee({
      name: '',
      position: '',
      department: '',
      salary: '',
      startDate: ''
    });
  };

  const handleVacationRequest = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Solicitação de férias:', vacationRequest);
    toast({
      title: "Solicitação Registrada",
      description: "Solicitação de férias foi registrada com sucesso.",
    });
    
    setVacationRequest({
      employeeId: '',
      startDate: '',
      endDate: '',
      reason: ''
    });
  };

  const handleEvaluation = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Avaliação registrada:', evaluation);
    toast({
      title: "Avaliação Registrada",
      description: "Avaliação de desempenho foi registrada com sucesso.",
    });
    
    setEvaluation({
      employeeId: '',
      period: '',
      rating: '',
      comments: ''
    });
  };

  const handleExportReport = async (type: 'excel' | 'word', reportType: string) => {
    console.log(`Exportando relatório ${reportType} em ${type}`);
    
    const reportData: ReportData = {
      title: `Relatório Administrativo - ${reportType}`,
      headers: ['Data', 'Tipo', 'Valor', 'Status'],
      data: [
        ['15/03/2024', 'Receita', '50000', 'Confirmado'],
        ['14/03/2024', 'Despesa', '25000', 'Pago'],
        ['13/03/2024', 'Investimento', '75000', 'Aprovado']
      ],
      summary: {
        'Total de Transações': 3,
        'Receita Total': 'MZN 50,000',
        'Despesas': 'MZN 25,000'
      }
    };

    let success = false;
    const filename = `relatorio-admin-${reportType.toLowerCase()}-${new Date().toISOString().split('T')[0]}`;

    try {
      if (type === 'excel') {
        success = exportToExcel(reportData, filename);
      } else {
        const wordContent = `${reportData.title}\n\nRelatório gerado em: ${new Date().toLocaleDateString()}`;
        success = exportToWord(wordContent, filename);
      }

      if (success) {
        toast({
          title: "Relatório Exportado",
          description: `Relatório ${reportType} foi exportado com sucesso.`,
        });
      } else {
        throw new Error('Falha na exportação');
      }
    } catch (error) {
      console.error('Erro na exportação:', error);
      toast({
        title: "Erro na Exportação",
        description: "Ocorreu um erro ao exportar o relatório.",
        variant: "destructive"
      });
    }
  };

  const handleRegisterTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transaction.type || !transaction.amount || !transaction.description) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    console.log('Registrando transação:', transaction);
    toast({
      title: "Transação Registrada",
      description: `Transação de ${transaction.type} registrada com sucesso.`,
    });
    
    setTransaction({
      type: '',
      amount: '',
      description: '',
      category: ''
    });
  };

  const handleSystemBackup = () => {
    console.log('Iniciando backup do sistema');
    toast({
      title: "Backup Iniciado",
      description: "Processo de backup do sistema foi iniciado.",
    });
  };

  const handleGenerateReport = (reportType: string) => {
    console.log(`Gerando relatório de ${reportType}`);
    toast({
      title: "Relatório Gerado",
      description: `Relatório de ${reportType} foi gerado com sucesso.`,
    });
  };

  const handleSystemMaintenance = () => {
    console.log('Agendando manutenção do sistema');
    toast({
      title: "Manutenção Agendada",
      description: "Manutenção do sistema foi agendada para esta noite.",
    });
  };

  if (showRegisterForm) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Cadastro de Usuário</h1>
          <Button variant="outline" onClick={() => setShowRegisterForm(false)}>
            Voltar
          </Button>
        </div>
        <Card>
          <CardContent className="pt-6">
            <RegisterForm onSwitchToLogin={() => setShowRegisterForm(false)} />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Administração</h1>
        <div className="flex space-x-2">
          <Button onClick={() => setShowRegisterForm(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Cadastrar Usuário
          </Button>
          <Button onClick={() => setNewEmployee({ name: '', email: '', role: '', department: '' })}>
            <Users className="mr-2 h-4 w-4" />
            Adicionar Funcionário
          </Button>
        </div>
      </div>

      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="employees">Funcionários</TabsTrigger>
          <TabsTrigger value="hr">Recursos Humanos</TabsTrigger>
          <TabsTrigger value="finance">Finanças</TabsTrigger>
          <TabsTrigger value="reports">Relatórios</TabsTrigger>
          <TabsTrigger value="settings">Configurações</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Usuários Ativos</p>
                    <p className="text-2xl font-bold">45</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Receita Mensal</p>
                    <p className="text-2xl font-bold">MZN 50,000</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Novos Clientes</p>
                    <p className="text-2xl font-bold">12</p>
                  </div>
                  <UserPlus className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Taxa de Engajamento</p>
                    <p className="text-2xl font-bold">78%</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Alertas de Segurança</CardTitle>
              <CardDescription>
                Notificações importantes sobre a segurança do sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg bg-yellow-50">
                  <div>
                    <p className="font-medium">Acesso Não Autorizado</p>
                    <p className="text-sm text-gray-600">
                      Tentativa de acesso detectada em 15/03/2024
                    </p>
                  </div>
                  <AlertTriangle className="h-6 w-6 text-yellow-600" />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg bg-red-50">
                  <div>
                    <p className="font-medium">Vulnerabilidade Encontrada</p>
                    <p className="text-sm text-gray-600">
                      Risco de segurança identificado no módulo de pagamentos
                    </p>
                  </div>
                  <Shield className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="employees" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Gerenciar Funcionários</CardTitle>
              <CardDescription>
                Adicionar, editar e remover funcionários do sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddEmployee} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="employeeName">Nome Completo *</Label>
                    <Input 
                      id="employeeName" 
                      placeholder="Nome completo" 
                      value={newEmployee.name}
                      onChange={(e) => setNewEmployee({...newEmployee, name: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="employeeEmail">Email *</Label>
                    <Input 
                      id="employeeEmail" 
                      placeholder="Email" 
                      type="email"
                      value={newEmployee.email}
                      onChange={(e) => setNewEmployee({...newEmployee, email: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="employeeRole">Cargo *</Label>
                    <Input 
                      id="employeeRole" 
                      placeholder="Cargo" 
                      value={newEmployee.role}
                      onChange={(e) => setNewEmployee({...newEmployee, role: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="employeeDepartment">Departamento *</Label>
                    <Input 
                      id="employeeDepartment" 
                      placeholder="Departamento" 
                      value={newEmployee.department}
                      onChange={(e) => setNewEmployee({...newEmployee, department: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button type="submit" className="w-1/3">Adicionar</Button>
                  <Button type="button" variant="outline" className="w-1/3">Editar</Button>
                  <Button type="button" variant="destructive" className="w-1/3">Remover</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hr" className="space-y-6">
          <Tabs defaultValue="employees" className="w-full">
            <TabsList>
              <TabsTrigger value="employees">Funcionários RH</TabsTrigger>
              <TabsTrigger value="vacations">Férias</TabsTrigger>
              <TabsTrigger value="evaluations">Avaliações</TabsTrigger>
              <TabsTrigger value="payroll">Folha de Pagamento</TabsTrigger>
              <TabsTrigger value="training">Treinamentos</TabsTrigger>
            </TabsList>

            <TabsContent value="employees" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Gestão de Funcionários (RH)</CardTitle>
                  <CardDescription>
                    Cadastro e gestão completa de funcionários
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleHREmployeeAdd} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="hrEmployeeName">Nome Completo *</Label>
                        <Input 
                          id="hrEmployeeName" 
                          placeholder="Nome completo" 
                          value={hrEmployee.name}
                          onChange={(e) => setHrEmployee({...hrEmployee, name: e.target.value})}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="hrEmployeePosition">Cargo *</Label>
                        <Input 
                          id="hrEmployeePosition" 
                          placeholder="Cargo" 
                          value={hrEmployee.position}
                          onChange={(e) => setHrEmployee({...hrEmployee, position: e.target.value})}
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="hrEmployeeDepartment">Departamento *</Label>
                        <Input 
                          id="hrEmployeeDepartment" 
                          placeholder="Departamento" 
                          value={hrEmployee.department}
                          onChange={(e) => setHrEmployee({...hrEmployee, department: e.target.value})}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="hrEmployeeSalary">Salário (MZN) *</Label>
                        <Input 
                          id="hrEmployeeSalary" 
                          placeholder="Salário" 
                          type="number"
                          value={hrEmployee.salary}
                          onChange={(e) => setHrEmployee({...hrEmployee, salary: e.target.value})}
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="hrEmployeeStartDate">Data de Início</Label>
                      <Input 
                        id="hrEmployeeStartDate" 
                        type="date"
                        value={hrEmployee.startDate}
                        onChange={(e) => setHrEmployee({...hrEmployee, startDate: e.target.value})}
                      />
                    </div>

                    <Button type="submit" className="w-full">
                      <UserCheck className="mr-2 h-4 w-4" />
                      Cadastrar Funcionário
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="vacations" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Gestão de Férias e Licenças</CardTitle>
                  <CardDescription>
                    Solicitações e aprovações de férias
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleVacationRequest} className="space-y-4">
                    <div>
                      <Label htmlFor="vacationEmployeeId">ID do Funcionário</Label>
                      <Input 
                        id="vacationEmployeeId" 
                        placeholder="ID do funcionário" 
                        value={vacationRequest.employeeId}
                        onChange={(e) => setVacationRequest({...vacationRequest, employeeId: e.target.value})}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="vacationStartDate">Data de Início</Label>
                        <Input 
                          id="vacationStartDate" 
                          type="date"
                          value={vacationRequest.startDate}
                          onChange={(e) => setVacationRequest({...vacationRequest, startDate: e.target.value})}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="vacationEndDate">Data de Fim</Label>
                        <Input 
                          id="vacationEndDate" 
                          type="date"
                          value={vacationRequest.endDate}
                          onChange={(e) => setVacationRequest({...vacationRequest, endDate: e.target.value})}
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="vacationReason">Motivo</Label>
                      <Textarea 
                        id="vacationReason" 
                        placeholder="Motivo da solicitação" 
                        value={vacationRequest.reason}
                        onChange={(e) => setVacationRequest({...vacationRequest, reason: e.target.value})}
                      />
                    </div>

                    <Button type="submit" className="w-full">
                      <Calendar className="mr-2 h-4 w-4" />
                      Registrar Solicitação
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="evaluations" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Avaliações de Desempenho</CardTitle>
                  <CardDescription>
                    Registro e acompanhamento de avaliações
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleEvaluation} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="evaluationEmployeeId">ID do Funcionário</Label>
                        <Input 
                          id="evaluationEmployeeId" 
                          placeholder="ID do funcionário" 
                          value={evaluation.employeeId}
                          onChange={(e) => setEvaluation({...evaluation, employeeId: e.target.value})}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="evaluationPeriod">Período</Label>
                        <Input 
                          id="evaluationPeriod" 
                          placeholder="Ex: Q1 2024" 
                          value={evaluation.period}
                          onChange={(e) => setEvaluation({...evaluation, period: e.target.value})}
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="evaluationRating">Classificação (1-5)</Label>
                      <Input 
                        id="evaluationRating" 
                        type="number" 
                        min="1" 
                        max="5"
                        placeholder="Classificação" 
                        value={evaluation.rating}
                        onChange={(e) => setEvaluation({...evaluation, rating: e.target.value})}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="evaluationComments">Comentários</Label>
                      <Textarea 
                        id="evaluationComments" 
                        placeholder="Comentários sobre o desempenho" 
                        value={evaluation.comments}
                        onChange={(e) => setEvaluation({...evaluation, comments: e.target.value})}
                      />
                    </div>

                    <Button type="submit" className="w-full">
                      <Award className="mr-2 h-4 w-4" />
                      Registrar Avaliação
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="payroll" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Folha de Pagamento</CardTitle>
                  <CardDescription>
                    Gestão de salários e benefícios
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 border rounded-lg text-center">
                      <Briefcase className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                      <h3 className="font-semibold mb-2">Gerar Folha</h3>
                      <Button size="sm" className="w-full">Gerar</Button>
                    </div>

                    <div className="p-4 border rounded-lg text-center">
                      <DollarSign className="h-8 w-8 mx-auto mb-2 text-green-600" />
                      <h3 className="font-semibold mb-2">Calcular Impostos</h3>
                      <Button size="sm" variant="outline" className="w-full">Calcular</Button>
                    </div>

                    <div className="p-4 border rounded-lg text-center">
                      <FileText className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                      <h3 className="font-semibold mb-2">Relatório Mensal</h3>
                      <Button size="sm" variant="outline" className="w-full">Exportar</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="training" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Programas de Treinamento</CardTitle>
                  <CardDescription>
                    Gestão de capacitação e desenvolvimento
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg">
                      <GraduationCap className="h-8 w-8 mb-2 text-blue-600" />
                      <h3 className="font-semibold mb-2">Curso de Microcrédito</h3>
                      <p className="text-sm text-gray-600 mb-3">
                        Treinamento básico sobre microcrédito
                      </p>
                      <Button size="sm" className="w-full">Inscrever Funcionários</Button>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <Award className="h-8 w-8 mb-2 text-green-600" />
                      <h3 className="font-semibold mb-2">Certificação em Análise de Risco</h3>
                      <p className="text-sm text-gray-600 mb-3">
                        Programa avançado de análise de crédito
                      </p>
                      <Button size="sm" variant="outline" className="w-full">Ver Detalhes</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </TabsContent>

        <TabsContent value="finance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Controle Financeiro</CardTitle>
              <CardDescription>
                Registro de transações financeiras
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleRegisterTransaction} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="transactionType">Tipo de Transação *</Label>
                    <Input 
                      id="transactionType" 
                      placeholder="Tipo" 
                      value={transaction.type}
                      onChange={(e) => setTransaction({...transaction, type: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="transactionAmount">Valor (MZN) *</Label>
                    <Input 
                      id="transactionAmount" 
                      placeholder="Valor" 
                      type="number"
                      value={transaction.amount}
                      onChange={(e) => setTransaction({...transaction, amount: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="transactionDescription">Descrição *</Label>
                  <Textarea 
                    id="transactionDescription" 
                    placeholder="Descrição" 
                    value={transaction.description}
                    onChange={(e) => setTransaction({...transaction, description: e.target.value})}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="transactionCategory">Categoria</Label>
                  <Input 
                    id="transactionCategory" 
                    placeholder="Categoria" 
                    value={transaction.category}
                    onChange={(e) => setTransaction({...transaction, category: e.target.value})}
                  />
                </div>

                <Button type="submit" className="w-full">Registrar Transação</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Relatórios Administrativos</CardTitle>
              <CardDescription>
                Geração e exportação de relatórios
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">Relatório Financeiro</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Visão geral das finanças da empresa
                  </p>
                  <div className="flex flex-col space-y-2">
                    <Button 
                      size="sm" 
                      onClick={() => handleExportReport('excel', 'Financeiro')}
                      className="w-full"
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      Excel
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleExportReport('word', 'Financeiro')}
                      className="w-full"
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      Word
                    </Button>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">Relatório de Usuários</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Informações sobre os usuários do sistema
                  </p>
                  <div className="flex flex-col space-y-2">
                    <Button 
                      size="sm" 
                      onClick={() => handleExportReport('excel', 'Usuários')}
                      className="w-full"
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      Excel
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleExportReport('word', 'Usuários')}
                      className="w-full"
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      Word
                    </Button>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">Relatório de RH</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Informações sobre funcionários e RH
                  </p>
                  <div className="flex flex-col space-y-2">
                    <Button 
                      size="sm" 
                      onClick={() => handleExportReport('excel', 'RH')}
                      className="w-full"
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      Excel
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleExportReport('word', 'RH')}
                      className="w-full"
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      Word
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configurações do Sistema</CardTitle>
              <CardDescription>
                Ajustes e configurações gerais do sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Backup do Sistema</p>
                    <p className="text-sm text-gray-600">
                      Realize um backup completo do sistema
                    </p>
                  </div>
                  <Button onClick={handleSystemBackup}>Executar Backup</Button>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Manutenção do Sistema</p>
                    <p className="text-sm text-gray-600">
                      Agende uma manutenção para otimizar o sistema
                    </p>
                  </div>
                  <Button onClick={handleSystemMaintenance}>Agendar Manutenção</Button>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Gerar Relatório de Uso</p>
                    <p className="text-sm text-gray-600">
                      Crie um relatório detalhado sobre o uso do sistema
                    </p>
                  </div>
                  <Button onClick={() => handleGenerateReport('Uso do Sistema')}>Gerar Relatório</Button>
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
