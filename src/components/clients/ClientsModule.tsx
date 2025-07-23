
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
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {user?.role === 'gestor' ? 'Gestão de Clientes' : 'Meus Clientes'}
          </h1>
          <p className="text-muted-foreground">
            Gerencie informações e histórico dos clientes
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Novo Cliente
        </Button>
      </div>

      <Tabs defaultValue="list" className="space-y-6">
        <TabsList>
          <TabsTrigger value="list">Lista de Clientes</TabsTrigger>
          <TabsTrigger value="add">Adicionar Cliente</TabsTrigger>
          <TabsTrigger value="import">Importar Dados</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Clientes Cadastrados
                </CardTitle>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Search className="h-4 w-4" />
                    <Input
                      placeholder="Pesquisar cliente..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-64"
                    />
                  </div>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-40">
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
            <CardContent>
              <div className="space-y-4">
                {filteredClients.map((client) => (
                  <div key={client.id} className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">{client.name}</h3>
                        <p className="text-sm text-muted-foreground">{client.email}</p>
                        <p className="text-sm text-muted-foreground">{client.phone}</p>
                      </div>
                      <div className="text-right space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            client.status === 'ativo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {client.status}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            Score: {client.creditScore}
                          </span>
                        </div>
                        <div className="text-sm">
                          <span>Empréstimos: {client.totalLoans}</span>
                          <span className="ml-4">Dívida: {client.totalDebt.toLocaleString()} MZN</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" size="sm">
                        <FileText className="mr-1 h-3 w-3" />
                        Ver Perfil
                      </Button>
                      <Button variant="outline" size="sm">
                        <CreditCard className="mr-1 h-3 w-3" />
                        Histórico
                      </Button>
                      <Button variant="outline" size="sm">
                        <Plus className="mr-1 h-3 w-3" />
                        Novo Empréstimo
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="add">
          <Card>
            <CardHeader>
              <CardTitle>Cadastrar Novo Cliente</CardTitle>
              <CardDescription>
                Preencha os dados completos do cliente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome Completo</Label>
                    <Input id="name" placeholder="Nome do cliente" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="email@exemplo.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <Input id="phone" placeholder="+258 84 000 0000" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="document">Documento (BI)</Label>
                    <Input id="document" placeholder="Número do BI" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Endereço</Label>
                    <Input id="address" placeholder="Endereço completo" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="occupation">Profissão</Label>
                    <Input id="occupation" placeholder="Profissão do cliente" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="income">Renda Mensal</Label>
                    <Input id="income" type="number" placeholder="Renda em MZN" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zone">Zona de Atendimento</Label>
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
            <CardHeader>
              <CardTitle>Importar Dados de Clientes</CardTitle>
              <CardDescription>
                Faça upload de uma planilha Excel com dados dos clientes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <FileText className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-sm text-gray-600">
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
