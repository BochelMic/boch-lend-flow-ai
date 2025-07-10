
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, FileText, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const ClientRequestsModule = () => {
  // Mock data dos pedidos do cliente
  const requests = [
    {
      id: 1,
      type: 'Novo Empréstimo',
      amount: 75000,
      status: 'em_analise',
      date: '2024-01-10',
      description: 'Solicitação de crédito para expansão de negócio',
      documents: ['BI', 'Comprovante de Renda', 'Declaração de IVA']
    },
    {
      id: 2,
      type: 'Renegociação',
      amount: 35000,
      status: 'aprovado',
      date: '2023-12-15',
      description: 'Renegociação de prazo do contrato CTR-001',
      documents: ['Proposta', 'Comprovante de Renda Atualizado']
    },
    {
      id: 3,
      type: 'Novo Empréstimo',
      amount: 50000,
      status: 'rejeitado',
      date: '2023-11-20',
      description: 'Solicitação de crédito pessoal',
      documents: ['BI', 'Comprovante de Renda'],
      rejectionReason: 'Renda insuficiente para o valor solicitado'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'aprovado': return 'bg-green-100 text-green-800';
      case 'em_analise': return 'bg-yellow-100 text-yellow-800';
      case 'rejeitado': return 'bg-red-100 text-red-800';
      case 'pendente_documentos': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'aprovado': return <CheckCircle className="h-4 w-4" />;
      case 'em_analise': return <Clock className="h-4 w-4" />;
      case 'rejeitado': return <XCircle className="h-4 w-4" />;
      case 'pendente_documentos': return <AlertCircle className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Meus Pedidos</h1>
          <p className="text-muted-foreground">
            Acompanhe o status dos seus pedidos de crédito
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Novo Pedido
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total de Pedidos</p>
                <p className="text-lg font-semibold">{requests.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm text-muted-foreground">Em Análise</p>
                <p className="text-lg font-semibold">
                  {requests.filter(r => r.status === 'em_analise').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Aprovados</p>
                <p className="text-lg font-semibold">
                  {requests.filter(r => r.status === 'aprovado').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm text-muted-foreground">Rejeitados</p>
                <p className="text-lg font-semibold">
                  {requests.filter(r => r.status === 'rejeitado').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList>
          <TabsTrigger value="all">Todos os Pedidos</TabsTrigger>
          <TabsTrigger value="pending">Em Análise</TabsTrigger>
          <TabsTrigger value="approved">Aprovados</TabsTrigger>
          <TabsTrigger value="rejected">Rejeitados</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="space-y-4">
            {requests.map((request) => (
              <Card key={request.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-lg">{request.type}</h3>
                      <p className="text-sm text-muted-foreground">
                        Solicitado em {request.date}
                      </p>
                    </div>
                    <Badge className={getStatusColor(request.status)}>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(request.status)}
                        {request.status.replace('_', ' ')}
                      </div>
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Valor Solicitado</p>
                        <p className="font-semibold text-lg">{request.amount.toLocaleString()} MZN</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Documentos Enviados</p>
                        <p className="font-medium">{request.documents.length} documento(s)</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground">Descrição</p>
                      <p className="font-medium">{request.description}</p>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground">Documentos</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {request.documents.map((doc, index) => (
                          <Badge key={index} variant="outline">{doc}</Badge>
                        ))}
                      </div>
                    </div>

                    {request.rejectionReason && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <p className="text-sm text-red-800">
                          <strong>Motivo da Rejeição:</strong> {request.rejectionReason}
                        </p>
                      </div>
                    )}

                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" size="sm">
                        Ver Detalhes
                      </Button>
                      {request.status === 'em_analise' && (
                        <Button variant="outline" size="sm">
                          Enviar Documentos
                        </Button>
                      )}
                      {request.status === 'aprovado' && (
                        <Button size="sm">
                          Aceitar Proposta
                        </Button>
                      )}
                      {request.status === 'rejeitado' && (
                        <Button variant="outline" size="sm">
                          Nova Solicitação
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="pending">
          <div className="space-y-4">
            {requests.filter(r => r.status === 'em_analise').map((request) => (
              <Card key={request.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{request.type}</h3>
                      <p className="text-sm text-muted-foreground">{request.amount.toLocaleString()} MZN</p>
                    </div>
                    <div className="text-right">
                      <Badge className={getStatusColor(request.status)}>
                        Em Análise
                      </Badge>
                      <p className="text-sm text-muted-foreground mt-1">
                        Desde {request.date}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm">
                      Seu pedido está sendo analisado pela nossa equipe. Você receberá uma notificação assim que houver uma resposta.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="approved">
          <div className="space-y-4">
            {requests.filter(r => r.status === 'aprovado').map((request) => (
              <Card key={request.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{request.type}</h3>
                      <p className="text-sm text-muted-foreground">{request.amount.toLocaleString()} MZN</p>
                    </div>
                    <Badge className={getStatusColor(request.status)}>
                      Aprovado
                    </Badge>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Button size="sm">
                      Aceitar Proposta
                    </Button>
                    <Button variant="outline" size="sm">
                      Ver Condições
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="rejected">
          <div className="space-y-4">
            {requests.filter(r => r.status === 'rejeitado').map((request) => (
              <Card key={request.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{request.type}</h3>
                      <p className="text-sm text-muted-foreground">{request.amount.toLocaleString()} MZN</p>
                    </div>
                    <Badge className={getStatusColor(request.status)}>
                      Rejeitado
                    </Badge>
                  </div>
                  {request.rejectionReason && (
                    <div className="mt-3 bg-red-50 border border-red-200 rounded-lg p-3">
                      <p className="text-sm text-red-800">
                        <strong>Motivo:</strong> {request.rejectionReason}
                      </p>
                    </div>
                  )}
                  <div className="mt-4">
                    <Button variant="outline" size="sm">
                      Nova Solicitação
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClientRequestsModule;
