
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

export interface ReportData {
  title: string;
  headers: string[];
  data: (string | number)[][];
  summary?: { [key: string]: string | number };
}

export const exportToExcel = (reportData: ReportData, filename: string) => {
  try {
    const wb = XLSX.utils.book_new();
    
    // Criar planilha principal
    const wsData = [
      [reportData.title],
      [],
      reportData.headers,
      ...reportData.data
    ];
    
    // Adicionar resumo se existir
    if (reportData.summary) {
      wsData.push([]);
      wsData.push(['RESUMO']);
      Object.entries(reportData.summary).forEach(([key, value]) => {
        wsData.push([key, value]);
      });
    }
    
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    
    // Formatação básica
    const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
    ws['!cols'] = reportData.headers.map(() => ({ width: 15 }));
    
    XLSX.utils.book_append_sheet(wb, ws, 'Relatório');
    
    // Salvar arquivo
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(data, `${filename}.xlsx`);
    
    return true;
  } catch (error) {
    console.error('Erro ao exportar Excel:', error);
    return false;
  }
};

export const exportToWord = (content: string, filename: string) => {
  try {
    const blob = new Blob([content], {
      type: 'application/msword'
    });
    saveAs(blob, `${filename}.doc`);
    return true;
  } catch (error) {
    console.error('Erro ao exportar Word:', error);
    return false;
  }
};

export const generateInvoiceHTML = (invoiceData: {
  number: string;
  date: string;
  clientName: string;
  amount: number;
  description: string;
  companyName: string;
}) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Fatura ${invoiceData.number}</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .company-name { font-size: 24px; font-weight: bold; }
            .invoice-title { font-size: 20px; margin: 20px 0; }
            .info-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            .info-table td { padding: 8px; border: 1px solid #ddd; }
            .amount { font-size: 18px; font-weight: bold; color: #2563eb; }
            .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #666; }
        </style>
    </head>
    <body>
        <div class="header">
            <div class="company-name">${invoiceData.companyName}</div>
            <div class="invoice-title">FATURA DE CONCESSÃO DE CRÉDITO</div>
        </div>
        
        <table class="info-table">
            <tr><td><strong>Número da Fatura:</strong></td><td>${invoiceData.number}</td></tr>
            <tr><td><strong>Data:</strong></td><td>${invoiceData.date}</td></tr>
            <tr><td><strong>Cliente:</strong></td><td>${invoiceData.clientName}</td></tr>
            <tr><td><strong>Descrição:</strong></td><td>${invoiceData.description}</td></tr>
            <tr><td><strong>Valor:</strong></td><td class="amount">MZN ${invoiceData.amount.toLocaleString()}</td></tr>
        </table>
        
        <div class="footer">
            <p>Esta fatura foi gerada automaticamente pelo sistema.</p>
            <p>Data de impressão: ${new Date().toLocaleDateString()}</p>
        </div>
    </body>
    </html>
  `;
};

export const generateReceiptHTML = (receiptData: {
  number: string;
  date: string;
  clientName: string;
  amount: number;
  description: string;
  companyName: string;
}) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Recibo ${receiptData.number}</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .company-name { font-size: 24px; font-weight: bold; }
            .receipt-title { font-size: 20px; margin: 20px 0; color: #16a34a; }
            .info-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            .info-table td { padding: 8px; border: 1px solid #ddd; }
            .amount { font-size: 18px; font-weight: bold; color: #16a34a; }
            .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #666; }
        </style>
    </head>
    <body>
        <div class="header">
            <div class="company-name">${receiptData.companyName}</div>
            <div class="receipt-title">RECIBO DE PAGAMENTO</div>
        </div>
        
        <table class="info-table">
            <tr><td><strong>Número do Recibo:</strong></td><td>${receiptData.number}</td></tr>
            <tr><td><strong>Data:</strong></td><td>${receiptData.date}</td></tr>
            <tr><td><strong>Cliente:</strong></td><td>${receiptData.clientName}</td></tr>
            <tr><td><strong>Descrição:</strong></td><td>${receiptData.description}</td></tr>
            <tr><td><strong>Valor Pago:</strong></td><td class="amount">MZN ${receiptData.amount.toLocaleString()}</td></tr>
        </table>
        
        <div class="footer">
            <p>Recebemos de ${receiptData.clientName} a quantia acima especificada.</p>
            <p>Data de impressão: ${new Date().toLocaleDateString()}</p>
        </div>
    </body>
    </html>
  `;
};

export const printDocument = (htmlContent: string) => {
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.print();
  }
};

export const downloadDocument = (htmlContent: string, filename: string) => {
  const blob = new Blob([htmlContent], { type: 'text/html' });
  saveAs(blob, `${filename}.html`);
};
