import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

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

    // FormataÃ§Ã£o bÃ¡sica
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
  dueDate?: string;
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
  clientEmail?: string;
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

export interface CreditRequestExportData {
  number: string;
  date: string;
  clientName: string;
  clientPhone?: string;
  clientEmail?: string;
  clientDocument?: string;
  clientNuit?: string;
  clientAddress?: string;
  birthDate?: string;
  gender?: string;
  residenceType?: string;

  occupation?: string;
  companyName?: string;
  workDuration?: string;
  monthlyIncome?: string;

  amount: number;
  purpose?: string;
  duration?: string;
  receiveDate?: string;
  guaranteeType?: string;
  guaranteeMode?: string;
  observations?: string;

  status: string;

  guaranteePhotos?: string[];
  docFrontUrl?: string;
  docBackUrl?: string;

  companyNameInfo: string;
  companyEmailInfo?: string;
  companyPhoneInfo?: string;
  companyNuitInfo?: string;
  companyAddressInfo?: string;
  logoUrl?: string;
}

const pdfBaseStyles = `
  @page { margin: 0; size: A4; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #000; background: #fff; }
  .page { max-width: 800px; margin: 0 auto; padding: 28px 40px; }
  .header { display: flex; align-items: center; justify-content: space-between; padding-bottom: 10px; border-bottom: 2px solid #000; margin-bottom: 14px; }
  .header-left { display: flex; align-items: center; gap: 16px; }
  .header-left img { height: 56px; object-fit: contain; }
  .company-info { text-align: right; font-size: 11px; color: #444; line-height: 1.6; }
  /* FATURA: header igual ao recibo (branco), apenas o título fica preto */
  .invoice-header { display: flex; align-items: center; justify-content: space-between; padding-bottom: 10px; border-bottom: 2px solid #000; margin-bottom: 14px; }
  .invoice-header img { height: 48px; object-fit: contain; }
  .invoice-header .company-info { text-align: right; font-size: 10px; color: #444; line-height: 1.4; }
  .invoice-doc-title { text-align: center; font-size: 16px; font-weight: 700; background: #000; color: #fff; letter-spacing: 3px; text-transform: uppercase; margin-bottom: 14px; padding: 9px 0; }
  .doc-title { text-align: center; font-size: 16px; font-weight: 700; color: #000; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 14px; padding: 8px 0; border-top: 1px solid #ccc; border-bottom: 1px solid #ccc; }
  .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 14px; }
  .info-box { border: 1px solid #ccc; padding: 10px; }
  .info-box h3 { font-size: 9px; text-transform: uppercase; letter-spacing: 1.5px; color: #000; font-weight: 700; margin-bottom: 6px; border-bottom: 1px solid #999; padding-bottom: 3px; display: inline-block; }
  .info-row { display: flex; justify-content: space-between; padding: 2px 0; font-size: 11px; }
  .info-row .label { color: #666; }
  .info-row .value { font-weight: 600; color: #000; }
  .table-section { margin-bottom: 14px; }
  .table-section table { width: 100%; border-collapse: collapse; }
  .table-section th { background: #000; color: #fff; padding: 6px 10px; font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; text-align: left; border: 1px solid #000; }
  .table-section td { padding: 6px 10px; font-size: 11px; border: 1px solid #ccc; }
  .table-section tr:nth-child(even) { background: #fafafa; }
  .total-row { background: #000 !important; }
  .total-row td { font-weight: 700; font-size: 13px; color: #fff !important; border-top: 2px solid #000; }
  .amount-highlight { display: inline-block; border: 2px solid #000; padding: 7px 24px; font-size: 18px; font-weight: 800; letter-spacing: 1px; margin: 8px 0; color: #000; }
  .amount-section { text-align: center; margin: 12px 0; padding: 12px; border: 1px solid #ccc; background: #fff; }
  .amount-label { font-size: 10px; color: #666; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 3px; }
  .amount-highlight-inv { display: inline-block; border: 2px solid #000; padding: 7px 24px; font-size: 20px; font-weight: 800; letter-spacing: 1px; color: #000; }
  .payment-methods { margin: 12px 0; padding: 10px 14px; border: 1px solid #ccc; background: #fafafa; }
  .payment-methods h4 { font-size: 9px; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 700; color: #333; margin-bottom: 6px; border-bottom: 1px solid #ddd; padding-bottom: 3px; }
  .payment-methods-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
  .payment-method-item { display: flex; align-items: center; gap: 6px; font-size: 11px; color: #444; background: #fff; border: 1px solid #e0e0e0; padding: 6px 10px; border-radius: 4px; }
  .footer { margin-top: 14px; padding-top: 10px; border-top: 1px solid #ccc; }
  .footer-text { font-size: 9px; color: #888; text-align: center; line-height: 1.6; }
  .signature-area { display: flex; justify-content: flex-end; margin-top: 24px; padding-top: 6px; }
  .sig-box { width: 45%; text-align: center; }
  .sig-line { border-top: 1px solid #000; padding-top: 6px; font-size: 10px; color: #444; margin-top: 30px; }
  .badge { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 10px; font-weight: 700; }
  .badge-green { background: #e8e8e8; color: #000; }
  .badge-orange { background: #f0f0f0; color: #000; }
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
    installmentRows += `<tr><td>${i}ª Parcela</td><td>---</td><td style="text-align:right">MZN ${val.toLocaleString()}</td></tr>`;
  }

  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Fatura ${s(invoiceData.number)}</title>
<style>${pdfBaseStyles}</style></head><body><div class="page">

  <div class="invoice-header">
    <img src="${invoiceData.logoUrl || '/logo-bochel.png'}" alt="Logo" onerror="this.style.display='none'" />
    <div class="company-info">
      <strong style="font-size:14px;color:#1a1a1a">${s(invoiceData.companyName)}</strong><br/>
      ${invoiceData.companyNuit ? 'NUIT: ' + s(invoiceData.companyNuit) + '<br/>' : ''}
      ${invoiceData.companyEmail ? s(invoiceData.companyEmail) + '<br/>' : ''}
      ${invoiceData.companyPhone ? 'Tel: ' + s(invoiceData.companyPhone) + '<br/>' : ''}
      Mocambique, Maputo
    </div>
  </div>

  <div class="invoice-doc-title">Fatura de Comissão de Crédito</div>

  <div class="info-grid">
    <div class="info-box">
      <h3>Dados do Documento</h3>
      <div class="info-row"><span class="label">Nº Fatura</span><span class="value">${s(invoiceData.number)}</span></div>
      <div class="info-row"><span class="label">Data de Emissão</span><span class="value">${s(invoiceData.date)}</span></div>
      <div class="info-row"><span class="label">Nº Parcelas</span><span class="value">${installments}</span></div>
      ${invoiceData.duration ? `<div class="info-row"><span class="label">Prazo</span><span class="value">${s(invoiceData.duration)}</span></div>` : ''}
      ${invoiceData.dueDate ? `<div class="info-row"><span class="label">Data de Vencimento</span><span class="value" style="font-weight:800;color:#c0392b">${s(invoiceData.dueDate)}</span></div>` : ''}
    </div>
    <div class="info-box">
      <h3>Dados do Cliente</h3>
      <div class="info-row"><span class="label">Nome Completo</span><span class="value">${s(invoiceData.clientName)}</span></div>
      ${invoiceData.clientDocument ? `<div class="info-row"><span class="label">Nº Documento (BI)</span><span class="value">${s(invoiceData.clientDocument)}</span></div>` : ''}
      ${invoiceData.clientNuit ? `<div class="info-row"><span class="label">NUIT</span><span class="value">${s(invoiceData.clientNuit)}</span></div>` : ''}
      ${invoiceData.clientPhone ? `<div class="info-row"><span class="label">Contacto</span><span class="value">${s(invoiceData.clientPhone)}</span></div>` : ''}
      ${invoiceData.clientAddress ? `<div class="info-row"><span class="label">Endereço</span><span class="value">${s(invoiceData.clientAddress)}</span></div>` : ''}
    </div>
  </div>

  <div class="table-section">
    <table>
      <thead><tr><th>Descrição</th><th>Taxa de Juro</th><th style="text-align:right">Valor (MZN)</th></tr></thead>
      <tbody>
        <tr><td>${s(invoiceData.description)}</td><td>${invoiceData.interestRate ? invoiceData.interestRate + '%' : '---'}</td><td style="text-align:right">${invoiceData.amount.toLocaleString()}</td></tr>
        ${invoiceData.interestRate ? `<tr><td>Comissão de Juros (${invoiceData.interestRate}%)</td><td></td><td style="text-align:right">${(totalAmount - invoiceData.amount).toLocaleString()}</td></tr>` : ''}
        <tr class="total-row"><td colspan="2">TOTAL A PAGAR</td><td style="text-align:right">${totalAmount.toLocaleString()}</td></tr>
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
    <div class="amount-label">Total a Pagar</div>
    <div class="amount-highlight-inv">MZN ${totalAmount.toLocaleString()}</div>
  </div>

  <!-- MEIOS DE PAGAMENTO -->
  <div class="payment-methods">
    <h4>Meios de Pagamento</h4>
    <div style="font-size:11px;color:#333;line-height:2;">
      <div style="display:flex;gap:40px;flex-wrap:wrap;">
        <div>
          <div style="font-weight:700;font-size:10px;text-transform:uppercase;letter-spacing:1px;color:#666;margin-bottom:4px">Banco (NIB) &amp; Conta M&oacute;vel</div>
          <div><strong>BCI:</strong> 000800000215226910113</div>
          <div><strong>BIM:</strong> 000100000035411644657</div>
        </div>
        <div>
          <div style="font-weight:700;font-size:10px;text-transform:uppercase;letter-spacing:1px;color:#666;margin-bottom:4px">Carteira M&oacute;vel</div>
          <div><strong>M-Pesa:</strong> 84 582 8205</div>
          <div><strong>e-Mola:</strong> 86 188 7302</div>
        </div>
      </div>
      <div style="margin-top:8px;font-size:11px;color:#555;">Titular: <strong>Armindo Dique Bochiwe</strong></div>
    </div>
    <div style="margin-top:10px;padding:8px 12px;background:#fffbeb;border:1px solid #f59e0b;border-radius:4px;font-size:10px;color:#92400e;line-height:1.6;">
      <strong>⚠ AVISO:</strong> É obrigatório o envio do comprovativo de pagamento via WhatsApp ou por e-mail fornecidos neste documento para a quitação imediata no sistema.
    </div>
  </div>

  <div class="signature-area">
    <div class="sig-box">
      <div class="sig-line">Concedido por — ${s(invoiceData.companyName)}</div>
    </div>
  </div>

  <div class="footer">
    <p class="footer-text">
      Documento gerado por ${s(invoiceData.companyName)} · NUIT: ${s(invoiceData.companyNuit || '1477066510')}<br/>
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
<style>${pdfBaseStyles}</style></head><body><div class="page">
  <div class="header">
    <div class="header-left">
      <img src="${receiptData.logoUrl || '/logo-bochel.png'}" alt="Logo" onerror="this.style.display='none'" />
    </div>
    <div class="company-info">
      <strong style="font-size:14px;color:#1a1a1a">${s(receiptData.companyName)}</strong><br/>
      ${receiptData.companyNuit ? 'NUIT: ' + s(receiptData.companyNuit) + '<br/>' : ''}
      ${receiptData.companyEmail ? s(receiptData.companyEmail) + '<br/>' : ''}
      ${receiptData.companyPhone ? 'Tel: ' + s(receiptData.companyPhone) + '<br/>' : ''}
      Mocambique, Maputo
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
      ${receiptData.clientEmail ? `<div class="info-row"><span class="label">Email</span><span class="value">${s(receiptData.clientEmail)}</span></div>` : ''}
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
        <tr><td>${s(receiptData.description)}</td><td>${s(method)}</td><td style="text-align:right">${receiptData.amount.toLocaleString()}</td></tr>
        ${receiptData.remainingBalance !== undefined ? `<tr><td colspan="2" style="color:#666">Saldo restante após este pagamento</td><td style="text-align:right;color:#666">${receiptData.remainingBalance.toLocaleString()}</td></tr>` : ''}
      </tbody>
    </table>
  </div>

  <div class="amount-section">
    <div class="amount-label">Total Pago</div>
    <div class="amount-highlight">MZN ${receiptData.amount.toLocaleString()}</div>
  </div>

  <div style="border:1px solid #ccc;padding:14px;margin:12px 0;font-size:12px;color:#1a1a1a;line-height:1.7">
    Recebemos de <strong>${s(receiptData.clientName)}</strong> a quantia de <strong>MZN ${receiptData.amount.toLocaleString()}</strong>
    (${s(receiptData.description)}), paga através de <strong>${s(method)}</strong>.
  </div>

  <div style="margin:12px 0;padding:8px 12px;background:#fffbeb;border:1px solid #f59e0b;border-radius:4px;font-size:10px;color:#92400e;line-height:1.6;">
    <strong>⚠ AVISO:</strong> É obrigatório o envio do comprovativo de pagamento via WhatsApp ou por e-mail fornecidos neste documento para a quitação imediata no sistema.
  </div>

  <div class="signature-area">
    <div class="sig-box">
      <div class="sig-line">Recebido por</div>
    </div>
  </div>

  <div class="footer">
    <p class="footer-text">
      Documento gerado por ${s(receiptData.companyName)}.<br/>
      Este recibo serve como comprovativo de pagamento.<br/>
      Data de impressão: ${new Date().toLocaleDateString('pt-MZ')}
    </p>
  </div>
</div></body></html>`;
};

