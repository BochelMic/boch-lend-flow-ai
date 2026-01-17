import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  UserPlus, 
  Shield, 
  UserCheck, 
  User,
  Trash2,
  Edit,
  Eye,
  EyeOff
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
} from '@/components/ui/alert-dialog';

interface SystemUser {
  id: string;
  name: string;
  email: string;
  role: 'gestor' | 'agente' | 'cliente';
  permissions: string[];
}

const UserManagementModule = () => {
  const { user: currentUser, register } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [filter, setFilter] = useState<'all' | 'gestor' | 'agente' | 'cliente'>('all');
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'agente' as 'gestor' | 'agente' | 'cliente'
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
    const usersWithoutPassword = storedUsers.map((u: any) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      permissions: u.permissions || []
    }));
    setUsers(usersWithoutPassword);
  };

  const handleCreateUser = () => {
    if (!newUser.name.trim() || !newUser.email.trim() || !newUser.password.trim()) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    if (newUser.password.length < 6) {
      toast({
        title: "Erro",
        description: "A senha deve ter pelo menos 6 caracteres.",
        variant: "destructive"
      });
      return;
    }

    const result = register({
      name: newUser.name.trim(),
      email: newUser.email.trim(),
      password: newUser.password,
      role: newUser.role
    });

    if (result.success) {
      toast({
        title: "Usuário Criado",
        description: `${newUser.name} foi cadastrado como ${getRoleLabel(newUser.role)}.`,
      });
      setNewUser({ name: '', email: '', password: '', role: 'agente' });
      setIsDialogOpen(false);
      loadUsers();
    } else {
      toast({
        title: "Erro",
        description: result.message,
        variant: "destructive"
      });
    }
  };

  const handleDeleteUser = (userId: string, userName: string) => {
    if (userId === currentUser?.id) {
      toast({
        title: "Erro",
        description: "Você não pode excluir sua própria conta.",
        variant: "destructive"
      });
      return;
    }

    const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
    const updatedUsers = storedUsers.filter((u: any) => u.id !== userId);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    
    toast({
      title: "Usuário Excluído",
      description: `${userName} foi removido do sistema.`,
    });
    loadUsers();
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'gestor': return 'Gestor';
      case 'agente': return 'Agente';
      case 'cliente': return 'Cliente';
      default: return role;
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'gestor': return 'bg-primary/20 text-primary border-primary/30';
      case 'agente': return 'bg-accent/20 text-accent border-accent/30';
      case 'cliente': return 'bg-secondary/20 text-secondary border-secondary/30';
      default: return '';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'gestor': return <Shield className="h-3 w-3" />;
      case 'agente': return <UserCheck className="h-3 w-3" />;
      case 'cliente': return <User className="h-3 w-3" />;
      default: return null;
    }
  };

  const filteredUsers = filter === 'all' 
    ? users 
    : users.filter(u => u.role === filter);

  const stats = {
    total: users.length,
    gestores: users.filter(u => u.role === 'gestor').length,
    agentes: users.filter(u => u.role === 'agente').length,
    clientes: users.filter(u => u.role === 'cliente').length,
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold">Gestão de Usuários</h1>
          <p className="text-xs md:text-sm text-muted-foreground">
            Cadastrar e gerenciar usuários do sistema
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="h-8 md:h-9">
              <UserPlus className="mr-1.5 h-3.5 w-3.5" />
              <span className="text-xs md:text-sm">Novo Usuário</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle className="text-lg">Cadastrar Usuário</DialogTitle>
              <DialogDescription className="text-xs">
                Preencha os dados para criar uma nova conta
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 mt-2">
              <div className="space-y-1">
                <Label className="text-xs">Nome Completo *</Label>
                <Input
                  value={newUser.name}
                  onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                  placeholder="Nome do usuário"
                  className="h-9 text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Email *</Label>
                <Input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  placeholder="email@exemplo.com"
                  className="h-9 text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Tipo de Usuário *</Label>
                <Select 
                  value={newUser.role} 
                  onValueChange={(value: 'gestor' | 'agente' | 'cliente') => setNewUser({...newUser, role: value})}
                >
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="agente">
                      <div className="flex items-center gap-2">
                        <UserCheck className="h-3.5 w-3.5" />
                        Agente de Campo
                      </div>
                    </SelectItem>
                    <SelectItem value="cliente">
                      <div className="flex items-center gap-2">
                        <User className="h-3.5 w-3.5" />
                        Cliente
                      </div>
                    </SelectItem>
                    <SelectItem value="gestor">
                      <div className="flex items-center gap-2">
                        <Shield className="h-3.5 w-3.5" />
                        Gestor (acesso total)
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Senha *</Label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={newUser.password}
                    onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                    placeholder="Mínimo 6 caracteres"
                    className="h-9 text-sm pr-9"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>
            <DialogFooter className="mt-4">
              <Button variant="outline" size="sm" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button size="sm" onClick={handleCreateUser}>
                Cadastrar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
        <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => setFilter('all')}>
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              <div>
                <p className="text-[10px] md:text-xs text-muted-foreground">Total</p>
                <p className="text-sm md:text-base font-semibold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => setFilter('gestor')}>
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              <div>
                <p className="text-[10px] md:text-xs text-muted-foreground">Gestores</p>
                <p className="text-sm md:text-base font-semibold">{stats.gestores}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => setFilter('agente')}>
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-accent" />
              <div>
                <p className="text-[10px] md:text-xs text-muted-foreground">Agentes</p>
                <p className="text-sm md:text-base font-semibold">{stats.agentes}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => setFilter('cliente')}>
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-secondary" />
              <div>
                <p className="text-[10px] md:text-xs text-muted-foreground">Clientes</p>
                <p className="text-sm md:text-base font-semibold">{stats.clientes}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter indicator */}
      {filter !== 'all' && (
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            Filtro: {getRoleLabel(filter)}
          </Badge>
          <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => setFilter('all')}>
            Limpar filtro
          </Button>
        </div>
      )}

      {/* Users List */}
      <Card>
        <CardHeader className="p-3 md:p-4">
          <CardTitle className="text-sm md:text-base">Usuários Cadastrados</CardTitle>
          <CardDescription className="text-xs">
            {filteredUsers.length} usuário(s) encontrado(s)
          </CardDescription>
        </CardHeader>
        <CardContent className="p-3 md:p-4 pt-0">
          {filteredUsers.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Nenhum usuário encontrado</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredUsers.map((user) => (
                <div 
                  key={user.id} 
                  className="flex items-center justify-between p-2 md:p-3 border rounded-lg hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                      {getRoleIcon(user.role)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-xs md:text-sm font-medium truncate">{user.name}</p>
                        <Badge 
                          variant="outline" 
                          className={`text-[10px] px-1.5 py-0 ${getRoleBadgeVariant(user.role)}`}
                        >
                          {getRoleLabel(user.role)}
                        </Badge>
                      </div>
                      <p className="text-[10px] md:text-xs text-muted-foreground truncate">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {user.id !== currentUser?.id && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive">
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="max-w-sm">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-base">Excluir Usuário</AlertDialogTitle>
                            <AlertDialogDescription className="text-xs">
                              Tem certeza que deseja excluir <strong>{user.name}</strong>? 
                              Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="h-8 text-xs">Cancelar</AlertDialogCancel>
                            <AlertDialogAction 
                              className="h-8 text-xs bg-destructive hover:bg-destructive/90"
                              onClick={() => handleDeleteUser(user.id, user.name)}
                            >
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                    {user.id === currentUser?.id && (
                      <Badge variant="outline" className="text-[10px]">Você</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Permissions Info */}
      <Card>
        <CardHeader className="p-3 md:p-4">
          <CardTitle className="text-sm md:text-base">Permissões por Tipo</CardTitle>
        </CardHeader>
        <CardContent className="p-3 md:p-4 pt-0">
          <div className="space-y-3 text-xs md:text-sm">
            <div className="flex items-start gap-2">
              <Shield className="h-4 w-4 text-primary mt-0.5" />
              <div>
                <p className="font-medium">Gestor</p>
                <p className="text-muted-foreground text-[10px] md:text-xs">
                  Acesso total: dashboard, clientes, empréstimos, agentes, relatórios, configurações
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <UserCheck className="h-4 w-4 text-accent mt-0.5" />
              <div>
                <p className="font-medium">Agente</p>
                <p className="text-muted-foreground text-[10px] md:text-xs">
                  Clientes, empréstimos, cobranças, pagamentos, pedidos de crédito
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <User className="h-4 w-4 text-secondary mt-0.5" />
              <div>
                <p className="font-medium">Cliente</p>
                <p className="text-muted-foreground text-[10px] md:text-xs">
                  Conta pessoal, histórico, pedidos de crédito
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManagementModule;