
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Phone, MessageSquare, Mail, Calendar, AlertTriangle, CheckCircle } from 'lucide-react';

const CollectionsModule = () => {
  const [selectedDate, setSelectedDate] = useState('2024-01-15');

  // Mock data para demonstração
  const collections = [
    {
      id: 1,
      clientName: 'João Silva',
      phone: '+258 84 123 4567',
      amount: 4850,
      daysOverdue: 5,
      lastContact: '2024-01-10',
      priority: 'alta',
      status: 'pendente'
    },
    {
      id: 2,
      clientName: 'Maria Santos',
      phone: '+258 84 987 6543',
      amount: 2500,
      daysOverdue: 2,
      lastContact: '2024-01-12',
      priority: 'media',
      status: 'contactado'
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'alta': return 'bg-red-100 text-red-800';
      case 'media': return 'bg-yellow-100 text-yellow-800';
      case 'baixa': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pagamentos e Cobranças</h1>
          <p className="text-muted-foreground">
            Gerencie cobranças e controle a inadimplência
          </p>
        </div>
      </div>

      <Tabs defaultValue="overdue" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overdue">Em Atraso</TabsTrigger>
          <TabsTrigger value="schedule">Agenda de Cobrança</TabsTrigger>
          <TabsTrigger value="payments">Registrar Pagamento</TabsTrigger>
          <TabsTrigger value="reports">Relatórios</TabsTrigger>
        </TabsList>

        <TabsContent value="overdue" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Total em Atraso</p>
                    <p className="text-lg font-semibold">87.350 MZN</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Phone className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Clientes em Atraso</p>
                    <p className="text-lg font-semibold">15</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Cobranças Hoje</p>
                    <p className="text-lg font-semibold">8</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-purple-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Taxa de Recuperação</p>
                    <p className="text-lg font-semibold">78%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Clientes com Pagamentos em Atraso</CardTitle>
              <CardDescription>
                Lista de clientes que precisam ser contactados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {collections.map((item) => (
                  <div key={item.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">{item.clientName}</h3>
                        <p className="text-sm text-muted-foreground">{item.phone}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getPriorityColor(item.priority)}>
                          {item.priority}
                        </Badge>
                        <Badge variant="outline">
                          {item.daysOverdue} dias
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Valor em Atraso</p>
                        <p className="font-medium text-red-600">{item.amount.toLocaleString()} MZN</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Último Contacto</p>
                        <p className="font-medium">{item.lastContact}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Status</p>
                        <p className="font-medium">{item.status}</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 pt-2">
                      <Button size="sm">
                        <Phone className="mr-1 h-3 w-3" />
                        Ligar
                      </Button>
                      <Button variant="outline" size="sm">
                        <MessageSquare className="mr-1 h-3 w-3" />
                        WhatsApp
                      </Button>
                      <Button variant="outline" size="sm">
                        <Mail className="mr-1 h-3 w-3" />
                        Email
                      </Button>
                      <Button variant="outline" size="sm">
                        Registrar Contacto
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedule">
          <Card>
            <CardHeader>
              <CardTitle>Agenda de Cobrança</CardTitle>
              <CardDescription>
                Programe e acompanhe as atividades de cobrança
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Input 
                    type="date" 
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-48"
                  />
                  <Button>Ver Agenda</Button>
                </div>
                
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-3">Atividades para {selectedDate}</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between py-2 border-b">
                      <div>
                        <p className="font-medium">09:00 - Ligar para João Silva</p>
                        <p className="text-sm text-muted-foreground">Cobrança de 4.850 MZN</p>
                      </div>
                      <Badge>Pendente</Badge>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b">
                      <div>
                        <p className="font-medium">14:00 - Visita a Maria Santos</p>
                        <p className="text-sm text-muted-foreground">Negociação de acordo</p>
                      </div>
                      <Badge variant="secondary">Agendado</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <CardTitle>Registrar Pagamento</CardTitle>
              <CardDescription>
                Registre pagamentos recebidos dos clientes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Cliente</label>
                    <Input placeholder="Selecionar cliente" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Contrato</label>
                    <Input placeholder="Número do contrato" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Valor Pago (MZN)</label>
                    <Input type="number" placeholder="0.00" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Data do Pagamento</label>
                    <Input type="date" />
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
                    <label className="text-sm font-medium">Observações</label>
                    <Input placeholder="Observações sobre o pagamento" />
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="text-muted-foreground">Saldo Devedor Atual</p>
                      <p className="text-lg font-semibold">35.000 MZN</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="text-muted-foreground">Valor a Pagar</p>
                      <p className="text-lg font-semibold">4.850 MZN</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="text-muted-foreground">Saldo Após Pagamento</p>
                      <p className="text-lg font-semibold text-green-600">30.150 MZN</p>
                    </div>
                  </div>
                </div>
                
                <Button type="submit" className="w-full">
                  Registrar Pagamento e Gerar Recibo
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Relatório de Inadimplência</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Taxa de Inadimplência:</span>
                    <span className="font-semibold text-red-600">12.5%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Valor Total em Atraso:</span>
                    <span className="font-semibold">87.350 MZN</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Clientes em Atraso:</span>
                    <span className="font-semibold">15</span>
                  </div>
                  <Button variant="outline" className="w-full">
                    Gerar Relatório Completo
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Efetividade de Cobrança</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Taxa de Recuperação:</span>
                    <span className="font-semibold text-green-600">78%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Contactos Realizados:</span>
                    <span className="font-semibold">45</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Acordos Firmados:</span>
                    <span className="font-semibold">12</span>
                  </div>
                  <Button variant="outline" className="w-full">
                    Ver Detalhes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CollectionsModule;
