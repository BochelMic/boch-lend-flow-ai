
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Settings, Shield, Database, LayoutDashboard, Key, Shield as ShieldIcon, Clock, Smartphone, Download, RefreshCw, FileText, BarChart3, AlertTriangle, Trash2, Building2, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { clearAllData } from '@/utils/clearData';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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

  const handleBackup = () => {
    toast({ title: "Backup Iniciado", description: "O sistema está a gerar um backup completo dos dados em segundo plano." });
  };

  const handleExport = () => {
    toast({ title: "Exportação Iniciada", description: "A gerar ficheiro seguro com todos os dados do sistema." });
  };

  const handleClearCache = () => {
    toast({ title: "Cache Limpa", description: "A cache do sistema foi limpa com sucesso para otimizar o desempenho." });
  };

  const handleViewLogs = () => {
    toast({ title: "Logs do Sistema", description: "A preparar ficheiro de log de auditoria recente para download." });
  };

  const handleUserReport = () => {
    toast({ title: "Relatório de Usuários", description: "A compilar relatório detalhado de atividade de todos os agentes e gestores." });
  };

  const handleSystemStats = () => {
    toast({ title: "Estatísticas do Sistema", description: "A gerar painel de estatísticas globais e KPIs do sistema." });
  };

  const handleReboot = () => {
    if (window.confirm('Atenção: Tem certeza que deseja reinicializar o sistema? Todos os utilizadores ativos poderão ter as suas sessões interrompidas.')) {
      toast({ title: "Sistema a Reiniciar", description: "Serviços em processo de reinicialização. Aguarde...", variant: "destructive" });
      setTimeout(() => window.location.reload(), 3000);
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

  const handleSaveSettings = () => {
    toast({
      title: "Configurações salvas",
      description: "As configurações foram atualizadas com sucesso"
    });
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
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">Geral</TabsTrigger>
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                      <Select value={settings.backupFrequency} onValueChange={(value) => setSettings({ ...settings, backupFrequency: value })}>
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
                <Button variant="outline" className="h-20 flex flex-col items-center justify-center" onClick={handleBackup}>
                  <Database className="h-6 w-6 mb-2" />
                  Fazer Backup Completo
                </Button>
                <Button variant="outline" className="h-20 flex flex-col items-center justify-center" onClick={handleExport}>
                  <Download className="h-6 w-6 mb-2" />
                  Exportar Todos os Dados
                </Button>
                <Button variant="outline" className="h-20 flex flex-col items-center justify-center" onClick={handleClearCache}>
                  <RefreshCw className="h-6 w-6 mb-2" />
                  Limpar Cache do Sistema
                </Button>
                <Button variant="outline" className="h-20 flex flex-col items-center justify-center" onClick={handleViewLogs}>
                  <FileText className="h-6 w-6 mb-2" />
                  Visualizar Logs
                </Button>
                <Button variant="outline" className="h-20 flex flex-col items-center justify-center" onClick={handleUserReport}>
                  <Users className="h-6 w-6 mb-2" />
                  Relatório de Usuários
                </Button>
                <Button variant="outline" className="h-20 flex flex-col items-center justify-center" onClick={handleSystemStats}>
                  <BarChart3 className="h-6 w-6 mb-2" />
                  Estatísticas do Sistema
                </Button>
              </div>

              <div className="border-t pt-4 space-y-4">
                <h3 className="font-semibold text-red-600">Zona de Perigo</h3>
                <div className="grid grid-cols-1 gap-2">
                  <Button variant="destructive" className="w-full" onClick={handleReboot}>
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
