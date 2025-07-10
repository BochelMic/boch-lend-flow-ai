
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Receipt, Clock, CheckCircle } from 'lucide-react';

const PaymentsModule = () => {
  // Mock data para demonstração
  const payments = [
    {
      id: 1,
      clientName: 'João Silva',
      amount: 4850,
      dueDate: '2024-01-15',
      status: 'pendente',
      contractId: 'CTR-001'
    },
    {
      id: 2,
      clientName: 'Maria Santos',
      amount: 2500,
      dueDate: '2024-01-10',
      status: 'pago',
      contractId: 'CTR-002'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pago': return 'bg-green-100 text-green-800';
      case 'pendente': return 'bg-yellow-100 text-yellow-800';
      case 'atrasado': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pagamentos</h1>
          <p className="text-muted-foreground">
            Registre e acompanhe pagamentos dos clientes
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Recebido Hoje</p>
                <p className="text-lg font-semibold">12.350 MZN</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm text-muted-foreground">Pendentes</p>
                <p className="text-lg font-semibold">8</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Recibos Emitidos</p>
                <p className="text-lg font-semibold">25</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Taxa de Cobrança</p>
                <p className="text-lg font-semibold">94%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Pagamentos Pendentes</CardTitle>
            <CardDescription>
              Clientes com pagamentos em aberto
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {payments.filter(p => p.status === 'pendente').map((payment) => (
                <div key={payment.id} className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">{payment.clientName}</h3>
                    <Badge className={getStatusColor(payment.status)}>
                      {payment.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Contrato: {payment.contractId}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{payment.amount.toLocaleString()} MZN</span>
                    <span className="text-sm text-muted-foreground">
                      Vencimento: {payment.dueDate}
                    </span>
                  </div>
                  <Button size="sm" className="w-full">
                    Registrar Pagamento
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Registrar Novo Pagamento</CardTitle>
            <CardDescription>
              Registre um pagamento recebido
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Cliente</label>
                <Input placeholder="Buscar cliente..." />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Valor Recebido (MZN)</label>
                <Input type="number" placeholder="0.00" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Forma de Pagamento</label>
                <select className="w-full p-2 border rounded">
                  <option>Dinheiro</option>
                  <option>Transferência</option>
                  <option>M-Pesa</option>
                  <option>Cheque</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Data do Pagamento</label>
                <Input type="date" />
              </div>
              <Button type="submit" className="w-full">
                Registrar e Gerar Recibo
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Histórico de Pagamentos</CardTitle>
          <CardDescription>
            Últimos pagamentos registrados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {payments.map((payment) => (
              <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">{payment.clientName}</p>
                  <p className="text-sm text-muted-foreground">
                    {payment.contractId} • {payment.dueDate}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{payment.amount.toLocaleString()} MZN</p>
                  <Badge className={getStatusColor(payment.status)}>
                    {payment.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentsModule;
