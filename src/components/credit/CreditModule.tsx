
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
  Download,
  Upload,
  Paperclip
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useToast } from '@/hooks/use-toast';

const CreditDashboard = () => {
  const { toast } = useToast();
  const [selectedClient, setSelectedClient] = useState(null);
  const [clients, setClients] = useState([]);
  const [loans, setLoans] = useState([]);

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
  const [selectedLoanForAmortization, setSelectedLoanForAmortization] = useState(null);
  const [contractFile, setContractFile] = useState(null);

  const calculateFixedInstallment = (principal, annualRate, termMonths) => {
    const monthlyRate = annualRate / 100 / 12;
    if (monthlyRate === 0) return principal / termMonths;
    return principal * (monthlyRate * Math.pow(1 + monthlyRate, termMonths)) / (Math.pow(1 + monthlyRate, termMonths) - 1);
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

  const handleContractUpload = (clientId, file) => {
    setClients(prev => prev.map(client => 
      client.id === clientId 
        ? { ...client, contracts: [...(client.contracts || []), { name: file.name, uploadDate: new Date().toLocaleDateString() }] }
        : client
    ));
    
    toast({
      title: "Contrato Anexado",
      description: `Contrato ${file.name} anexado com sucesso.`,
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
          <TabsTrigger value="amortization">Tabela Amortização</TabsTrigger>
          <TabsTrigger value="payments">Pagamentos</TabsTrigger>
          <TabsTrigger value="clients">Clientes</TabsTrigger>
          <TabsTrigger value="contracts">Contratos</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Carteira Total</p>
                    <p className="text-2xl font-bold">MZN 0</p>
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
                    <p className="text-2xl font-bold">0</p>
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
                    <p className="text-2xl font-bold">0</p>
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
                    <p className="text-2xl font-bold">0%</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="loans" className="space-y-6">
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
        </TabsContent>

        <TabsContent value="amortization" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Tabela de Amortização</CardTitle>
              <CardDescription>Selecione um empréstimo para ver o cronograma detalhado</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="loanSelect">Selecionar Empréstimo</Label>
                <Select onValueChange={(value) => setSelectedLoanForAmortization(loans.find(l => l.id === parseInt(value)))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o empréstimo" />
                  </SelectTrigger>
                  <SelectContent>
                    {loans.map(loan => {
                      const client = clients.find(c => c.id === loan.clientId);
                      return (
                        <SelectItem key={loan.id} value={loan.id.toString()}>
                          {client?.name} - MZN {loan.amount.toLocaleString()} - {loan.term} meses
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              {selectedLoanForAmortization && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-600">Valor Empréstimo</p>
                      <p className="font-bold">MZN {selectedLoanForAmortization.amount.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Taxa de Juros</p>
                      <p className="font-bold">{selectedLoanForAmortization.interestRate}% a.a.</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Prazo</p>
                      <p className="font-bold">{selectedLoanForAmortization.term} meses</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Prestação</p>
                      <p className="font-bold">MZN {selectedLoanForAmortization.monthlyPayment.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="max-h-96 overflow-y-auto border rounded-lg">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th className="text-left p-3 font-medium">Mês</th>
                          <th className="text-left p-3 font-medium">Prestação</th>
                          <th className="text-left p-3 font-medium">Juros</th>
                          <th className="text-left p-3 font-medium">Principal</th>
                          <th className="text-left p-3 font-medium">Saldo Devedor</th>
                        </tr>
                      </thead>
                      <tbody>
                        {generateAmortizationTable(
                          selectedLoanForAmortization.amount,
                          selectedLoanForAmortization.interestRate,
                          selectedLoanForAmortization.term
                        ).map((row, index) => (
                          <tr key={index} className="border-b hover:bg-gray-50">
                            <td className="p-3">{row.month}</td>
                            <td className="p-3">MZN {row.payment.toFixed(2)}</td>
                            <td className="p-3">MZN {row.interest.toFixed(2)}</td>
                            <td className="p-3">MZN {row.principal.toFixed(2)}</td>
                            <td className="p-3">MZN {row.balance.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <Button onClick={() => toast({ title: "Tabela Exportada", description: "Tabela de amortização exportada com sucesso." })}>
                    <Download className="mr-2 h-4 w-4" />
                    Exportar Tabela
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
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
              <CardTitle>Gestão de Clientes</CardTitle>
              <CardDescription>Cadastro e gestão de clientes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
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
                    <span>Status</span>
                    <span>Contato</span>
                    <span>Ações</span>
                  </div>
                  {filteredClients.map((client) => (
                    <div key={client.id} className="grid grid-cols-6 gap-4 p-3 border-b items-center">
                      <span>{client.name}</span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        client.classification === 'Fiel' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {client.classification}
                      </span>
                      <span>{client.score}</span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        client.status === 'Ativo' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {client.status}
                      </span>
                      <div className="flex space-x-1">
                        <Button size="sm" variant="outline">
                          <Phone className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Mail className="h-3 w-3" />
                        </Button>
                      </div>
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4 mr-1" />
                        Ver
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contracts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Gestão de Contratos</CardTitle>
              <CardDescription>Anexar e gerenciar contratos de clientes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="border rounded-lg p-4 bg-gray-50">
                  <h3 className="font-semibold mb-4">Anexar Novo Contrato</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="contractClient">Cliente</Label>
                      <Select>
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
                    <div>
                      <Label htmlFor="contractFile">Arquivo do Contrato</Label>
                      <div className="flex space-x-2">
                        <Input 
                          id="contractFile"
                          type="file"
                          accept=".pdf,.doc,.docx"
                          onChange={(e) => setContractFile(e.target.files[0])}
                        />
                        <Button 
                          onClick={() => {
                            if (contractFile) {
                              handleContractUpload(1, contractFile);
                              setContractFile(null);
                            }
                          }}
                        >
                          <Upload className="h-4 w-4 mr-1" />
                          Anexar
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold">Contratos por Cliente</h3>
                  {clients.map(client => (
                    <div key={client.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium">{client.name}</h4>
                        <span className="text-sm text-gray-600">
                          {client.contracts?.length || 0} contrato(s)
                        </span>
                      </div>
                      {client.contracts && client.contracts.length > 0 ? (
                        <div className="space-y-2">
                          {client.contracts.map((contract, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                              <div className="flex items-center">
                                <Paperclip className="h-4 w-4 mr-2 text-gray-600" />
                                <span className="text-sm">{contract.name}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className="text-xs text-gray-500">{contract.uploadDate}</span>
                                <Button size="sm" variant="outline">
                                  <Download className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">Nenhum contrato anexado</p>
                      )}
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

const CreditModule = () => {
  return (
    <Routes>
      <Route path="/" element={<CreditDashboard />} />
      <Route path="/*" element={<CreditDashboard />} />
    </Routes>
  );
};

export default CreditModule;
