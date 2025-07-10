
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, CreditCard, Phone, Mail, MapPin, Edit } from 'lucide-react';

const ClientAccountModule = () => {
  // Mock data do cliente logado
  const clientData = {
    name: 'João Silva',
    email: 'joao@email.com',
    phone: '+258 84 123 4567',
    document: '123456789',
    address: 'Av. Julius Nyerere, 123, Maputo',
    creditScore: 'Bom',
    totalLoans: 2,
    activeLoans: 1,
    totalBorrowed: 75000,
    totalPaid: 40000,
    currentDebt: 35000
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Minha Conta</h1>
          <p className="text-muted-foreground">
            Gerencie suas informações pessoais e dados de crédito
          </p>
        </div>
        <Button>
          <Edit className="mr-2 h-4 w-4" />
          Editar Perfil
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informações Pessoais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Nome Completo</label>
                  <p className="font-medium">{clientData.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Documento (BI)</label>
                  <p className="font-medium">{clientData.document}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <p className="font-medium">{clientData.email}</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Telefone</label>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <p className="font-medium">{clientData.phone}</p>
                  </div>
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium text-muted-foreground">Endereço</label>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <p className="font-medium">{clientData.address}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Informações de Crédito
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Score de Crédito</label>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-green-100 text-green-800">
                        {clientData.creditScore}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Total de Empréstimos</label>
                    <p className="text-lg font-semibold">{clientData.totalLoans}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Empréstimos Ativos</label>
                    <p className="text-lg font-semibold">{clientData.activeLoans}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Total Emprestado</label>
                    <p className="text-lg font-semibold">{clientData.totalBorrowed.toLocaleString()} MZN</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Total Pago</label>
                    <p className="text-lg font-semibold text-green-600">{clientData.totalPaid.toLocaleString()} MZN</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Dívida Atual</label>
                    <p className="text-lg font-semibold text-orange-600">{clientData.currentDebt.toLocaleString()} MZN</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full" variant="default">
                Solicitar Novo Crédito
              </Button>
              <Button className="w-full" variant="outline">
                Ver Histórico de Pagamentos
              </Button>
              <Button className="w-full" variant="outline">
                Meus Contratos
              </Button>
              <Button className="w-full" variant="outline">
                Imprimir Extratos
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Status da Conta</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Status:</span>
                <Badge className="bg-green-100 text-green-800">Ativo</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Próximo Pagamento:</span>
                <span className="text-sm font-medium">15/01/2024</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Valor:</span>
                <span className="text-sm font-medium">4.850 MZN</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Suporte</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Precisa de ajuda? Entre em contacto connosco.
              </p>
              <div className="space-y-2">
                <Button variant="outline" size="sm" className="w-full">
                  <Phone className="mr-2 h-4 w-4" />
                  Ligar para Suporte
                </Button>
                <Button variant="outline" size="sm" className="w-full">
                  <Mail className="mr-2 h-4 w-4" />
                  Enviar Mensagem
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ClientAccountModule;
