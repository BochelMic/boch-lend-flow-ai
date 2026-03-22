
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Phone, MessageSquare, Mail, Calendar, AlertTriangle, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface OverdueLoan {
  id: string;
  clientName: string;
  clientPhone: string;
  amount: number;
  remainingAmount: number;
  installments: number;
  startDate: string | null;
  status: string;
}

const CollectionsModule = () => {
  const { user } = useAuth();
  const [overdue, setOverdue] = useState<OverdueLoan[]>([]);
  const [totalOverdue, setTotalOverdue] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCollections();
  }, []);

  const loadCollections = async () => {
    try {
      // Buscar empréstimos ativos/em atraso com dados dos clientes
      let query = supabase
        .from('loans')
        .select('*, clients(name, phone)')
        .in('status', ['active', 'overdue'])
        .gt('remaining_amount', 0);

      if (user?.role === 'agente') {
        query = query.eq('agent_id', user.id);
      }

      const { data: loans, error } = await query;

      if (error) throw error;

      const mapped = (loans || []).map((l: any) => ({
        id: l.id,
        clientName: l.clients?.name || 'Desconhecido',
        clientPhone: l.clients?.phone || '',
        amount: Number(l.total_amount),
        remainingAmount: Number(l.remaining_amount),
        installments: l.installments,
        startDate: l.start_date,
        status: l.status,
      }));

      setOverdue(mapped);
      setTotalOverdue(mapped.reduce((sum: number, l: OverdueLoan) => sum + l.remainingAmount, 0));
    } catch (error) {
      console.error('Error loading collections:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div>
        <h1 className="text-xl md:text-3xl font-bold tracking-tight">Pagamentos e Cobranças</h1>
        <p className="text-sm text-muted-foreground">
          Gerencie cobranças e controle a inadimplência
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <Card>
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs md:text-sm text-muted-foreground truncate">Saldo Pendente</p>
                <p className="text-sm md:text-lg font-semibold">{totalOverdue.toLocaleString()} MZN</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center gap-2">
              <Phone className="h-5 w-5 text-blue-500 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs md:text-sm text-muted-foreground truncate">Clientes com Saldo</p>
                <p className="text-sm md:text-lg font-semibold">{overdue.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-green-500 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs md:text-sm text-muted-foreground truncate">Em Atraso</p>
                <p className="text-sm md:text-lg font-semibold">{overdue.filter(l => l.status === 'overdue').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-purple-500 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs md:text-sm text-muted-foreground truncate">Ativos</p>
                <p className="text-sm md:text-lg font-semibold">{overdue.filter(l => l.status === 'active').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="p-4 md:p-6">
          <CardTitle className="text-base md:text-lg">Clientes com Saldo Pendente</CardTitle>
          <CardDescription className="text-xs md:text-sm">
            Empréstimos ativos com saldo a receber
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 md:p-6 pt-0">
          <div className="space-y-4">
            {loading ? (
              <p className="text-center text-muted-foreground py-8">Carregando...</p>
            ) : overdue.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Nenhum empréstimo pendente</p>
            ) : (
              overdue.map((item) => (
                <div key={item.id} className="border rounded-lg p-3 md:p-4 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h3 className="font-semibold">{item.clientName}</h3>
                      <p className="text-sm text-muted-foreground">{item.clientPhone || 'Sem telefone'}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={item.status === 'overdue' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}>
                        {item.status === 'overdue' ? 'Em Atraso' : 'Ativo'}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                    <div>
                      <p className="text-muted-foreground">Saldo Devedor</p>
                      <p className="font-medium text-red-600">{item.remainingAmount.toLocaleString()} MZN</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Valor Total</p>
                      <p className="font-medium">{item.amount.toLocaleString()} MZN</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Prestações</p>
                      <p className="font-medium">{item.installments} meses</p>
                    </div>
                  </div>

                  {item.clientPhone && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      <Button size="sm" onClick={() => window.open(`tel:${item.clientPhone}`)}>
                        <Phone className="mr-1 h-3 w-3" />
                        Ligar
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => window.open(`https://wa.me/${item.clientPhone.replace(/[^0-9]/g, '')}`)}>
                        <MessageSquare className="mr-1 h-3 w-3" />
                        WhatsApp
                      </Button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CollectionsModule;
