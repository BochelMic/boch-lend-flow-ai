import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/use-toast';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  User, 
  DollarSign, 
  Calendar,
  MessageSquare,
  Phone,
  MapPin
} from 'lucide-react';

export interface CreditRequest {
  id: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  clientAddress: string;
  amount: number;
  purpose: string;
  term: number; // months
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
  reviewMessage?: string;
  agentId?: string;
  agentName?: string;
}

const CreditRequestManager = () => {
  const [requests, setRequests] = useState<CreditRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<CreditRequest | null>(null);
  const [reviewMessage, setReviewMessage] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = () => {
    const storedRequests = localStorage.getItem('creditRequests');
    if (storedRequests) {
      const parsed = JSON.parse(storedRequests);
      setRequests(parsed.map((req: any) => ({
        ...req,
        submittedAt: new Date(req.submittedAt),
        reviewedAt: req.reviewedAt ? new Date(req.reviewedAt) : undefined
      })));
    }
  };

  const saveRequests = (updatedRequests: CreditRequest[]) => {
    localStorage.setItem('creditRequests', JSON.stringify(updatedRequests));
    setRequests(updatedRequests);
  };

  const handleApprove = (requestId: string) => {
    const updatedRequests = requests.map(req => 
      req.id === requestId 
        ? {
            ...req,
            status: 'approved' as const,
            reviewedAt: new Date(),
            reviewedBy: user?.name || 'Gestor',
            reviewMessage: reviewMessage || 'Pedido aprovado'
          }
        : req
    );
    saveRequests(updatedRequests);
    setSelectedRequest(null);
    setReviewMessage('');
    toast({
      title: 'Pedido Aprovado',
      description: 'O pedido de crédito foi aprovado com sucesso.',
    });
  };

  const handleReject = (requestId: string) => {
    if (!reviewMessage.trim()) {
      toast({
        title: 'Erro',
        description: 'Por favor, forneça uma mensagem de rejeição.',
        variant: 'destructive'
      });
      return;
    }

    const updatedRequests = requests.map(req => 
      req.id === requestId 
        ? {
            ...req,
            status: 'rejected' as const,
            reviewedAt: new Date(),
            reviewedBy: user?.name || 'Gestor',
            reviewMessage: reviewMessage
          }
        : req
    );
    saveRequests(updatedRequests);
    setSelectedRequest(null);
    setReviewMessage('');
    toast({
      title: 'Pedido Rejeitado',
      description: 'O pedido foi rejeitado com a mensagem fornecida.',
    });
  };

  const getStatusBadge = (status: CreditRequest['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Pendente</Badge>;
      case 'approved':
        return <Badge variant="secondary" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Aprovado</Badge>;
      case 'rejected':
        return <Badge variant="secondary" className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />Rejeitado</Badge>;
    }
  };

  const filteredRequests = requests.filter(req => 
    filterStatus === 'all' || req.status === filterStatus
  );

  const isGestor = user?.role === 'gestor';

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <Card className="bg-gradient-to-r from-primary to-primary-light text-white">
          <CardHeader>
            <CardTitle className="text-2xl">
              {isGestor ? 'Gestão de Pedidos de Crédito' : 'Pedidos de Crédito'}
            </CardTitle>
            <p className="text-primary-foreground/80">
              {isGestor ? 'Aprovar e rejeitar pedidos de crédito' : 'Visualizar status dos pedidos'}
            </p>
          </CardHeader>
        </Card>

        {/* Filters */}
        <Card className="bg-card/90 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center gap-4">
              <h3 className="text-lg font-semibold">Filtros</h3>
              <div className="flex gap-2">
                <Button
                  variant={filterStatus === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterStatus('all')}
                >
                  Todos ({requests.length})
                </Button>
                <Button
                  variant={filterStatus === 'pending' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterStatus('pending')}
                >
                  Pendentes ({requests.filter(r => r.status === 'pending').length})
                </Button>
                <Button
                  variant={filterStatus === 'approved' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterStatus('approved')}
                >
                  Aprovados ({requests.filter(r => r.status === 'approved').length})
                </Button>
                <Button
                  variant={filterStatus === 'rejected' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterStatus('rejected')}
                >
                  Rejeitados ({requests.filter(r => r.status === 'rejected').length})
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Requests List */}
        <div className="grid gap-4">
          {filteredRequests.map((request) => (
            <Card key={request.id} className="bg-card/90 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <User className="h-5 w-5 text-muted-foreground" />
                      <span className="font-semibold">{request.clientName}</span>
                    </div>
                    {getStatusBadge(request.status)}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    {request.submittedAt.toLocaleDateString()}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-success" />
                    <span>MZN {request.amount.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{request.clientPhone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{request.clientAddress}</span>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-muted-foreground mb-1">Finalidade:</p>
                  <p>{request.purpose}</p>
                </div>

                {request.reviewMessage && (
                  <div className="mb-4 p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <MessageSquare className="h-4 w-4" />
                      <span className="font-medium">Mensagem da Revisão:</span>
                    </div>
                    <p className="text-sm">{request.reviewMessage}</p>
                    {request.reviewedBy && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Por: {request.reviewedBy} em {request.reviewedAt?.toLocaleDateString()}
                      </p>
                    )}
                  </div>
                )}

                {isGestor && request.status === 'pending' && (
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setSelectedRequest(request)}
                      variant="outline"
                      size="sm"
                    >
                      Analisar
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Review Modal */}
        {selectedRequest && isGestor && (
          <Card className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-card p-6 rounded-lg max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold mb-4">
                Analisar Pedido - {selectedRequest.clientName}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <p className="font-medium">Valor: MZN {selectedRequest.amount.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Prazo: {selectedRequest.term} meses</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Mensagem de Revisão
                  </label>
                  <Textarea
                    value={reviewMessage}
                    onChange={(e) => setReviewMessage(e.target.value)}
                    placeholder="Digite sua mensagem..."
                    rows={3}
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => handleApprove(selectedRequest.id)}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Aprovar
                  </Button>
                  <Button
                    onClick={() => handleReject(selectedRequest.id)}
                    variant="destructive"
                    className="flex-1"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Rejeitar
                  </Button>
                </div>

                <Button
                  onClick={() => setSelectedRequest(null)}
                  variant="outline"
                  className="w-full"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CreditRequestManager;