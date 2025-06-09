
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import { Settings, Bell, Shield, Mail, MessageSquare } from 'lucide-react';

const FormSettings = () => {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [whatsappNotifications, setWhatsappNotifications] = useState(true);
  const [autoAnalysis, setAutoAnalysis] = useState(true);
  const [requireDocuments, setRequireDocuments] = useState(false);

  const [settings, setSettings] = useState({
    adminEmail: 'admin@empresa.com',
    whatsappNumber: '+244912345678',
    maxCreditAmount: 1000000,
    minCreditAmount: 50000,
    autoApprovalLimit: 300000,
    riskScoreThreshold: 70,
    welcomeMessage: 'Obrigado por solicitar crédito conosco!',
    rejectionMessage: 'Lamentamos, mas seu pedido não foi aprovado.',
    approvalMessage: 'Parabéns! Seu crédito foi aprovado.',
  });

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const saveSettings = () => {
    console.log('Salvando configurações:', settings);
    toast({
      title: "Configurações salvas",
      description: "As configurações foram atualizadas com sucesso.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Configurações de Notificação */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Configurações de Notificação
          </CardTitle>
          <CardDescription>
            Configure como receber alertas sobre novos pedidos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Notificações por Email</h4>
              <p className="text-sm text-gray-600">Receber email para cada novo pedido</p>
            </div>
            <Switch 
              checked={emailNotifications}
              onCheckedChange={setEmailNotifications}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Email do Administrador</label>
            <Input
              value={settings.adminEmail}
              onChange={(e) => handleSettingChange('adminEmail', e.target.value)}
              placeholder="admin@empresa.com"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Notificações via WhatsApp</h4>
              <p className="text-sm text-gray-600">Integração com WhatsApp Business API</p>
            </div>
            <Switch 
              checked={whatsappNotifications}
              onCheckedChange={setWhatsappNotifications}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Número do WhatsApp Business</label>
            <Input
              value={settings.whatsappNumber}
              onChange={(e) => handleSettingChange('whatsappNumber', e.target.value)}
              placeholder="+244912345678"
            />
          </div>
        </CardContent>
      </Card>

      {/* Configurações de Análise */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Configurações de Análise
          </CardTitle>
          <CardDescription>
            Configure os parâmetros de análise automática
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Análise Automática</h4>
              <p className="text-sm text-gray-600">Ativar processamento automático de pedidos</p>
            </div>
            <Switch 
              checked={autoAnalysis}
              onCheckedChange={setAutoAnalysis}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Montante Mínimo (AOA)</label>
              <Input
                type="number"
                value={settings.minCreditAmount}
                onChange={(e) => handleSettingChange('minCreditAmount', parseInt(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Montante Máximo (AOA)</label>
              <Input
                type="number"
                value={settings.maxCreditAmount}
                onChange={(e) => handleSettingChange('maxCreditAmount', parseInt(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Limite para Aprovação Automática (AOA)</label>
              <Input
                type="number"
                value={settings.autoApprovalLimit}
                onChange={(e) => handleSettingChange('autoApprovalLimit', parseInt(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Score Mínimo para Aprovação</label>
              <Input
                type="number"
                min="0"
                max="100"
                value={settings.riskScoreThreshold}
                onChange={(e) => handleSettingChange('riskScoreThreshold', parseInt(e.target.value))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Configurações do Formulário */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configurações do Formulário
          </CardTitle>
          <CardDescription>
            Personalize o comportamento e requisitos do formulário
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Documentos Obrigatórios</h4>
              <p className="text-sm text-gray-600">Exigir upload de documentos</p>
            </div>
            <Switch 
              checked={requireDocuments}
              onCheckedChange={setRequireDocuments}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Mensagem de Boas-vindas</label>
            <Textarea
              value={settings.welcomeMessage}
              onChange={(e) => handleSettingChange('welcomeMessage', e.target.value)}
              placeholder="Mensagem exibida após envio do formulário"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Mensagem de Aprovação</label>
            <Textarea
              value={settings.approvalMessage}
              onChange={(e) => handleSettingChange('approvalMessage', e.target.value)}
              placeholder="Mensagem enviada quando o crédito é aprovado"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Mensagem de Rejeição</label>
            <Textarea
              value={settings.rejectionMessage}
              onChange={(e) => handleSettingChange('rejectionMessage', e.target.value)}
              placeholder="Mensagem enviada quando o crédito é rejeitado"
            />
          </div>
        </CardContent>
      </Card>

      {/* Configurações de Integração */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Integrações Externas
          </CardTitle>
          <CardDescription>
            Configure integrações com sistemas externos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 border rounded-lg">
            <h4 className="font-medium mb-2">WhatsApp Business API</h4>
            <p className="text-sm text-gray-600 mb-3">
              Conecte com a API do WhatsApp Business para envio automático de mensagens
            </p>
            <Button variant="outline" size="sm">
              Configurar API
            </Button>
          </div>

          <div className="p-4 border rounded-lg">
            <h4 className="font-medium mb-2">Sistema de Email</h4>
            <p className="text-sm text-gray-600 mb-3">
              Configure SMTP para envio de emails automáticos
            </p>
            <Button variant="outline" size="sm">
              Configurar SMTP
            </Button>
          </div>

          <div className="p-4 border rounded-lg">
            <h4 className="font-medium mb-2">CRM Integration</h4>
            <p className="text-sm text-gray-600 mb-3">
              Sincronize pedidos com seu sistema CRM
            </p>
            <Button variant="outline" size="sm">
              Conectar CRM
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Botão de Salvar */}
      <div className="flex justify-end">
        <Button onClick={saveSettings} className="px-8">
          Salvar Configurações
        </Button>
      </div>
    </div>
  );
};

export default FormSettings;
