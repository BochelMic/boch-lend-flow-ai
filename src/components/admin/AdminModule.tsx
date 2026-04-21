
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
import { useAuth } from '@/hooks/useAuth';
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
    console.log("Carregando clientes para limpeza...");
    try {
      // 1. PRIMARY SOURCE: Fetch all records from the `clients` table
      const { data: clientRecords, error: clientsError } = await supabase
        .from('clients')
        .select('*');
      if (clientsError) throw clientsError;

      // 2. ORPHAN DETECTION: Find users with role='cliente' but no client record
      const { data: roles } = await supabase
        .from('user_roles')
        .select('user_id, role')
        .eq('role', 'cliente');

      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, name, email, created_at');

      const clientUserIds = new Set((clientRecords || []).map(c => c.user_id).filter(Boolean));
      const profilesMap = new Map((profiles || []).map(p => [p.id, p]));

      // Orphans: have role='cliente' in user_roles but NO record in clients table
      const orphanUsers = (roles || [])
        .filter(r => !clientUserIds.has(r.user_id))
        .map(r => {
          const profile = profilesMap.get(r.user_id);
          return profile ? {
            id: r.user_id,
            client_id: null,
            name: profile.name || 'Sem Nome',
            email: profile.email || 'N/A',
            phone: 'N/A',
            user_id: r.user_id,
            status: 'órfão',
            created_at: profile.created_at,
            is_orphan: true
          } : null;
        })
        .filter(Boolean);

      // 3. MERGE: Real clients + Orphans
      const realClients = (clientRecords || []).map(c => ({
        id: c.id,
        client_id: c.id,
        name: c.name,
        email: c.email || 'N/A',
        phone: c.phone || 'N/A',
        user_id: c.user_id,
        status: c.status,
        created_at: c.created_at,
        is_orphan: false
      }));

      const allClients = [...realClients, ...orphanUsers];
      setClients(allClients);

      const activeCount = realClients.filter(c => c.status === 'active').length;
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const newCount = realClients.filter(c => new Date(c.created_at) > thirtyDaysAgo).length;

      console.log(`Clientes: ${realClients.length}, Órfãos: ${orphanUsers.length}, Total: ${allClients.length}`);

      // Stats fetching
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { data: payments } = await supabase
        .from('payments')
        .select('amount')
        .gte('created_at', startOfMonth.toISOString());

      let totalRevenue = 0;
      if (payments) {
        totalRevenue = payments.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
      }

      const { count: activeLoans } = await supabase
        .from('loans')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      const engagementRate = (realClients.length > 0)
        ? Math.min(Math.round(((activeLoans || 0) / realClients.length) * 100), 100)
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
      toast({ title: "Erro", description: "Falha ao carregar clientes: " + error.message, variant: "destructive" });
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
      // Separate real clients (have client_id) from orphans (only have user_id)
      const selectedData = clients.filter(c => selectedClients.includes(c.id));
      const realClientIds = selectedData.filter(c => c.client_id && !c.is_orphan).map(c => c.client_id);
      const orphanUserIds = selectedData.filter(c => c.is_orphan).map(c => c.user_id);

      console.log("Excluindo - Clientes reais:", realClientIds, "Órfãos:", orphanUserIds);

      // 1. Delete real clients using the EXISTING RPC
      if (realClientIds.length > 0) {
        const { error } = await supabase.rpc('delete_clients_bulk', {
          client_ids: realClientIds
        });
        if (error) {
          console.error("Erro RPC delete_clients_bulk:", error);
          throw new Error("Falha ao excluir clientes: " + (error.message || error.details));
        }
      }

      // 2. Delete orphans directly (no client record to cascade from)
      if (orphanUserIds.length > 0) {
        // Delete their credit requests
        await supabase.from('credit_requests').delete().in('user_id', orphanUserIds);
        // Delete their chat messages
        await supabase.from('chat_messages').delete().in('sender_id', orphanUserIds);
        await supabase.from('chat_messages').delete().in('receiver_id', orphanUserIds);
        // Delete their notifications
        await supabase.from('notifications').delete().in('user_id', orphanUserIds);
        // Delete profiles and roles
        await supabase.from('user_roles').delete().in('user_id', orphanUserIds);
        await supabase.from('profiles').delete().in('id', orphanUserIds);
      }

      toast({
        title: "Dados Apagados",
        description: `${selectedClients.length} cliente(s) removidos com sucesso.`,
      });
      setSelectedClients([]);
      setDeleteConfirmText('');
      loadClients();
    } catch (error: any) {
      console.error("Erro na exclusão:", error);
      toast({
        title: "Erro na Exclusão",
        description: error.message || "Falha na base de dados.",
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
          <div className="grid grid-cols-1 min-[400px]:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
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
              <div className="rounded-md border overflow-x-auto">
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
                            <div className="text-xs text-muted-foreground font-mono">{client.id}</div>
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

