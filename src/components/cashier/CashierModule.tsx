
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Wallet, TrendingUp, TrendingDown, DollarSign, FileText, ArrowUpDown } from 'lucide-react';

const CashierModule = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Mock data para demonstração
  const cashFlow = {
    opening: 150000,
    receipts: 75000,
    disbursements: 120000,
    closing: 105000
  };

  const transactions = [
    {
      id: 1,
      type: 'entrada',
      description: 'Pagamento João Silva',
      amount: 4850,
      time: '09:15',
      method: 'Dinheiro'
    },
    {
      id: 2,
      type: 'saida',
      description: 'Desembolso Maria Santos',
      amount: 25000,
      time: '10:30',
      method: 'Transferência'
    },
    {
      id: 3,
      type: 'entrada',
      description: 'Pagamento Pedro Costa',
      amount: 3200,
      time: '14:20',
      method: 'M-Pesa'
    }
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Caixa e Tesouraria</h1>
          <p className="text-muted-foreground">
            Controle o fluxo de caixa e movimentações financeiras
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <FileText className="mr-2 h-4 w-4" />
            Fecho de Caixa
          </Button>
          <Button>
            <ArrowUpDown className="mr-2 h-4 w-4" />
            Nova Movimentação
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Saldo Inicial</p>
                <p className="text-lg font-semibold">{cashFlow.opening.toLocaleString()} MZN</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Entradas</p>
                <p className="text-lg font-semibold text-green-600">{cashFlow.receipts.toLocaleString()} MZN</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm text-muted-foreground">Saídas</p>
                <p className="text-lg font-semibold text-red-600">{cashFlow.disbursements.toLocaleString()} MZN</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Saldo Atual</p>
                <p className="text-lg font-semibold">{cashFlow.closing.toLocaleString()} MZN</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="movements" className="space-y-6">
        <TabsList>
          <TabsTrigger value="movements">Movimentações</TabsTrigger>
          <TabsTrigger value="receipt">Entrada</TabsTrigger>
          <TabsTrigger value="disbursement">Saída</TabsTrigger>
          <TabsTrigger value="closing">Fecho de Caixa</TabsTrigger>
        </TabsList>

        <TabsContent value="movements" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Movimentações do Dia</CardTitle>
                <Input 
                  type="date" 
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-48"
                />
              </div>
              <CardDescription>
                Histórico de todas as movimentações financeiras
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {transactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-full ${
                        transaction.type === 'entrada' ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                        {transaction.type === 'entrada' ? (
                          <TrendingUp className="h-4 w-4 text-green-600" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{transaction.description}</p>
                        <p className="text-sm text-muted-foreground">
                          {transaction.time} - {transaction.method}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${
                        transaction.type === 'entrada' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'entrada' ? '+' : '-'}{transaction.amount.toLocaleString()} MZN
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="receipt">
          <Card>
            <CardHeader>
              <CardTitle>Registrar Entrada</CardTitle>
              <CardDescription>
                Registre recebimentos e outras entradas de caixa
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="receipt-type">Tipo de Entrada</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecionar tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="payment">Pagamento de Cliente</SelectItem>
                        <SelectItem value="loan-recovery">Recuperação de Empréstimo</SelectItem>
                        <SelectItem value="interest">Juros Recebidos</SelectItem>
                        <SelectItem value="other">Outros</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="receipt-amount">Valor (MZN)</Label>
                    <Input id="receipt-amount" type="number" placeholder="0.00" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="receipt-method">Forma de Recebimento</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecionar forma" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">Dinheiro</SelectItem>
                        <SelectItem value="transfer">Transferência</SelectItem>
                        <SelectItem value="mpesa">M-Pesa</SelectItem>
                        <SelectItem value="check">Cheque</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="receipt-date">Data</Label>
                    <Input id="receipt-date" type="date" />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="receipt-description">Descrição</Label>
                    <Input id="receipt-description" placeholder="Descrição da entrada" />
                  </div>
                </div>
                <Button type="submit" className="w-full">
                  Registrar Entrada
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="disbursement">
          <Card>
            <CardHeader>
              <CardTitle>Registrar Saída</CardTitle>
              <CardDescription>
                Registre desembolsos e outras saídas de caixa
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="disbursement-type">Tipo de Saída</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecionar tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="loan">Desembolso de Empréstimo</SelectItem>
                        <SelectItem value="expense">Despesa Operacional</SelectItem>
                        <SelectItem value="commission">Comissão de Agente</SelectItem>
                        <SelectItem value="other">Outros</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="disbursement-amount">Valor (MZN)</Label>
                    <Input id="disbursement-amount" type="number" placeholder="0.00" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="disbursement-method">Forma de Pagamento</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecionar forma" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">Dinheiro</SelectItem>
                        <SelectItem value="transfer">Transferência</SelectItem>
                        <SelectItem value="mpesa">M-Pesa</SelectItem>
                        <SelectItem value="check">Cheque</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="disbursement-date">Data</Label>
                    <Input id="disbursement-date" type="date" />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="disbursement-description">Descrição</Label>
                    <Input id="disbursement-description" placeholder="Descrição da saída" />
                  </div>
                </div>
                <Button type="submit" className="w-full">
                  Registrar Saída
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="closing">
          <Card>
            <CardHeader>
              <CardTitle>Fecho de Caixa</CardTitle>
              <CardDescription>
                Realize o fecho diário, semanal ou mensal do caixa
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Período do Fecho</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecionar período" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Diário</SelectItem>
                        <SelectItem value="weekly">Semanal</SelectItem>
                        <SelectItem value="monthly">Mensal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Data de Referência</Label>
                    <Input type="date" />
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-4">Resumo do Período</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>Saldo Inicial:</span>
                        <span className="font-medium">{cashFlow.opening.toLocaleString()} MZN</span>
                      </div>
                      <div className="flex justify-between text-green-600">
                        <span>Total de Entradas:</span>
                        <span className="font-medium">{cashFlow.receipts.toLocaleString()} MZN</span>
                      </div>
                      <div className="flex justify-between text-red-600">
                        <span>Total de Saídas:</span>
                        <span className="font-medium">{cashFlow.disbursements.toLocaleString()} MZN</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between font-semibold">
                        <span>Saldo Calculado:</span>
                        <span>{cashFlow.closing.toLocaleString()} MZN</span>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="physical-count">Contagem Física</Label>
                        <Input id="physical-count" type="number" placeholder="Valor contado" />
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Diferença:</span>
                        <span className="font-medium">0 MZN</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button className="flex-1">
                    Confirmar Fecho
                  </Button>
                  <Button variant="outline">
                    Exportar Relatório
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

export default CashierModule;
