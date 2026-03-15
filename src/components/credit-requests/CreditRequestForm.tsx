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
  Send,
  AlertCircle,
  TrendingUp,
  Percent,
  CheckCircle,
  Table as TableIcon,
  Info,
  DollarSign,
  User,
  Phone,
  MapPin,
  Calendar,
  FileText
} from 'lucide-react';
import {
  simulateCredit,
  getAvailableOptions,
  getInstallmentLimits,
  CreditOption,
  SimulationResult
} from '@/utils/creditUtils';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const CreditRequestForm = ({ initialData }: { initialData?: any }) => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    clientName: user?.name || '',
    clientEmail: user?.email || '',
    clientPhone: '',
    clientAddress: '',
    amount: initialData?.amount?.toString() || '5000',
    purpose: '',
    days: initialData?.days?.toString() || '30'
  });

  const [selectedOption, setSelectedOption] = useState<CreditOption>(initialData?.option || 'B');
  const [isInstallment, setIsInstallment] = useState(initialData?.isInstallment || false);
  const [installmentMonths, setInstallmentMonths] = useState((initialData?.installments || initialData?.installmentMonths || '1').toString());
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-simulate - Intelligent Selection
  React.useEffect(() => {
    const numAmount = Number(formData.amount);
    const numDays = Number(formData.days);
    const numMonths = Number(installmentMonths);

    if (numAmount > 0 && numDays > 0) {
      // simulateCredit now handles auto-selection (A/B/C) internally
      const sim = simulateCredit(numAmount, numDays, undefined, isInstallment, numMonths);
      setResult(sim);
      setSelectedOption(sim.option);
    }
  }, [formData.amount, formData.days, isInstallment, installmentMonths]);

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
        term: parseInt(formData.days),
        credit_option: result?.option || selectedOption,
        is_installment: isInstallment,
        installment_months: isInstallment ? parseInt(installmentMonths) : 1,
        amortization_plan: result?.installments || null,
        interest_rate_at_request: result?.monthlyInterestRate ? result.monthlyInterestRate * 100 : 30,
        status: 'pending',
        user_id: user?.id || null,
        agent_id: user?.role === 'agente' ? user?.id : null,
      });

      if (error) throw error;

      // Reset form
      setFormData({
        clientName: user?.name || '',
        clientEmail: user?.email || '',
        clientPhone: '',
        clientAddress: '',
        amount: '5000',
        purpose: '',
        days: '30'
      });
      setIsInstallment(false);
      setInstallmentMonths('1');

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
                    <Label htmlFor="days" className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Prazo (dias)
                    </Label>
                    <Select value={formData.days} onValueChange={(val) => setFormData(p => ({ ...p, days: val }))}>
                      <SelectTrigger className="font-medium">
                        <SelectValue placeholder="Selecione o prazo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7">7 dias</SelectItem>
                        <SelectItem value="15">15 dias</SelectItem>
                        <SelectItem value="21">21 dias</SelectItem>
                        <SelectItem value="30">30 dias</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="mt-6 p-4 rounded-xl bg-primary/5 border-2 border-dashed border-primary/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="font-bold text-primary text-xs uppercase tracking-wider">Plano de Crédito Determinado</Label>
                    <Badge className="bg-primary text-white">Opção {selectedOption}</Badge>
                  </div>
                  <p className="text-[11px] text-gray-600 leading-relaxed font-medium">
                    {selectedOption === 'A' && "Crédito Geral: Aplicável para valores até 4.000 MT com juros de 30%."}
                    {selectedOption === 'B' && "Plano Express: Juros de 20% para prazos curtos (até 15 dias)."}
                    {selectedOption === 'C' && "Vencimento Fixo: Plano padrão para montantes 5.000+ MT com juros de 30%."}
                  </p>
                  {selectedOption === 'B' && (
                    <div className="bg-amber-50 p-2 rounded-lg border border-amber-100 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
                      <p className="text-[10px] text-amber-700 leading-tight">
                        <strong>Nota:</strong> Se o pagamento não for realizado em 15 dias, a taxa é ajustada automaticamente para 30%.
                      </p>
                    </div>
                  )}
                </div>

                {/* Installments Toggle */}
                {getInstallmentLimits(Number(formData.amount)) > 1 && (
                  <div className="mt-6 pt-4 border-t flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <Switch checked={isInstallment} onCheckedChange={setIsInstallment} id="installment" />
                      <div>
                        <Label htmlFor="installment" className="font-bold">Pagamento Parcelado</Label>
                        <p className="text-xs text-gray-500">Deseja pagar em mensalidades?</p>
                      </div>
                    </div>

                    {isInstallment && (
                      <div className="w-full sm:w-40 space-y-1">
                        <Label htmlFor="months" className="text-[10px] font-bold uppercase text-gray-400">
                          {selectedOption === 'A' ? 'Semanas' : 'Prestações'}
                        </Label>
                        <Select value={installmentMonths} onValueChange={setInstallmentMonths}>
                          <SelectTrigger className="font-bold h-10">
                            <SelectValue placeholder={selectedOption === 'A' ? 'Semanas' : 'Meses'} />
                          </SelectTrigger>
                          <SelectContent>
                            {[...Array(getInstallmentLimits(Number(formData.amount)))].map((_, i) => (
                              <SelectItem key={i + 1} value={(i + 1).toString()}>
                                {i + 1} {selectedOption === 'A' ? (i === 0 ? 'Semana' : 'Semanas') : (i === 0 ? 'Mês' : 'Meses')}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                )}

                {/* Result Preview */}
                {result && (
                  <div className="mt-6 bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500">Total a Pagar</span>
                      <span className="font-bold text-lg text-primary">MZN {result.totalToPay.toLocaleString()}</span>
                    </div>
                    {isInstallment && (
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-500">
                          {selectedOption === 'A' ? 'Semanal' : 'Mensalidade'} ({installmentMonths}x)
                        </span>
                        <span className="font-semibold">
                          MZN {(result.installments[0]?.total || 0).toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                )}

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
                <h4 className="font-semibold text-info">Novas Regras de Crédito</h4>
                <ul className="text-sm text-info/80 mt-2 space-y-1">
                  <li>• Opção A: Créditos pequenos até 10.000 MT</li>
                  <li>• Opção B: Juros reduzidos (20%) se pago até 15 dias</li>
                  <li>• Pagamento Parcelado: Disponível para créditos acima de 5.000 MT</li>
                  <li>• Recapitalização: Juros de 30% aplicados mensalmente sobre o saldo</li>
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