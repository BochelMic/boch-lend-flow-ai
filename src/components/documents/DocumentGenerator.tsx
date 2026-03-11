import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { FileText, Receipt, Printer, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { generateInvoiceHTML, generateReceiptHTML, downloadDocumentAsPdf } from '../../utils/exportUtils';

interface LoanOption {
  id: string;
  clientName: string;
  clientPhone: string;
  clientDocument: string;
  clientNuit: string;
  clientAddress: string;
  totalAmount: number;
  remainingAmount: number;
  interestRate: number;
  installments: number;
}

interface CompanySettings {
  company_name: string;
  email: string;
  phone: string;
  nuit: string;
  address: string;
}

const DocumentGenerator = () => {
  const { toast } = useToast();
  const [loans, setLoans] = useState<LoanOption[]>([]);
  const [selectedLoanId, setSelectedLoanId] = useState('');
  const [description, setDescription] = useState('');
  const [receiptLoanId, setReceiptLoanId] = useState('');
  const [receiptAmount, setReceiptAmount] = useState('');
  const [receiptMethod, setReceiptMethod] = useState('cash');
  const [receiptDesc, setReceiptDesc] = useState('');
  const [loading, setLoading] = useState(true);
  const [companySettings, setCompanySettings] = useState<CompanySettings>({
    company_name: 'BOCHEL MICROCREDITO',
    email: '',
    phone: '',
    nuit: '',
    address: 'Maputo, Moçambique',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [{ data: loansData }, { data: settings }] = await Promise.all([
        supabase
          .from('loans')
          .select('id, total_amount, remaining_amount, interest_rate, installments, client_id, status, clients(name, phone, user_id)')
          .in('status', ['active', 'completed']),
        supabase
          .from('system_settings')
          .select('company_name, email, phone, nuit, address')
          .limit(1)
          .single(),
      ]);

      if (loansData) {
        // For each loan, try to fetch client credit request data for document/nuit/address
        const enrichedLoans: LoanOption[] = await Promise.all(
          loansData.map(async (l: any) => {
            const clientUserId = l.clients?.user_id;
            let clientDoc = '';
            let clientNuit = '';
            let clientAddr = '';

            if (clientUserId) {
              const { data: creditReq } = await supabase
                .from('credit_requests')
                .select('document_number, nuit, neighborhood, district, province')
                .eq('user_id', clientUserId)
                .order('created_at', { ascending: false })
                .limit(1)
                .single();

              if (creditReq) {
                clientDoc = creditReq.document_number || '';
                clientNuit = creditReq.nuit || '';
                const parts = [creditReq.neighborhood, creditReq.district, creditReq.province].filter(Boolean);
                clientAddr = parts.join(', ');
              }
            }

            return {
              id: l.id,
              clientName: l.clients?.name || 'Desconhecido',
              clientPhone: l.clients?.phone || '',
              clientDocument: clientDoc,
              clientNuit: clientNuit,
              clientAddress: clientAddr,
              totalAmount: Number(l.total_amount),
              remainingAmount: Number(l.remaining_amount),
              interestRate: Number(l.interest_rate),
              installments: l.installments || 1,
            };
          })
        );
        setLoans(enrichedLoans);
      }
      if (settings) {
        setCompanySettings({
          company_name: settings.company_name || 'BOCHEL MICROCREDITO',
          email: settings.email || '',
          phone: settings.phone || '',
          nuit: (settings as any).nuit || '',
          address: (settings as any).address || 'Maputo, Moçambique',
        });
      }
    } catch (e) {
      console.error('Error loading data:', e);
    } finally {
      setLoading(false);
    }
  };

  const selectedLoan = loans.find(l => l.id === selectedLoanId);
  const receiptLoan = loans.find(l => l.id === receiptLoanId);

  const generateInvoice = () => {
    if (!selectedLoan) {
      toast({ title: 'Erro', description: 'Selecione um empréstimo.', variant: 'destructive' });
      return;
    }
    const html = generateInvoiceHTML({
      number: `FAT-${Date.now()}`,
      date: new Date().toLocaleDateString('pt-MZ'),
      clientName: selectedLoan.clientName,
      clientPhone: selectedLoan.clientPhone,
      clientDocument: selectedLoan.clientDocument,
      clientNuit: selectedLoan.clientNuit,
      clientAddress: selectedLoan.clientAddress,
      amount: selectedLoan.totalAmount,
      interestRate: selectedLoan.interestRate,
      totalAmount: selectedLoan.totalAmount,
      installments: selectedLoan.installments,
      description: description || 'Concessão de microcrédito',
      companyName: companySettings.company_name,
      companyEmail: companySettings.email,
      companyPhone: companySettings.phone,
      companyNuit: companySettings.nuit,
      companyAddress: companySettings.address,
    });
    downloadDocumentAsPdf(html, `Fatura_${selectedLoan.clientName.replace(/\s+/g, '_')}_${Date.now()}`);
    toast({ title: 'Fatura Gerada', description: 'A fatura está sendo baixada em PDF.' });
  };

  const generateReceipt = () => {
    if (!receiptLoan || !receiptAmount) {
      toast({ title: 'Erro', description: 'Selecione o empréstimo e preencha o valor.', variant: 'destructive' });
      return;
    }
    const amount = parseFloat(receiptAmount);
    const html = generateReceiptHTML({
      number: `REC-${Date.now()}`,
      date: new Date().toLocaleDateString('pt-MZ'),
      clientName: receiptLoan.clientName,
      clientPhone: receiptLoan.clientPhone,
      clientDocument: receiptLoan.clientDocument,
      clientNuit: receiptLoan.clientNuit,
      clientAddress: receiptLoan.clientAddress,
      amount,
      paymentMethod: receiptMethod,
      remainingBalance: Math.max(0, receiptLoan.remainingAmount - amount),
      description: receiptDesc || 'Pagamento de prestação de microcrédito',
      companyName: companySettings.company_name,
      companyEmail: companySettings.email,
      companyPhone: companySettings.phone,
      companyNuit: companySettings.nuit,
      companyAddress: companySettings.address,
    });
    downloadDocumentAsPdf(html, `Recibo_${receiptLoan.clientName.replace(/\s+/g, '_')}_${Date.now()}`);
    toast({ title: 'Recibo Gerado', description: 'O recibo está sendo baixado em PDF.' });
  };

  if (loading) {
    return <div className="flex items-center justify-center h-40"><Loader2 className="h-6 w-6 animate-spin text-gray-400" /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Faturas & Recibos</h1>
        <p className="text-sm text-muted-foreground">Emitir faturas de crédito e recibos de pagamento</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Fatura */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <FileText className="mr-2 h-5 w-5 text-[#0b3a20]" />
              Gerar Fatura
            </CardTitle>
            <CardDescription>Fatura de concessão de crédito com dados reais</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label>Empréstimo *</Label>
                <Select value={selectedLoanId} onValueChange={setSelectedLoanId}>
                  <SelectTrigger><SelectValue placeholder="Selecionar empréstimo..." /></SelectTrigger>
                  <SelectContent>
                    {loans.map(loan => (
                      <SelectItem key={loan.id} value={loan.id}>
                        {loan.clientName} — MZN {loan.totalAmount.toLocaleString()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {selectedLoan && (
                <div className="grid grid-cols-2 gap-2 text-sm bg-gray-50 p-3 rounded-lg">
                  <div><span className="text-gray-500">Cliente:</span> <strong>{selectedLoan.clientName}</strong></div>
                  <div><span className="text-gray-500">Valor:</span> <strong>MZN {selectedLoan.totalAmount.toLocaleString()}</strong></div>
                  <div><span className="text-gray-500">Taxa:</span> <strong>{selectedLoan.interestRate}%</strong></div>
                  <div><span className="text-gray-500">Parcelas:</span> <strong>{selectedLoan.installments}</strong></div>
                  {selectedLoan.clientDocument && (
                    <div><span className="text-gray-500">Doc:</span> <strong>{selectedLoan.clientDocument}</strong></div>
                  )}
                  {selectedLoan.clientNuit && (
                    <div><span className="text-gray-500">NUIT:</span> <strong>{selectedLoan.clientNuit}</strong></div>
                  )}
                </div>
              )}
              <div>
                <Label>Descrição (opcional)</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ex: Empréstimo para capital de giro"
                />
              </div>
              <Button onClick={generateInvoice} className="w-full" style={{ backgroundColor: '#0b3a20' }}>
                <Printer className="mr-2 h-4 w-4" />
                Gerar Fatura (PDF)
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recibo */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Receipt className="mr-2 h-5 w-5 text-[#d37c22]" />
              Gerar Recibo
            </CardTitle>
            <CardDescription>Recibo de pagamento de cliente</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label>Empréstimo *</Label>
                <Select value={receiptLoanId} onValueChange={setReceiptLoanId}>
                  <SelectTrigger><SelectValue placeholder="Selecionar empréstimo..." /></SelectTrigger>
                  <SelectContent>
                    {loans.map(loan => (
                      <SelectItem key={loan.id} value={loan.id}>
                        {loan.clientName} — Saldo: MZN {loan.remainingAmount.toLocaleString()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Valor Pago (MZN) *</Label>
                  <Input type="number" value={receiptAmount} onChange={(e) => setReceiptAmount(e.target.value)} placeholder="0.00" />
                </div>
                <div>
                  <Label>Forma de Pagamento</Label>
                  <Select value={receiptMethod} onValueChange={setReceiptMethod}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Dinheiro</SelectItem>
                      <SelectItem value="mpesa">M-Pesa</SelectItem>
                      <SelectItem value="emola">e-Mola</SelectItem>
                      <SelectItem value="bank_transfer">Transferência Bancária</SelectItem>
                      <SelectItem value="check">Cheque</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Descrição (opcional)</Label>
                <Textarea
                  value={receiptDesc}
                  onChange={(e) => setReceiptDesc(e.target.value)}
                  placeholder="Ex: Pagamento da 2ª parcela"
                />
              </div>
              <Button onClick={generateReceipt} className="w-full" style={{ backgroundColor: '#d37c22' }}>
                <Printer className="mr-2 h-4 w-4" />
                Gerar Recibo (PDF)
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DocumentGenerator;
