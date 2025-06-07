
import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { 
  Phone, 
  MessageSquare, 
  AlertTriangle, 
  Clock, 
  Users, 
  DollarSign,
  Calendar,
  CheckCircle,
  XCircle,
  Mail,
  FileText,
  Search
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useToast } from '@/hooks/use-toast';

const CollectionModule = () => {
  const { toast } = useToast();
  const [overdueLoans, setOverdueLoans] = useState([
    { id: 1, clientName: 'João Silva', amount: 15000, daysOverdue: 5, phone: '84123456', lastContact: '10/06/2024', status: 'Pendente', interestAmount: 500 },
    { id: 2, clientName: 'Maria Santos', amount: 8500, daysOverdue: 15, phone: '87654321', lastContact: '05/06/2024', status: 'Em Negociação', interestAmount: 1275 },
    { id: 3, clientName: 'Carlos Mussa', amount: 22000, daysOverdue: 30, phone: '85987654', lastContact: '01/06/2024', status: 'Inadimplente', interestAmount: 4400 },
  ]);

  const [collectionActions, setCollectionActions] = useState([
    { id: 1, clientName: 'João Silva', action: 'SMS Lembrete', date: '15/06/2024 09:00', status: 'Enviado', result: 'Sem resposta' },
    { id: 2, clientName: 'Maria Santos', action: 'Ligação', date: '15/06/2024 10:30', status: 'Completado', result: 'Promessa de pagamento' },
    { id: 3, clientName: 'Carlos Mussa', action: 'Email Cobrança', date: '14/06/2024 14:00', status: 'Enviado', result: 'Lido' },
  ]);

  const [contactForm, setContactForm] = useState({
    clientId: '',
    actionType: '',
    message: '',
    schedule: '',
    notes: ''
  });

  const handleContact = (action: string, clientName: string) => {
    const newAction = {
      id: collectionActions.length + 1,
      clientName,
      action,
      date: new Date().toLocaleString('pt-BR'),
      status: 'Completado',
      result: 'Aguardando resposta'
    };

    setCollectionActions([newAction, ...collectionActions]);
    
    toast({
      title: `${action} Realizado`,
      description: `${action} para ${clientName} registrado com sucesso.`,
    });
  };

  const updateLoanStatus = (loanId: number, newStatus: string) => {
    setOverdueLoans(prev => prev.map(loan => 
      loan.id === loanId ? { ...loan, status: newStatus } : loan
    ));
    
    toast({
      title: "Status Atualizado",
      description: `Status do empréstimo atualizado para ${newStatus}.`,
    });
  };

  const calculateTotalOverdue = () => {
    return overdueLoans.reduce((total, loan) => total + loan.amount + loan.interestAmount, 0);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pendente': return 'bg-yellow-100 text-yellow-800';
      case 'Em Negociação': return 'bg-blue-100 text-blue-800';
      case 'Inadimplente': return 'bg-red-100 text-red-800';
      case 'Resolvido': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getUrgencyLevel = (days: number) => {
    if (days <= 7) return { level: 'Baixa', color: 'text-yellow-600' };
    if (days <= 30) return { level: 'Média', color: 'text-orange-600' };
    return { level: 'Alta', color: 'text-red-600' };
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Sistema de Cobrança</h1>
        <Button onClick={() => toast({ title: "Relatório Gerado", description: "Relatório de cobrança exportado." })}>
          <FileText className="mr-2 h-4 w-4" />
          Gerar Relatório
        </Button>
      </div>

      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="overdue">Vencidos</TabsTrigger>
          <TabsTrigger value="actions">Ações</TabsTrigger>
          <TabsTrigger value="negotiation">Negociação</TabsTrigger>
          <TabsTrigger value="reports">Relatórios</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total em Atraso</p>
                    <p className="text-2xl font-bold">MZN {calculateTotalOverdue().toLocaleString()}</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Clientes Vencidos</p>
                    <p className="text-2xl font-bold">{overdueLoans.length}</p>
                  </div>
                  <Users className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Ações Hoje</p>
                    <p className="text-2xl font-bold">12</p>
                  </div>
                  <Phone className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Taxa Recuperação</p>
                    <p className="text-2xl font-bold">78%</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Ações Urgentes</CardTitle>
                <CardDescription>Clientes que precisam de contato imediato</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {overdueLoans.filter(loan => loan.daysOverdue > 15).map((loan) => {
                    const urgency = getUrgencyLevel(loan.daysOverdue);
                    return (
                      <div key={loan.id} className="flex items-center justify-between p-3 border rounded-lg bg-red-50">
                        <div>
                          <p className="font-medium">{loan.clientName}</p>
                          <p className="text-sm text-gray-600">{loan.daysOverdue} dias em atraso</p>
                          <p className={`text-sm font-medium ${urgency.color}`}>
                            Urgência: {urgency.level}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">MZN {(loan.amount + loan.interestAmount).toLocaleString()}</p>
                          <div className="flex space-x-1 mt-1">
                            <Button 
                              size="sm" 
                              onClick={() => handleContact('Ligação', loan.clientName)}
                            >
                              <Phone className="h-3 w-3" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleContact('SMS', loan.clientName)}
                            >
                              <MessageSquare className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Ações Recentes</CardTitle>
                <CardDescription>Últimas ações de cobrança realizadas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {collectionActions.slice(0, 5).map((action) => (
                    <div key={action.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{action.clientName}</p>
                        <p className="text-sm text-gray-600">{action.action}</p>
                        <p className="text-xs text-gray-500">{action.date}</p>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-1 rounded text-xs ${
                          action.status === 'Completado' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {action.status}
                        </span>
                        <p className="text-xs text-gray-600 mt-1">{action.result}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="overdue" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Empréstimos Vencidos</CardTitle>
              <CardDescription>Lista completa de clientes em atraso</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <Input placeholder="Buscar cliente..." className="w-64" />
                  <Button variant="outline">
                    <Search className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-2">
                  <div className="grid grid-cols-8 gap-4 p-3 bg-gray-50 rounded font-medium">
                    <span>Cliente</span>
                    <span>Valor Original</span>
                    <span>Juros Mora</span>
                    <span>Total</span>
                    <span>Dias Atraso</span>
                    <span>Status</span>
                    <span>Último Contato</span>
                    <span>Ações</span>
                  </div>
                  {overdueLoans.map((loan) => (
                    <div key={loan.id} className="grid grid-cols-8 gap-4 p-3 border-b items-center">
                      <div>
                        <span className="font-medium">{loan.clientName}</span>
                        <p className="text-sm text-gray-600">{loan.phone}</p>
                      </div>
                      <span>MZN {loan.amount.toLocaleString()}</span>
                      <span className="text-red-600">MZN {loan.interestAmount.toLocaleString()}</span>
                      <span className="font-bold">MZN {(loan.amount + loan.interestAmount).toLocaleString()}</span>
                      <span className="text-red-600 font-medium">{loan.daysOverdue} dias</span>
                      <span className={`px-2 py-1 rounded text-xs ${getStatusColor(loan.status)}`}>
                        {loan.status}
                      </span>
                      <span className="text-sm">{loan.lastContact}</span>
                      <div className="flex space-x-1">
                        <Button 
                          size="sm" 
                          onClick={() => handleContact('Ligação', loan.clientName)}
                        >
                          <Phone className="h-3 w-3" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleContact('SMS', loan.clientName)}
                        >
                          <MessageSquare className="h-3 w-3" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleContact('Email', loan.clientName)}
                        >
                          <Mail className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="actions" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Agendar Ação</CardTitle>
                <CardDescription>Programar contato com cliente</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="actionClient">Cliente</Label>
                  <Select onValueChange={(value) => setContactForm({...contactForm, clientId: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      {overdueLoans.map(loan => (
                        <SelectItem key={loan.id} value={loan.id.toString()}>{loan.clientName}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="actionType">Tipo de Ação</Label>
                  <Select onValueChange={(value) => setContactForm({...contactForm, actionType: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a ação" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="call">Ligação</SelectItem>
                      <SelectItem value="sms">SMS</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="visit">Visita</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="actionSchedule">Agendar para</Label>
                  <Input 
                    id="actionSchedule"
                    type="datetime-local"
                    value={contactForm.schedule}
                    onChange={(e) => setContactForm({...contactForm, schedule: e.target.value})}
                  />
                </div>

                <div>
                  <Label htmlFor="actionMessage">Mensagem/Observações</Label>
                  <Textarea 
                    id="actionMessage"
                    placeholder="Digite a mensagem ou observações..."
                    value={contactForm.message}
                    onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                  />
                </div>

                <Button className="w-full">
                  <Calendar className="mr-2 h-4 w-4" />
                  Agendar Ação
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Histórico de Ações</CardTitle>
                <CardDescription>Registro de todas as ações realizadas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {collectionActions.map((action) => (
                    <div key={action.id} className="p-3 border rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{action.clientName}</p>
                          <p className="text-sm text-gray-600">{action.action}</p>
                          <p className="text-xs text-gray-500">{action.date}</p>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs ${
                          action.status === 'Completado' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {action.status}
                        </span>
                      </div>
                      <p className="text-sm mt-2 p-2 bg-gray-50 rounded">
                        Resultado: {action.result}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="negotiation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Negociações em Andamento</CardTitle>
              <CardDescription>Clientes em processo de negociação</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {overdueLoans.filter(loan => loan.status === 'Em Negociação').map((loan) => (
                  <div key={loan.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-medium">{loan.clientName}</h3>
                        <p className="text-sm text-gray-600">
                          Valor: MZN {(loan.amount + loan.interestAmount).toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-600">
                          {loan.daysOverdue} dias em atraso
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          onClick={() => updateLoanStatus(loan.id, 'Resolvido')}
                        >
                          Acordo Fechado
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => updateLoanStatus(loan.id, 'Inadimplente')}
                        >
                          Sem Acordo
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor={`proposal-${loan.id}`}>Proposta de Acordo</Label>
                      <Textarea 
                        id={`proposal-${loan.id}`}
                        placeholder="Digite os termos da proposta..."
                        className="min-h-[80px]"
                      />
                      <Button size="sm">Salvar Proposta</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Relatório de Cobrança</CardTitle>
                <CardDescription>Análise de performance de cobrança</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">
                  <FileText className="mr-2 h-4 w-4" />
                  Gerar Relatório
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Relatório de Recuperação</CardTitle>
                <CardDescription>Taxa de recuperação por período</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">
                  <FileText className="mr-2 h-4 w-4" />
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

export default CollectionModule;
