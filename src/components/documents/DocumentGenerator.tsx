
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { FileText, Receipt, Download, Printer } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateInvoiceHTML, generateReceiptHTML, printDocument, downloadDocument } from '../../utils/exportUtils';

interface DocumentData {
  clientName: string;
  amount: string;
  description: string;
}

const DocumentGenerator = () => {
  const { toast } = useToast();
  const [invoiceData, setInvoiceData] = useState<DocumentData>({
    clientName: '',
    amount: '',
    description: ''
  });
  const [receiptData, setReceiptData] = useState<DocumentData>({
    clientName: '',
    amount: '',
    description: ''
  });

  const generateInvoice = (action: 'print' | 'download') => {
    if (!invoiceData.clientName || !invoiceData.amount || !invoiceData.description) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos da fatura.",
        variant: "destructive"
      });
      return;
    }

    const invoiceNumber = `FAT-${Date.now()}`;
    const htmlContent = generateInvoiceHTML({
      number: invoiceNumber,
      date: new Date().toLocaleDateString(),
      clientName: invoiceData.clientName,
      amount: parseFloat(invoiceData.amount),
      description: invoiceData.description,
      companyName: "Empresa de Microcrédito"
    });

    if (action === 'print') {
      printDocument(htmlContent);
      toast({
        title: "Fatura Impressa",
        description: `Fatura ${invoiceNumber} enviada para impressão.`,
      });
    } else {
      downloadDocument(htmlContent, `fatura-${invoiceNumber}`);
      toast({
        title: "Fatura Baixada",
        description: `Fatura ${invoiceNumber} foi baixada com sucesso.`,
      });
    }
  };

  const generateReceipt = (action: 'print' | 'download') => {
    if (!receiptData.clientName || !receiptData.amount || !receiptData.description) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos do recibo.",
        variant: "destructive"
      });
      return;
    }

    const receiptNumber = `REC-${Date.now()}`;
    const htmlContent = generateReceiptHTML({
      number: receiptNumber,
      date: new Date().toLocaleDateString(),
      clientName: receiptData.clientName,
      amount: parseFloat(receiptData.amount),
      description: receiptData.description,
      companyName: "Empresa de Microcrédito"
    });

    if (action === 'print') {
      printDocument(htmlContent);
      toast({
        title: "Recibo Impresso",
        description: `Recibo ${receiptNumber} enviado para impressão.`,
      });
    } else {
      downloadDocument(htmlContent, `recibo-${receiptNumber}`);
      toast({
        title: "Recibo Baixado",
        description: `Recibo ${receiptNumber} foi baixado com sucesso.`,
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="mr-2 h-5 w-5" />
              Gerar Fatura
            </CardTitle>
            <CardDescription>
              Fatura de concessão de crédito
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="invoiceClient">Nome do Cliente</Label>
                <Input 
                  id="invoiceClient"
                  value={invoiceData.clientName}
                  onChange={(e) => setInvoiceData({...invoiceData, clientName: e.target.value})}
                  placeholder="Ex: João Silva"
                />
              </div>
              <div>
                <Label htmlFor="invoiceAmount">Valor (MZN)</Label>
                <Input 
                  id="invoiceAmount"
                  type="number"
                  value={invoiceData.amount}
                  onChange={(e) => setInvoiceData({...invoiceData, amount: e.target.value})}
                  placeholder="Ex: 25000"
                />
              </div>
              <div>
                <Label htmlFor="invoiceDescription">Descrição</Label>
                <Textarea 
                  id="invoiceDescription"
                  value={invoiceData.description}
                  onChange={(e) => setInvoiceData({...invoiceData, description: e.target.value})}
                  placeholder="Ex: Empréstimo para capital de giro"
                />
              </div>
              <div className="flex space-x-2">
                <Button onClick={() => generateInvoice('print')} className="flex-1">
                  <Printer className="mr-2 h-4 w-4" />
                  Imprimir
                </Button>
                <Button onClick={() => generateInvoice('download')} variant="outline" className="flex-1">
                  <Download className="mr-2 h-4 w-4" />
                  Baixar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Receipt className="mr-2 h-5 w-5" />
              Gerar Recibo
            </CardTitle>
            <CardDescription>
              Recibo de pagamento de cliente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="receiptClient">Nome do Cliente</Label>
                <Input 
                  id="receiptClient"
                  value={receiptData.clientName}
                  onChange={(e) => setReceiptData({...receiptData, clientName: e.target.value})}
                  placeholder="Ex: Maria Santos"
                />
              </div>
              <div>
                <Label htmlFor="receiptAmount">Valor Pago (MZN)</Label>
                <Input 
                  id="receiptAmount"
                  type="number"
                  value={receiptData.amount}
                  onChange={(e) => setReceiptData({...receiptData, amount: e.target.value})}
                  placeholder="Ex: 6250"
                />
              </div>
              <div>
                <Label htmlFor="receiptDescription">Descrição</Label>
                <Textarea 
                  id="receiptDescription"
                  value={receiptData.description}
                  onChange={(e) => setReceiptData({...receiptData, description: e.target.value})}
                  placeholder="Ex: Pagamento da 2ª parcela do empréstimo"
                />
              </div>
              <div className="flex space-x-2">
                <Button onClick={() => generateReceipt('print')} className="flex-1">
                  <Printer className="mr-2 h-4 w-4" />
                  Imprimir
                </Button>
                <Button onClick={() => generateReceipt('download')} variant="outline" className="flex-1">
                  <Download className="mr-2 h-4 w-4" />
                  Baixar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DocumentGenerator;
