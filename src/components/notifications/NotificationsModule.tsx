
import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { 
  Bell, 
  MessageSquare, 
  Phone, 
  Mail, 
  Send, 
  Settings, 
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Users,
  Calendar,
  Zap
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useToast } from '@/hooks/use-toast';
import { Switch } from '../ui/switch';

const NotificationsModule = () => {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'SMS', recipient: 'João Silva', message: 'Seu empréstimo foi aprovado!', status: 'Enviado', date: '15/06/2024 10:30', method: 'Automático' },
    { id: 2, type: 'SMS', recipient: 'Maria Santos', message: 'Lembrete: Pagamento vence em 5 dias', status: 'Enviado', date: '15/06/2024 09:15', method: 'Automático' },
    { id: 3, type: 'Ligação', recipient: 'Carlos Mussa', message: 'Cobrança - pagamento vencido', status: 'Pendente', date: '15/06/2024 14:00', method: 'Manual' },
  ]);

  const [automationRules, setAutomationRules] = useState([
    { id: 1, name: 'Aprovação de Empréstimo', trigger: 'loan_approved', message: 'Parabéns! Seu empréstimo de {amount} foi aprovado. O dinheiro estará disponível em sua conta em até 24h.', active: true, channel: 'SMS' },
    { id: 2, name: 'Lembrete 5 dias', trigger: 'payment_due_5_days', message: 'Lembrete: Seu pagamento de {amount} vence em 5 dias ({due_date}). Evite multas pagando em dia.', active: true, channel: 'SMS' },
    { id: 3, name: 'Lembrete 1 dia', trigger: 'payment_due_1_day', message: 'URGENTE: Seu pagamento de {amount} vence AMANHÃ ({due_date}). Pague hoje e evite juros de mora.', active: true, channel: 'SMS' },
    { id: 4, name: 'Pagamento Vencido', trigger: 'payment_overdue', message: 'Seu pagamento de {amount} está VENCIDO desde {due_date}. Entre em contato conosco: (21) 123-4567', active: true, channel: 'SMS+Ligação' },
  ]);

  const [messageTemplate, setMessageTemplate] = useState({
    type: '',
    message: '',
    trigger: '',
    channel: ''
  });

  // Simulação de verificação automática
  useEffect(() => {
    const interval = setInterval(() => {
      checkAutomaticTriggers();
    }, 60000); // Verifica a cada minuto

    return () => clearInterval(interval);
  }, []);

  const checkAutomaticTriggers = () => {
    // Simula verificação de triggers automáticos
    console.log('Verificando triggers automáticos...');
    
    // Aqui seria a lógica real para verificar:
    // - Empréstimos aprovados hoje
    // - Pagamentos que vencem em 5 dias
    // - Pagamentos que vencem amanhã
    // - Pagamentos vencidos
  };

  const sendNotification = (type: string, recipient: string, message: string) => {
    const newNotification = {
      id: notifications.length + 1,
      type,
      recipient,
      message,
      status: 'Enviado',
      date: new Date().toLocaleString('pt-BR'),
      method: 'Manual'
    };

    setNotifications([newNotification, ...notifications]);
    
    toast({
      title: "Notificação Enviada",
      description: `${type} enviado para ${recipient}`,
    });
  };

  const toggleAutomationRule = (ruleId: number) => {
    setAutomationRules(prev => prev.map(rule => 
      rule.id === ruleId ? { ...rule, active: !rule.active } : rule
    ));
    
    toast({
      title: "Regra Atualizada",
      description: "Configuração de automação atualizada.",
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Enviado': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'Pendente': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'Falhou': return <XCircle className="h-4 w-4 text-red-600" />;
      default: return <AlertTriangle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'SMS': return <MessageSquare className="h-4 w-4" />;
      case 'Ligação': return <Phone className="h-4 w-4" />;
      case 'Email': return <Mail className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Sistema de Notificações</h1>
        <Button onClick={() => toast({ title: "Verificação Manual", description: "Executando verificação de triggers..." })}>
          <Zap className="mr-2 h-4 w-4" />
          Executar Verificação
        </Button>
      </div>

      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="notifications">Notificações</TabsTrigger>
          <TabsTrigger value="automation">Automação</TabsTrigger>
          <TabsTrigger value="templates">Modelos</TabsTrigger>
          <TabsTrigger value="settings">Configurações</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Enviadas</p>
                    <p className="text-2xl font-bold">1,247</p>
                  </div>
                  <Send className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Hoje</p>
                    <p className="text-2xl font-bold">23</p>
                  </div>
                  <Calendar className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Automáticas</p>
                    <p className="text-2xl font-bold">89%</p>
                  </div>
                  <Zap className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Taxa Sucesso</p>
                    <p className="text-2xl font-bold">96%</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Notificações Recentes</CardTitle>
                <CardDescription>Últimas notificações enviadas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {notifications.slice(0, 5).map((notification) => (
                    <div key={notification.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        {getTypeIcon(notification.type)}
                        <div>
                          <p className="font-medium">{notification.recipient}</p>
                          <p className="text-sm text-gray-600">{notification.message.substring(0, 40)}...</p>
                          <p className="text-xs text-gray-500">{notification.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(notification.status)}
                        <span className="text-sm">{notification.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Enviar Notificação</CardTitle>
                <CardDescription>Envio manual de notificação</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="notificationType">Tipo</Label>
                  <Select onValueChange={(value) => setMessageTemplate({...messageTemplate, type: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SMS">SMS</SelectItem>
                      <SelectItem value="Ligação">Ligação</SelectItem>
                      <SelectItem value="Email">Email</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="recipient">Destinatário</Label>
                  <Input 
                    id="recipient"
                    placeholder="Nome do cliente"
                  />
                </div>

                <div>
                  <Label htmlFor="message">Mensagem</Label>
                  <Textarea 
                    id="message"
                    placeholder="Digite sua mensagem..."
                    className="min-h-[100px]"
                    value={messageTemplate.message}
                    onChange={(e) => setMessageTemplate({...messageTemplate, message: e.target.value})}
                  />
                </div>

                <Button 
                  className="w-full"
                  onClick={() => sendNotification(messageTemplate.type, 'Cliente Teste', messageTemplate.message)}
                >
                  <Send className="mr-2 h-4 w-4" />
                  Enviar Notificação
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="automation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Regras de Automação</CardTitle>
              <CardDescription>Configure notificações automáticas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {automationRules.map((rule) => (
                  <div key={rule.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <Switch 
                          checked={rule.active}
                          onCheckedChange={() => toggleAutomationRule(rule.id)}
                        />
                        <div>
                          <h3 className="font-medium">{rule.name}</h3>
                          <p className="text-sm text-gray-600">{rule.message}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              {rule.channel}
                            </span>
                            <span className="text-xs text-gray-500">
                              Trigger: {rule.trigger}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      <Settings className="h-3 w-3 mr-1" />
                      Editar
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Modelos de Mensagem</CardTitle>
              <CardDescription>Gerencie modelos para automação</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium">Aprovação de Empréstimo</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Parabéns! Seu empréstimo de {`{amount}`} foi aprovado. O dinheiro estará disponível em sua conta em até 24h.
                  </p>
                  <div className="flex space-x-2 mt-2">
                    <Button size="sm" variant="outline">Editar</Button>
                    <Button size="sm" variant="outline">Testar</Button>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <h3 className="font-medium">Lembrete de Pagamento</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Lembrete: Seu pagamento de {`{amount}`} vence em {`{days}`} dias ({`{due_date}`}). Evite multas pagando em dia.
                  </p>
                  <div className="flex space-x-2 mt-2">
                    <Button size="sm" variant="outline">Editar</Button>
                    <Button size="sm" variant="outline">Testar</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configurações SMS</CardTitle>
              <CardDescription>Configurações do provedor SMS</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="smsProvider">Provedor SMS</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o provedor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vodacom">Vodacom</SelectItem>
                    <SelectItem value="tmcel">Tmcel</SelectItem>
                    <SelectItem value="movitel">Movitel</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="smsApiKey">API Key</Label>
                <Input type="password" placeholder="Sua API Key" />
              </div>

              <div>
                <Label htmlFor="smsSender">Remetente</Label>
                <Input placeholder="Ex: BOCHEL" />
              </div>

              <div className="flex items-center space-x-2">
                <Switch />
                <Label>Ativar envio automático</Label>
              </div>

              <Button>Salvar Configurações</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NotificationsModule;
