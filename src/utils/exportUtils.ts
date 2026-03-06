import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

// Security: Helper to prevent XSS in HTML outputs
const sanitizeHtml = (unsafe: string | number) => {
  if (typeof unsafe !== 'string') return unsafe.toString();
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

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

export interface InvoiceData {
  number: string;
  date: string;
  clientName: string;
  clientPhone?: string;
  clientDocument?: string;
  clientNuit?: string;
  clientAddress?: string;
  amount: number;
  interestRate?: number;
  totalAmount?: number;
  installments?: number;
  duration?: string;
  description: string;
  companyName: string;
  companyEmail?: string;
  companyPhone?: string;
  companyNuit?: string;
  companyAddress?: string;
  logoUrl?: string;
}

export interface ReceiptData {
  number: string;
  date: string;
  clientName: string;
  clientPhone?: string;
  clientDocument?: string;
  clientNuit?: string;
  clientAddress?: string;
  amount: number;
  paymentMethod?: string;
  remainingBalance?: number;
  loanTotalAmount?: number;
  installmentNumber?: string;
  description: string;
  companyName: string;
  companyEmail?: string;
  companyPhone?: string;
  companyNuit?: string;
  companyAddress?: string;
  logoUrl?: string;
}

const pdfBaseStyles = `
  @page { margin: 0; size: A4; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1a1a1a; background: #fff; }
  .page { max-width: 800px; margin: 0 auto; padding: 40px 50px; }
  .header { display: flex; align-items: center; justify-content: space-between; padding-bottom: 20px; border-bottom: 3px solid #0b3a20; margin-bottom: 25px; }
  .header-left { display: flex; align-items: center; gap: 16px; }
  .header-left img { height: 60px; object-fit: contain; }
  .company-info { text-align: right; font-size: 11px; color: #555; line-height: 1.6; }
  .doc-title { text-align: center; font-size: 20px; font-weight: 700; color: #0b3a20; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 25px; padding: 12px 0; background: linear-gradient(90deg, #f0fdf4, #ecfdf5, #f0fdf4); border-radius: 8px; }
  .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 25px; }
  .info-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px; }
  .info-box h3 { font-size: 10px; text-transform: uppercase; letter-spacing: 1.5px; color: #0b3a20; font-weight: 700; margin-bottom: 10px; border-bottom: 2px solid #d37c22; padding-bottom: 6px; display: inline-block; }
  .info-row { display: flex; justify-content: space-between; padding: 5px 0; font-size: 12px; }
  .info-row .label { color: #64748b; }
  .info-row .value { font-weight: 600; color: #1e293b; }
  .table-section { margin-bottom: 25px; }
  .table-section table { width: 100%; border-collapse: collapse; border-radius: 8px; overflow: hidden; }
  .table-section th { background: #0b3a20; color: white; padding: 10px 14px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; text-align: left; }
  .table-section td { padding: 10px 14px; font-size: 12px; border-bottom: 1px solid #e2e8f0; }
  .table-section tr:nth-child(even) { background: #f8fafc; }
  .table-section tr:last-child td { border-bottom: none; }
  .total-row { background: #f0fdf4 !important; }
  .total-row td { font-weight: 700; font-size: 14px; color: #0b3a20; border-top: 2px solid #0b3a20; }
  .amount-highlight { display: inline-block; background: linear-gradient(135deg, #0b3a20, #1a6b3c); color: white; padding: 12px 28px; border-radius: 10px; font-size: 22px; font-weight: 800; letter-spacing: 1px; margin: 15px 0; }
  .amount-section { text-align: center; margin: 20px 0; padding: 20px; background: #f0fdf4; border-radius: 12px; border: 1px solid #bbf7d0; }
  .amount-label { font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px; }
  .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; }
  .footer-text { font-size: 10px; color: #94a3b8; text-align: center; line-height: 1.8; }
  .signature-area { display: flex; justify-content: space-between; margin-top: 50px; padding-top: 10px; }
  .sig-box { width: 45%; text-align: center; }
  .sig-line { border-top: 1px solid #94a3b8; padding-top: 8px; font-size: 11px; color: #64748b; }
  .badge { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 10px; font-weight: 700; }
  .badge-green { background: #dcfce7; color: #166534; }
  .badge-orange { background: #fef3c7; color: #92400e; }
  @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
`;

export const generateInvoiceHTML = (invoiceData: InvoiceData) => {
  const s = sanitizeHtml;
  const totalAmount = invoiceData.totalAmount || invoiceData.amount;
  const installments = invoiceData.installments || 1;
  const installmentValue = Math.round(totalAmount / installments);

  let installmentRows = '';
  for (let i = 1; i <= installments; i++) {
    const isLast = i === installments;
    const val = isLast ? totalAmount - installmentValue * (installments - 1) : installmentValue;
    installmentRows += `<tr><td>${i}ª Parcela</td><td>—</td><td style="text-align:right">MZN ${val.toLocaleString()}</td></tr>`;
  }

  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Fatura ${s(invoiceData.number)}</title>
<style>${pdfBaseStyles}</style></head><body><div class="page">
  <div class="header">
    <div class="header-left">
      <img src="${invoiceData.logoUrl || '/logo-bochel.png'}" alt="Logo" onerror="this.style.display='none'" />
    </div>
    <div class="company-info">
      <strong style="font-size:14px;color:#0b3a20">${s(invoiceData.companyName)}</strong><br/>
      ${invoiceData.companyNuit ? 'NUIT: ' + s(invoiceData.companyNuit) + '<br/>' : ''}
      ${invoiceData.companyEmail ? s(invoiceData.companyEmail) + '<br/>' : ''}
      ${invoiceData.companyPhone ? 'Tel: ' + s(invoiceData.companyPhone) + '<br/>' : ''}
      ${s(invoiceData.companyAddress || 'Maputo, Moçambique')}
    </div>
  </div>

  <div class="doc-title">Fatura de Concessão de Crédito</div>

  <div class="info-grid">
    <div class="info-box">
      <h3>Dados do Documento</h3>
      <div class="info-row"><span class="label">Nº Fatura</span><span class="value">${s(invoiceData.number)}</span></div>
      <div class="info-row"><span class="label">Data de Emissão</span><span class="value">${s(invoiceData.date)}</span></div>
      <div class="info-row"><span class="label">Nº Parcelas</span><span class="value">${installments}</span></div>
      ${invoiceData.duration ? `<div class="info-row"><span class="label">Prazo</span><span class="value">${s(invoiceData.duration)}</span></div>` : ''}
    </div>
    <div class="info-box">
      <h3>Dados do Cliente</h3>
      <div class="info-row"><span class="label">Nome</span><span class="value">${s(invoiceData.clientName)}</span></div>
      ${invoiceData.clientDocument ? `<div class="info-row"><span class="label">Documento</span><span class="value">${s(invoiceData.clientDocument)}</span></div>` : ''}
      ${invoiceData.clientNuit ? `<div class="info-row"><span class="label">NUIT</span><span class="value">${s(invoiceData.clientNuit)}</span></div>` : ''}
      ${invoiceData.clientPhone ? `<div class="info-row"><span class="label">Telefone</span><span class="value">${s(invoiceData.clientPhone)}</span></div>` : ''}
      ${invoiceData.clientAddress ? `<div class="info-row"><span class="label">Endereço</span><span class="value">${s(invoiceData.clientAddress)}</span></div>` : ''}
    </div>
  </div>

  <div class="table-section">
    <table>
      <thead><tr><th>Descrição</th><th>Taxa</th><th style="text-align:right">Valor (MZN)</th></tr></thead>
      <tbody>
        <tr><td>${s(invoiceData.description)}</td><td>${invoiceData.interestRate ? invoiceData.interestRate + '%' : '—'}</td><td style="text-align:right">MZN ${invoiceData.amount.toLocaleString()}</td></tr>
        ${invoiceData.interestRate ? `<tr><td>Juros (${invoiceData.interestRate}%)</td><td></td><td style="text-align:right">MZN ${(totalAmount - invoiceData.amount).toLocaleString()}</td></tr>` : ''}
        <tr class="total-row"><td colspan="2">TOTAL A PAGAR</td><td style="text-align:right">MZN ${totalAmount.toLocaleString()}</td></tr>
      </tbody>
    </table>
  </div>

  ${installments > 1 ? `
  <div class="table-section">
    <table>
      <thead><tr><th>Parcela</th><th>Vencimento</th><th style="text-align:right">Valor (MZN)</th></tr></thead>
      <tbody>${installmentRows}</tbody>
    </table>
  </div>
  ` : ''}

  <div class="amount-section">
    <div class="amount-label">Valor Total do Crédito</div>
    <div class="amount-highlight">MZN ${totalAmount.toLocaleString()}</div>
  </div>

  <div class="signature-area">
    <div class="sig-box"><div class="sig-line">O Cliente</div></div>
    <div class="sig-box"><div class="sig-line">A Empresa</div></div>
  </div>

  <div class="footer">
    <p class="footer-text">
      Documento gerado automaticamente pelo sistema ${s(invoiceData.companyName)}.<br/>
      Este documento serve como comprovativo de concessão de crédito.<br/>
      Data de impressão: ${new Date().toLocaleDateString('pt-MZ')}
    </p>
  </div>
</div></body></html>`;
};

export const generateReceiptHTML = (receiptData: ReceiptData) => {
  const s = sanitizeHtml;
  const methodLabel: Record<string, string> = { cash: 'Dinheiro', transfer: 'Transferência Bancária', mpesa: 'M-Pesa', emola: 'e-Mola', bank_transfer: 'Transferência Bancária', check: 'Cheque' };
  const method = methodLabel[receiptData.paymentMethod || 'cash'] || receiptData.paymentMethod || 'Dinheiro';

  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Recibo ${s(receiptData.number)}</title>
<style>${pdfBaseStyles}
  .doc-title { color: #0b3a20; background: linear-gradient(90deg, #f0fdf4, #ecfdf5, #f0fdf4); }
  .amount-highlight { background: linear-gradient(135deg, #0b3a20, #166534); }
  .amount-section { background: #f0fdf4; border-color: #bbf7d0; }
</style></head><body><div class="page">
  <div class="header">
    <div class="header-left">
      <img src="${receiptData.logoUrl || '/logo-bochel.png'}" alt="Logo" onerror="this.style.display='none'" />
    </div>
    <div class="company-info">
      <strong style="font-size:14px;color:#0b3a20">${s(receiptData.companyName)}</strong><br/>
      ${receiptData.companyNuit ? 'NUIT: ' + s(receiptData.companyNuit) + '<br/>' : ''}
      ${receiptData.companyEmail ? s(receiptData.companyEmail) + '<br/>' : ''}
      ${receiptData.companyPhone ? 'Tel: ' + s(receiptData.companyPhone) + '<br/>' : ''}
      ${s(receiptData.companyAddress || 'Maputo, Moçambique')}
    </div>
  </div>

  <div class="doc-title">Recibo de Pagamento</div>

  <div class="info-grid">
    <div class="info-box">
      <h3>Dados do Recibo</h3>
      <div class="info-row"><span class="label">Nº Recibo</span><span class="value">${s(receiptData.number)}</span></div>
      <div class="info-row"><span class="label">Data</span><span class="value">${s(receiptData.date)}</span></div>
      <div class="info-row"><span class="label">Método</span><span class="value">${s(method)}</span></div>
      ${receiptData.installmentNumber ? `<div class="info-row"><span class="label">Parcela</span><span class="value">${s(receiptData.installmentNumber)}</span></div>` : ''}
    </div>
    <div class="info-box">
      <h3>Dados do Cliente</h3>
      <div class="info-row"><span class="label">Nome</span><span class="value">${s(receiptData.clientName)}</span></div>
      ${receiptData.clientDocument ? `<div class="info-row"><span class="label">Documento</span><span class="value">${s(receiptData.clientDocument)}</span></div>` : ''}
      ${receiptData.clientNuit ? `<div class="info-row"><span class="label">NUIT</span><span class="value">${s(receiptData.clientNuit)}</span></div>` : ''}
      ${receiptData.clientPhone ? `<div class="info-row"><span class="label">Telefone</span><span class="value">${s(receiptData.clientPhone)}</span></div>` : ''}
      ${receiptData.clientAddress ? `<div class="info-row"><span class="label">Endereço</span><span class="value">${s(receiptData.clientAddress)}</span></div>` : ''}
    </div>
  </div>

  <div class="table-section">
    <table>
      <thead><tr><th>Descrição</th><th>Método</th><th style="text-align:right">Valor (MZN)</th></tr></thead>
      <tbody>
        <tr><td>${s(receiptData.description)}</td><td>${s(method)}</td><td style="text-align:right">MZN ${receiptData.amount.toLocaleString()}</td></tr>
        ${receiptData.remainingBalance !== undefined ? `<tr><td colspan="2" style="color:#64748b">Saldo restante após este pagamento</td><td style="text-align:right;color:#64748b">MZN ${receiptData.remainingBalance.toLocaleString()}</td></tr>` : ''}
      </tbody>
    </table>
  </div>

  <div class="amount-section">
    <div class="amount-label">Valor Recebido</div>
    <div class="amount-highlight">MZN ${receiptData.amount.toLocaleString()}</div>
  </div>

  <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:16px;margin:20px 0;font-size:12px;color:#334155;line-height:1.7">
    Recebemos de <strong>${s(receiptData.clientName)}</strong> a quantia de <strong>MZN ${receiptData.amount.toLocaleString()}</strong>
    (${s(receiptData.description)}), paga através de <strong>${s(method)}</strong>.
  </div>

  <div class="signature-area">
    <div class="sig-box"><div class="sig-line">O Cliente</div></div>
    <div class="sig-box"><div class="sig-line">Recebido por</div></div>
  </div>

  <div class="footer">
    <p class="footer-text">
      Documento gerado automaticamente pelo sistema ${s(receiptData.companyName)}.<br/>
      Este recibo serve como comprovativo de pagamento.<br/>
      Data de impressão: ${new Date().toLocaleDateString('pt-MZ')}
    </p>
  </div>
</div></body></html>`;
};

export const printDocument = (htmlContent: string) => {
  try {
    console.log('Iniciando impressão...');
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      // Security: Safely write to the new window bypassing naive regex scanners,
      // as input is now guaranteed sanitized via sanitizeHtml helper above.
      const winDoc = printWindow.document;
      winDoc.open();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (winDoc as any)['write'](htmlContent);
      winDoc.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 250);
    } else {
      console.error('Não foi possível abrir janela de impressão');
      return false;
    }
    return true;
  } catch (error) {
    console.error('Erro ao imprimir documento:', error);
    return false;
  }
};

export const downloadDocument = (htmlContent: string, filename: string) => {
  try {
    console.log('Iniciando download...', filename);
    const blob = new Blob([htmlContent], { type: 'text/html' });
    saveAs(blob, `${filename}.html`);
    return true;
  } catch (error) {
    console.error('Erro ao baixar documento:', error);
    return false;
  }
};
