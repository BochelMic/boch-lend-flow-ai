import jsPDF from 'jspdf';

export interface CreditPdfData {
    id: string;
    date: string;
    status: string;

    clientName: string;
    birthDate?: string;
    gender?: string;
    documentType?: string;
    documentNumber?: string;
    nuit?: string;
    phone?: string;
    email?: string;

    neighborhood?: string;
    district?: string;
    province?: string;
    residenceType?: string;

    occupation?: string;
    companyName?: string;
    workDuration?: string;
    monthlyIncome?: string;

    amount: number;
    purpose?: string;
    receiveDate?: string;
    guaranteeType?: string;
    guaranteeMode?: string;
    observations?: string;

    docFrontUrl?: string;
    docBackUrl?: string;
    guaranteePhotos?: string[];

    creditOption?: string;
    isInstallment?: boolean;
    installmentMonths?: number;
    amortizationPlan?: any[];

    company: {
        name: string;
        email?: string;
        phone?: string;
        nuit?: string;
        address?: string;
    };
}

const COLORS = {
    primary: [11, 58, 32] as [number, number, number],
    accent: [211, 124, 34] as [number, number, number],
    dark: [30, 41, 59] as [number, number, number],
    gray: [100, 116, 139] as [number, number, number],
    lightBg: [248, 250, 252] as [number, number, number],
    white: [255, 255, 255] as [number, number, number],
    border: [226, 232, 240] as [number, number, number],
    green: [22, 163, 74] as [number, number, number],
    red: [220, 38, 38] as [number, number, number],
    amber: [217, 119, 6] as [number, number, number],
};

async function loadImageAsBase64(url: string): Promise<string | null> {
    try {
        const response = await fetch(url);
        const blob = await response.blob();
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = () => resolve(null);
            reader.readAsDataURL(blob);
        });
    } catch {
        return null;
    }
}

