
import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { 
  Users, 
  UserPlus, 
  Calendar,
  Clock,
  DollarSign,
  FileText,
  Award,
  TrendingUp,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

const HRDashboard = () => {
  const { toast } = useToast();
  const [newEmployee, setNewEmployee] = useState({
    name: '',
    email: '',
    position: '',
    department: '',
    salary: '',
    startDate: ''
  });

  const [leaveRequest, setLeaveRequest] = useState({
    employeeId: '',
    type: '',
    startDate: '',
    endDate: '',
    reason: ''
  });

  const [performanceReview, setPerformanceReview] = useState({
    employeeId: '',
    period: '',
    rating: '',
    feedback: '',
    goals: ''
  });

  const handleAddEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmployee.name || !newEmployee.email || !newEmployee.position) {
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
      position: '',
      department: '',
      salary: '',
      startDate: ''
    });
  };

  const handleLeaveRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaveRequest.employeeId || !leaveRequest.type || !leaveRequest.startDate) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    console.log('Processando solicitação de férias:', leaveRequest);
    toast({
      title: "Solicitação Registrada",
      description: "Solicitação de férias foi registrada com sucesso.",
    });
    
    setLeaveRequest({
      employeeId: '',
      type: '',
      startDate: '',
      endDate: '',
      reason: ''
    });
  };

  const handlePerformanceReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!performanceReview.employeeId || !performanceReview.period || !performanceReview.rating) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    console.log('Registrando avaliação de desempenho:', performanceReview);
    toast({
      title: "Avaliação Registrada",
      description: "Avaliação de desempenho foi registrada com sucesso.",
    });
    
    setPerformanceReview({
      employeeId: '',
      period: '',
      rating: '',
      feedback: '',
      goals: ''
    });
  };

  const handleGeneratePayroll = () => {
    console.log('Gerando folha de pagamento');
    toast({
      title: "Folha de Pagamento",
      description: "Folha de pagamento foi gerada com sucesso.",
    });
  };

  const handleTrainingProgram = () => {
    console.log('Criando programa de treinamento');
    toast({
      title: "Programa de Treinamento",
      description: "Programa de treinamento foi criado com sucesso.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Recursos Humanos</h1>
        <Button onClick={() => setNewEmployee({ name: '', email: '', position: '', department: '', salary: '', startDate: '' })}>
          <UserPlus className="mr-2 h-4 w-4" />
          Novo Funcionário
        </Button>
      </div>

      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="employees">Funcionários</TabsTrigger>
          <TabsTrigger value="leaves">Férias e Licenças</TabsTrigger>
          <TabsTrigger value="performance">Avaliações</TabsTrigger>
          <TabsTrigger value="payroll">Folha de Pagamento</TabsTrigger>
          <TabsTrigger value="training">Treinamentos</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total de Funcionários</p>
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
                    <p className="text-sm font-medium text-gray-600">Novos Funcionários</p>
                    <p className="text-2xl font-bold">5</p>
                  </div>
                  <UserPlus className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Folha de Pagamento</p>
                    <p className="text-2xl font-bold">MZN 150,000</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Avaliações Pendentes</p>
                    <p className="text-2xl font-bold">8</p>
                  </div>
                  <FileText className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Alertas de RH</CardTitle>
              <CardDescription>
                Notificações importantes sobre recursos humanos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg bg-yellow-50">
                  <div>
                    <p className="font-medium">Avaliações Pendentes</p>
                    <p className="text-sm text-gray-600">
                      8 funcionários precisam de avaliação de desempenho
                    </p>
                  </div>
                  <AlertTriangle className="h-6 w-6 text-yellow-600" />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg bg-green-50">
                  <div>
                    <p className="font-medium">Contratação Completa</p>
                    <p className="text-sm text-gray-600">
                      3 novos funcionários foram integrados com sucesso
                    </p>
                  </div>
                  <CheckCircle className="h-6 w-6 text-green-600" />
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
                Adicionar e gerenciar informações dos funcionários
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
                    <Label htmlFor="employeePosition">Cargo *</Label>
                    <Input 
                      id="employeePosition" 
                      placeholder="Cargo" 
                      value={newEmployee.position}
                      onChange={(e) => setNewEmployee({...newEmployee, position: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="employeeDepartment">Departamento</Label>
                    <Select value={newEmployee.department} onValueChange={(value) => setNewEmployee({...newEmployee, department: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o departamento" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Administração</SelectItem>
                        <SelectItem value="credit">Crédito e Risco</SelectItem>
                        <SelectItem value="legal">Jurídico</SelectItem>
                        <SelectItem value="operations">Operações</SelectItem>
                        <SelectItem value="marketing">Marketing</SelectItem>
                        <SelectItem value="hr">Recursos Humanos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="employeeSalary">Salário (MZN)</Label>
                    <Input 
                      id="employeeSalary" 
                      placeholder="Salário" 
                      type="number"
                      value={newEmployee.salary}
                      onChange={(e) => setNewEmployee({...newEmployee, salary: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="employeeStartDate">Data de Início</Label>
                    <Input 
                      id="employeeStartDate" 
                      type="date"
                      value={newEmployee.startDate}
                      onChange={(e) => setNewEmployee({...newEmployee, startDate: e.target.value})}
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full">Adicionar Funcionário</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leaves" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Gestão de Férias e Licenças</CardTitle>
              <CardDescription>
                Registrar e aprovar solicitações de férias e licenças
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLeaveRequest} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="leaveEmployeeId">Funcionário *</Label>
                    <Input 
                      id="leaveEmployeeId" 
                      placeholder="ID ou nome do funcionário" 
                      value={leaveRequest.employeeId}
                      onChange={(e) => setLeaveRequest({...leaveRequest, employeeId: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="leaveType">Tipo *</Label>
                    <Select value={leaveRequest.type} onValueChange={(value) => setLeaveRequest({...leaveRequest, type: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Tipo de licença" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="vacation">Férias</SelectItem>
                        <SelectItem value="sick">Licença Médica</SelectItem>
                        <SelectItem value="personal">Licença Pessoal</SelectItem>
                        <SelectItem value="maternity">Licença Maternidade</SelectItem>
                        <SelectItem value="paternity">Licença Paternidade</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="leaveStartDate">Data de Início *</Label>
                    <Input 
                      id="leaveStartDate" 
                      type="date"
                      value={leaveRequest.startDate}
                      onChange={(e) => setLeaveRequest({...leaveRequest, startDate: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="leaveEndDate">Data de Fim</Label>
                    <Input 
                      id="leaveEndDate" 
                      type="date"
                      value={leaveRequest.endDate}
                      onChange={(e) => setLeaveRequest({...leaveRequest, endDate: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="leaveReason">Motivo</Label>
                  <Textarea 
                    id="leaveReason" 
                    placeholder="Motivo da solicitação" 
                    value={leaveRequest.reason}
                    onChange={(e) => setLeaveRequest({...leaveRequest, reason: e.target.value})}
                  />
                </div>

                <Button type="submit" className="w-full">Registrar Solicitação</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Avaliações de Desempenho</CardTitle>
              <CardDescription>
                Registrar e gerenciar avaliações de desempenho
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePerformanceReview} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="performanceEmployeeId">Funcionário *</Label>
                    <Input 
                      id="performanceEmployeeId" 
                      placeholder="ID ou nome do funcionário" 
                      value={performanceReview.employeeId}
                      onChange={(e) => setPerformanceReview({...performanceReview, employeeId: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="performancePeriod">Período *</Label>
                    <Input 
                      id="performancePeriod" 
                      placeholder="Ex: Q1 2024" 
                      value={performanceReview.period}
                      onChange={(e) => setPerformanceReview({...performanceReview, period: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="performanceRating">Avaliação *</Label>
                  <Select value={performanceReview.rating} onValueChange={(value) => setPerformanceReview({...performanceReview, rating: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a avaliação" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="excellent">Excelente</SelectItem>
                      <SelectItem value="good">Bom</SelectItem>
                      <SelectItem value="satisfactory">Satisfatório</SelectItem>
                      <SelectItem value="needsImprovement">Precisa Melhorar</SelectItem>
                      <SelectItem value="unsatisfactory">Insatisfatório</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="performanceFeedback">Feedback</Label>
                  <Textarea 
                    id="performanceFeedback" 
                    placeholder="Feedback sobre o desempenho" 
                    value={performanceReview.feedback}
                    onChange={(e) => setPerformanceReview({...performanceReview, feedback: e.target.value})}
                  />
                </div>

                <div>
                  <Label htmlFor="performanceGoals">Metas para o Próximo Período</Label>
                  <Textarea 
                    id="performanceGoals" 
                    placeholder="Metas e objetivos" 
                    value={performanceReview.goals}
                    onChange={(e) => setPerformanceReview({...performanceReview, goals: e.target.value})}
                  />
                </div>

                <Button type="submit" className="w-full">Registrar Avaliação</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payroll" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Folha de Pagamento</CardTitle>
              <CardDescription>
                Gerenciar e processar folha de pagamento
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Processar Folha de Pagamento</p>
                    <p className="text-sm text-gray-600">
                      Gerar folha de pagamento para o mês atual
                    </p>
                  </div>
                  <Button onClick={handleGeneratePayroll}>
                    <DollarSign className="mr-2 h-4 w-4" />
                    Gerar Folha
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 border rounded-lg text-center">
                    <h3 className="font-semibold">Total Bruto</h3>
                    <p className="text-2xl font-bold text-green-600">MZN 180,000</p>
                  </div>
                  <div className="p-4 border rounded-lg text-center">
                    <h3 className="font-semibold">Descontos</h3>
                    <p className="text-2xl font-bold text-red-600">MZN 30,000</p>
                  </div>
                  <div className="p-4 border rounded-lg text-center">
                    <h3 className="font-semibold">Total Líquido</h3>
                    <p className="text-2xl font-bold text-blue-600">MZN 150,000</p>
                  </div>
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
                Criar e gerenciar programas de treinamento e desenvolvimento
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Criar Programa de Treinamento</p>
                    <p className="text-sm text-gray-600">
                      Desenvolver novos programas de capacitação
                    </p>
                  </div>
                  <Button onClick={handleTrainingProgram}>
                    <Award className="mr-2 h-4 w-4" />
                    Criar Programa
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2">Treinamentos Ativos</h3>
                    <ul className="space-y-2">
                      <li className="flex justify-between">
                        <span>Atendimento ao Cliente</span>
                        <span className="text-green-600">15 participantes</span>
                      </li>
                      <li className="flex justify-between">
                        <span>Gestão de Risco</span>
                        <span className="text-blue-600">8 participantes</span>
                      </li>
                      <li className="flex justify-between">
                        <span>Compliance</span>
                        <span className="text-orange-600">12 participantes</span>
                      </li>
                    </ul>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2">Próximos Treinamentos</h3>
                    <ul className="space-y-2">
                      <li className="flex justify-between">
                        <span>Segurança da Informação</span>
                        <span className="text-gray-600">25/03/2024</span>
                      </li>
                      <li className="flex justify-between">
                        <span>Liderança</span>
                        <span className="text-gray-600">30/03/2024</span>
                      </li>
                      <li className="flex justify-between">
                        <span>Vendas</span>
                        <span className="text-gray-600">05/04/2024</span>
                      </li>
                    </ul>
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

const HRModule = () => {
  return (
    <Routes>
      <Route path="/" element={<HRDashboard />} />
      <Route path="/*" element={<HRDashboard />} />
    </Routes>
  );
};

export default HRModule;
