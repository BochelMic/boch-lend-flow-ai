
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Settings, User, Shield, Bell, Database, Users, MessageSquare, Building2, Percent, Calendar, Upload, Phone, Globe, MapPin, Shield as ShieldIcon, Clock, Key, Smartphone, Download, RefreshCw, FileText, BarChart3, AlertTriangle, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { clearAllData } from '@/utils/clearData';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';

const SettingsModule = () => {
  const { toast } = useToast();

  const handleClearData = () => {
    if (window.confirm('Tem certeza que deseja limpar todos os dados de demonstração? Esta ação não pode ser desfeita.')) {
      clearAllData();
      toast({
        title: "Dados Limpos",
        description: "Todos os dados de demonstração foram removidos. Sistema pronto para dados reais.",
      });
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    }
  };
  const [settings, setSettings] = useState({
    companyName: 'BOCHEL MICROCREDITO',
    email: 'admin@bochel.mz',
    notifications: true,
    autoReports: false,
    twoFactor: true,
    defaultInterestRate: 15,
    defaultLateRate: 2,
    maxLoanAmount: 100000,
    minLoanAmount: 5000,
    sessionTimeout: 30,
    maxLoginAttempts: 3,
    passwordExpiry: 90,
    backupFrequency: 'daily',
    dataRetention: 7,
    emailNotifications: true,
    smsNotifications: true,
    auditLog: true,
    ipWhitelist: '',
    maintenanceMode: false
  });

  const [departments] = useState([
    { id: 'admin', name: 'Administração', permissions: ['all'] },
    { id: 'credit', name: 'Análise de Crédito', permissions: ['credit_analysis', 'client_management', 'loan_approval'] },
    { id: 'operations', name: 'Operações', permissions: ['payments', 'collection', 'client_management'] },
    { id: 'legal', name: 'Jurídico', permissions: ['contracts', 'legal_documents', 'compliance'] },
    { id: 'marketing', name: 'Marketing', permissions: ['campaigns', 'client_communication', 'reports_view'] },
    { id: 'finance', name: 'Financeiro', permissions: ['accounting', 'reports', 'cash_flow'] },
    { id: 'hr', name: 'Recursos Humanos', permissions: ['employee_management', 'training', 'reports_view'] }
  ]);

  const [allPermissions] = useState([
    'all', 'credit_analysis', 'loan_approval', 'client_management', 'payments', 'collection',
    'contracts', 'legal_documents', 'compliance', 'campaigns', 'client_communication',
    'accounting', 'reports', 'cash_flow', 'employee_management', 'training', 'reports_view',
    'settings_access', 'backup_restore', 'user_management', 'audit_access'
  ]);

  const [employees, setEmployees] = useState([
    { 
      id: 1, 
      name: "João Silva", 
      email: "joao@bochel.mz", 
      role: "Administrador", 
      department: "admin",
      status: "Ativo", 
      permissions: ["all"],
      accessLevel: "full"
    },
    { 
      id: 2, 
      name: "Maria Santos", 
      email: "maria@bochel.mz", 
      role: "Analista de Crédito", 
      department: "credit",
      status: "Ativo", 
      permissions: ["credit_analysis", "client_management", "loan_approval"],
      accessLevel: "department"
    },
    { 
      id: 3, 
      name: "Pedro Costa", 
      email: "pedro@bochel.mz", 
      role: "Operador", 
      department: "operations",
      status: "Ativo", 
      permissions: ["payments", "collection"],
      accessLevel: "limited"
    }
  ]);

  const [newEmployee, setNewEmployee] = useState({
    name: '',
    email: '',
    role: '',
    department: '',
    password: '',
    permissions: [],
    accessLevel: 'limited'
  });

  const [microcreditProfile, setMicrocreditProfile] = useState({
    companyType: 'microfinance',
    licenseNumber: 'MF-2024-001',
    centralBankRegistration: 'BM-REG-2024',
    maxClients: 1000,
    operationRegions: ['Maputo', 'Matola', 'Beira'],
    products: ['Microcrédito Individual', 'Microcrédito Solidário', 'Microcrédito Rural'],
    logo: '',
    slogan: 'Crescendo Juntos, Construindo Futuros',
    phone: '+258 21 123 456',
    whatsapp: '+258 84 123 4567',
    website: 'www.bochel.mz',
    address: 'Av. Julius Nyerere, 123, Maputo',
    foundedYear: '2020',
    employeeCount: '25-50',
    socialMedia: {
      facebook: 'facebook.com/bochelmicrocredito',
      instagram: '@bochelmicrocredito',
      linkedin: 'linkedin.com/company/bochel'
    },
    bankingPartners: ['BCI', 'Millennium BIM', 'Standard Bank'],
    certifications: ['ISO 27001', 'Certificação BM']
  });

  const [messageTemplates, setMessageTemplates] = useState({
    paymentReminder: 'Olá {nome}, seu pagamento de MZN {valor} vence em {dias} dias. Evite juros de mora.',
    overdue: 'Olá {nome}, seu pagamento de MZN {valor} está vencido há {dias} dias. Entre em contato conosco.',
    paymentConfirmation: 'Pagamento de MZN {valor} recebido com sucesso. Obrigado!',
    loanApproval: 'Parabéns {nome}! Seu empréstimo de MZN {valor} foi aprovado.',
    loanRejection: 'Lamentamos informar que seu pedido de empréstimo não foi aprovado. Entre em contato para mais informações.',
    welcomeMessage: 'Bem-vindo à BOCHEL MICROCRÉDITO, {nome}! Estamos aqui para ajudar no seu crescimento.',
    birthdayMessage: 'Feliz aniversário, {nome}! Desejamos muito sucesso e prosperidade.'
  });

  const handleSaveSettings = () => {
    toast({
      title: "Configurações salvas",
      description: "As configurações foram atualizadas com sucesso"
    });
  };

  const handleAddEmployee = () => {
    if (!newEmployee.name || !newEmployee.email || !newEmployee.role || !newEmployee.department) {
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
      status: "Ativo"
    };

    setEmployees([...employees, employee]);
    setNewEmployee({ name: '', email: '', role: '', department: '', password: '', permissions: [], accessLevel: 'limited' });
    
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

  const handlePermissionChange = (permission: string, checked: boolean) => {
    if (checked) {
      setNewEmployee({...newEmployee, permissions: [...newEmployee.permissions, permission]});
    } else {
      setNewEmployee({...newEmployee, permissions: newEmployee.permissions.filter(p => p !== permission)});
    }
  };

  const getDepartmentPermissions = (departmentId: string) => {
    const dept = departments.find(d => d.id === departmentId);
    return dept ? dept.permissions : [];
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setMicrocreditProfile({...microcreditProfile, logo: e.target?.result as string});
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Settings className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Configurações do Sistema</h1>
          <p className="text-gray-600">Gerencie todas as configurações e permissões do sistema</p>
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="general">Geral</TabsTrigger>
          <TabsTrigger value="employees">Funcionários</TabsTrigger>
          <TabsTrigger value="microcredit">Perfil Empresa</TabsTrigger>
          <TabsTrigger value="messages">Mensagens</TabsTrigger>
          <TabsTrigger value="security">Segurança</TabsTrigger>
          <TabsTrigger value="advanced">Avançado</TabsTrigger>
          <TabsTrigger value="system">Sistema</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Building2 className="h-5 w-5 text-blue-600" />
                <CardTitle>Configurações Gerais</CardTitle>
              </div>
              <CardDescription>
                Configure as informações básicas e parâmetros operacionais
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
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

              <div className="grid grid-cols-3 gap-4">
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
                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout">Timeout de Sessão (min)</Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    value={settings.sessionTimeout}
                    onChange={(e) => setSettings({ ...settings, sessionTimeout: parseInt(e.target.value) })}
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

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Notificações</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Notificações por Email</Label>
                      <p className="text-sm text-gray-500">Receber notificações importantes por email</p>
                    </div>
                    <Switch
                      checked={settings.emailNotifications}
                      onCheckedChange={(checked) => setSettings({ ...settings, emailNotifications: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Notificações por SMS</Label>
                      <p className="text-sm text-gray-500">Receber alertas críticos por SMS</p>
                    </div>
                    <Switch
                      checked={settings.smsNotifications}
                      onCheckedChange={(checked) => setSettings({ ...settings, smsNotifications: checked })}
                    />
                  </div>
                </div>
              </div>

              <Button onClick={handleSaveSettings} className="w-full">
                Salvar Configurações Gerais
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="employees" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-blue-600" />
                <CardTitle>Gestão de Funcionários e Permissões</CardTitle>
              </div>
              <CardDescription>
                Gerencie funcionários, departamentos e suas permissões específicas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="border rounded-lg p-6 bg-gray-50">
                <h3 className="font-semibold mb-4 flex items-center">
                  <User className="mr-2 h-5 w-5" />
                  Adicionar Novo Funcionário
                </h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
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
                    <Input 
                      id="empRole"
                      value={newEmployee.role}
                      onChange={(e) => setNewEmployee({...newEmployee, role: e.target.value})}
                      placeholder="Ex: Analista de Crédito"
                    />
                  </div>
                  <div>
                    <Label htmlFor="empDepartment">Departamento</Label>
                    <Select onValueChange={(value) => {
                      setNewEmployee({...newEmployee, department: value, permissions: getDepartmentPermissions(value)});
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o departamento" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((dept) => (
                          <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="empAccessLevel">Nível de Acesso</Label>
                    <Select onValueChange={(value) => setNewEmployee({...newEmployee, accessLevel: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o nível" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="full">Acesso Total</SelectItem>
                        <SelectItem value="department">Acesso ao Departamento</SelectItem>
                        <SelectItem value="limited">Acesso Limitado</SelectItem>
                        <SelectItem value="readonly">Somente Leitura</SelectItem>
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

                {newEmployee.department && (
                  <div className="mb-4">
                    <Label className="text-base font-medium">Permissões Específicas</Label>
                    <p className="text-sm text-gray-500 mb-3">
                      Selecione as permissões específicas para este funcionário
                    </p>
                    <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto border rounded p-3">
                      {allPermissions.map((permission) => (
                        <div key={permission} className="flex items-center space-x-2">
                          <Checkbox
                            id={permission}
                            checked={newEmployee.permissions.includes(permission)}
                            onCheckedChange={(checked) => handlePermissionChange(permission, checked as boolean)}
                          />
                          <Label htmlFor={permission} className="text-sm">
                            {permission.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Button onClick={handleAddEmployee} className="w-full">
                  <User className="mr-2 h-4 w-4" />
                  Adicionar Funcionário
                </Button>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold flex items-center">
                  <Users className="mr-2 h-5 w-5" />
                  Funcionários Cadastrados
                </h3>
                {employees.map((employee) => (
                  <div key={employee.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex-1">
                        <p className="font-medium">{employee.name}</p>
                        <p className="text-sm text-gray-600">{employee.email} • {employee.role}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            {departments.find(d => d.id === employee.department)?.name}
                          </span>
                          <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                            {employee.accessLevel}
                          </span>
                        </div>
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
                    <div className="text-xs text-gray-500">
                      <strong>Permissões:</strong> {employee.permissions.slice(0, 3).join(', ')}
                      {employee.permissions.length > 3 && ` (+${employee.permissions.length - 3} mais)`}
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
                <CardTitle>Perfil Completo da Empresa</CardTitle>
              </div>
              <CardDescription>
                Configure todas as informações da sua instituição de microcrédito
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="logo">Logotipo da Empresa</Label>
                    <div className="mt-2 flex flex-col items-center space-y-4">
                      {microcreditProfile.logo ? (
                        <img src={microcreditProfile.logo} alt="Logo" className="w-32 h-32 object-contain border rounded" />
                      ) : (
                        <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded flex items-center justify-center">
                          <Upload className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                      <Input
                        id="logo"
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="text-sm"
                      />
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="slogan">Slogan da Empresa</Label>
                      <Input
                        id="slogan"
                        value={microcreditProfile.slogan}
                        onChange={(e) => setMicrocreditProfile({...microcreditProfile, slogan: e.target.value})}
                        placeholder="Ex: Crescendo Juntos, Construindo Futuros"
                      />
                    </div>
                    <div>
                      <Label htmlFor="foundedYear">Ano de Fundação</Label>
                      <Input
                        id="foundedYear"
                        value={microcreditProfile.foundedYear}
                        onChange={(e) => setMicrocreditProfile({...microcreditProfile, foundedYear: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone">Telefone Principal</Label>
                      <div className="flex">
                        <Phone className="w-4 h-4 mt-3 mr-2 text-gray-400" />
                        <Input
                          id="phone"
                          value={microcreditProfile.phone}
                          onChange={(e) => setMicrocreditProfile({...microcreditProfile, phone: e.target.value})}
                          placeholder="+258 21 123 456"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="whatsapp">WhatsApp Business</Label>
                      <div className="flex">
                        <Smartphone className="w-4 h-4 mt-3 mr-2 text-gray-400" />
                        <Input
                          id="whatsapp"
                          value={microcreditProfile.whatsapp}
                          onChange={(e) => setMicrocreditProfile({...microcreditProfile, whatsapp: e.target.value})}
                          placeholder="+258 84 123 4567"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="website">Website</Label>
                      <div className="flex">
                        <Globe className="w-4 h-4 mt-3 mr-2 text-gray-400" />
                        <Input
                          id="website"
                          value={microcreditProfile.website}
                          onChange={(e) => setMicrocreditProfile({...microcreditProfile, website: e.target.value})}
                          placeholder="www.empresa.mz"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="employeeCount">Número de Funcionários</Label>
                      <Select value={microcreditProfile.employeeCount} onValueChange={(value) => setMicrocreditProfile({...microcreditProfile, employeeCount: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1-10">1-10 funcionários</SelectItem>
                          <SelectItem value="11-25">11-25 funcionários</SelectItem>
                          <SelectItem value="25-50">25-50 funcionários</SelectItem>
                          <SelectItem value="50-100">50-100 funcionários</SelectItem>
                          <SelectItem value="100+">Mais de 100 funcionários</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="address">Endereço Completo</Label>
                    <div className="flex">
                      <MapPin className="w-4 h-4 mt-3 mr-2 text-gray-400" />
                      <Textarea
                        id="address"
                        value={microcreditProfile.address}
                        onChange={(e) => setMicrocreditProfile({...microcreditProfile, address: e.target.value})}
                        placeholder="Av. Julius Nyerere, 123, Maputo, Moçambique"
                        className="min-h-[80px]"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Redes Sociais</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="facebook">Facebook</Label>
                    <Input
                      id="facebook"
                      value={microcreditProfile.socialMedia.facebook}
                      onChange={(e) => setMicrocreditProfile({
                        ...microcreditProfile, 
                        socialMedia: {...microcreditProfile.socialMedia, facebook: e.target.value}
                      })}
                      placeholder="facebook.com/empresa"
                    />
                  </div>
                  <div>
                    <Label htmlFor="instagram">Instagram</Label>
                    <Input
                      id="instagram"
                      value={microcreditProfile.socialMedia.instagram}
                      onChange={(e) => setMicrocreditProfile({
                        ...microcreditProfile, 
                        socialMedia: {...microcreditProfile.socialMedia, instagram: e.target.value}
                      })}
                      placeholder="@empresa"
                    />
                  </div>
                  <div>
                    <Label htmlFor="linkedin">LinkedIn</Label>
                    <Input
                      id="linkedin"
                      value={microcreditProfile.socialMedia.linkedin}
                      onChange={(e) => setMicrocreditProfile({
                        ...microcreditProfile, 
                        socialMedia: {...microcreditProfile.socialMedia, linkedin: e.target.value}
                      })}
                      placeholder="linkedin.com/company/empresa"
                    />
                  </div>
                </div>
              </div>

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
                      <SelectItem value="ngo">ONG</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label>Regiões de Operação</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {microcreditProfile.operationRegions.map((region, index) => (
                      <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                        {region}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Produtos Oferecidos</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {microcreditProfile.products.map((product, index) => (
                      <span key={index} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                        {product}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Parceiros Bancários</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {microcreditProfile.bankingPartners.map((partner, index) => (
                      <span key={index} className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                        {partner}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Certificações</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {microcreditProfile.certifications.map((cert, index) => (
                      <span key={index} className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm">
                        {cert}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <Button onClick={handleSaveSettings} className="w-full">
                Salvar Perfil da Empresa
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="messages" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <MessageSquare className="h-5 w-5 text-blue-600" />
                <CardTitle>Modelos de Mensagens Avançados</CardTitle>
              </div>
              <CardDescription>
                Configure modelos de SMS, WhatsApp e emails automáticos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(messageTemplates).map(([key, value]) => (
                <div key={key}>
                  <Label htmlFor={key} className="capitalize">
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </Label>
                  <Textarea
                    id={key}
                    value={value}
                    onChange={(e) => setMessageTemplates({...messageTemplates, [key]: e.target.value})}
                    placeholder="Digite sua mensagem aqui..."
                    className="min-h-[80px]"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Variáveis disponíveis: {'{nome}'}, {'{valor}'}, {'{dias}'}, {'{data}'}
                  </p>
                </div>
              ))}

              <Button onClick={handleSaveSettings} className="w-full">
                Salvar Modelos de Mensagens
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-blue-600" />
                <CardTitle>Configurações de Segurança Avançadas</CardTitle>
              </div>
              <CardDescription>
                Gerencie todas as configurações de segurança e auditoria
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center">
                    <Key className="mr-2 h-5 w-5" />
                    Autenticação
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Autenticação de Dois Fatores</Label>
                        <p className="text-sm text-gray-500">Adicione uma camada extra de segurança</p>
                      </div>
                      <Switch
                        checked={settings.twoFactor}
                        onCheckedChange={(checked) => setSettings({ ...settings, twoFactor: checked })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="maxLoginAttempts">Máximo de Tentativas de Login</Label>
                      <Input
                        id="maxLoginAttempts"
                        type="number"
                        value={settings.maxLoginAttempts}
                        onChange={(e) => setSettings({ ...settings, maxLoginAttempts: parseInt(e.target.value) })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="passwordExpiry">Expiração de Senha (dias)</Label>
                      <Input
                        id="passwordExpiry"
                        type="number"
                        value={settings.passwordExpiry}
                        onChange={(e) => setSettings({ ...settings, passwordExpiry: parseInt(e.target.value) })}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center">
                    <ShieldIcon className="mr-2 h-5 w-5" />
                    Auditoria e Logs
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Log de Auditoria</Label>
                        <p className="text-sm text-gray-500">Registrar todas as ações dos usuários</p>
                      </div>
                      <Switch
                        checked={settings.auditLog}
                        onCheckedChange={(checked) => setSettings({ ...settings, auditLog: checked })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="dataRetention">Retenção de Dados (anos)</Label>
                      <Input
                        id="dataRetention"
                        type="number"
                        value={settings.dataRetention}
                        onChange={(e) => setSettings({ ...settings, dataRetention: parseInt(e.target.value) })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="ipWhitelist">Lista Branca de IPs</Label>
                      <Textarea
                        id="ipWhitelist"
                        value={settings.ipWhitelist}
                        onChange={(e) => setSettings({ ...settings, ipWhitelist: e.target.value })}
                        placeholder="192.168.1.1, 10.0.0.1"
                        className="min-h-[80px]"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <Button onClick={handleSaveSettings} className="w-full">
                Salvar Configurações de Segurança
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Settings className="h-5 w-5 text-blue-600" />
                <CardTitle>Configurações Avançadas</CardTitle>
              </div>
              <CardDescription>
                Configurações técnicas e avançadas do sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center">
                    <Database className="mr-2 h-5 w-5" />
                    Backup e Recuperação
                  </h3>
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="backupFrequency">Frequência de Backup</Label>
                      <Select value={settings.backupFrequency} onValueChange={(value) => setSettings({...settings, backupFrequency: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hourly">A cada hora</SelectItem>
                          <SelectItem value="daily">Diário</SelectItem>
                          <SelectItem value="weekly">Semanal</SelectItem>
                          <SelectItem value="monthly">Mensal</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Backup Automático</Label>
                        <p className="text-sm text-gray-500">Realizar backup automático dos dados</p>
                      </div>
                      <Switch
                        checked={settings.autoReports}
                        onCheckedChange={(checked) => setSettings({ ...settings, autoReports: checked })}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center">
                    <Clock className="mr-2 h-5 w-5" />
                    Manutenção
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Modo de Manutenção</Label>
                        <p className="text-sm text-gray-500">Bloquear acesso durante manutenção</p>
                      </div>
                      <Switch
                        checked={settings.maintenanceMode}
                        onCheckedChange={(checked) => setSettings({ ...settings, maintenanceMode: checked })}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <Button onClick={handleSaveSettings} className="w-full">
                Salvar Configurações Avançadas
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Database className="h-5 w-5 text-blue-600" />
                <CardTitle>Ferramentas do Sistema</CardTitle>
              </div>
              <CardDescription>
                Ferramentas para manutenção e gestão do sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                  <Database className="h-6 w-6 mb-2" />
                  Fazer Backup Completo
                </Button>
                <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                  <Download className="h-6 w-6 mb-2" />
                  Exportar Todos os Dados
                </Button>
                <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                  <RefreshCw className="h-6 w-6 mb-2" />
                  Limpar Cache do Sistema
                </Button>
                <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                  <FileText className="h-6 w-6 mb-2" />
                  Visualizar Logs
                </Button>
                <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                  <Users className="h-6 w-6 mb-2" />
                  Relatório de Usuários
                </Button>
                <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                  <BarChart3 className="h-6 w-6 mb-2" />
                  Estatísticas do Sistema
                </Button>
              </div>
              
              <div className="border-t pt-4 space-y-4">
                <h3 className="font-semibold text-red-600">Zona de Perigo</h3>
                <div className="grid grid-cols-1 gap-2">
                  <Button variant="destructive" className="w-full">
                    <AlertTriangle className="mr-2 h-4 w-4" />
                    Reinicializar Sistema
                  </Button>
                <Button 
                  variant="destructive" 
                  className="w-full"
                  onClick={handleClearData}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Limpar Dados de Demonstração
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

export default SettingsModule;