export const generateCreditRequestHTML = (data: CreditRequestExportData) => {
  const s = sanitizeHtml;

  const statusColor = data.status === 'approved' ? '#16a34a'
    : data.status === 'rejected' ? '#dc2626'
      : '#d97706';
  const statusText = data.status === 'approved' ? 'APROVADO'
    : data.status === 'rejected' ? 'REJEITADO'
      : 'PENDENTE';

  let photosHtml = '';
  if (data.guaranteePhotos && data.guaranteePhotos.length > 0) {
    photosHtml = `
      <div style="page-break-before: always; padding-top: 40px;">
        <div class="doc-title">Anexos - Bens de Garantia</div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 20px;">
          ${data.guaranteePhotos.map((photo, i) => `
            <div style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px; background: #f8fafc; text-align: center;">
              <div style="margin-bottom: 8px; font-weight: bold; font-size: 12px; color: #0b3a20;">Anexo ${i + 1}</div>
              <img src="${photo}" style="max-width: 100%; height: 250px; object-fit: cover; border-radius: 4px;" />
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  let docsHtml = '';
  if (data.docFrontUrl || data.docBackUrl) {
    docsHtml = `
      <div style="page-break-before: always; padding-top: 40px;">
        <div class="doc-title">Anexos - Documentos</div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 20px;">
          ${data.docFrontUrl ? `
            <div style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px; background: #f8fafc; text-align: center;">
              <div style="margin-bottom: 8px; font-weight: bold; font-size: 12px; color: #0b3a20;">Frente do Documento</div>
              <img src="${data.docFrontUrl}" style="max-width: 100%; height: 250px; object-fit: contain; border-radius: 4px;" />
            </div>
          ` : ''}
          ${data.docBackUrl ? `
            <div style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px; background: #f8fafc; text-align: center;">
              <div style="margin-bottom: 8px; font-weight: bold; font-size: 12px; color: #0b3a20;">Verso do Documento</div>
              <img src="${data.docBackUrl}" style="max-width: 100%; height: 250px; object-fit: contain; border-radius: 4px;" />
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Pedido ${s(data.number)}</title>
<style>${pdfBaseStyles}
  .status-badge { display: inline-block; padding: 6px 16px; border-radius: 20px; font-size: 12px; font-weight: bold; color: white; background-color: ${statusColor}; margin-left: 10px; vertical-align: middle; }
</style></head><body><div class="page">
  <div class="header">
    <div class="header-left">
      <img src="${data.logoUrl || '/logo-bochel.png'}" alt="Logo" onerror="this.style.display='none'" />
    </div>
    <div class="company-info">
      <strong style="font-size:14px;color:#0b3a20">${s(data.companyNameInfo)}</strong><br/>
      ${data.companyNuitInfo ? 'NUIT: ' + s(data.companyNuitInfo) + '<br/>' : ''}
      ${data.companyEmailInfo ? s(data.companyEmailInfo) + '<br/>' : ''}
      ${data.companyPhoneInfo ? 'Tel: ' + s(data.companyPhoneInfo) + '<br/>' : ''}
      ${s(data.companyAddressInfo || 'Maputo, Moçambique')}
    </div>
  </div>

  <div class="doc-title" style="text-align: left; display: flex; justify-content: space-between; align-items: center; padding: 12px 20px;">
    <span>Dossiê de Pedido de Crédito</span>
    <span class="status-badge">${statusText}</span>
  </div>

  <div class="info-grid" style="grid-template-columns: 1fr;">
    <div class="info-box">
      <div style="display: flex; justify-content: space-between;">
        <div><span class="label">Nº Pedido:</span> <span class="value">${s(data.number)}</span></div>
        <div><span class="label">Data do Pedido:</span> <span class="value">${s(data.date)}</span></div>
      </div>
    </div>
  </div>

  <div class="info-grid">
    <div class="info-box">
      <h3>1. Dados Pessoais</h3>
      <div class="info-row"><span class="label">Nome Completo</span><span class="value">${s(data.clientName)}</span></div>
      ${data.birthDate ? `<div class="info-row"><span class="label">Data Nasc.</span><span class="value">${s(data.birthDate)}</span></div>` : ''}
      ${data.gender ? `<div class="info-row"><span class="label">Sexo</span><span class="value">${s(data.gender)}</span></div>` : ''}
      ${data.clientDocument ? `<div class="info-row"><span class="label">Documento</span><span class="value">${s(data.clientDocument)}</span></div>` : ''}
      ${data.clientNuit ? `<div class="info-row"><span class="label">NUIT</span><span class="value">${s(data.clientNuit)}</span></div>` : ''}
      ${data.clientPhone ? `<div class="info-row"><span class="label">Telefone</span><span class="value">${s(data.clientPhone)}</span></div>` : ''}
      ${data.clientEmail ? `<div class="info-row"><span class="label">Email</span><span class="value">${s(data.clientEmail)}</span></div>` : ''}
    </div>
    
    <div class="info-box">
      <h3>2. Endereço</h3>
      ${data.clientAddress ? `<div class="info-row"><span class="label">Morada</span><span class="value" style="text-align: right; max-width: 60%;">${s(data.clientAddress)}</span></div>` : ''}
      ${data.residenceType ? `<div class="info-row"><span class="label">Tipo Residência</span><span class="value">${s(data.residenceType)}</span></div>` : ''}

      <h3 style="margin-top: 15px;">3. Perfil Profissional</h3>
      ${data.occupation ? `<div class="info-row"><span class="label">Ocupação</span><span class="value">${s(data.occupation)}</span></div>` : ''}
      ${data.companyName ? `<div class="info-row"><span class="label">Empresa/Ativ.</span><span class="value">${s(data.companyName)}</span></div>` : ''}
      ${data.workDuration ? `<div class="info-row"><span class="label">Tempo Trabal.</span><span class="value">${s(data.workDuration)}</span></div>` : ''}
      ${data.monthlyIncome ? `<div class="info-row"><span class="label">Rendimento</span><span class="value">MZN ${s(data.monthlyIncome)}</span></div>` : ''}
    </div>
  </div>

  <div class="info-grid" style="grid-template-columns: 1fr;">
    <div class="info-box">
      <h3>4. Informações do Crédito Solicitado</h3>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
        <div>
          <div class="info-row"><span class="label">Valor Solicitado</span><span class="value" style="color: #0b3a20; font-size: 16px;">MZN ${data.amount.toLocaleString()}</span></div>
          ${data.duration ? `<div class="info-row"><span class="label">Prazo</span><span class="value">${s(data.duration)}</span></div>` : ''}
          ${data.purpose ? `<div class="info-row"><span class="label">Finalidade</span><span class="value">${s(data.purpose)}</span></div>` : ''}
          ${data.receiveDate ? `<div class="info-row"><span class="label">Data Desejada</span><span class="value">${s(data.receiveDate)}</span></div>` : ''}
        </div>
        <div>
          ${data.guaranteeType ? `<div class="info-row"><span class="label">Garantia</span><span class="value">${s(data.guaranteeType)}</span></div>` : ''}
          ${data.guaranteeMode ? `<div class="info-row"><span class="label">Modo</span><span class="value">${s(data.guaranteeMode)}</span></div>` : ''}
        </div>
      </div>
      ${data.observations ? `
        <div style="margin-top: 15px; background: #fffbeb; padding: 10px; border-radius: 6px; border: 1px solid #fde68a;">
          <div style="font-size: 10px; color: #b45309; text-transform: uppercase; margin-bottom: 4px; font-weight: bold;">Observações do Cliente</div>
          <div style="font-size: 12px; color: #78350f;">${s(data.observations)}</div>
        </div>
      ` : ''}
    </div>
  </div>



  <div class="footer">
    <p class="footer-text">
      Documento confidencial gerado automaticamente pelo sistema ${s(data.companyNameInfo)}.<br/>
      Data de impressão: ${new Date().toLocaleDateString('pt-MZ', { hour: '2-digit', minute: '2-digit' })}
    </p>
  </div>
</div>

${photosHtml}
${docsHtml}

</body></html>`;
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

export const downloadDocumentAsPdf = async (htmlContent: string, filename: string) => {
  try {
    console.log('Gerando PDF...', filename);
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.top = '0';
    container.style.width = '800px';
    container.style.backgroundColor = '#ffffff';
    container.innerHTML = htmlContent;
    document.body.appendChild(container);

    const images = Array.from(container.querySelectorAll('img'));
    await Promise.all(images.map(img => {
      if (img.complete) return Promise.resolve();
      return new Promise((resolve) => {
        img.onload = resolve;
        img.onerror = resolve;
      });
    }));

    const element = container.querySelector('.page') as HTMLElement || container;
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false
    });

    const imgData = canvas.toDataURL('image/jpeg', 1.0);
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${filename}.pdf`);

    document.body.removeChild(container);
    return true;
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
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
