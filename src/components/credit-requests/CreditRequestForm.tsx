import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  DollarSign,
  User,
  Phone,
  MapPin,
  Calendar,
  FileText,
  Send
} from 'lucide-react';

const CreditRequestForm = () => {
  const [formData, setFormData] = useState({
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    clientAddress: '',
    amount: '',
    purpose: '',
    term: '12'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate form
      if (!formData.clientName || !formData.clientEmail || !formData.amount || !formData.purpose) {
        toast({
          title: 'Erro',
          description: 'Por favor, preencha todos os campos obrigatórios.',
          variant: 'destructive'
        });
        setIsSubmitting(false);
        return;
      }

      const { error } = await supabase.from('credit_requests').insert({
        client_name: formData.clientName,
        client_email: formData.clientEmail,
        client_phone: formData.clientPhone || null,
        client_address: formData.clientAddress || null,
        amount: parseFloat(formData.amount),
        purpose: formData.purpose,
        term: parseInt(formData.term),
        status: 'pending',
        user_id: user?.id || null,
        agent_id: user?.role === 'agente' ? user?.id : null,
      });

      if (error) throw error;

      // Reset form
      setFormData({
        clientName: '',
        clientEmail: '',
        clientPhone: '',
        clientAddress: '',
        amount: '',
        purpose: '',
        term: '12'
      });

      toast({
        title: 'Pedido Enviado',
        description: 'O pedido de crédito foi enviado com sucesso para análise.',
      });

    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Ocorreu um erro ao enviar o pedido. Tente novamente.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 to-gray-900 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <Card className="bg-gradient-to-r from-primary to-primary-light text-white">
          <CardHeader>
            <CardTitle className="text-2xl">Novo Pedido de Crédito</CardTitle>
            <p className="text-primary-foreground/80">
              Preencha os dados para solicitar um novo crédito
            </p>
          </CardHeader>
        </Card>

        {/* Form */}
        <Card className="bg-card/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Dados do Cliente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Cliente Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="clientName" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Nome Completo *
                  </Label>
                  <Input
                    id="clientName"
                    name="clientName"
                    value={formData.clientName}
                    onChange={handleChange}
                    placeholder="Digite o nome completo"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="clientEmail" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Email *
                  </Label>
                  <Input
                    id="clientEmail"
                    name="clientEmail"
                    type="email"
                    value={formData.clientEmail}
                    onChange={handleChange}
                    placeholder="email@exemplo.com"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="clientPhone" className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Telefone
                  </Label>
                  <Input
                    id="clientPhone"
                    name="clientPhone"
                    value={formData.clientPhone}
                    onChange={handleChange}
                    placeholder="+258 XX XXX XXXX"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="clientAddress" className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Endereço
                  </Label>
                  <Input
                    id="clientAddress"
                    name="clientAddress"
                    value={formData.clientAddress}
                    onChange={handleChange}
                    placeholder="Endereço completo"
                  />
                </div>
              </div>

              {/* Loan Info */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Dados do Empréstimo</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount" className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Valor Solicitado (MZN) *
                    </Label>
                    <Input
                      id="amount"
                      name="amount"
                      type="number"
                      value={formData.amount}
                      onChange={handleChange}
                      placeholder="0.00"
                      min="1000"
                      step="0.01"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="term" className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Prazo (meses)
                    </Label>
                    <Input
                      id="term"
                      name="term"
                      type="number"
                      value={formData.term}
                      onChange={handleChange}
                      min="1"
                      max="60"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2 mt-4">
                  <Label htmlFor="purpose" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Finalidade do Empréstimo *
                  </Label>
                  <Textarea
                    id="purpose"
                    name="purpose"
                    value={formData.purpose}
                    onChange={handleChange}
                    placeholder="Descreva a finalidade do empréstimo..."
                    rows={3}
                    required
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end pt-6 border-t">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-primary hover:bg-primary-dark text-white px-8"
                >
                  {isSubmitting ? (
                    'Enviando...'
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Enviar Pedido
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="bg-info/10 border-info/20">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="bg-info/20 p-2 rounded-lg">
                <FileText className="h-5 w-5 text-info" />
              </div>
              <div>
                <h4 className="font-semibold text-info">Informações Importantes</h4>
                <ul className="text-sm text-info/80 mt-2 space-y-1">
                  <li>• Taxa de juros: 30% ao mês</li>
                  <li>• Análise do pedido: 1-3 dias úteis</li>
                  <li>• Documentação necessária será solicitada após aprovação</li>
                  <li>• Valor mínimo: MZN 1.000</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreditRequestForm;