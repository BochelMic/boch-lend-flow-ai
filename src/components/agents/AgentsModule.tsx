
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { UserCheck, Plus, Target, DollarSign, TrendingUp, MapPin, Lock } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface Agent {
  id: string;
  name: string;
  email: string;
  phone: string;
  zone: string;
  clients: number;
  activeLoans: number;
  collections: number;
  commission: number;
  performance: number;
}

const AgentsModule = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newAgent, setNewAgent] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    zone: ''
  });

  useEffect(() => {
    loadAgents();
  }, []);

  const loadAgents = async () => {
    try {
      // Buscar todos os perfis com role 'agente'
      const { data: roles } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'agente');

      if (!roles || roles.length === 0) {
        setAgents([]);
        setLoading(false);
        return;
      }

      const agentUserIds = roles.map(r => r.user_id);

      // Buscar perfis dos agentes
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, name, email')
        .in('user_id', agentUserIds);

      // Para cada agente, contar clientes e empréstimos
      const agentsList: Agent[] = [];
      for (const profile of (profiles || [])) {
        const { count: clientCount } = await supabase
          .from('clients')
          .select('*', { count: 'exact', head: true })
          .eq('agent_id', profile.user_id);

        const { data: agentLoans } = await supabase
          .from('loans')
          .select('id, status, remaining_amount')
          .eq('agent_id', profile.user_id);

        const activeLoans = agentLoans?.filter(l => l.status === 'active').length || 0;
        const loanIds = agentLoans?.map(l => l.id) || [];

        let totalCollections = 0;
        if (loanIds.length > 0) {
          const { data: payments } = await supabase
            .from('payments')
            .select('amount')
            .in('loan_id', loanIds);
          totalCollections = payments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;
        }

        agentsList.push({
          id: profile.user_id,
          name: profile.name,
          email: profile.email,
          phone: '',
          zone: '',
          clients: clientCount || 0,
          activeLoans,
          collections: totalCollections,
          commission: Math.round(totalCollections * 0.05),
          performance: activeLoans > 0 ? Math.min(100, Math.round((totalCollections / (activeLoans * 10000)) * 100)) : 0,
        });
      }

      setAgents(agentsList);
    } catch (error) {
      console.error('Error loading agents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAgent = async () => {
    if (!newAgent.name || !newAgent.email || !newAgent.password) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Register through Supabase auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: newAgent.email,
        password: newAgent.password,
        options: {
          data: {
            name: newAgent.name,
            role: 'agente'
          }
        }
      });

      if (authError) throw authError;

      if (authData.user) {
        // Create profile
        await supabase.from('profiles').insert({
          user_id: authData.user.id,
          name: newAgent.name,
          email: newAgent.email,
        });

        // Create role
        await supabase.from('user_roles').insert({
          user_id: authData.user.id,
          role: 'agente',
        });
      }

      toast({
        title: "Sucesso",
        description: "Agente cadastrado com sucesso!",
      });

      setNewAgent({ name: '', email: '', password: '', phone: '', zone: '' });
      setIsDialogOpen(false);
      loadAgents();
    } catch (error: any) {
      console.error('Error creating agent:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao cadastrar agente.",
        variant: "destructive"
      });
    }
  };

  const getPerformanceColor = (performance: number) => {
    if (performance >= 90) return 'text-green-600';
    if (performance >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  const totalAgents = agents.length;
  const totalCollections = agents.reduce((sum, a) => sum + a.collections, 0);
  const totalCommissions = agents.reduce((sum, a) => sum + a.commission, 0);
  const avgPerformance = totalAgents > 0 ? Math.round(agents.reduce((sum, a) => sum + a.performance, 0) / totalAgents) : 0;

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Gestão de Agentes</h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Gerencie agentes de campo e acompanhe desempenho
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Novo Agente
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Cadastrar Novo Agente</DialogTitle>
              <DialogDescription>
                Preencha os dados para criar uma conta de agente
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Nome Completo *</Label>
                <Input
                  value={newAgent.name}
                  onChange={(e) => setNewAgent({ ...newAgent, name: e.target.value })}
                  placeholder="Nome do agente"
                />
              </div>
              <div className="space-y-2">
                <Label>Email *</Label>
                <Input
                  type="email"
                  value={newAgent.email}
                  onChange={(e) => setNewAgent({ ...newAgent, email: e.target.value })}
                  placeholder="email@exemplo.com"
                />
              </div>
              <div className="space-y-2">
                <Label>Senha *</Label>
                <Input
                  type="password"
                  value={newAgent.password}
                  onChange={(e) => setNewAgent({ ...newAgent, password: e.target.value })}
                  placeholder="Senha de acesso"
                />
              </div>
              <Button onClick={handleCreateAgent} className="w-full">
                Cadastrar Agente
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total de Agentes</p>
                <p className="text-lg font-semibold">{totalAgents}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Performance Média</p>
                <p className="text-lg font-semibold">{avgPerformance}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Cobrado</p>
                <p className="text-lg font-semibold">{totalCollections.toLocaleString()} MZN</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">Comissões</p>
                <p className="text-lg font-semibold">{totalCommissions.toLocaleString()} MZN</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Agentes Cadastrados</CardTitle>
          <CardDescription>Lista completa dos agentes de campo</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {loading ? (
              <p className="text-center text-muted-foreground py-8">Carregando...</p>
            ) : agents.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <UserCheck className="mx-auto h-12 w-12 opacity-50 mb-2" />
                <p>Nenhum agente cadastrado</p>
              </div>
            ) : (
              agents.map((agent) => (
                <div key={agent.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{agent.name}</h3>
                      <p className="text-sm text-muted-foreground">{agent.email}</p>
                    </div>
                    <p className={`text-sm font-medium ${getPerformanceColor(agent.performance)}`}>
                      Performance: {agent.performance}%
                    </p>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Clientes</p>
                      <p className="font-medium">{agent.clients}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Empréstimos Ativos</p>
                      <p className="font-medium">{agent.activeLoans}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Cobranças (MZN)</p>
                      <p className="font-medium">{agent.collections.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Comissão (MZN)</p>
                      <p className="font-medium text-green-600">{agent.commission.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AgentsModule;
