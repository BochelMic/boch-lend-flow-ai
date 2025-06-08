
import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  Wallet, 
  CreditCard,
  Smartphone,
  Bell,
  CheckCircle,
  AlertCircle,
  Download,
  Plus
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const BalanceDashboard = () => {
  const { toast } = useToast();
  const [currentBalance, setCurrentBalance] = useState(125000);
  const [transactions, setTransactions] = useState([
    { id: 1, type: 'entrada', amount: 50000, description: 'Depósito via M-Pesa', date: '15/06/2024', reference: 'MP123456', status: 'Concluído' },
    { id: 2, type: 'saida', amount: 25000, description: 'Empréstimo para João Silva', date: '14/06/2024', reference: 'EMP001', status: 'Concluído' },
    { id: 3, type: 'entrada', amount: 15000, description: 'Pagamento de empréstimo', date: '13/06/2024', reference: 'PAG002', status: 'Concluído' },
    { id: 4, type: 'saida', amount: 5000, description: 'Taxa de operação', date: '12/06/2024', reference: 'TAX001', status: 'Pendente' }
  ]);

  const [transactionForm, setTransactionForm] = useState({
    type: '',
    amount: '',
    description: '',
    method: '',
    reference: ''
  });

  const handleTransaction = () => {
    if (!transactionForm.type || !transactionForm.amount || !transactionForm.description) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    const newTransaction = {
      id: transactions.length + 1,
      type: transactionForm.type,
      amount: parseFloat(transactionForm.amount),
      description: transactionForm.description,
      date: new Date().toLocaleDateString('pt-BR'),
      reference: transactionForm.reference || `REF${Date.now()}`,
      status: 'Concluído'
    };

    setTransactions([newTransaction, ...transactions]);
    
    if (transactionForm.type === 'entrada') {
      setCurrentBalance(prev => prev + parseFloat(transactionForm.amount));
    } else {
      setCurrentBalance(prev => prev - parseFloat(transactionForm.amount));
    }

    setTransactionForm({ type: '', amount: '', description: '', method: '', reference: '' });

    // Notificação automática
    toast({
      title: "Transação Processada",
      description: `${transactionForm.type === 'entrada' ? 'Entrada' : 'Saída'} de MZN ${transactionForm.amount} processada com sucesso.`,
    });

    // Simular notificação IPE
    setTimeout(() => {
      toast({
        title: "Notificação IPE",
        description: `Confirmação recebida da carteira móvel para ${transactionForm.type === 'entrada' ? 'entrada' : 'saída'} de MZN ${transactionForm.amount}.`,
      });
    }, 2000);
  };

  const totalEntradas = transactions
    .filter(t => t.type === 'entrada')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalSaidas = transactions
    .filter(t => t.type === 'saida')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Saldo Disponível</h1>
        <Button onClick={() => toast({ title: "IPE Conectado", description: "Conectado à carteira móvel IPE." })}>
          <Smartphone className="mr-2 h-4 w-4" />
          Conectar IPE
        </Button>
      </div>

      <Tabs defaultValue="saldo" className="w-full">
        <TabsList>
          <TabsTrigger value="saldo">Saldo Atual</TabsTrigger>
          <TabsTrigger value="transacoes">Transações</TabsTrigger>
          <TabsTrigger value="relatorios">Relatórios</TabsTrigger>
          <TabsTrigger value="configuracoes">Configurações</TabsTrigger>
        </TabsList>

        <TabsContent value="saldo" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Saldo Atual</p>
                    <p className="text-3xl font-bold text-green-600">MZN {currentBalance.toLocaleString()}</p>
                  </div>
                  <Wallet className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Entradas</p>
                    <p className="text-2xl font-bold text-blue-600">MZN {totalEntradas.toLocaleString()}</p>
                  </div>
                  <ArrowUp className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Saídas</p>
                    <p className="text-2xl font-bold text-red-600">MZN {totalSaidas.toLocaleString()}</p>
                  </div>
                  <ArrowDown className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Saldo Líquido</p>
                    <p className={`text-2xl font-bold ${(totalEntradas - totalSaidas) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      MZN {(totalEntradas - totalSaidas).toLocaleString()}
                    </p>
                  </div>
                  <ArrowUpDown className="h-8 w-8 text-gray-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Nova Transação</CardTitle>
              <CardDescription>Registrar entrada ou saída de saldo</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="transactionType">Tipo de Transação</Label>
                  <Select onValueChange={(value) => setTransactionForm({...transactionForm, type: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="entrada">Entrada</SelectItem>
                      <SelectItem value="saida">Saída</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="transactionAmount">Valor (MZN)</Label>
                  <Input 
                    id="transactionAmount"
                    type="number"
                    value={transactionForm.amount}
                    onChange={(e) => setTransactionForm({...transactionForm, amount: e.target.value})}
                    placeholder="Ex: 50000"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="transactionDescription">Descrição</Label>
                <Input 
                  id="transactionDescription"
                  value={transactionForm.description}
                  onChange={(e) => setTransactionForm({...transactionForm, description: e.target.value})}
                  placeholder="Ex: Depósito via M-Pesa"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="transactionMethod">Método</Label>
                  <Select onValueChange={(value) => setTransactionForm({...transactionForm, method: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o método" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mpesa">M-Pesa</SelectItem>
                      <SelectItem value="emola">E-Mola</SelectItem>
                      <SelectItem value="transfer">Transferência Bancária</SelectItem>
                      <SelectItem value="cash">Dinheiro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="transactionReference">Referência</Label>
                  <Input 
                    id="transactionReference"
                    value={transactionForm.reference}
                    onChange={(e) => setTransactionForm({...transactionForm, reference: e.target.value})}
                    placeholder="Ex: MP123456"
                  />
                </div>
              </div>

              <Button onClick={handleTransaction} className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Processar Transação
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transacoes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Transações</CardTitle>
              <CardDescription>Todas as movimentações de saldo</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="grid grid-cols-6 gap-4 p-3 bg-gray-50 rounded font-medium">
                  <span>Data</span>
                  <span>Tipo</span>
                  <span>Descrição</span>
                  <span>Valor</span>
                  <span>Referência</span>
                  <span>Status</span>
                </div>
                {transactions.map((transaction) => (
                  <div key={transaction.id} className="grid grid-cols-6 gap-4 p-3 border-b items-center">
                    <span className="text-sm">{transaction.date}</span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      transaction.type === 'entrada' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {transaction.type === 'entrada' ? 'Entrada' : 'Saída'}
                    </span>
                    <span className="text-sm">{transaction.description}</span>
                    <span className={`font-bold ${
                      transaction.type === 'entrada' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'entrada' ? '+' : '-'}MZN {transaction.amount.toLocaleString()}
                    </span>
                    <span className="text-sm text-gray-600">{transaction.reference}</span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      transaction.status === 'Concluído' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {transaction.status}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="relatorios" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Relatório de Movimentações</CardTitle>
                <CardDescription>Exportar histórico de transações</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">
                  <Download className="mr-2 h-4 w-4" />
                  Exportar Relatório
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Conciliação Bancária</CardTitle>
                <CardDescription>Comparar com extratos bancários</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Iniciar Conciliação
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="configuracoes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configurações IPE</CardTitle>
              <CardDescription>Configurar integração com carteira móvel</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="ipeAccount">Conta IPE</Label>
                <Input 
                  id="ipeAccount"
                  placeholder="Ex: 258841234567"
                />
              </div>
              <div>
                <Label htmlFor="ipePin">PIN de Segurança</Label>
                <Input 
                  id="ipePin"
                  type="password"
                  placeholder="PIN de 4 dígitos"
                />
              </div>
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="notifications" />
                <Label htmlFor="notifications">Receber notificações automáticas</Label>
              </div>
              <Button>
                <Bell className="mr-2 h-4 w-4" />
                Salvar Configurações
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

const BalanceModule = () => {
  return (
    <Routes>
      <Route path="/" element={<BalanceDashboard />} />
      <Route path="/*" element={<BalanceDashboard />} />
    </Routes>
  );
};

export default BalanceModule;
