
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Plus, Search, FileText, CreditCard, AlertCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ClientProfileDialog } from '../profile/ClientProfileDialog';

interface Client {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  id_number: string | null;
  status: string;
  created_at: string;
}

const ClientsModule = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('list');

  // Form state
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', document: '', address: '', occupation: '', income: '', zone: '', password: ''
  });

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      let query = supabase.from('clients').select('*').order('created_at', { ascending: false });

      // Agentes veem apenas seus clientes
      if (user?.role === 'agente') {
        query = query.eq('agent_id', user.id);
      }

      const { data, error } = await query;
      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error('Error loading clients:', error);
      toast({ title: 'Erro', description: 'Erro ao carregar clientes.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast({ title: 'Erro', description: 'Nome é obrigatório.', variant: 'destructive' });
      return;
    }
    setLoading(true);

    try {
      // If user is agent, they must provide email and password to auto-create user auth
      if (user?.role === 'agente') {
        if (!formData.email || !formData.password) {
          toast({ title: 'Erro', description: 'Email e Senha são obrigatórios para registar o cliente no sistema.', variant: 'destructive' });
          setLoading(false);
          return;
        }

        // 1. Call the Edge Function exactly like the Admin does (Name, Email, Password, Role)
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
              const bodyText = await funcError.context.text();
              try {
                const bodyJson = JSON.parse(bodyText);
                detail = bodyJson.error || bodyJson.message || bodyText;
              } catch (e) {
                detail = bodyText;
              }
            }
          } catch (e) { }
          throw new Error(`Erro ao criar utilizador: ${detail}`);
        }

        if (funcData && funcData.success === false) {
          console.error('[ClientsModule] Edge Function Logic Error:', funcData.error);
          throw new Error(funcData.error || 'Erro desconhecido na criação do utilizador');
        }

        // 2. The database trigger has now created the 'clients' record.
        // We use a secure RPC (Remote Procedure Call) to bypass RLS and link this client to the agent.
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

        const { error } = await supabase.from('clients').insert(clientData);
        if (error) throw error;
        toast({ title: 'Sucesso', description: 'Cliente cadastrado com sucesso!' });
      }

      setFormData({ name: '', email: '', phone: '', document: '', address: '', occupation: '', income: '', zone: '', password: '' });
      setActiveTab('list');
      loadClients();
    } catch (error: any) {
      console.error('Error creating client:', error);
      // Clean up common supabase errors
      let msg = error.message || 'Erro ao cadastrar cliente.';
      if (msg.includes('User already exists')) msg = 'Já existe um utilizador com este email no sistema.';

      toast({ title: 'Erro', description: msg, variant: 'destructive' });
    } finally {
      setLoading(false);
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
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Carregando clientes...</p>
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
                        <Button variant="outline" size="sm" className="text-xs" onClick={() => {
                          const prefix = user?.role === 'gestor' ? '/gestor' : '/agente';
                          navigate(`${prefix}/credit-form`, {
                            state: {
                              clientId: client.id,
                              fullName: client.name,
                              email: client.email,
                              phone: client.phone,
                              agentId: client.agent_id
                            }
                          });
                        }}>
                          <CreditCard className="h-3 w-3 mr-1" />
                          Empréstimo
                        </Button>
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
                  {loading ? 'Processando...' : 'Cadastrar Cliente'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClientsModule;
