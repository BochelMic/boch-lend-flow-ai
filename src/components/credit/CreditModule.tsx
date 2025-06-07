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
  Trash,
  MessageSquare,
  Calculator,
  DollarSign,
  Calendar,
  FileText,
  Download
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useToast } from '@/hooks/use-toast';

const CreditDashboard = () => {
  const { toast } = useToast();
  const [selectedClient, setSelectedClient] = useState(null);
  const [clients, setClients] = useState([
    { id: 1, name: "António Silva", classification: "Fiel", score: 850, lastOp: "15/03/2024", phone: "84123456", email: "antonio@email.com", balance: 25000, status: "Ativo" },
    { id: 2, name: "Beatriz Costa", classification: "Fiel", score: 780, lastOp: "10/03/2024", phone: "87654321", email: "beatriz@email.com", balance: 15000, status: "Ativo" },
    { id: 3, name: "Carlos Mussa", classification: "Não Fiel", score: 520, lastOp: "02/02/2024", phone: "85987654", email: "carlos@email.com", balance: 0, status: "Inadimplente" },
  ]);

  const [loans, setLoans] = useState([
    { id: 1, clientId: 1, amount: 50000, interestRate: 15, term: 12, monthlyPayment: 4500, remainingBalance: 25000, nextPayment: "15/07/2024", status: "Ativo", daysOverdue: 0 },
    { id: 2, clientId: 2, amount: 30000, interestRate: 18, term: 6, monthlyPayment: 5500, remainingBalance: 15000, nextPayment: "10/07/2024", status: "Ativo", daysOverdue: 0 },
    { id: 3, clientId: 3, amount: 20000, interestRate: 20, term: 12, monthlyPayment: 1850, remainingBalance: 18500, nextPayment: "02/06/2024", status: "Vencido", daysOverdue: 35 }
  ]);

  const [pendingAnalysis, setPendingAnalysis] = useState([
    { id: 1, name: "Ana Sita", amount: "MZN 25,000", score: 720, risk: "Baixo", status: "Pendente" },
    { id: 2, name: "João Mussa", amount: "MZN 15,000", score: 650, risk: "Médio", status: "Pendente" },
    { id: 3, name: "Maria Silva", amount: "MZN 30,000", score: 780, risk: "Baixo", status: "Pendente" },
  ]);

  const [loanForm, setLoanForm] = useState({
    clientId: '',
    amount: '',
    interestRate: '',
    term: '',
    purpose: '',
    collateral: ''
  });

  const [paymentForm, setPaymentForm] = useState({
    loanId: '',
    amount: '',
    paymentDate: '',
    paymentMethod: '',
    reference: ''
  });

  const [searchTerm, setSearchTerm] = useState('');

  const calculateDefaultInterest = (principal, daysOverdue, defaultRate = 2) => {
    return (principal * (defaultRate / 100) * daysOverdue) / 30;
  };

  const calculateFixedInstallment = (principal, annualRate, termMonths) => {
    const monthlyRate = annualRate / 100 / 12;
    if (monthlyRate === 0) return principal / termMonths;
    return principal * (monthlyRate * Math.pow(1 + monthlyRate, termMonths)) / (Math.pow(1 + monthlyRate, termMonths) - 1);
  };

  const handleCreateLoan = () => {
    if (!loanForm.clientId || !loanForm.amount || !loanForm.interestRate || !loanForm.term) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    const monthlyPayment = calculateFixedInstallment(
      parseFloat(loanForm.amount),
      parseFloat(loanForm.interestRate),
      parseInt(loanForm.term)
    );

    const newLoan = {
      id: loans.length + 1,
      clientId: parseInt(loanForm.clientId),
      amount: parseFloat(loanForm.amount),
      interestRate: parseFloat(loanForm.interestRate),
      term: parseInt(loanForm.term),
      monthlyPayment: Math.round(monthlyPayment),
      remainingBalance: parseFloat(loanForm.amount),
      nextPayment: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR'),
      status: "Ativo",
      daysOverdue: 0
    };

    setLoans([...loans, newLoan]);
    setLoanForm({ clientId: '', amount: '', interestRate: '', term: '', purpose: '', collateral: '' });
    
    toast({
      title: "Empréstimo Criado",
      description: `Empréstimo de MZN ${loanForm.amount} criado com prestação de MZN ${Math.round(monthlyPayment)}.`,
    });
  };

  const handlePayment = () => {
    if (!paymentForm.loanId || !paymentForm.amount) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    setLoans(prev => prev.map(loan => 
      loan.id === parseInt(paymentForm.loanId) 
        ? { ...loan, remainingBalance: loan.remainingBalance - parseFloat(paymentForm.amount) }
        : loan
    ));

    setPaymentForm({ loanId: '', amount: '', paymentDate: '', paymentMethod: '', reference: '' });
    
    toast({
      title: "Pagamento Registrado",
      description: `Pagamento de MZN ${paymentForm.amount} registrado com sucesso.`,
    });
  };

  const generateAmortizationTable = (principal, annualRate, termMonths) => {
    const monthlyRate = annualRate / 100 / 12;
    const monthlyPayment = calculateFixedInstallment(principal, annualRate, termMonths);
    const table = [];
    let balance = principal;

    for (let month = 1; month <= termMonths; month++) {
      const interest = balance * monthlyRate;
      const principalPayment = monthlyPayment - interest;
      balance -= principalPayment;

      table.push({
        month,
        payment: monthlyPayment,
        interest: interest,
        principal: principalPayment,
        balance: Math.max(0, balance)
      });
    }

    return table;
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

  const handleSendSMSReminder = (clientName: string, amount: string, type: string) => {
    toast({
      title: "SMS Enviado",
      description: `Lembrete por SMS enviado para ${clientName} sobre ${type} de ${amount}.`,
    });
  };

  const handleCallClient = (clientName: string, reason: string) => {
    toast({
      title: "Chamada Iniciada",
      description: `Ligação para ${clientName} - ${reason}.`,
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
          <TabsTrigger value="loans">Empréstimos</TabsTrigger>
          <TabsTrigger value="payments">Pagamentos</TabsTrigger>
          <TabsTrigger value="clients">Clientes</TabsTrigger>
          <TabsTrigger value="collection">Cobrança</TabsTrigger>
          <TabsTrigger value="reports">Relatórios</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Carteira Total</p>
                    <p className="text-2xl font-bold">MZN 58.5K</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Empréstimos Ativos</p>
                    <p className="text-2xl font-bold">23</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Em Atraso</p>
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
                    <p className="text-sm font-medium text-gray-600">Taxa Inadimplência</p>
                    <p className="text-2xl font-bold">13%</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Empréstimos Vencidos</CardTitle>
                <CardDescription>Clientes com pagamentos em atraso</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {loans.filter(loan => loan.daysOverdue > 0).map((loan) => {
                    const client = clients.find(c => c.id === loan.clientId);
                    const defaultInterest = calculateDefaultInterest(loan.remainingBalance, loan.daysOverdue);
                    return (
                      <div key={loan.id} className="flex items-center justify-between p-3 border rounded-lg bg-red-50">
                        <div>
                          <p className="font-medium">{client?.name}</p>
                          <p className="text-sm text-gray-600">{loan.daysOverdue} dias em atraso</p>
                          <p className="text-sm text-red-600">Juros de mora: MZN {defaultInterest.toFixed(2)}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">MZN {loan.remainingBalance.toLocaleString()}</p>
                          <p className="text-sm text-gray-600">Prestação: MZN {loan.monthlyPayment}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pagamentos Hoje</CardTitle>
                <CardDescription>Clientes com vencimento hoje</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {loans.filter(loan => loan.status === "Ativo").slice(0, 3).map((loan) => {
                    const client = clients.find(c => c.id === loan.clientId);
                    return (
                      <div key={loan.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{client?.name}</p>
                          <p className="text-sm text-gray-600">Vence: {loan.nextPayment}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">MZN {loan.monthlyPayment}</p>
                          <Button size="sm" onClick={() => toast({ title: "Lembrete Enviado", description: `SMS enviado para ${client?.name}` })}>
                            <MessageSquare className="h-3 w-3 mr-1" />
                            SMS
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="loans" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Novo Empréstimo</CardTitle>
                <CardDescription>Criar novo empréstimo com parcelas fixas</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="clientSelect">Cliente</Label>
                  <Select onValueChange={(value) => setLoanForm({...loanForm, clientId: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map(client => (
                        <SelectItem key={client.id} value={client.id.toString()}>{client.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="loanAmount">Valor (MZN)</Label>
                    <Input 
                      id="loanAmount"
                      type="number"
                      value={loanForm.amount}
                      onChange={(e) => setLoanForm({...loanForm, amount: e.target.value})}
                      placeholder="Ex: 50000"
                    />
                  </div>
                  <div>
                    <Label htmlFor="interestRate">Taxa de Juros (% a.a.)</Label>
                    <Input 
                      id="interestRate"
                      type="number"
                      step="0.1"
                      value={loanForm.interestRate}
                      onChange={(e) => setLoanForm({...loanForm, interestRate: e.target.value})}
                      placeholder="Ex: 15"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="loanTerm">Prazo (meses)</Label>
                  <Input 
                    id="loanTerm"
                    type="number"
                    value={loanForm.term}
                    onChange={(e) => setLoanForm({...loanForm, term: e.target.value})}
                    placeholder="Ex: 12"
                  />
                </div>

                {loanForm.amount && loanForm.interestRate && loanForm.term && (
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="font-medium">Prestação Fixa Calculada:</p>
                    <p className="text-lg font-bold text-blue-600">
                      MZN {calculateFixedInstallment(
                        parseFloat(loanForm.amount),
                        parseFloat(loanForm.interestRate),
                        parseInt(loanForm.term)
                      ).toFixed(2)}
                    </p>
                  </div>
                )}

                <Button onClick={handleCreateLoan} className="w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  Criar Empréstimo
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tabela de Amortização</CardTitle>
                <CardDescription>Visualize o cronograma de pagamentos</CardDescription>
              </CardHeader>
              <CardContent>
                {loanForm.amount && loanForm.interestRate && loanForm.term ? (
                  <div className="max-h-96 overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Mês</th>
                          <th className="text-left p-2">Prestação</th>
                          <th className="text-left p-2">Juros</th>
                          <th className="text-left p-2">Principal</th>
                          <th className="text-left p-2">Saldo</th>
                        </tr>
                      </thead>
                      <tbody>
                        {generateAmortizationTable(
                          parseFloat(loanForm.amount),
                          parseFloat(loanForm.interestRate),
                          parseInt(loanForm.term)
                        ).map((row, index) => (
                          <tr key={index} className="border-b">
                            <td className="p-2">{row.month}</td>
                            <td className="p-2">{row.payment.toFixed(2)}</td>
                            <td className="p-2">{row.interest.toFixed(2)}</td>
                            <td className="p-2">{row.principal.toFixed(2)}</td>
                            <td className="p-2">{row.balance.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-500">Preencha os dados do empréstimo para ver a tabela</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="payments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Registrar Pagamento</CardTitle>
              <CardDescription>Registre pagamentos de empréstimos</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="paymentLoan">Empréstimo</Label>
                  <Select onValueChange={(value) => setPaymentForm({...paymentForm, loanId: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o empréstimo" />
                    </SelectTrigger>
                    <SelectContent>
                      {loans.map(loan => {
                        const client = clients.find(c => c.id === loan.clientId);
                        return (
                          <SelectItem key={loan.id} value={loan.id.toString()}>
                            {client?.name} - MZN {loan.remainingBalance.toLocaleString()}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="paymentAmount">Valor do Pagamento (MZN)</Label>
                  <Input 
                    id="paymentAmount"
                    type="number"
                    value={paymentForm.amount}
                    onChange={(e) => setPaymentForm({...paymentForm, amount: e.target.value})}
                    placeholder="Ex: 4500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="paymentMethod">Método de Pagamento</Label>
                  <Select onValueChange={(value) => setPaymentForm({...paymentForm, paymentMethod: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o método" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Dinheiro</SelectItem>
                      <SelectItem value="transfer">Transferência</SelectItem>
                      <SelectItem value="mpesa">M-Pesa</SelectItem>
                      <SelectItem value="emola">E-Mola</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="paymentReference">Referência</Label>
                  <Input 
                    id="paymentReference"
                    value={paymentForm.reference}
                    onChange={(e) => setPaymentForm({...paymentForm, reference: e.target.value})}
                    placeholder="Ex: TXN123456"
                  />
                </div>
              </div>

              <Button onClick={handlePayment} className="w-full">
                <Save className="mr-2 h-4 w-4" />
                Registrar Pagamento
              </Button>
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
                        placeholder="Ex: João Silva"
                      />
                    </div>
                    <div>
                      <Label htmlFor="clientPhone">Telefone</Label>
                      <Input 
                        id="clientPhone"
                        placeholder="Ex: 84123456"
                      />
                    </div>
                    <div>
                      <Label htmlFor="clientEmail">Email</Label>
                      <Input 
                        id="clientEmail"
                        type="email"
                        placeholder="Ex: joao@email.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="clientIncome">Renda Mensal (MZN)</Label>
                      <Input 
                        id="clientIncome"
                        type="number"
                        placeholder="Ex: 15000"
                      />
                    </div>
                  </div>
                  <Button className="mt-4">
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

        <TabsContent value="collection" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Sistema de Cobrança</CardTitle>
              <CardDescription>
                Alertas e lembretes de pagamento por SMS e telefone
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <h3 className="font-semibold text-red-800 mb-2">Vencidos</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="font-medium">João Silva - Venceu há 5 dias</span>
                        <p className="text-sm text-gray-600">Tel: 84123456</p>
                      </div>
                      <span className="font-bold">MZN 15,000</span>
                      <div className="flex space-x-1">
                        <Button 
                          size="sm" 
                          variant="destructive" 
                          onClick={() => handleCallClient('João Silva', 'cobrança urgente')}
                        >
                          <Phone className="h-3 w-3 mr-1" />
                          Ligar
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleSendSMSReminder('João Silva', 'MZN 15,000', 'pagamento vencido')}
                        >
                          <MessageSquare className="h-3 w-3 mr-1" />
                          SMS
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h3 className="font-semibold text-yellow-800 mb-2">Vencem Hoje</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="font-medium">Maria Santos - Vence hoje</span>
                        <p className="text-sm text-gray-600">Tel: 87654321</p>
                      </div>
                      <span className="font-bold">MZN 8,500</span>
                      <div className="flex space-x-1">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleCallClient('Maria Santos', 'lembrete de vencimento')}
                        >
                          <Phone className="h-3 w-3 mr-1" />
                          Ligar
                        </Button>
                        <Button 
                          size="sm" 
                          onClick={() => handleSendSMSReminder('Maria Santos', 'MZN 8,500', 'vencimento hoje')}
                        >
                          <MessageSquare className="h-3 w-3 mr-1" />
                          SMS
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h3 className="font-semibold text-blue-800 mb-2">Vencem em 3 dias</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="font-medium">Ana Costa - Vence em 3 dias</span>
                        <p className="text-sm text-gray-600">Tel: 85987654</p>
                      </div>
                      <span className="font-bold">MZN 12,000</span>
                      <div className="flex space-x-1">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleCallClient('Ana Costa', 'pré-aviso de vencimento')}
                        >
                          <Phone className="h-3 w-3 mr-1" />
                          Ligar
                        </Button>
                        <Button 
                          size="sm" 
                          onClick={() => handleSendSMSReminder('Ana Costa', 'MZN 12,000', 'pré-aviso (3 dias)')}
                        >
                          <MessageSquare className="h-3 w-3 mr-1" />
                          SMS
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h3 className="font-semibold text-green-800 mb-2">Configurações de SMS</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="smsProvider">Provedor SMS</Label>
                      <Input id="smsProvider" placeholder="Ex: Vodacom, Tmcel" />
                    </div>
                    <div>
                      <Label htmlFor="smsTemplate">Modelo de SMS</Label>
                      <Textarea 
                        id="smsTemplate" 
                        placeholder="Olá {nome}, seu pagamento de {valor} vence {data}..."
                        className="min-h-[80px]"
                      />
                    </div>
                  </div>
                  <Button className="mt-4" onClick={() => toast({ title: "Configurações Salvas", description: "Configurações de SMS foram atualizadas." })}>
                    <Save className="mr-2 h-4 w-4" />
                    Salvar Configurações
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Relatório de Carteira</CardTitle>
                <CardDescription>Análise completa da carteira de crédito</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">
                  <Download className="mr-2 h-4 w-4" />
                  Gerar Relatório
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Relatório de Inadimplência</CardTitle>
                <CardDescription>Análise de clientes em atraso</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">
                  <Download className="mr-2 h-4 w-4" />
                  Gerar Relatório
                </Button>
              </CardContent>
            </Card>
          </div>
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
