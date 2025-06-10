
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';
import { CheckCircle, XCircle, Eye, MessageSquare, Calendar, Phone, MapPin, Briefcase, DollarSign, Clock, Target, Shield } from 'lucide-react';

interface CreditRequest {
  id: string;
  fullName: string;
  documentNumber: string;
  birthDate: string;
  phone: string;
  address: string;
  profession: string;
  requestedAmount: string;
  paymentTerm: string;
  creditPurpose: string;
  guaranteeType?: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  uploadedFiles: string[];
}

const CreditRequestsManager = () => {
  const [requests, setRequests] = useState<CreditRequest[]>([
    {
      id: '1',
      fullName: 'João Silva Santos',
      documentNumber: '123456789BA123',
      birthDate: '1985-03-15',
      phone: '+244 912 345 678',
      address: 'Rua das Flores, 123, Maianga, Luanda',
      profession: 'Funcionário Público',
      requestedAmount: '500000',
      paymentTerm: '12',
      creditPurpose: 'Ampliação do negócio de venda de produtos alimentares',
      guaranteeType: 'fiador',
      status: 'pending',
      submittedAt: '2024-06-10T08:30:00Z',
      uploadedFiles: ['documento_identidade.pdf', 'comprovativo_salario.pdf']
    },
    {
      id: '2',
      fullName: 'Maria João Fernandes',
      documentNumber: '987654321BA456',
      birthDate: '1992-07-22',
      phone: '+244 923 456 789',
      address: 'Bairro Popular, Rua 15, Casa 45, Viana, Luanda',
      profession: 'Comerciante',
      requestedAmount: '300000',
      paymentTerm: '6',
      creditPurpose: 'Compra de mercadoria para revenda',
      status: 'pending',
      submittedAt: '2024-06-10T10:15:00Z',
      uploadedFiles: ['bi_copia.jpg']
    }
  ]);

  const [selectedRequest, setSelectedRequest] = useState<CreditRequest | null>(null);
  const [responseMessage, setResponseMessage] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject'>('approve');

  const handleAction = (request: CreditRequest, action: 'approve' | 'reject') => {
    setSelectedRequest(request);
    setActionType(action);
    setResponseMessage(
      action === 'approve' 
        ? 'Parabéns! Seu pedido de crédito foi aprovado. Entraremos em contacto em breve para finalizar o processo.'
        : 'Lamentamos informar que seu pedido de crédito não foi aprovado neste momento. Para mais informações, entre em contacto connosco.'
    );
    setIsDialogOpen(true);
  };

  const confirmAction = () => {
    if (!selectedRequest) return;

    setRequests(prev => 
      prev.map(req => 
        req.id === selectedRequest.id 
          ? { ...req, status: actionType === 'approve' ? 'approved' : 'rejected' }
          : req
      )
    );

    toast({
      title: `Pedido ${actionType === 'approve' ? 'aprovado' : 'rejeitado'}`,
      description: `Mensagem enviada para ${selectedRequest.fullName}`,
    });

    console.log(`Enviando mensagem para ${selectedRequest.phone}:`, responseMessage);
    console.log(`Enviando email para registro do pedido ${selectedRequest.id}`);

    setIsDialogOpen(false);
    setSelectedRequest(null);
    setResponseMessage('');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Pendente</Badge>;
      case 'approved':
        return <Badge className="bg-green-500">Aprovado</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejeitado</Badge>;
      default:
        return <Badge variant="outline">Desconhecido</Badge>;
    }
  };

  const formatAmount = (amount: string) => {
    return new Intl.NumberFormat('pt-AO', {
      style: 'currency',
      currency: 'AOA',
      minimumFractionDigits: 0
    }).format(Number(amount));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-AO');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Pedidos de Crédito</h2>
          <p className="text-muted-foreground">Gerencie e responda aos pedidos recebidos</p>
        </div>
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span>Pendente: {requests.filter(r => r.status === 'pending').length}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>Aprovado: {requests.filter(r => r.status === 'approved').length}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span>Rejeitado: {requests.filter(r => r.status === 'rejected').length}</span>
          </div>
        </div>
      </div>

      <div className="grid gap-4">
        {requests.map((request) => (
          <Card key={request.id} className="w-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {request.fullName}
                    {getStatusBadge(request.status)}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {formatDate(request.submittedAt)}
                    </span>
                    <span className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      {formatAmount(request.requestedAmount)}
                    </span>
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{request.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="line-clamp-1">{request.address}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    <span>{request.profession}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{request.paymentTerm} meses</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Target className="h-4 w-4 text-muted-foreground" />
                    <span className="line-clamp-1">{request.creditPurpose}</span>
                  </div>
                  {request.guaranteeType && (
                    <div className="flex items-center gap-2 text-sm">
                      <Shield className="h-4 w-4 text-muted-foreground" />
                      <span>{request.guaranteeType}</span>
                    </div>
                  )}
                </div>
              </div>

              {request.uploadedFiles.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm font-medium mb-2">Documentos anexados:</p>
                  <div className="flex flex-wrap gap-2">
                    {request.uploadedFiles.map((file, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {file}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {request.status === 'pending' && (
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleAction(request, 'approve')}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Aprovar
                  </Button>
                  <Button
                    onClick={() => handleAction(request, 'reject')}
                    variant="destructive"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Rejeitar
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {actionType === 'approve' ? 'Aprovar Pedido' : 'Rejeitar Pedido'}
            </DialogTitle>
            <DialogDescription>
              {actionType === 'approve' 
                ? 'Confirme a aprovação e personalize a mensagem de resposta'
                : 'Confirme a rejeição e personalize a mensagem de resposta'
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Mensagem para o cliente:</label>
              <Textarea
                value={responseMessage}
                onChange={(e) => setResponseMessage(e.target.value)}
                placeholder="Digite sua mensagem personalizada..."
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={confirmAction}
              className={actionType === 'approve' ? 'bg-green-600 hover:bg-green-700' : ''}
              variant={actionType === 'approve' ? 'default' : 'destructive'}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Confirmar e Enviar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CreditRequestsManager;
