import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Users, Plus, Search, FileText, CreditCard, AlertCircle, RefreshCw, MapPin, Globe, HandCoins, History, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '../../hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ClientProfileDialog } from '../profile/ClientProfileDialog';
import { Skeleton } from '@/components/ui/skeleton';

interface Client {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  id_number: string | null;
  status: string;
  is_physical: boolean;
  agent_id: string | null;
  created_at: string;
}

const ClientsModule = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [activeTab, setActiveTab] = useState('list');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', document: '', address: '', occupation: '', income: '', zone: '', password: '', isPhysical: false
  });

  // Loan history dialog state
  const [loanDialogOpen, setLoanDialogOpen] = useState(false);
  const [loanDialogClient, setLoanDialogClient] = useState<string>('');
  const [clientLoans, setClientLoans] = useState<any[]>([]);
  const [loadingLoans, setLoadingLoans] = useState(false);

  const loadClientLoans = async (clientId: string, clientName: string) => {
    setLoanDialogClient(clientName);
    setLoanDialogOpen(true);
    setLoadingLoans(true);
    try {
      const { data, error } = await supabase
        .from('loans')
        .select('id, amount, total_amount, remaining_amount, status, start_date, end_date, installments, created_at')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setClientLoans(data || []);
    } catch (err: any) {
      console.error('Error loading loans:', err);
      toast({ title: 'Erro', description: 'Não foi possível carregar os empréstimos.', variant: 'destructive' });
    } finally {
      setLoadingLoans(false);
    }
  };

  const { data: clients = [], isLoading: isQueryLoading, refetch } = useQuery({
    queryKey: ['clients', user?.role, user?.id],
    queryFn: async () => {
      let query = supabase.from('clients').select('*').order('created_at', { ascending: false });

      // Agentes veem apenas seus clientes
      if (user?.role === 'agente') {
        query = query.eq('agent_id', user.id);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Client[];
    },
    enabled: !!user,
  });

  const loading = isQueryLoading || isSubmitting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast({ title: 'Erro', description: 'Nome é obrigatório.', variant: 'destructive' });
      return;
    }
    setIsSubmitting(true);

    try {
      // If user is agent, they must provide email and password to auto-create user auth
      if (user?.role === 'agente') {
        if (!formData.email || !formData.password) {
          toast({ title: 'Erro', description: 'Email e Senha são obrigatórios para registar o cliente no sistema.', variant: 'destructive' });
          setIsSubmitting(false);
          return;
        }

        // 1. Refresh session to ensure token is valid
        await supabase.auth.refreshSession();

        // 2. Call the Edge Function exactly like the Admin does (Name, Email, Password, Role)
        const { data: funcData, error: funcError } = await supabase.functions.invoke('create-user', {
          body: {
            email: formData.email,
            password: formData.password,
            name: formData.name,
            role: 'cliente',
            agent_id: user?.id,
            phone: formData.phone || null,
            empresa_id: user?.empresa_id
          }
        });

        if (funcError) {
          console.error('[ClientsModule] Edge Function Invocation Error:', funcError);
          let detail = funcError.message;
          try {
            if (funcError.context && typeof funcError.context.text === 'function') {
              const text = await funcError.context.text();
              console.error('Func error text:', text);
              if (text.includes('already registered')) detail = 'Este email já está registado num utilizador.';
            }
          } catch (e) {}
          throw new Error(detail);
        }

        console.log('[ClientsModule] User successfully created via edge function:', funcData);

        // 2. We MUST manually call link_agent_to_client RPC
        // Because the 'create-user' edge function creates the auth user AND inserts into 'clients'
        // But we want to explicitly make sure the agent is linked
        const { error: rpcError } = await supabase.rpc('link_agent_to_client', {
          p_client_email: formData.email,
          p_client_phone: formData.phone || null,
          p_client_id_number: formData.document || null,
          p_client_address: formData.address || null
        });

        if (rpcError) {
          console.error('[ClientsModule] Failed to link client to agent via RPC:', rpcError);
          // Don't throw, since the user was created. Just warn.
          toast({ title: 'Aviso', description: 'Cliente criado, mas houve um erro ao associá-lo à sua conta.', variant: 'destructive' });
        } else {
          toast({ title: 'Sucesso', description: 'Cliente e utilizador criados com sucesso!' });
        }
      } else {
        // Normal Gestor flow (just creates client record)
        const clientData: any = {
          name: formData.name,
          email: formData.email || null,
          phone: formData.phone || null,
          address: formData.address || null,
          id_number: formData.document || null,
          status: 'active',
        };

        const { data: insertedData, error } = await supabase.from('clients').insert(clientData).select('id').single();
        if (error) throw error;

        // Step 2: If physical, mark via RPC (bypasses PostgREST schema cache)
        if (formData.isPhysical && insertedData?.id) {
          const { error: rpcErr } = await supabase.rpc('set_client_physical', {
            p_client_id: insertedData.id,
            p_is_physical: true,
          });
          if (rpcErr) {
            console.warn('[ClientsModule] Failed to set is_physical via RPC:', rpcErr.message);
          }
        }
        toast({ title: 'Sucesso', description: 'Cliente cadastrado com sucesso!' });
      }

      setFormData({ name: '', email: '', phone: '', document: '', address: '', occupation: '', income: '', zone: '', password: '', isPhysical: false });
      setActiveTab('list');
      refetch();
    } catch (error: any) {
      console.error('Error creating client:', error);
      // Clean up common supabase errors
      let msg = error.message || 'Erro ao cadastrar cliente.';
      if (msg.includes('User already exists')) msg = 'Já existe um utilizador com este email no sistema.';

      toast({ title: 'Erro', description: msg, variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (client.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (client.phone || '').includes(searchTerm);
    const matchesFilter = filterStatus === 'all' || client.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <>
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-3xl font-bold tracking-tight">
            {user?.role === 'gestor' ? 'Gestão de Clientes' : 'Meus Clientes'}
          </h1>
          <p className="text-sm text-muted-foreground">
            Gerencie informações e histórico dos clientes
          </p>
        </div>
        <Button className="w-full sm:w-auto" onClick={() => setActiveTab('add')}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Cliente
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 md:space-y-6">
        <TabsList className="w-full grid grid-cols-2">
          <TabsTrigger value="list" className="text-xs md:text-sm">Lista</TabsTrigger>
          <TabsTrigger value="add" className="text-xs md:text-sm">Adicionar</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          <Card>
            <CardHeader className="p-4 md:p-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                  <Users className="h-4 w-4 md:h-5 md:w-5" />
                  Clientes Cadastrados ({filteredClients.length})
                </CardTitle>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Pesquisar..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full sm:w-48 md:w-64"
                    />
                  </div>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-full sm:w-32 md:w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="active">Ativo</SelectItem>
                      <SelectItem value="inactive">Inativo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-0">
              <div className="space-y-3">
                {loading ? (
                  <div className="space-y-3">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="border border-border rounded-lg p-3 md:p-4 space-y-3">
                        <div className="flex flex-col sm:flex-row justify-between gap-3">
                          <div className="space-y-2 w-full max-w-sm">
                            <Skeleton className="h-5 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                            <Skeleton className="h-4 w-1/3" />
                          </div>
                          <div className="flex items-center gap-2">
                            <Skeleton className="h-9 w-24 rounded-md" />
                            <Skeleton className="h-9 w-24 rounded-md" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : filteredClients.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="mx-auto h-12 w-12 opacity-50 mb-2" />
                    <p>Nenhum cliente cadastrado</p>
                  </div>
                ) : (
                  filteredClients.map((client) => (
                    <div key={client.id} className="border border-border rounded-lg p-3 md:p-4 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="font-semibold truncate">{client.name}</h3>
                          <p className="text-sm text-muted-foreground truncate">{client.email || 'Sem email'}</p>
                          <p className="text-sm text-muted-foreground">{client.phone || 'Sem telefone'}</p>
                          {client.address && (
                            <p className="text-sm text-muted-foreground">{client.address}</p>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs ${client.status === 'active' ? 'bg-success/20 text-success' : 'bg-destructive/20 text-destructive'
                            }`}>
                            {client.status === 'active' ? 'Ativo' : 'Inativo'}
                          </span>
                          {client.is_physical ? (
                            <span className="px-2 py-1 rounded-full text-xs bg-amber-100 text-amber-700 flex items-center gap-1">
                              <MapPin className="h-3 w-3" /> Físico
                            </span>
                          ) : (
                            <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700 flex items-center gap-1">
                              <Globe className="h-3 w-3" /> Digital
                            </span>
                          )}
                          <span className="text-xs text-muted-foreground">
                            BI: {client.id_number || 'N/A'}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <ClientProfileDialog
                          clientData={{
                            id: client.id,
                            name: client.name,
                            email: client.email || undefined,
                            phone: client.phone || undefined
                          }}
                        >
                          <Button variant="outline" size="sm" className="text-xs">
                            <FileText className="mr-1 h-3 w-3" />
                            Perfil
                          </Button>
                        </ClientProfileDialog>
                        <Button variant="outline" size="sm" className="text-xs" onClick={() => loadClientLoans(client.id, client.name)}>
                          <History className="h-3 w-3 mr-1" />
                          Empréstimos
                        </Button>
                        {client.is_physical && user?.role === 'gestor' && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs border-amber-300 text-amber-700 hover:bg-amber-50"
                            onClick={() => {
                              navigate('/gestor/credit-form', {
                                state: {
                                  clientId: client.id,
                                  fullName: client.name,
                                  email: client.email,
                                  phone: client.phone,
                                  agentId: client.agent_id,
                                  isPhysicalRegistration: true,
                                }
                              });
                            }}
                          >
                            <HandCoins className="h-3 w-3 mr-1" />
                            Registar Crédito Concedido
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="add">
          <Card>
            <CardHeader className="p-4 md:p-6">
              <CardTitle className="text-base md:text-lg">Cadastrar Novo Cliente</CardTitle>
              <CardDescription className="text-xs md:text-sm">
                Preencha os dados completos do cliente
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-0">
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm">Nome Completo *</Label>
                    <Input
                      id="name"
                      placeholder="Nome do cliente"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm">Email {user?.role === 'agente' ? '*' : ''}</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="email@exemplo.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required={user?.role === 'agente'}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm">Telefone</Label>
                    <Input
                      id="phone"
                      placeholder="+258 84 000 0000"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                  {user?.role === 'agente' && (
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-sm">Senha de Acesso (Login) *</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="Mínimo 6 caracteres"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required
                        minLength={6}
                      />
                    </div>
                  )}
                  {user?.role === 'gestor' && (
                    <div className="space-y-2 sm:col-span-2">
                      <div className="flex items-center justify-between rounded-lg border p-3 bg-amber-50/50">
                        <div className="space-y-0.5">
                          <Label htmlFor="isPhysical" className="text-sm font-medium flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-amber-600" />
                            Cliente Físico (Presencial)
                          </Label>
                          <p className="text-xs text-muted-foreground">
                            Marque se o cliente não tem acesso digital ao sistema
                          </p>
                        </div>
                        <Switch
                          id="isPhysical"
                          checked={formData.isPhysical}
                          onCheckedChange={(checked) => setFormData({ ...formData, isPhysical: checked })}
                        />
                      </div>
                    </div>
                  )}
                  {user?.role !== 'agente' && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="document" className="text-sm">Documento (BI)</Label>
                        <Input
                          id="document"
                          placeholder="Número do BI"
                          value={formData.document}
                          onChange={(e) => setFormData({ ...formData, document: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor="address" className="text-sm">Endereço</Label>
                        <Input
                          id="address"
                          placeholder="Endereço completo"
                          value={formData.address}
                          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        />
                      </div>
                    </>
                  )}
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      {user?.role === 'agente' ? 'Criando Utilizador e Cliente...' : 'Cadastrando...'}
                    </>
                  ) : (
                    'Cadastrar Cliente'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>

      {/* Loan History Dialog */}
      <Dialog open={loanDialogOpen} onOpenChange={setLoanDialogOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Empréstimos — {loanDialogClient}
            </DialogTitle>
          </DialogHeader>
          {loadingLoans ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          ) : clientLoans.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CreditCard className="mx-auto h-10 w-10 opacity-40 mb-2" />
              <p className="text-sm">Nenhum empréstimo encontrado</p>
            </div>
          ) : (
            <div className="space-y-3">
              {clientLoans.map((loan) => {
                const statusMap: Record<string, { label: string; color: string }> = {
                  active: { label: 'Activo', color: 'bg-emerald-100 text-emerald-700' },
                  paid: { label: 'Pago', color: 'bg-blue-100 text-blue-700' },
                  completed: { label: 'Concluído', color: 'bg-blue-100 text-blue-700' },
                  defaulted: { label: 'Em atraso', color: 'bg-red-100 text-red-700' },
                };
                const st = statusMap[loan.status] || { label: loan.status, color: 'bg-gray-100 text-gray-700' };
                return (
                  <div key={loan.id} className="border rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm">MT {Number(loan.amount).toLocaleString()}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${st.color}`}>{st.label}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                      <div>
                        <span className="font-medium text-gray-600">Total:</span>{' '}
                        MT {Number(loan.total_amount).toLocaleString()}
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Restante:</span>{' '}
                        <span className={loan.remaining_amount > 0 ? 'text-red-500 font-bold' : 'text-green-600'}>
                          MT {Number(loan.remaining_amount).toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Início:</span>{' '}
                        {loan.start_date ? new Date(loan.start_date).toLocaleDateString('pt-PT') : '—'}
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Fim:</span>{' '}
                        {loan.end_date ? new Date(loan.end_date).toLocaleDateString('pt-PT') : '—'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ClientsModule;

