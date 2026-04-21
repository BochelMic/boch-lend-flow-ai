import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Users,
  UserCheck,
  Activity,
  Shield,
  Bell,
  Settings2,
  Eye,
  Lock,
  Unlock,
  MessageCircle,
  TrendingUp,
  AlertTriangle,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface SubUser {
  id: string;
  name: string;
  email: string;
  role: 'agente' | 'cliente';
  permissions: string[];
  blocked?: boolean;
  lastActive?: string;
}

interface SystemMessage {
  id: string;
  from: string;
  fromRole: string;
  to: string;
  content: string;
  timestamp: string;
  read: boolean;
}

const SubsystemsControl = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [agents, setAgents] = useState<SubUser[]>([]);
  const [clients, setClients] = useState<SubUser[]>([]);
  const [messages, setMessages] = useState<SystemMessage[]>([]);
  const [agentModules, setAgentModules] = useState({
    clientes: true,
    emprestimos: true,
    cobrancas: true,
    pagamentos: true,
    chat: true,
  });
  const [clientModules, setClientModules] = useState({
    conta: true,
    historico: true,
    pedidos: true,
    chat: true,
  });

  useEffect(() => {
    loadUsers();
    loadMessages();
    loadModuleSettings();
  }, []);

  const loadUsers = async () => {
    try {
      const { data: roles } = await supabase.from('user_roles').select('user_id, role');
      if (!roles) return;

      const userIds = roles.map(r => r.user_id);
      const { data: profiles } = await supabase.from('profiles').select('user_id, name, email').in('user_id', userIds);

      const agentsList: SubUser[] = [];
      const clientsList: SubUser[] = [];

      (profiles || []).forEach(p => {
        const role = roles.find(r => r.user_id === p.user_id)?.role;
        const u: SubUser = { id: p.user_id, name: p.name, email: p.email, role: (role || 'cliente') as any, permissions: [] };
        if (role === 'agente') agentsList.push(u);
        else if (role === 'cliente') clientsList.push(u);
      });

      setAgents(agentsList);
      setClients(clientsList);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const loadMessages = async () => {
    try {
      const { data } = await supabase.from('chat_messages').select('*').order('created_at', { ascending: false }).limit(20);
      setMessages((data || []).map((m: any) => ({
        id: m.id,
        from: m.sender_id || '',
        fromRole: '',
        to: m.receiver_id || '',
        content: m.content || '',
        timestamp: m.created_at,
        read: m.read || false,
      })));
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const loadModuleSettings = async () => {
    // 1. Try to load from Supabase first
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('key, value')
        .in('key', ['agent_modules', 'client_modules']);
        
      if (!error && data && data.length > 0) {
        let loadedAgent = false;
        let loadedClient = false;
        
        data.forEach((setting: any) => {
          if (setting.key === 'agent_modules') {
            try {
              const parsed = typeof setting.value === 'string' ? JSON.parse(setting.value) : setting.value;
              setAgentModules(parsed);
              localStorage.setItem('agent_modules', JSON.stringify(parsed));
              loadedAgent = true;
            } catch (e) { }
          }
          if (setting.key === 'client_modules') {
            try {
              const parsed = typeof setting.value === 'string' ? JSON.parse(setting.value) : setting.value;
              setClientModules(parsed);
              localStorage.setItem('client_modules', JSON.stringify(parsed));
              loadedClient = true;
            } catch (e) { }
          }
        });
        
        if (loadedAgent && loadedClient) return; // DB sync successful
      }
    } catch (dbError) {
      console.warn('Could not load from DB, falling back to localStorage', dbError);
    }

    // 2. Fallback to localStorage if DB fetch failed or missing keys
    const agentSettings = localStorage.getItem('agent_modules');
    const clientSettings = localStorage.getItem('client_modules');
    if (agentSettings) setAgentModules(JSON.parse(agentSettings));
    if (clientSettings) setClientModules(JSON.parse(clientSettings));
  };

  const toggleUserBlock = (userId: string, role: string) => {
    // Block/unblock via UI toggle (visual only for now)
    const setter = role === 'agente' ? setAgents : setClients;
    const list = role === 'agente' ? agents : clients;
    const target = list.find(u => u.id === userId);
    setter(list.map(u => u.id === userId ? { ...u, blocked: !u.blocked } : u));
    toast({
      title: target?.blocked ? 'Utilizador desbloqueado' : 'Utilizador bloqueado',
      description: `${target?.name} foi ${target?.blocked ? 'desbloqueado' : 'bloqueado'} com sucesso.`,
    });
  };

  const saveAgentModules = async (updated: typeof agentModules) => {
    setAgentModules(updated);
    const jsonStr = JSON.stringify(updated);
    localStorage.setItem('agent_modules', jsonStr);
    
    try {
      await supabase.from('system_settings').upsert({ key: 'agent_modules', value: updated });
    } catch (e) {
      console.warn('Could not save to DB:', e);
    }
    toast({ title: 'Configuração salva', description: 'Módulos do Agente actualizados.' });
  };

  const saveClientModules = async (updated: typeof clientModules) => {
    setClientModules(updated);
    const jsonStr = JSON.stringify(updated);
    localStorage.setItem('client_modules', jsonStr);
    
    try {
      await supabase.from('system_settings').upsert({ key: 'client_modules', value: updated });
    } catch (e) {
      console.warn('Could not save to DB:', e);
    }
    toast({ title: 'Configuração salva', description: 'Módulos do Cliente actualizados.' });
  };

  const sendBroadcast = async (targetRole: string, message: string) => {
    if (!user || !message.trim()) return;
    const targets = targetRole === 'agente' ? agents : clients;

    try {
      const inserts = targets.map(t => ({
        sender_id: user.id,
        receiver_id: t.id,
        content: `📢 [Aviso do Gestor] ${message}`,
        read: false,
      }));

      if (inserts.length > 0) {
        await supabase.from('chat_messages').insert(inserts);
      }

      toast({
        title: 'Aviso enviado',
        description: `Mensagem enviada para todos os ${targetRole === 'agente' ? 'agentes' : 'clientes'}.`,
      });
      loadMessages();
    } catch (error) {
      console.error('Error sending broadcast:', error);
    }
  };

  const [broadcastAgent, setBroadcastAgent] = useState('');
  const [broadcastClient, setBroadcastClient] = useState('');

  const roleTag = (role: string) => {
    const styles: Record<string, string> = {
      agente: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
      cliente: 'bg-purple-500/20 text-purple-400 border border-purple-500/30',
    };
    const labels: Record<string, string> = { agente: 'Agente', cliente: 'Cliente' };
    return (
      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${styles[role]}`}>
        {labels[role] || role}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
          <Shield className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Controlo de Subsistemas</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie os apps de Agente e Cliente a partir do sistema principal
          </p>
        </div>
      </div>

      {/* Stats rápidos */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-border/50">
          <CardContent className="p-4 flex items-center gap-3">
            <UserCheck className="h-8 w-8 text-blue-400" />
            <div>
              <p className="text-2xl font-bold">{agents.length}</p>
              <p className="text-xs text-muted-foreground">Agentes</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4 flex items-center gap-3">
            <Users className="h-8 w-8 text-purple-400" />
            <div>
              <p className="text-2xl font-bold">{clients.length}</p>
              <p className="text-xs text-muted-foreground">Clientes</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4 flex items-center gap-3">
            <Activity className="h-8 w-8 text-green-400" />
            <div>
              <p className="text-2xl font-bold">
                {agents.filter((a) => !a.blocked).length + clients.filter((c) => !c.blocked).length}
              </p>
              <p className="text-xs text-muted-foreground">Activos</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4 flex items-center gap-3">
            <MessageCircle className="h-8 w-8 text-primary" />
            <div>
              <p className="text-2xl font-bold">{messages.length}</p>
              <p className="text-xs text-muted-foreground">Mensagens</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="agentes" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="agentes" className="flex items-center gap-2">
            <UserCheck className="h-4 w-4" />
            App Agente
          </TabsTrigger>
          <TabsTrigger value="clientes" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            App Cliente
          </TabsTrigger>
          <TabsTrigger value="actividade" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Actividade
          </TabsTrigger>
        </TabsList>

        {/* ── APP AGENTE ── */}
        <TabsContent value="agentes" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Utilizadores */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <UserCheck className="h-4 w-4 text-blue-400" />
                  Agentes Registados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-48">
                  <div className="space-y-2">
                    {agents.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        Nenhum agente registado
                      </p>
                    ) : (
                      agents.map((agent) => (
                        <div
                          key={agent.id}
                          className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-blue-500/20 flex items-center justify-center">
                              <span className="text-[10px] font-bold text-blue-400">
                                {agent.name[0]}
                              </span>
                            </div>
                            <div>
                              <p className="text-sm font-medium">{agent.name}</p>
                              <p className="text-[10px] text-muted-foreground">{agent.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {agent.blocked ? (
                              <Badge variant="destructive" className="text-[10px]">Bloqueado</Badge>
                            ) : (
                              <Badge className="text-[10px] bg-green-500/20 text-green-400 border-green-500/30">Activo</Badge>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0"
                              onClick={() => toggleUserBlock(agent.id, 'agente')}
                              title={agent.blocked ? 'Desbloquear' : 'Bloquear'}
                            >
                              {agent.blocked ? (
                                <Unlock className="h-3 w-3 text-green-400" />
                              ) : (
                                <Lock className="h-3 w-3 text-destructive" />
                              )}
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Módulos do Agente */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Settings2 className="h-4 w-4 text-blue-400" />
                  Módulos Visíveis no App Agente
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {(Object.entries(agentModules) as [keyof typeof agentModules, boolean][]).map(([key, val]) => {
                  const labels: Record<string, string> = {
                    clientes: 'Clientes',
                    emprestimos: 'Empréstimos',
                    cobrancas: 'Cobranças',
                    pagamentos: 'Pagamentos',
                    chat: 'Chat Interno',
                  };
                  return (
                    <div key={key} className="flex items-center justify-between">
                      <Label className="text-sm">{labels[key]}</Label>
                      <Switch
                        checked={val}
                        onCheckedChange={(checked) =>
                          saveAgentModules({ ...agentModules, [key]: checked })
                        }
                      />
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          {/* Broadcast para Agentes */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Bell className="h-4 w-4 text-blue-400" />
                Enviar Aviso a Todos os Agentes
              </CardTitle>
            </CardHeader>
            <CardContent className="flex gap-2">
              <input
                className="flex-1 px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="Escreva uma mensagem para todos os agentes..."
                value={broadcastAgent}
                onChange={(e) => setBroadcastAgent(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    sendBroadcast('agente', broadcastAgent);
                    setBroadcastAgent('');
                  }
                }}
              />
              <Button
                size="sm"
                onClick={() => { sendBroadcast('agente', broadcastAgent); setBroadcastAgent(''); }}
              >
                <Bell className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── APP CLIENTE ── */}
        <TabsContent value="clientes" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="h-4 w-4 text-purple-400" />
                  Clientes Registados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-48">
                  <div className="space-y-2">
                    {clients.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        Nenhum cliente registado
                      </p>
                    ) : (
                      clients.map((client) => (
                        <div
                          key={client.id}
                          className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-purple-500/20 flex items-center justify-center">
                              <span className="text-[10px] font-bold text-purple-400">
                                {client.name[0]}
                              </span>
                            </div>
                            <div>
                              <p className="text-sm font-medium">{client.name}</p>
                              <p className="text-[10px] text-muted-foreground">{client.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {client.blocked ? (
                              <Badge variant="destructive" className="text-[10px]">Bloqueado</Badge>
                            ) : (
                              <Badge className="text-[10px] bg-green-500/20 text-green-400 border-green-500/30">Activo</Badge>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0"
                              onClick={() => toggleUserBlock(client.id, 'cliente')}
                            >
                              {client.blocked ? (
                                <Unlock className="h-3 w-3 text-green-400" />
                              ) : (
                                <Lock className="h-3 w-3 text-destructive" />
                              )}
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Settings2 className="h-4 w-4 text-purple-400" />
                  Módulos Visíveis no App Cliente
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {(Object.entries(clientModules) as [keyof typeof clientModules, boolean][]).map(([key, val]) => {
                  const labels: Record<string, string> = {
                    conta: 'Minha Conta',
                    historico: 'Histórico',
                    pedidos: 'Pedidos de Crédito',
                    chat: 'Chat Interno',
                  };
                  return (
                    <div key={key} className="flex items-center justify-between">
                      <Label className="text-sm">{labels[key]}</Label>
                      <Switch
                        checked={val}
                        onCheckedChange={(checked) =>
                          saveClientModules({ ...clientModules, [key]: checked })
                        }
                      />
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Bell className="h-4 w-4 text-purple-400" />
                Enviar Aviso a Todos os Clientes
              </CardTitle>
            </CardHeader>
            <CardContent className="flex gap-2">
              <input
                className="flex-1 px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="Escreva uma mensagem para todos os clientes..."
                value={broadcastClient}
                onChange={(e) => setBroadcastClient(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    sendBroadcast('cliente', broadcastClient);
                    setBroadcastClient('');
                  }
                }}
              />
              <Button
                size="sm"
                onClick={() => { sendBroadcast('cliente', broadcastClient); setBroadcastClient(''); }}
              >
                <Bell className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── ACTIVIDADE ── */}
        <TabsContent value="actividade">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Eye className="h-4 w-4 text-primary" />
                Actividade Recente nos Subsistemas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-72">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-48 text-muted-foreground gap-2">
                    <Activity className="h-10 w-10 opacity-30" />
                    <p className="text-sm">Nenhuma actividade registada</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {[...messages].reverse().map((msg, i) => (
                      <div key={i} className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{(msg as any).senderName}</span>
                            {roleTag((msg as any).senderRole)}
                            <span className="text-[10px] text-muted-foreground ml-auto">
                              {new Date((msg as any).timestamp).toLocaleString('pt-PT', {
                                day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
                              })}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground truncate">{(msg as any).content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SubsystemsControl;
