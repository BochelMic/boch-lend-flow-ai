
import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { 
  ArrowUpDown, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  Smartphone, 
  RefreshCw,
  Bell,
  DollarSign,
  CreditCard,
  Activity,
  Zap
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useToast } from '@/hooks/use-toast';

const BalanceModule = () => {
  const { toast } = useToast();
  const [balance, setBalance] = useState({
    available: 485000,
    pending: 25000,
    reserved: 15000
  });

  const [transactions, setTransactions] = useState([
    { id: 1, type: 'Entrada', description: 'Depósito via M-Pesa', amount: 50000, date: '15/06/2024', time: '14:30', reference: 'MPESA001234' },
    { id: 2, type: 'Saída', description: 'Transferência para cliente', amount: 15000, date: '15/06/2024', time: '13:45', reference: 'TRF001235' },
    { id: 3, type: 'Entrada', description: 'Recarga via e-Mola', amount: 25000, date: '14/06/2024', time: '16:20', reference: 'EMOLA5678' },
    { id: 4, type: 'Saída', description: 'Pagamento de salário', amount: 35000, date: '14/06/2024', time: '09:15', reference: 'SAL001236' },
  ]);

  const [transferForm, setTransferForm] = useState({
    type: '',
    amount: '',
    reference: '',
    provider: ''
  });

  const mobileProviders = ['M-Pesa', 'e-Mola', 'mkesh'];

  const handleTransfer = () => {
    if (!transferForm.type || !transferForm.amount) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    const newTransaction = {
      id: transactions.length + 1,
      type: transferForm.type,
      description: `${transferForm.type} via ${transferForm.provider}`,
      amount: parseFloat(transferForm.amount),
      date: new Date().toLocaleDateString('pt-BR'),
      time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      reference: transferForm.reference || `AUTO${Date.now()}`
    };

    setTransactions([newTransaction, ...transactions]);
    
    // Atualizar saldo
    if (transferForm.type === 'Entrada') {
      setBalance(prev => ({ ...prev, available: prev.available + parseFloat(transferForm.amount) }));
    } else {
      setBalance(prev => ({ ...prev, available: prev.available - parseFloat(transferForm.amount) }));
    }

    setTransferForm({ type: '', amount: '', reference: '', provider: '' });
    
    // Notificação automática
    toast({
      title: "Transação Realizada",
      description: `${transferForm.type} de MZN ${transferForm.amount} processada com sucesso via ${transferForm.provider}.`,
    });

    // Simular notificação SMS
    setTimeout(() => {
      toast({
        title: "Notificação Enviada",
        description: `SMS enviado confirmando ${transferForm.type.toLowerCase()} de MZN ${transferForm.amount}.`,
      });
    }, 2000);
  };

  const handleBalanceSync = () => {
    toast({
      title: "Sincronização Iniciada",
      description: "Sincronizando saldo com operadoras de carteira móvel...",
    });

    setTimeout(() => {
      setBalance(prev => ({ ...prev, available: prev.available + Math.floor(Math.random() * 10000) }));
      toast({
        title: "Saldo Atualizado",
        description: "Sincronização com IPE concluída com sucesso.",
      });
    }, 3000);
  };

  const getTransactionIcon = (type: string) => {
    return type === 'Entrada' 
      ? <ArrowUpCircle className="h-4 w-4 text-green-600" />
      : <ArrowDownCircle className="h-4 w-4 text-red-600" />;
  };

  const getTransactionColor = (type: string) => {
    return type === 'Entrada' ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Gestão de Saldo</h1>
        <Button onClick={handleBalanceSync}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Sincronizar IPE
        </Button>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="transactions">Transações</TabsTrigger>
          <TabsTrigger value="mobile-wallets">Carteiras Móveis</TabsTrigger>
          <TabsTrigger value="notifications">Notificações</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Saldo Disponível</p>
                    <p className="text-2xl font-bold text-green-600">MZN {balance.available.toLocaleString()}</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Saldo Pendente</p>
                    <p className="text-2xl font-bold text-yellow-600">MZN {balance.pending.toLocaleString()}</p>
                  </div>
                  <Activity className="h-8 w-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Saldo Reservado</p>
                    <p className="text-2xl font-bold text-blue-600">MZN {balance.reserved.toLocaleString()}</p>
                  </div>
                  <CreditCard className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Nova Transação</CardTitle>
                <CardDescription>Realizar entrada ou saída de saldo</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="transactionType">Tipo de Transação</Label>
                  <Select onValueChange={(value) => setTransferForm({...transferForm, type: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Entrada">Entrada de Saldo</SelectItem>
                      <SelectItem value="Saída">Saída de Saldo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="provider">Operadora</Label>
                  <Select onValueChange={(value) => setTransferForm({...transferForm, provider: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a operadora" />
                    </SelectTrigger>
                    <SelectContent>
                      {mobileProviders.map(provider => (
                        <SelectItem key={provider} value={provider}>{provider}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="amount">Valor (MZN)</Label>
                    <Input 
                      id="amount"
                      type="number"
                      value={transferForm.amount}
                      onChange={(e) => setTransferForm({...transferForm, amount: e.target.value})}
                      placeholder="Ex: 50000"
                    />
                  </div>
                  <div>
                    <Label htmlFor="reference">Referência (Opcional)</Label>
                    <Input 
                      id="reference"
                      value={transferForm.reference}
                      onChange={(e) => setTransferForm({...transferForm, reference: e.target.value})}
                      placeholder="Ex: MPESA001234"
                    />
                  </div>
                </div>

                <Button onClick={handleTransfer} className="w-full">
                  <ArrowUpDown className="mr-2 h-4 w-4" />
                  Processar Transação
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Transações Recentes</CardTitle>
                <CardDescription>Últimas movimentações de saldo</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {transactions.slice(0, 5).map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        {getTransactionIcon(transaction.type)}
                        <div>
                          <p className="font-medium">{transaction.description}</p>
                          <p className="text-sm text-gray-600">{transaction.date} às {transaction.time}</p>
                          <p className="text-xs text-gray-500">Ref: {transaction.reference}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold ${getTransactionColor(transaction.type)}`}>
                          {transaction.type === 'Entrada' ? '+' : '-'}MZN {transaction.amount.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Transações</CardTitle>
              <CardDescription>Todas as movimentações de saldo</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-7 gap-4 p-3 bg-gray-50 rounded font-medium">
                  <span>Tipo</span>
                  <span>Descrição</span>
                  <span>Operadora</span>
                  <span>Data</span>
                  <span>Hora</span>
                  <span>Valor</span>
                  <span>Referência</span>
                </div>
                {transactions.map((transaction) => (
                  <div key={transaction.id} className="grid grid-cols-7 gap-4 p-3 border-b items-center">
                    <div className="flex items-center space-x-2">
                      {getTransactionIcon(transaction.type)}
                      <span>{transaction.type}</span>
                    </div>
                    <span className="text-sm">{transaction.description}</span>
                    <span className="text-sm">
                      <Smartphone className="h-4 w-4 inline mr-1" />
                      {transaction.description.includes('M-Pesa') ? 'M-Pesa' : 
                       transaction.description.includes('e-Mola') ? 'e-Mola' : 'Sistema'}
                    </span>
                    <span>{transaction.date}</span>
                    <span>{transaction.time}</span>
                    <span className={`font-bold ${getTransactionColor(transaction.type)}`}>
                      {transaction.type === 'Entrada' ? '+' : '-'}MZN {transaction.amount.toLocaleString()}
                    </span>
                    <span className="text-xs text-gray-500">{transaction.reference}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mobile-wallets" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {mobileProviders.map((provider) => (
              <Card key={provider}>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Smartphone className="mr-2 h-5 w-5" />
                    {provider}
                  </CardTitle>
                  <CardDescription>Integração com carteira móvel</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">Conectado</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Última sync:</span>
                      <span className="text-sm">Agora mesmo</span>
                    </div>
                    <Button size="sm" className="w-full">
                      <Zap className="mr-2 h-4 w-4" />
                      Reconectar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuração de Notificações</CardTitle>
              <CardDescription>Configurar alertas de entrada e saída de saldo</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded">
                  <div>
                    <h3 className="font-medium">Notificar entradas de saldo</h3>
                    <p className="text-sm text-gray-600">Receber SMS quando houver entrada de saldo</p>
                  </div>
                  <Button variant="outline">
                    <Bell className="mr-2 h-4 w-4" />
                    Ativo
                  </Button>
                </div>
                <div className="flex items-center justify-between p-4 border rounded">
                  <div>
                    <h3 className="font-medium">Notificar saídas de saldo</h3>
                    <p className="text-sm text-gray-600">Receber SMS quando houver saída de saldo</p>
                  </div>
                  <Button variant="outline">
                    <Bell className="mr-2 h-4 w-4" />
                    Ativo
                  </Button>
                </div>
                <div className="flex items-center justify-between p-4 border rounded">
                  <div>
                    <h3 className="font-medium">Alertas de saldo baixo</h3>
                    <p className="text-sm text-gray-600">Avisar quando saldo estiver abaixo de MZN 50.000</p>
                  </div>
                  <Button variant="outline">
                    <Bell className="mr-2 h-4 w-4" />
                    Ativo
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BalanceModule;
