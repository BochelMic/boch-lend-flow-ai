
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Settings, User, Shield, Bell, Database, Users, MessageSquare, Building2, Percent, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const SettingsModule = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    companyName: 'BOCHEL MICROCREDITO',
    email: 'admin@bochel.mz',
    notifications: true,
    autoReports: false,
    twoFactor: true,
    defaultInterestRate: 15,
    defaultLateRate: 2,
    maxLoanAmount: 100000,
    minLoanAmount: 5000
  });

  const [employees, setEmployees] = useState([
    { id: 1, name: "João Silva", email: "joao@bochel.mz", role: "Administrador", status: "Ativo", permissions: ["all"] },
    { id: 2, name: "Maria Santos", email: "maria@bochel.mz", role: "Analista de Crédito", status: "Ativo", permissions: ["credit", "clients"] },
    { id: 3, name: "Pedro Costa", email: "pedro@bochel.mz", role: "Operador", status: "Ativo", permissions: ["payments", "collection"] }
  ]);

  const [newEmployee, setNewEmployee] = useState({
    name: '',
    email: '',
    role: '',
    password: '',
    permissions: []
  });

  const [microcreditProfile, setMicrocreditProfile] = useState({
    companyType: 'microfinance',
    licenseNumber: 'MF-2024-001',
    centralBankRegistration: 'BM-REG-2024',
    maxClients: 1000,
    operationRegions: ['Maputo', 'Matola', 'Beira'],
    products: ['Microcrédito Individual', 'Microcrédito Solidário', 'Microcrédito Rural']
  });

  const [messageTemplates, setMessageTemplates] = useState({
    paymentReminder: 'Olá {nome}, seu pagamento de MZN {valor} vence em {dias} dias. Evite juros de mora.',
    overdue: 'Olá {nome}, seu pagamento de MZN {valor} está vencido há {dias} dias. Entre em contato conosco.',
    paymentConfirmation: 'Pagamento de MZN {valor} recebido com sucesso. Obrigado!'
  });

  const handleSaveSettings = () => {
    toast({
      title: "Configurações salvas",
      description: "As configurações foram atualizadas com sucesso"
    });
  };

  const handleAddEmployee = () => {
    if (!newEmployee.name || !newEmployee.email || !newEmployee.role) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    const employee = {
      id: employees.length + 1,
      ...newEmployee,
      status: "Ativo",
      permissions: newEmployee.permissions
    };

    setEmployees([...employees, employee]);
    setNewEmployee({ name: '', email: '', role: '', password: '', permissions: [] });
    
    toast({
      title: "Funcionário Adicionado",
      description: `${newEmployee.name} foi cadastrado com sucesso.`
    });
  };

  const handleToggleEmployeeStatus = (employeeId: number) => {
    setEmployees(prev => prev.map(emp => 
      emp.id === employeeId 
        ? { ...emp, status: emp.status === 'Ativo' ? 'Inativo' : 'Ativo' }
        : emp
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Settings className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
          <p className="text-gray-600">Gerencie as configurações do sistema</p>
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">Geral</TabsTrigger>
          <TabsTrigger value="employees">Funcionários</TabsTrigger>
          <TabsTrigger value="microcredit">Perfil Microcrédito</TabsTrigger>
          <TabsTrigger value="messages">Mensagens</TabsTrigger>
          <TabsTrigger value="security">Segurança</TabsTrigger>
          <TabsTrigger value="system">Sistema</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Building2 className="h-5 w-5 text-blue-600" />
                <CardTitle>Informações da Empresa</CardTitle>
              </div>
              <CardDescription>
                Configure as informações básicas da empresa
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Nome da Empresa</Label>
                  <Input
                    id="companyName"
                    value={settings.companyName}
                    onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Principal</Label>
                  <Input
                    id="email"
                    type="email"
                    value={settings.email}
                    onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="defaultRate">Taxa de Juros Padrão (%)</Label>
                  <Input
                    id="defaultRate"
                    type="number"
                    step="0.1"
                    value={settings.defaultInterestRate}
                    onChange={(e) => setSettings({ ...settings, defaultInterestRate: parseFloat(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lateRate">Taxa de Juros de Mora (% a.m.)</Label>
                  <Input
                    id="lateRate"
                    type="number"
                    step="0.1"
                    value={settings.defaultLateRate}
                    onChange={(e) => setSettings({ ...settings, defaultLateRate: parseFloat(e.target.value) })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="minLoan">Valor Mínimo de Empréstimo (MZN)</Label>
                  <Input
                    id="minLoan"
                    type="number"
                    value={settings.minLoanAmount}
                    onChange={(e) => setSettings({ ...settings, minLoanAmount: parseInt(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxLoan">Valor Máximo de Empréstimo (MZN)</Label>
                  <Input
                    id="maxLoan"
                    type="number"
                    value={settings.maxLoanAmount}
                    onChange={(e) => setSettings({ ...settings, maxLoanAmount: parseInt(e.target.value) })}
                  />
                </div>
              </div>

              <Button onClick={handleSaveSettings}>
                Salvar Alterações
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="employees" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-blue-600" />
                <CardTitle>Gestão de Funcionários</CardTitle>
              </div>
              <CardDescription>
                Gerencie funcionários e suas permissões de acesso
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="border rounded-lg p-4 bg-gray-50">
                <h3 className="font-semibold mb-4">Adicionar Funcionário</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="empName">Nome Completo</Label>
                    <Input 
                      id="empName"
                      value={newEmployee.name}
                      onChange={(e) => setNewEmployee({...newEmployee, name: e.target.value})}
                      placeholder="Ex: João Silva"
                    />
                  </div>
                  <div>
                    <Label htmlFor="empEmail">Email</Label>
                    <Input 
                      id="empEmail"
                      type="email"
                      value={newEmployee.email}
                      onChange={(e) => setNewEmployee({...newEmployee, email: e.target.value})}
                      placeholder="Ex: joao@bochel.mz"
                    />
                  </div>
                  <div>
                    <Label htmlFor="empRole">Cargo</Label>
                    <Select onValueChange={(value) => setNewEmployee({...newEmployee, role: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o cargo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Administrador">Administrador</SelectItem>
                        <SelectItem value="Gerente">Gerente</SelectItem>
                        <SelectItem value="Analista de Crédito">Analista de Crédito</SelectItem>
                        <SelectItem value="Operador">Operador</SelectItem>
                        <SelectItem value="Cobrador">Cobrador</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="empPassword">Senha Inicial</Label>
                    <Input 
                      id="empPassword"
                      type="password"
                      value={newEmployee.password}
                      onChange={(e) => setNewEmployee({...newEmployee, password: e.target.value})}
                      placeholder="Senha temporária"
                    />
                  </div>
                </div>
                <Button onClick={handleAddEmployee} className="mt-4">
                  <User className="mr-2 h-4 w-4" />
                  Adicionar Funcionário
                </Button>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold">Funcionários Cadastrados</h3>
                {employees.map((employee) => (
                  <div key={employee.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">{employee.name}</p>
                      <p className="text-sm text-gray-600">{employee.email} • {employee.role}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        employee.status === 'Ativo' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {employee.status}
                      </span>
                      <Switch
                        checked={employee.status === 'Ativo'}
                        onCheckedChange={() => handleToggleEmployeeStatus(employee.id)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="microcredit" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Building2 className="h-5 w-5 text-blue-600" />
                <CardTitle>Perfil de Microcrédito</CardTitle>
              </div>
              <CardDescription>
                Configurações específicas para instituição de microcrédito
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="licenseNumber">Número da Licença</Label>
                  <Input
                    id="licenseNumber"
                    value={microcreditProfile.licenseNumber}
                    onChange={(e) => setMicrocreditProfile({...microcreditProfile, licenseNumber: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="centralBankReg">Registo Banco Central</Label>
                  <Input
                    id="centralBankReg"
                    value={microcreditProfile.centralBankRegistration}
                    onChange={(e) => setMicrocreditProfile({...microcreditProfile, centralBankRegistration: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="maxClients">Máximo de Clientes</Label>
                  <Input
                    id="maxClients"
                    type="number"
                    value={microcreditProfile.maxClients}
                    onChange={(e) => setMicrocreditProfile({...microcreditProfile, maxClients: parseInt(e.target.value)})}
                  />
                </div>
                <div>
                  <Label htmlFor="companyType">Tipo de Instituição</Label>
                  <Select value={microcreditProfile.companyType} onValueChange={(value) => setMicrocreditProfile({...microcreditProfile, companyType: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="microfinance">Instituição de Microfinanças</SelectItem>
                      <SelectItem value="bank">Banco</SelectItem>
                      <SelectItem value="cooperative">Cooperativa de Crédito</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="operationRegions">Regiões de Operação</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {microcreditProfile.operationRegions.map((region, index) => (
                    <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                      {region}
                    </span>
                  ))}
                </div>
              </div>

              <Button onClick={handleSaveSettings}>
                Salvar Perfil
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="messages" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <MessageSquare className="h-5 w-5 text-blue-600" />
                <CardTitle>Modelos de Mensagens</CardTitle>
              </div>
              <CardDescription>
                Configure modelos de SMS e mensagens automáticas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="paymentReminder">Lembrete de Pagamento</Label>
                <Textarea
                  id="paymentReminder"
                  value={messageTemplates.paymentReminder}
                  onChange={(e) => setMessageTemplates({...messageTemplates, paymentReminder: e.target.value})}
                  placeholder="Use {nome}, {valor}, {dias} como variáveis"
                  className="min-h-[80px]"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Variáveis disponíveis: {'{nome}'}, {'{valor}'}, {'{dias}'}
                </p>
              </div>

              <div>
                <Label htmlFor="overdueMessage">Mensagem de Atraso</Label>
                <Textarea
                  id="overdueMessage"
                  value={messageTemplates.overdue}
                  onChange={(e) => setMessageTemplates({...messageTemplates, overdue: e.target.value})}
                  placeholder="Use {nome}, {valor}, {dias} como variáveis"
                  className="min-h-[80px]"
                />
              </div>

              <div>
                <Label htmlFor="paymentConfirmation">Confirmação de Pagamento</Label>
                <Textarea
                  id="paymentConfirmation"
                  value={messageTemplates.paymentConfirmation}
                  onChange={(e) => setMessageTemplates({...messageTemplates, paymentConfirmation: e.target.value})}
                  placeholder="Use {nome}, {valor} como variáveis"
                  className="min-h-[80px]"
                />
              </div>

              <Button onClick={handleSaveSettings}>
                Salvar Modelos
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-blue-600" />
                <CardTitle>Configurações de Segurança</CardTitle>
              </div>
              <CardDescription>
                Gerencie as configurações de segurança do sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Autenticação de Dois Fatores</Label>
                  <p className="text-sm text-gray-500">
                    Adicione uma camada extra de segurança
                  </p>
                </div>
                <Switch
                  checked={settings.twoFactor}
                  onCheckedChange={(checked) => setSettings({ ...settings, twoFactor: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Backup Automático</Label>
                  <p className="text-sm text-gray-500">
                    Realizar backup diário dos dados
                  </p>
                </div>
                <Switch
                  checked={settings.autoReports}
                  onCheckedChange={(checked) => setSettings({ ...settings, autoReports: checked })}
                />
              </div>

              <Button onClick={handleSaveSettings}>
                Salvar Configurações
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Database className="h-5 w-5 text-blue-600" />
                <CardTitle>Configurações do Sistema</CardTitle>
              </div>
              <CardDescription>
                Configurações avançadas do sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Button variant="outline">
                  Fazer Backup do Sistema
                </Button>
                <Button variant="outline">
                  Exportar Dados
                </Button>
                <Button variant="outline">
                  Limpar Cache
                </Button>
                <Button variant="outline">
                  Logs do Sistema
                </Button>
              </div>
              
              <div className="border-t pt-4">
                <Button variant="destructive" className="w-full">
                  Reinicializar Sistema
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsModule;
