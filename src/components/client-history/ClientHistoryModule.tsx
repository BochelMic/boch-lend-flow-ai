
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { History, Download, Filter, CreditCard, Receipt, FileText } from 'lucide-react';

const ClientHistoryModule = () => {
  const [filterPeriod, setFilterPeriod] = useState('all');

  // Mock data do histórico do cliente
  const loanHistory = [
    {
      id: 1,
      contractNumber: 'CTR-001',
      amount: 50000,
      startDate: '2023-06-15',
      endDate: '2024-06-15',
      status: 'ativo',
      remainingAmount: 35000,
      paymentsTotal: 8,
      paymentsMade: 5
    },
    {
      id: 2,
      contractNumber: 'CTR-002',
      amount: 25000,
      startDate: '2023-01-10',
      endDate: '2023-12-10',
      status: 'quitado',
      remainingAmount: 0,
      paymentsTotal: 12,
      paymentsMade: 12
    }
  ];

  const paymentHistory = [
    {
      id: 1,
      date: '2024-01-05',
      amount: 4850,
      method: 'Dinheiro',
      contractNumber: 'CTR-001',
      receipt: 'REC-001'
    },
    {
      id: 2,
      date: '2023-12-05',
      amount: 4850,
      method: 'Transferência',
      contractNumber: 'CTR-001',
      receipt: 'REC-002'
    },
    {
      id: 3,
      date: '2023-11-05',
      amount: 2500,
      method: 'M-Pesa',
      contractNumber: 'CTR-002',
      receipt: 'REC-003'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativo': return 'bg-green-100 text-green-800';
      case 'quitado': return 'bg-blue-100 text-blue-800';
      case 'atrasado': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Histórico</h1>
          <p className="text-muted-foreground">
            Consulte seu histórico de empréstimos e pagamentos
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Filtrar
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
        </div>
      </div>

      <Tabs defaultValue="loans" className="space-y-6">
        <TabsList>
          <TabsTrigger value="loans" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Empréstimos
          </TabsTrigger>
          <TabsTrigger value="payments" className="flex items-center gap-2">
            <Receipt className="h-4 w-4" />
            Pagamentos
          </TabsTrigger>
          <TabsTrigger value="documents" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Documentos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="loans" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Histórico de Empréstimos
              </CardTitle>
              <CardDescription>
                Todos os seus contratos de empréstimo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {loanHistory.map((loan) => (
                  <div key={loan.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">{loan.contractNumber}</h3>
                        <p className="text-sm text-muted-foreground">
                          {loan.startDate} até {loan.endDate}
                        </p>
                      </div>
                      <Badge className={getStatusColor(loan.status)}>
                        {loan.status}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Valor Original</p>
                        <p className="font-medium">{loan.amount.toLocaleString()} MZN</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Saldo Devedor</p>
                        <p className="font-medium">{loan.remainingAmount.toLocaleString()} MZN</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Pagamentos</p>
                        <p className="font-medium">{loan.paymentsMade}/{loan.paymentsTotal}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Progresso</p>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${(loan.paymentsMade / loan.paymentsTotal) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" size="sm">
                        Ver Detalhes
                      </Button>
                      <Button variant="outline" size="sm">
                        Cronograma
                      </Button>
                      <Button variant="outline" size="sm">
                        Imprimir Contrato
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Receipt className="h-5 w-5" />
                  Histórico de Pagamentos
                </CardTitle>
                <div className="flex items-center gap-4">
                  <select 
                    value={filterPeriod}
                    onChange={(e) => setFilterPeriod(e.target.value)}
                    className="p-2 border rounded"
                  >
                    <option value="all">Todos os períodos</option>
                    <option value="2024">2024</option>
                    <option value="2023">2023</option>
                  </select>
                </div>
              </div>
              <CardDescription>
                Todos os pagamentos realizados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {paymentHistory.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">Pagamento - {payment.contractNumber}</p>
                      <p className="text-sm text-muted-foreground">
                        {payment.date} • {payment.method} • {payment.receipt}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">{payment.amount.toLocaleString()} MZN</p>
                      <Button variant="outline" size="sm">
                        <Download className="mr-1 h-3 w-3" />
                        Recibo
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Documentos Disponíveis
              </CardTitle>
              <CardDescription>
                Contratos, recibos e outros documentos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { name: 'Contrato CTR-001', type: 'Contrato', date: '2023-06-15' },
                  { name: 'Contrato CTR-002', type: 'Contrato', date: '2023-01-10' },
                  { name: 'Extrato Janeiro 2024', type: 'Extrato', date: '2024-01-31' },
                  { name: 'Recibo Janeiro 2024', type: 'Recibo', date: '2024-01-05' },
                  { name: 'Declaração de Quitação CTR-002', type: 'Declaração', date: '2023-12-10' }
                ].map((doc, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">{doc.name}</h3>
                      <Badge variant="outline">{doc.type}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{doc.date}</p>
                    <Button variant="outline" size="sm" className="w-full">
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClientHistoryModule;
