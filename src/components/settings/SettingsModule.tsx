import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Settings, Building2, CreditCard, Bell, Loader2, Save, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { clearAllData } from '@/utils/clearData';

interface SystemSettings {
  id: string;
  company_name: string;
  email: string;
  phone: string;
  nuit?: string;
  address?: string;
  default_interest_rate: number;
  max_loan_amount: number;
  min_loan_amount: number;
  loan_duration_days: number;
  email_notifications: boolean;
  sms_notifications: boolean;
}

const SettingsModule = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<SystemSettings>({
    id: '',
    company_name: 'BOCHEL MICROCREDITO',
    email: 'admin@bochel.mz',
    phone: '',
    nuit: '',
    address: '',
    default_interest_rate: 30,
    max_loan_amount: 100000,
    min_loan_amount: 5000,
    loan_duration_days: 30,
    email_notifications: true,
    sms_notifications: true,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setSettings({
          id: data.id,
          company_name: data.company_name || 'BOCHEL MICROCREDITO',
          email: data.email || '',
          phone: data.phone || '',
          nuit: data.nuit || '',
          address: data.address || '',
          default_interest_rate: data.default_interest_rate ?? 30,
          max_loan_amount: data.max_loan_amount ?? 100000,
          min_loan_amount: data.min_loan_amount ?? 5000,
          loan_duration_days: data.loan_duration_days ?? 30,
          email_notifications: data.email_notifications ?? true,
          sms_notifications: data.sms_notifications ?? true,
        });
      }
    } catch (error: any) {
      console.error('Erro ao carregar configurações:', error);
      toast({ title: 'Aviso', description: 'Não foi possível carregar as configurações da base de dados. A usar valores padrão.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      const payload = {
        company_name: settings.company_name,
        email: settings.email,
        phone: settings.phone,
        nuit: settings.nuit,
        address: settings.address,
        default_interest_rate: settings.default_interest_rate,
        max_loan_amount: settings.max_loan_amount,
        min_loan_amount: settings.min_loan_amount,
        loan_duration_days: settings.loan_duration_days,
        email_notifications: settings.email_notifications,
        sms_notifications: settings.sms_notifications,
        updated_at: new Date().toISOString(),
      };

      if (settings.id) {
        const { error } = await supabase
          .from('system_settings')
          .update(payload)
          .eq('id', settings.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('system_settings')
          .insert(payload);
        if (error) throw error;
      }

      toast({ title: 'Configurações Guardadas', description: 'As configurações foram atualizadas com sucesso na base de dados.' });
    } catch (error: any) {
      console.error('Erro ao guardar configurações:', error);
      toast({ title: 'Erro', description: error.message || 'Não foi possível guardar as configurações.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleClearData = () => {
    if (window.confirm('Tem certeza que deseja limpar todos os dados de demonstração? Esta ação não pode ser desfeita.')) {
      clearAllData();
      toast({
        title: "Dados Limpos",
        description: "Todos os dados de demonstração foram removidos.",
      });
      setTimeout(() => window.location.reload(), 2000);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#1a3a5c' }}>
          <Settings className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
          <p className="text-sm text-gray-500">Gerencie os parâmetros operacionais do sistema</p>
        </div>
      </div>

      {/* Dados da Empresa */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Building2 className="h-5 w-5 text-[#0b3a20]" />
            <CardTitle className="text-lg">Dados da Empresa</CardTitle>
          </div>
          <CardDescription>Informações básicas sobre a sua instituição</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="companyName">Nome da Empresa</Label>
              <Input
                id="companyName"
                value={settings.company_name}
                onChange={(e) => setSettings({ ...settings, company_name: e.target.value })}
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
              <Label htmlFor="phone">Telefone de Contacto</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+258 84 000 0000"
                value={settings.phone}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nuit">NUIT da Empresa</Label>
              <Input
                id="nuit"
                placeholder="123456789"
                value={settings.nuit}
                onChange={(e) => setSettings({ ...settings, nuit: e.target.value })}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address">Localização / Morada Física</Label>
              <Input
                id="address"
                placeholder="Ex: Av. Eduardo Mondlane, Maputo"
                value={settings.address}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Parâmetros de Crédito */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <CreditCard className="h-5 w-5 text-[#d37c22]" />
            <CardTitle className="text-lg">Parâmetros de Crédito</CardTitle>
          </div>
          <CardDescription>Defina os valores padrão para novos empréstimos</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="interestRate">Taxa de Juro Padrão (%)</Label>
              <Input
                id="interestRate"
                type="number"
                min={0}
                max={100}
                value={settings.default_interest_rate}
                onChange={(e) => setSettings({ ...settings, default_interest_rate: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="loanDuration">Duração do Empréstimo (dias)</Label>
              <Input
                id="loanDuration"
                type="number"
                min={1}
                value={settings.loan_duration_days}
                onChange={(e) => setSettings({ ...settings, loan_duration_days: parseInt(e.target.value) || 30 })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="minLoan">Valor Mínimo (MZN)</Label>
              <Input
                id="minLoan"
                type="number"
                min={0}
                value={settings.min_loan_amount}
                onChange={(e) => setSettings({ ...settings, min_loan_amount: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxLoan">Valor Máximo (MZN)</Label>
              <Input
                id="maxLoan"
                type="number"
                min={0}
                value={settings.max_loan_amount}
                onChange={(e) => setSettings({ ...settings, max_loan_amount: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notificações */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Bell className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-lg">Notificações</CardTitle>
          </div>
          <CardDescription>Controle como o sistema comunica consigo</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
            <div className="space-y-0.5">
              <Label>Notificações por Email</Label>
              <p className="text-sm text-gray-500">Receber alertas e notificações por email</p>
            </div>
            <Switch
              checked={settings.email_notifications}
              onCheckedChange={(checked) => setSettings({ ...settings, email_notifications: checked })}
            />
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
            <div className="space-y-0.5">
              <Label>Notificações por SMS</Label>
              <p className="text-sm text-gray-500">Receber alertas críticos por SMS</p>
            </div>
            <Switch
              checked={settings.sms_notifications}
              onCheckedChange={(checked) => setSettings({ ...settings, sms_notifications: checked })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Botão de Guardar */}
      <Button
        onClick={handleSaveSettings}
        disabled={saving}
        className="w-full h-12 text-white font-bold text-base shadow-lg"
        style={{ backgroundColor: '#0b3a20' }}
      >
        {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
        {saving ? 'A guardar...' : 'Guardar Todas as Configurações'}
      </Button>

      {/* Zona de Perigo */}
      <Card className="border border-red-200 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-red-600">Zona de Perigo</CardTitle>
        </CardHeader>
        <CardContent>
          <Button
            variant="destructive"
            className="w-full"
            onClick={handleClearData}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Limpar Dados de Demonstração
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsModule;
