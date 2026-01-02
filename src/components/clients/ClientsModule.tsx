
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Plus, Search, FileText, CreditCard, AlertCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const ClientsModule = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const [clients, setClients] = useState([]);

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.email.toLowerCase().includes(searchTerm.toLowerCase());
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
        <Button className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Novo Cliente
        </Button>
      </div>

      <Tabs defaultValue="list" className="space-y-4 md:space-y-6">
        <TabsList className="w-full grid grid-cols-3">
          <TabsTrigger value="list" className="text-xs md:text-sm">Lista</TabsTrigger>
          <TabsTrigger value="add" className="text-xs md:text-sm">Adicionar</TabsTrigger>
          <TabsTrigger value="import" className="text-xs md:text-sm">Importar</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          <Card>
            <CardHeader className="p-4 md:p-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                  <Users className="h-4 w-4 md:h-5 md:w-5" />
                  Clientes Cadastrados
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
                      <SelectItem value="ativo">Ativo</SelectItem>
                      <SelectItem value="inativo">Inativo</SelectItem>
                      <SelectItem value="bloqueado">Bloqueado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-0">
              <div className="space-y-3">
                {filteredClients.length === 0 ? (
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
                          <p className="text-sm text-muted-foreground truncate">{client.email}</p>
                          <p className="text-sm text-muted-foreground">{client.phone}</p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            client.status === 'ativo' ? 'bg-success/20 text-success' : 'bg-destructive/20 text-destructive'
                          }`}>
                            {client.status}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            Score: {client.creditScore}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button variant="outline" size="sm" className="text-xs">
                          <FileText className="mr-1 h-3 w-3" />
                          Perfil
                        </Button>
                        <Button variant="outline" size="sm" className="text-xs">
                          <CreditCard className="mr-1 h-3 w-3" />
                          Histórico
                        </Button>
                        <Button variant="outline" size="sm" className="text-xs">
                          <Plus className="mr-1 h-3 w-3" />
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
              <form className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm">Nome Completo</Label>
                    <Input id="name" placeholder="Nome do cliente" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm">Email</Label>
                    <Input id="email" type="email" placeholder="email@exemplo.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm">Telefone</Label>
                    <Input id="phone" placeholder="+258 84 000 0000" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="document" className="text-sm">Documento (BI)</Label>
                    <Input id="document" placeholder="Número do BI" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address" className="text-sm">Endereço</Label>
                    <Input id="address" placeholder="Endereço completo" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="occupation" className="text-sm">Profissão</Label>
                    <Input id="occupation" placeholder="Profissão do cliente" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="income" className="text-sm">Renda Mensal</Label>
                    <Input id="income" type="number" placeholder="Renda em MZN" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zone" className="text-sm">Zona de Atendimento</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecionar zona" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="maputo">Maputo Cidade</SelectItem>
                        <SelectItem value="matola">Matola</SelectItem>
                        <SelectItem value="boane">Boane</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button type="submit" className="w-full">
                  Cadastrar Cliente
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="import">
          <Card>
            <CardHeader className="p-4 md:p-6">
              <CardTitle className="text-base md:text-lg">Importar Dados de Clientes</CardTitle>
              <CardDescription className="text-xs md:text-sm">
                Faça upload de uma planilha Excel com dados dos clientes
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-0">
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                <FileText className="mx-auto h-10 w-10 md:h-12 md:w-12 text-muted-foreground" />
                <p className="mt-2 text-xs md:text-sm text-muted-foreground">
                  Arraste um arquivo Excel aqui ou clique para selecionar
                </p>
                <Button variant="outline" className="mt-4">
                  Selecionar Arquivo
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClientsModule;
