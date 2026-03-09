
import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import {
  Users,
  DollarSign,
  TrendingUp,
  Shield,
  UserPlus,
  AlertTriangle,
  RefreshCw,
  Trash2
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '../../hooks/useAuth';
import RegisterForm from '../auth/RegisterForm';
import { supabase } from '../../integrations/supabase/client';
import { Badge } from '../ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '../ui/table';
import { Checkbox } from '../ui/checkbox';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";

const AdminDashboard = () => {
  const { toast } = useToast();
  const { register } = useAuth();
  const [showRegisterForm, setShowRegisterForm] = useState(false);

  const [clients, setClients] = useState<any[]>([]);
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const [loadingClients, setLoadingClients] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [stats, setStats] = useState({
    activeUsers: '...',
    monthlyRevenue: '...',
    newClients: '...',
    engagementRate: '...'
  });

  const loadClients = async () => {
    setLoadingClients(true);
    console.log("Iniciando carregamento de dados do painel...");
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*');
      if (error) throw error;
      setClients(data || []);

      const activeCount = data?.filter(c => c.status === 'active').length || 0;
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const newCount = data?.filter(c => new Date(c.created_at) > thirtyDaysAgo).length || 0;

      console.log(`Clientes carregados: ${data?.length}, Ativos: ${activeCount}`);

      // Fetch monthly revenue from payments
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { data: payments, error: payError } = await supabase
        .from('payments')
        .select('amount')
        .gte('created_at', startOfMonth.toISOString());

      let totalRevenue = 0;
      if (!payError && payments) {
        totalRevenue = payments.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
      }

      // Fetch engagement (clients with active loans)
      const { count: activeLoans, error: loanError } = await supabase
        .from('loans')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      const engagementRate = (data && data.length > 0)
        ? Math.min(Math.round(((activeLoans || 0) / data.length) * 100), 100)
        : 0;

      const formattedRevenue = new Intl.NumberFormat('pt-MZ', {
        style: 'currency',
        currency: 'MZN',
        maximumFractionDigits: 0
      }).format(totalRevenue);

      setStats({
        activeUsers: activeCount.toString(),
        newClients: newCount.toString(),
        monthlyRevenue: formattedRevenue,
        engagementRate: `${engagementRate}%`
      });

    } catch (error: any) {
      console.error("Erro no loadClients:", error);
      toast({ title: "Erro", description: "Falha ao atualizar estatísticas: " + error.message, variant: "destructive" });
    } finally {
      setLoadingClients(false);
    }
  };

  const handleDeleteClients = async () => {
    if (deleteConfirmText !== 'ELIMINAR') {
      toast({ title: "Erro", description: "Por favor, digite 'ELIMINAR' para confirmar.", variant: "destructive" });
      return;
    }

    try {
      const { error } = await supabase.rpc('delete_clients_bulk', {
        client_ids: selectedClients
      });

      if (error) throw error;

      toast({
        title: "Dados Apagados",
        description: `${selectedClients.length} registos removidos com sucesso.`,
      });
      setSelectedClients([]);
      setDeleteConfirmText('');
      loadClients();
    } catch (error: any) {
      console.error("Erro na exclusão:", error);
      toast({
        title: "Erro Crítico",
        description: "Falha na base de dados: " + (error.details || error.message || "Contacte o suporte"),
        variant: "destructive"
      });
    }
  };

  const toggleClientSelection = (id: string) => {
    setSelectedClients(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  React.useEffect(() => {
    loadClients();
  }, []);


  if (showRegisterForm) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Cadastro de Usuário</h1>
          <Button variant="outline" onClick={() => setShowRegisterForm(false)}>
            Voltar
          </Button>
        </div>
        <Card>
          <CardContent className="pt-6">
            <RegisterForm onSwitchToLogin={() => setShowRegisterForm(false)} />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Administração</h1>
        <div className="flex space-x-2">
          <Button onClick={() => setShowRegisterForm(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Cadastrar Usuário
          </Button>
        </div>
      </div>

      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="clients">Clientes (Limpeza)</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Usuários Ativos</p>
                    <p className="text-2xl font-bold">{stats.activeUsers}</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Receita Mensal</p>
                    <p className="text-2xl font-bold">{stats.monthlyRevenue}</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Novos Clientes</p>
                    <p className="text-2xl font-bold">{stats.newClients}</p>
                  </div>
                  <UserPlus className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Taxa de Engajamento</p>
                    <p className="text-2xl font-bold">{stats.engagementRate}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Alertas de Segurança</CardTitle>
              <CardDescription>
                Notificações importantes sobre a segurança do sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg bg-yellow-50">
                  <div>
                    <p className="font-medium">Acesso Não Autorizado</p>
                    <p className="text-sm text-gray-600">
                      Tentativa de acesso detectada em 15/03/2024
                    </p>
                  </div>
                  <AlertTriangle className="h-6 w-6 text-yellow-600" />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg bg-red-50">
                  <div>
                    <p className="font-medium">Vulnerabilidade Encontrada</p>
                    <p className="text-sm text-gray-600">
                      Risco de segurança identificado no módulo de pagamentos
                    </p>
                  </div>
                  <Shield className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clients" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle>Limpeza de Dados de Teste</CardTitle>
                <CardDescription>Selecione clientes para excluir permanentemente todos os seus dados</CardDescription>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={loadClients} disabled={loadingClients}>
                  <RefreshCw className={`mr-2 h-4 w-4 ${loadingClients ? 'animate-spin' : ''}`} />
                  Atualizar
                </Button>

                {selectedClients.length > 0 && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Eliminar Selecionados ({selectedClients.length})
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-destructive flex items-center gap-2">
                          <AlertTriangle className="h-5 w-5" /> Atenção: Ação Irreversível
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          Isso excluirá permanentemente os **{selectedClients.length}** clientes selecionados e **TODOS** os seus dados (Empréstimos, Pagamentos, Contratos e Histórico de Chat).
                          <div className="mt-4 p-4 bg-red-50 rounded-md border border-red-100">
                            <p className="text-sm font-semibold text-red-900 mb-2">Para confirmar, digite ELIMINAR abaixo:</p>
                            <Input
                              placeholder="ELIMINAR"
                              value={deleteConfirmText}
                              onChange={(e) => setDeleteConfirmText(e.target.value)}
                              className="bg-white border-red-200"
                            />
                          </div>
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setDeleteConfirmText('')}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDeleteClients}
                          className="bg-red-600 hover:bg-red-700"
                          disabled={deleteConfirmText !== 'ELIMINAR'}
                        >
                          Confirmar Exclusão em Massa
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader className="bg-gray-50">
                    <TableRow>
                      <TableHead className="w-[50px]"></TableHead>
                      <TableHead>Nome</TableHead>
                      <TableHead>Email/Telefone</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Cadastro</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loadingClients ? (
                      <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">Carregando...</TableCell>
                      </TableRow>
                    ) : clients.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">Nenhum cliente encontrado. Clique em Atualizar.</TableCell>
                      </TableRow>
                    ) : (
                      clients.map((client) => (
                        <TableRow key={client.id} className={selectedClients.includes(client.id) ? "bg-red-50/50" : ""}>
                          <TableCell>
                            <Checkbox
                              checked={selectedClients.includes(client.id)}
                              onCheckedChange={() => toggleClientSelection(client.id)}
                            />
                          </TableCell>
                          <TableCell className="font-medium">
                            {client.name}
                            <div className="text-xs text-muted-foreground">{client.user_id || 'Sem Usuário'}</div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">{client.email || 'N/A'}</div>
                            <div className="text-xs text-muted-foreground">{client.phone || 'N/A'}</div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={client.status === 'active' ? 'default' : 'secondary'} className="capitalize">
                              {client.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs font-mono">
                            {new Date(client.created_at).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

const AdminModule = () => {
  return (
    <Routes>
      <Route path="/" element={<AdminDashboard />} />
      <Route path="/*" element={<AdminDashboard />} />
    </Routes>
  );
};

export default AdminModule;
