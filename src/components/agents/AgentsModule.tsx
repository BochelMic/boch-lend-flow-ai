
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
  const [newAgent, setNewAgent] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    zone: ''
  });

  // Verificar se é o gestor principal (primeiro gestor cadastrado)
  const isPrimaryManager = () => {
    if (user?.role !== 'gestor') return false;
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const gestores = users.filter((u: any) => u.role === 'gestor');
    return gestores.length > 0 && gestores[0].id === user.id;
  };

  useEffect(() => {
    loadAgents();
  }, []);

  const loadAgents = () => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const agentUsers = users.filter((u: any) => u.role === 'agente');
    const agentData = JSON.parse(localStorage.getItem('agents_data') || '[]');
    
    const agentsList = agentUsers.map((u: any) => {
      const data = agentData.find((a: any) => a.userId === u.id) || {};
      return {
        id: u.id,
        name: u.name,
        email: u.email,
        phone: data.phone || '',
        zone: data.zone || 'Não atribuída',
        clients: data.clients || 0,
        activeLoans: data.activeLoans || 0,
        collections: data.collections || 0,
        commission: data.commission || 0,
        performance: data.performance || 0
      };
    });
    
    setAgents(agentsList);
  };

  const handleCreateAgent = () => {
    if (!isPrimaryManager()) {
      toast({
        title: "Acesso Negado",
        description: "Apenas o gestor principal pode cadastrar novos agentes.",
        variant: "destructive"
      });
      return;
    }

    if (!newAgent.name || !newAgent.email || !newAgent.password) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const existingUser = users.find((u: any) => u.email === newAgent.email);
    
    if (existingUser) {
      toast({
        title: "Erro",
        description: "Já existe um usuário com este email.",
        variant: "destructive"
      });
      return;
    }

    const newUser = {
      id: Date.now().toString(),
      name: newAgent.name,
      email: newAgent.email,
      password: newAgent.password,
      role: 'agente',
      permissions: ['clientes', 'emprestimos', 'cobrancas', 'pagamentos']
    };

    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));

    // Salvar dados extras do agente
    const agentData = JSON.parse(localStorage.getItem('agents_data') || '[]');
    agentData.push({
      userId: newUser.id,
      phone: newAgent.phone,
      zone: newAgent.zone,
      clients: 0,
      activeLoans: 0,
      collections: 0,
      commission: 0,
      performance: 0
    });
    localStorage.setItem('agents_data', JSON.stringify(agentData));

    toast({
      title: "Sucesso",
      description: "Agente cadastrado com sucesso!",
    });

    setNewAgent({ name: '', email: '', password: '', phone: '', zone: '' });
    setIsDialogOpen(false);
    loadAgents();
  };

  // Mock data se não houver agentes
  const displayAgents = agents.length > 0 ? agents : [
    {
      id: 1,
      name: 'Carlos Silva',
      email: 'carlos@bochel.com',
      phone: '+258 84 111 2222',
      zone: 'Maputo Centro',
      clients: 25,
      activeLoans: 18,
      collections: 85000,
      commission: 4250,
      performance: 92
    },
    {
      id: 2,
      name: 'Ana Santos',
      email: 'ana@bochel.com',
      phone: '+258 84 333 4444',
      zone: 'Matola',
      clients: 30,
      activeLoans: 22,
      collections: 120000,
      commission: 6000,
      performance: 88
    }
  ];

  const getPerformanceColor = (performance: number) => {
    if (performance >= 90) return 'text-green-600';
    if (performance >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Gestão de Agentes</h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Gerencie agentes de campo e acompanhe desempenho
          </p>
        </div>
        
        {isPrimaryManager() ? (
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
                    onChange={(e) => setNewAgent({...newAgent, name: e.target.value})}
                    placeholder="Nome do agente"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email *</Label>
                  <Input
                    type="email"
                    value={newAgent.email}
                    onChange={(e) => setNewAgent({...newAgent, email: e.target.value})}
                    placeholder="email@exemplo.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Senha *</Label>
                  <Input
                    type="password"
                    value={newAgent.password}
                    onChange={(e) => setNewAgent({...newAgent, password: e.target.value})}
                    placeholder="Senha de acesso"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Telefone</Label>
                  <Input
                    value={newAgent.phone}
                    onChange={(e) => setNewAgent({...newAgent, phone: e.target.value})}
                    placeholder="+258 84 xxx xxxx"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Zona de Atuação</Label>
                  <Input
                    value={newAgent.zone}
                    onChange={(e) => setNewAgent({...newAgent, zone: e.target.value})}
                    placeholder="Ex: Maputo Centro"
                  />
                </div>
                <Button onClick={handleCreateAgent} className="w-full">
                  Cadastrar Agente
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        ) : (
          <Button disabled variant="outline">
            <Lock className="mr-2 h-4 w-4" />
            Apenas Gestor Principal
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total de Agentes</p>
                <p className="text-lg font-semibold">12</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Meta Mensal</p>
                <p className="text-lg font-semibold">87%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Comissões Pagas</p>
                <p className="text-lg font-semibold">45.230 MZN</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">Performance Média</p>
                <p className="text-lg font-semibold">89%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="list" className="space-y-6">
        <TabsList>
          <TabsTrigger value="list">Lista de Agentes</TabsTrigger>
          <TabsTrigger value="performance">Desempenho</TabsTrigger>
          <TabsTrigger value="commissions">Comissões</TabsTrigger>
          <TabsTrigger value="zones">Zonas</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Agentes Cadastrados</CardTitle>
              <CardDescription>
                Lista completa dos agentes de campo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {displayAgents.map((agent) => (
                  <div key={agent.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">{agent.name}</h3>
                        <p className="text-sm text-muted-foreground">{agent.email}</p>
                        <p className="text-sm text-muted-foreground">{agent.phone}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className="mb-2">
                          <MapPin className="h-3 w-3 mr-1" />
                          {agent.zone}
                        </Badge>
                        <p className={`text-sm font-medium ${getPerformanceColor(agent.performance)}`}>
                          Performance: {agent.performance}%
                        </p>
                      </div>
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
                    
                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" size="sm">
                        Ver Perfil
                      </Button>
                      <Button variant="outline" size="sm">
                        Relatório
                      </Button>
                      <Button variant="outline" size="sm">
                        Definir Meta
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Performers</CardTitle>
                <CardDescription>Agentes com melhor desempenho este mês</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {displayAgents.sort((a, b) => b.performance - a.performance).map((agent, index) => (
                    <div key={agent.id} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-lg">{index + 1}</span>
                        <div>
                          <p className="font-medium">{agent.name}</p>
                          <p className="text-sm text-muted-foreground">{agent.zone}</p>
                        </div>
                      </div>
                      <Badge className={
                        agent.performance >= 90 ? 'bg-green-100 text-green-800' : 
                        agent.performance >= 75 ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-red-100 text-red-800'
                      }>
                        {agent.performance}%
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Metas vs Realizado</CardTitle>
                <CardDescription>Comparação de metas e resultados</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {displayAgents.map((agent) => (
                    <div key={agent.id} className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">{agent.name}</span>
                        <span className="text-sm">{agent.performance}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${agent.performance}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="commissions">
          <Card>
            <CardHeader>
              <CardTitle>Cálculo de Comissões</CardTitle>
              <CardDescription>
                Gerencie o pagamento de comissões dos agentes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Período</Label>
                    <select className="w-full p-2 border rounded">
                      <option>Janeiro 2024</option>
                      <option>Dezembro 2023</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Agente</Label>
                    <select className="w-full p-2 border rounded">
                      <option>Todos os Agentes</option>
                      <option>Carlos Silva</option>
                      <option>Ana Santos</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <select className="w-full p-2 border rounded">
                      <option>Pendente</option>
                      <option>Pago</option>
                      <option>Processando</option>
                    </select>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="space-y-3">
                    {displayAgents.map((agent) => (
                      <div key={agent.id} className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <p className="font-medium">{agent.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {agent.activeLoans} empréstimos • {agent.collections.toLocaleString()} MZN cobrado
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-green-600">{agent.commission.toLocaleString()} MZN</p>
                          <Badge>Pendente</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t">
                  <div>
                    <p className="text-sm text-muted-foreground">Total de Comissões</p>
                    <p className="text-lg font-semibold">10.250 MZN</p>
                  </div>
                  <Button>Processar Pagamentos</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="zones">
          <Card>
            <CardHeader>
              <CardTitle>Gestão de Zonas</CardTitle>
              <CardDescription>
                Configure zonas de atendimento e atribua agentes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button className="mb-4">
                  <Plus className="mr-2 h-4 w-4" />
                  Nova Zona
                </Button>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { name: 'Maputo Centro', agents: 4, clients: 120 },
                    { name: 'Matola', agents: 3, clients: 95 },
                    { name: 'Boane', agents: 2, clients: 60 },
                    { name: 'Marracuene', agents: 3, clients: 85 }
                  ].map((zone) => (
                    <div key={zone.name} className="border rounded-lg p-4">
                      <h3 className="font-semibold">{zone.name}</h3>
                      <div className="mt-2 space-y-1">
                        <p className="text-sm text-muted-foreground">
                          {zone.agents} agentes • {zone.clients} clientes
                        </p>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Button variant="outline" size="sm">
                          Ver Detalhes
                        </Button>
                        <Button variant="outline" size="sm">
                          Atribuir Agente
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AgentsModule;