export async function generateCreditRequestPdf(data: CreditPdfData): Promise<void> {
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageW = 210;
    const margin = 15;
    const contentW = pageW - margin * 2;
    let y = margin;

    const addPage = () => {
        doc.addPage();
        y = margin;
    };

    const checkPageBreak = (needed: number) => {
        if (y + needed > 280) addPage();
    };

    // --- HEADER ---
    // Logo
    try {
        const logoBase64 = await loadImageAsBase64('/logo-bochel.png');
        if (logoBase64) {
            doc.addImage(logoBase64, 'PNG', margin, y, 35, 14);
        }
    } catch { /* skip logo */ }

    // Company info (right aligned)
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLORS.primary);
    doc.text(data.company.name, pageW - margin, y + 3, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.gray);
    let companyY = y + 7;
    if (data.company.nuit) { doc.text('NUIT: ' + data.company.nuit, pageW - margin, companyY, { align: 'right' }); companyY += 3.5; }
    if (data.company.email) { doc.text(data.company.email, pageW - margin, companyY, { align: 'right' }); companyY += 3.5; }
    if (data.company.phone) { doc.text('Tel: ' + data.company.phone, pageW - margin, companyY, { align: 'right' }); companyY += 3.5; }
    if (data.company.address) { doc.text(data.company.address, pageW - margin, companyY, { align: 'right' }); }

    y += 18;

    // Green line
    doc.setDrawColor(...COLORS.primary);
    doc.setLineWidth(0.8);
    doc.line(margin, y, pageW - margin, y);
    y += 8;

    // --- TITLE + STATUS ---
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLORS.primary);
    doc.text('Dossie de Pedido de Credito', margin, y);

    // Status badge
    const statusText = data.status === 'approved' ? 'APROVADO' : data.status === 'rejected' ? 'REJEITADO' : 'PENDENTE';
    const statusColor = data.status === 'approved' ? COLORS.green : data.status === 'rejected' ? COLORS.red : COLORS.amber;
    const badgeW = doc.getTextWidth(statusText) + 10;
    const badgeX = pageW - margin - badgeW;
    doc.setFillColor(...statusColor);
    doc.roundedRect(badgeX, y - 5, badgeW, 7, 3, 3, 'F');
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLORS.white);
    doc.text(statusText, badgeX + badgeW / 2, y - 0.5, { align: 'center' });

    y += 5;

    // --- PEDIDO INFO BAR ---
    doc.setFillColor(...COLORS.lightBg);
    doc.roundedRect(margin, y, contentW, 8, 2, 2, 'F');
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.gray);
    doc.text('N. Pedido: ' + data.id, margin + 4, y + 5.5);
    doc.text('Data do Pedido: ' + data.date, pageW - margin - 4, y + 5.5, { align: 'right' });
    y += 13;

    // --- HELPER: Section Title ---
    const sectionTitle = (title: string) => {
        checkPageBreak(12);
        doc.setFillColor(...COLORS.primary);
        doc.roundedRect(margin, y, contentW, 7, 1.5, 1.5, 'F');
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...COLORS.white);
        doc.text(title, margin + 4, y + 5);
        y += 10;
    };

    // --- HELPER: Info Row ---
    const infoRow = (label: string, value: string | undefined | null, leftX: number, rightX: number) => {
        if (!value || value === '-') return;
        checkPageBreak(6);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...COLORS.gray);
        doc.text(label, leftX, y);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...COLORS.dark);
        doc.text(value, rightX, y, { align: 'right' });
        y += 5;
    };

    // ============================
    // 1. DADOS PESSOAIS
    // ============================
    sectionTitle('1. Dados Pessoais');
    const col1L = margin + 3;
    const col1R = margin + contentW / 2 - 3;
    const col2L = margin + contentW / 2 + 3;
    const col2R = pageW - margin - 3;

    // Left column data
    const personalLeft = [
        ['Nome Completo', data.clientName],
        ['Data Nascimento', data.birthDate],
        ['Sexo', data.gender],
        ['NUIT', data.nuit],
    ].filter(([, v]) => v && v !== '-') as [string, string][];

    const personalRight = [
        ['Documento', data.documentType && data.documentNumber ? data.documentType + ': ' + data.documentNumber : undefined],
        ['Telefone', data.phone],
        ['Email', data.email],
    ].filter(([, v]) => v && v !== '-') as [string, string][];

    const maxRows = Math.max(personalLeft.length, personalRight.length);
    const savedY = y;

    for (const [label, value] of personalLeft) {
        infoRow(label, value, col1L, col1R);
    }
    const leftEndY = y;

    y = savedY;
    for (const [label, value] of personalRight) {
        infoRow(label, value, col2L, col2R);
    }
    y = Math.max(leftEndY, y) + 3;

    // ============================
    // 2. ENDERECO + PROFISSIONAL
    // ============================
    sectionTitle('2. Endereco e Perfil Profissional');

    const addressParts = [data.neighborhood, data.district, data.province].filter(Boolean).join(', ');

    const leftCol2 = [
        ['Morada', addressParts || undefined],
        ['Tipo Residencia', data.residenceType],
    ].filter(([, v]) => v && v !== '-') as [string, string][];

    const rightCol2 = [
        ['Ocupacao', data.occupation],
        ['Empresa/Atividade', data.companyName],
        ['Tempo de Trabalho', data.workDuration],
        ['Rendimento Mensal', data.monthlyIncome ? 'MZN ' + Number(data.monthlyIncome).toLocaleString() : undefined],
    ].filter(([, v]) => v && v !== '-') as [string, string][];

    const savedY2 = y;
    for (const [label, value] of leftCol2) {
        infoRow(label, value, col1L, col1R);
    }
    const leftEnd2 = y;
    y = savedY2;
    for (const [label, value] of rightCol2) {
        infoRow(label, value, col2L, col2R);
    }
    y = Math.max(leftEnd2, y) + 3;

    // ============================
    // 3. INFORMACOES DO CREDITO
    // ============================
    sectionTitle('3. Informacoes do Credito Solicitado');

    const creditLeft = [
        ['Valor Solicitado', 'MZN ' + data.amount.toLocaleString()],
        ['Prazo Escolhido', data.isInstallment ? `${data.installmentMonths} ${data.creditOption === 'A' ? 'Semanas' : 'Meses'}` : '30 dias'],
        ['Finalidade', data.purpose],
        ['Data Desejada', data.receiveDate],
    ].filter(([, v]) => v && v !== '-') as [string, string][];

    const creditRight = [
        ['Opção de Crédito', data.creditOption ? 'Opção ' + data.creditOption : undefined],
        ['Tipo de Plano', data.isInstallment ? 'Parcelado' : 'Pagamento Único'],
        ['Garantia', data.guaranteeType],
        ['Modo Garantia', data.guaranteeMode],
    ].filter(([, v]) => v && v !== '-') as [string, string][];

    const savedY3 = y;
    for (const [label, value] of creditLeft) {
        infoRow(label, value, col1L, col1R);
    }
    const leftEnd3 = y;
    y = savedY3;
    for (const [label, value] of creditRight) {
        infoRow(label, value, col2L, col2R);
    }
    y = Math.max(leftEnd3, y) + 4;

    // --- AMORTIZATION TABLE ---
    if (data.isInstallment && data.amortizationPlan && data.amortizationPlan.length > 0) {
        checkPageBreak(30);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...COLORS.primary);
        doc.text('PLANO DE AMORTIZAÇÃO SIMULADO', margin, y);
        y += 4;

        // Table Header
        doc.setFillColor(...COLORS.lightBg);
        doc.rect(margin, y, contentW, 6, 'F');
        doc.setFontSize(7);
        doc.setTextColor(...COLORS.gray);
        doc.text('#', margin + 3, y + 4);
        doc.text('Data', margin + 15, y + 4);
        doc.text('Principal', margin + 50, y + 4, { align: 'right' });
        doc.text('Juros', margin + 80, y + 4, { align: 'right' });
        doc.text('Total a Pagar', pageW - margin - 3, y + 4, { align: 'right' });
        y += 6;

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...COLORS.dark);
        let totalVal = 0;

        for (const row of data.amortizationPlan) {
            checkPageBreak(6);
            doc.text(row.installmentNumber.toString(), margin + 3, y + 4);
            doc.text(new Date(row.date).toLocaleDateString('pt-MZ'), margin + 15, y + 4);
            doc.text('MT ' + Number(row.principal).toLocaleString(), margin + 50, y + 4, { align: 'right' });
            doc.text('MT ' + Number(row.interest).toLocaleString(), margin + 80, y + 4, { align: 'right' });
            doc.setFont('helvetica', 'bold');
            doc.text('MT ' + Number(row.total).toLocaleString(), pageW - margin - 3, y + 4, { align: 'right' });
            doc.setFont('helvetica', 'normal');
            totalVal += Number(row.total);
            y += 5;
        }

        doc.setDrawColor(...COLORS.border);
        doc.line(margin, y, pageW - margin, y);
        y += 4;
        doc.setFont('helvetica', 'bold');
        doc.text('TOTAL ESTIMADO:', margin + 80, y, { align: 'right' });
        doc.setTextColor(...COLORS.primary);
        doc.text('MT ' + totalVal.toLocaleString(), pageW - margin - 3, y, { align: 'right' });
        y += 6;
    }

    // Observations box
    if (data.observations) {
        checkPageBreak(18);
        doc.setFillColor(255, 251, 235);
        doc.setDrawColor(253, 230, 138);
        doc.roundedRect(margin, y, contentW, 14, 2, 2, 'FD');
        doc.setFontSize(7);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(180, 83, 9);
        doc.text('OBSERVACOES DO CLIENTE', margin + 4, y + 4);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(120, 53, 15);
        const obsLines = doc.splitTextToSize(data.observations, contentW - 8);
        doc.text(obsLines.slice(0, 2), margin + 4, y + 9);
        y += 18;
    }

    // ============================
    // AMOUNT HIGHLIGHT
    // ============================
    checkPageBreak(22);
    y += 3;
    doc.setFillColor(240, 253, 244);
    doc.setDrawColor(187, 247, 208);
    doc.roundedRect(margin, y, contentW, 18, 3, 3, 'FD');
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.gray);
    doc.text('VALOR TOTAL SOLICITADO', pageW / 2, y + 6, { align: 'center' });
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLORS.primary);
    doc.text('MZN ' + data.amount.toLocaleString(), pageW / 2, y + 14, { align: 'center' });
    y += 25;

    // ============================
    // SIGNATURE AREA
    // ============================
    checkPageBreak(25);
    y += 8;
    doc.setDrawColor(...COLORS.gray);
    doc.setLineWidth(0.3);
    // Left signature
    doc.line(margin + 10, y + 10, margin + contentW / 2 - 10, y + 10);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...COLORS.gray);
    doc.text('Assinatura do Cliente', margin + contentW / 4, y + 15, { align: 'center' });
    // Right signature
    doc.line(margin + contentW / 2 + 10, y + 10, pageW - margin - 10, y + 10);
    doc.text('Analista de Credito', margin + contentW * 3 / 4, y + 15, { align: 'center' });

    y += 22;

    // ============================
    // FOOTER
    // ============================
    doc.setDrawColor(...COLORS.border);
    doc.setLineWidth(0.2);
    doc.line(margin, y, pageW - margin, y);
    y += 4;
    doc.setFontSize(7);
    doc.setTextColor(...COLORS.gray);
    doc.text('Documento confidencial gerado automaticamente pelo sistema ' + data.company.name + '.', pageW / 2, y, { align: 'center' });
    doc.text('Data de impressao: ' + new Date().toLocaleDateString('pt-MZ'), pageW / 2, y + 3.5, { align: 'center' });

    // ============================
    // PAGE 2: DOCUMENT PHOTOS
    // ============================
    const hasDocPhotos = data.docFrontUrl || data.docBackUrl;
    const hasGuaranteePhotos = data.guaranteePhotos && data.guaranteePhotos.length > 0;

    if (hasDocPhotos) {
        addPage();

        // Mini header
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...COLORS.primary);
        doc.text('Anexos - Documentos de Identificacao', margin, y + 5);
        doc.setDrawColor(...COLORS.primary);
        doc.setLineWidth(0.5);
        doc.line(margin, y + 7, pageW - margin, y + 7);
        y += 14;

        const imgW = (contentW - 6) / 2;
        const imgH = 80;

        const docPhotos: { label: string; url: string }[] = [];
        if (data.docFrontUrl) docPhotos.push({ label: 'Frente do Documento', url: data.docFrontUrl });
        if (data.docBackUrl) docPhotos.push({ label: 'Verso do Documento', url: data.docBackUrl });

        for (let i = 0; i < docPhotos.length; i++) {
            const xPos = margin + (i % 2) * (imgW + 6);

            // Label
            doc.setFillColor(...COLORS.lightBg);
            doc.setDrawColor(...COLORS.border);
            doc.roundedRect(xPos, y, imgW, imgH + 10, 2, 2, 'FD');
            doc.setFontSize(8);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(...COLORS.primary);
            doc.text(docPhotos[i].label, xPos + imgW / 2, y + 6, { align: 'center' });

            try {
                const imgData = await loadImageAsBase64(docPhotos[i].url);
                if (imgData) {
                    doc.addImage(imgData, 'JPEG', xPos + 3, y + 9, imgW - 6, imgH - 2, undefined, 'MEDIUM');
                }
            } catch { /* skip */ }
        }
        y += imgH + 16;
    }

    // ============================
    // GUARANTEE PHOTOS
    // ============================
    if (hasGuaranteePhotos && data.guaranteePhotos) {
        if (!hasDocPhotos) addPage();
        else if (y > 160) addPage();

        // Section header
        if (hasDocPhotos && y <= 160) {
            y += 5;
        }
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...COLORS.primary);
        doc.text('Anexos - Bens de Garantia', margin, y + 5);
        doc.setDrawColor(...COLORS.primary);
        doc.setLineWidth(0.5);
        doc.line(margin, y + 7, pageW - margin, y + 7);
        y += 14;

        const imgW = (contentW - 6) / 2;
        const imgH = 75;

        for (let i = 0; i < data.guaranteePhotos.length; i++) {
            const col = i % 2;
            if (col === 0 && i > 0) y += imgH + 14;
            if (col === 0) checkPageBreak(imgH + 20);

            const xPos = margin + col * (imgW + 6);

            doc.setFillColor(...COLORS.lightBg);
            doc.setDrawColor(...COLORS.border);
            doc.roundedRect(xPos, y, imgW, imgH + 10, 2, 2, 'FD');
            doc.setFontSize(8);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(...COLORS.primary);
            doc.text('Garantia ' + (i + 1), xPos + imgW / 2, y + 6, { align: 'center' });

            try {
                const imgData = await loadImageAsBase64(data.guaranteePhotos[i]);
                if (imgData) {
                    doc.addImage(imgData, 'JPEG', xPos + 3, y + 9, imgW - 6, imgH - 2, undefined, 'MEDIUM');
                }
            } catch { /* skip */ }
        }
    }

    // ============================
    // SAVE
    // ============================
    const safeName = data.clientName.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30);
    doc.save(`Pedido_Credito_${safeName}.pdf`);
}
