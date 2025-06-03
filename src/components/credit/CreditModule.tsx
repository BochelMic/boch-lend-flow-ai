import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { 
  CreditCard, 
  Users, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Search,
  Plus,
  Eye,
  Phone,
  Mail,
  Save,
  Edit,
  Trash
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { toast } from '../ui/use-toast';

const CreditDashboard = () => {
  const [selectedClient, setSelectedClient] = useState(null);
  const [clients, setClients] = useState([
    { id: 1, name: "António Silva", classification: "Fiel", score: 850, lastOp: "15/03/2024", phone: "84123456", email: "antonio@email.com" },
    { id: 2, name: "Beatriz Costa", classification: "Fiel", score: 780, lastOp: "10/03/2024", phone: "87654321", email: "beatriz@email.com" },
    { id: 3, name: "Carlos Mussa", classification: "Não Fiel", score: 520, lastOp: "02/02/2024", phone: "85987654", email: "carlos@email.com" },
  ]);

  const [pendingAnalysis, setPendingAnalysis] = useState([
    { id: 1, name: "Ana Sita", amount: "MZN 25,000", score: 720, risk: "Baixo", status: "Pendente" },
    { id: 2, name: "João Mussa", amount: "MZN 15,000", score: 650, risk: "Médio", status: "Pendente" },
    { id: 3, name: "Maria Silva", amount: "MZN 30,000", score: 780, risk: "Baixo", status: "Pendente" },
  ]);

  const [analysisForm, setAnalysisForm] = useState({
    income: '',
    expenses: '',
    collateral: '',
    requested: '',
    description: ''
  });

  const [newClient, setNewClient] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    income: ''
  });

  const [searchTerm, setSearchTerm] = useState('');

  const handleApproveCredit = (clientId: number) => {
    setPendingAnalysis(prev => prev.map(client => 
      client.id === clientId ? { ...client, status: 'Aprovado' } : client
    ));
    toast({
      title: "Crédito Aprovado",
      description: "O crédito foi aprovado com sucesso.",
    });
  };

  const handleRejectCredit = (clientId: number) => {
    setPendingAnalysis(prev => prev.map(client => 
      client.id === clientId ? { ...client, status: 'Rejeitado' } : client
    ));
    toast({
      title: "Crédito Rejeitado",
      description: "O crédito foi rejeitado.",
      variant: "destructive"
    });
  };

  const handleAnalyzeCredit = () => {
    const { income, expenses, collateral, requested } = analysisForm;
    
    if (!income || !expenses || !collateral || !requested) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    const incomeNum = parseFloat(income);
    const expensesNum = parseFloat(expenses);
    const collateralNum = parseFloat(collateral);
    const requestedNum = parseFloat(requested);

    const paymentCapacity = ((incomeNum - expensesNum) / incomeNum) * 100;
    const collateralRatio = (collateralNum / requestedNum) * 100;

    toast({
      title: "Análise Concluída",
      description: `Capacidade: ${paymentCapacity.toFixed(1)}% | Garantia: ${collateralRatio.toFixed(1)}%`,
    });
  };

  const handleAddClient = () => {
    if (!newClient.name || !newClient.phone || !newClient.email) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    const client = {
      id: clients.length + 1,
      name: newClient.name,
      classification: "Novo",
      score: 600,
      lastOp: "Novo",
      phone: newClient.phone,
      email: newClient.email
    };

    setClients([...clients, client]);
    setNewClient({ name: '', phone: '', email: '', address: '', income: '' });
    
    toast({
      title: "Cliente Adicionado",
      description: `${newClient.name} foi cadastrado com sucesso.`,
    });
  };

  const handleContactClient = (clientName: string, method: string) => {
    toast({
      title: `Contato por ${method}`,
      description: `Iniciando contato com ${clientName} via ${method}.`,
    });
  };

  const handleViewClientDetails = (clientId: number) => {
    const client = clients.find(c => c.id === clientId);
    setSelectedClient(client);
    toast({
      title: "Detalhes do Cliente",
      description: `Visualizando informações de ${client?.name}.`,
    });
  };

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Crédito e Risco</h1>
        <Button onClick={() => toast({ title: "Nova Análise", description: "Iniciando nova análise de crédito." })}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Análise
        </Button>
      </div>

      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="clients">Clientes</TabsTrigger>
          <TabsTrigger value="analysis">Análise</TabsTrigger>
          <TabsTrigger value="collection">Cobrança</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pedidos Pendentes</p>
                    <p className="text-2xl font-bold">23</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Aprovados Hoje</p>
                    <p className="text-2xl font-bold">8</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Rejeitados</p>
                    <p className="text-2xl font-bold">3</p>
                  </div>
                  <XCircle className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Taxa Aprovação</p>
                    <p className="text-2xl font-bold">73%</p>
                  </div>
                  <CreditCard className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Análise de Crédito Pendente</CardTitle>
              <CardDescription>
                Pedidos aguardando análise e aprovação
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pendingAnalysis.map((client) => (
                  <div key={client.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">{client.name}</p>
                      <p className="text-sm text-gray-600">Score: {client.score} | Risco: {client.risk}</p>
                    </div>
                    <div className="text-right mr-4">
                      <p className="font-bold">{client.amount}</p>
                      <span className={`px-2 py-1 rounded text-xs ${
                        client.status === 'Aprovado' ? 'bg-green-100 text-green-800' :
                        client.status === 'Rejeitado' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {client.status}
                      </span>
                    </div>
                    <div className="space-x-2">
                      <Button size="sm" variant="outline" onClick={() => handleViewClientDetails(client.id)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      {client.status === 'Pendente' && (
                        <>
                          <Button size="sm" onClick={() => handleApproveCredit(client.id)}>
                            Aprovar
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleRejectCredit(client.id)}>
                            Rejeitar
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clients" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Cadastro de Clientes</CardTitle>
              <CardDescription>
                Gestão e classificação de clientes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="border rounded-lg p-4 bg-gray-50">
                  <h3 className="font-semibold mb-4">Novo Cliente</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="clientName">Nome Completo</Label>
                      <Input 
                        id="clientName"
                        value={newClient.name}
                        onChange={(e) => setNewClient({...newClient, name: e.target.value})}
                        placeholder="Ex: João Silva"
                      />
                    </div>
                    <div>
                      <Label htmlFor="clientPhone">Telefone</Label>
                      <Input 
                        id="clientPhone"
                        value={newClient.phone}
                        onChange={(e) => setNewClient({...newClient, phone: e.target.value})}
                        placeholder="Ex: 84123456"
                      />
                    </div>
                    <div>
                      <Label htmlFor="clientEmail">Email</Label>
                      <Input 
                        id="clientEmail"
                        type="email"
                        value={newClient.email}
                        onChange={(e) => setNewClient({...newClient, email: e.target.value})}
                        placeholder="Ex: joao@email.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="clientIncome">Renda Mensal (MZN)</Label>
                      <Input 
                        id="clientIncome"
                        type="number"
                        value={newClient.income}
                        onChange={(e) => setNewClient({...newClient, income: e.target.value})}
                        placeholder="Ex: 15000"
                      />
                    </div>
                  </div>
                  <Button onClick={handleAddClient} className="mt-4">
                    <Plus className="mr-2 h-4 w-4" />
                    Cadastrar Cliente
                  </Button>
                </div>

                <div className="flex justify-between mb-4">
                  <div className="flex space-x-2">
                    <Input 
                      placeholder="Buscar cliente..." 
                      className="w-64"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Button variant="outline">
                      <Search className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="grid grid-cols-6 gap-4 p-3 bg-gray-50 rounded font-medium">
                    <span>Nome</span>
                    <span>Classificação</span>
                    <span>Score</span>
                    <span>Última Operação</span>
                    <span>Contato</span>
                    <span>Ações</span>
                  </div>
                  {filteredClients.map((client) => (
                    <div key={client.id} className="grid grid-cols-6 gap-4 p-3 border-b items-center">
                      <span>{client.name}</span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        client.classification === 'Fiel' 
                          ? 'bg-green-100 text-green-800' 
                          : client.classification === 'Não Fiel'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {client.classification}
                      </span>
                      <span>{client.score}</span>
                      <span>{client.lastOp}</span>
                      <div className="flex space-x-1">
                        <Button size="sm" variant="outline" onClick={() => handleContactClient(client.name, 'telefone')}>
                          <Phone className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleContactClient(client.name, 'email')}>
                          <Mail className="h-3 w-3" />
                        </Button>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => handleViewClientDetails(client.id)}>
                        Ver Detalhes
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Análise de Capacidade Financeira</CardTitle>
              <CardDescription>
                Avaliação detalhada do cliente para concessão de crédito
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleAnalyzeCredit(); }}>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="income">Renda Mensal (MZN)</Label>
                    <Input 
                      id="income" 
                      type="number"
                      value={analysisForm.income}
                      onChange={(e) => setAnalysisForm({...analysisForm, income: e.target.value})}
                      placeholder="Ex: 15000" 
                    />
                  </div>
                  <div>
                    <Label htmlFor="expenses">Despesas Mensais (MZN)</Label>
                    <Input 
                      id="expenses" 
                      type="number"
                      value={analysisForm.expenses}
                      onChange={(e) => setAnalysisForm({...analysisForm, expenses: e.target.value})}
                      placeholder="Ex: 8000" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="collateral">Valor do Penhor (MZN)</Label>
                    <Input 
                      id="collateral" 
                      type="number"
                      value={analysisForm.collateral}
                      onChange={(e) => setAnalysisForm({...analysisForm, collateral: e.target.value})}
                      placeholder="Ex: 50000" 
                    />
                  </div>
                  <div>
                    <Label htmlFor="requested">Valor Solicitado (MZN)</Label>
                    <Input 
                      id="requested" 
                      type="number"
                      value={analysisForm.requested}
                      onChange={(e) => setAnalysisForm({...analysisForm, requested: e.target.value})}
                      placeholder="Ex: 20000" 
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Descrição do Penhor</Label>
                  <Textarea 
                    id="description" 
                    value={analysisForm.description}
                    onChange={(e) => setAnalysisForm({...analysisForm, description: e.target.value})}
                    placeholder="Descreva o bem oferecido como garantia..." 
                  />
                </div>

                <Button type="submit" className="w-full">
                  <Save className="mr-2 h-4 w-4" />
                  Analisar Capacidade
                </Button>

                {analysisForm.income && analysisForm.expenses && (
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h3 className="font-semibold mb-2">Resultado da Análise</h3>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Capacidade de Pagamento</p>
                        <p className="font-bold text-green-600">
                          {(((parseFloat(analysisForm.income) - parseFloat(analysisForm.expenses)) / parseFloat(analysisForm.income)) * 100).toFixed(1)}%
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Risco Calculado</p>
                        <p className="font-bold text-yellow-600">Médio</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Recomendação</p>
                        <p className="font-bold text-green-600">Aprovar</p>
                      </div>
                    </div>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="collection" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Sistema de Cobrança</CardTitle>
              <CardDescription>
                Alertas e lembretes de pagamento
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <h3 className="font-semibold text-red-800 mb-2">Vencidos</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span>João Silva - Venceu há 5 dias</span>
                      <span className="font-bold">MZN 15,000</span>
                      <Button size="sm" variant="destructive" onClick={() => handleContactClient('João Silva', 'cobrança urgente')}>
                        Contactar
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h3 className="font-semibold text-yellow-800 mb-2">Vencem Hoje</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span>Maria Santos - Vence hoje</span>
                      <span className="font-bold">MZN 8,500</span>
                      <Button size="sm" variant="outline" onClick={() => handleContactClient('Maria Santos', 'lembrete de vencimento')}>
                        Lembrar
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h3 className="font-semibold text-blue-800 mb-2">Vencem em 3 dias</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span>Ana Costa - Vence em 3 dias</span>
                      <span className="font-bold">MZN 12,000</span>
                      <Button size="sm" variant="outline" onClick={() => handleContactClient('Ana Costa', 'pré-aviso')}>
                        Pré-aviso
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

const CreditModule = () => {
  return (
    <Routes>
      <Route path="/" element={<CreditDashboard />} />
      <Route path="/*" element={<CreditDashboard />} />
    </Routes>
  );
};

export default CreditModule;
