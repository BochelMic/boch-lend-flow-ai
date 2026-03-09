import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PDFDocument } from 'pdf-lib';
import { saveAs } from 'file-saver';
import { pdfjs, Document, Page } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import Draggable, { DraggableData, DraggableEvent } from 'react-draggable';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url,
).toString();
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';
import {
    FileText, PenLine, Check, Download, RefreshCw,
    ChevronLeft, Eraser, CheckCircle, Clock, AlertTriangle, User, ChevronRight
} from 'lucide-react';

interface Contract {
    id: string;
    credit_request_id: string | null;
    client_id: string;
    client_name: string;
    signature_url: string | null;
    contract_url?: string | null;
    status: string;
    signed_at: string | null;
    created_at: string;
}

const ContractModule = () => {
    const { user } = useAuth();
    const { toast } = useToast();
    const navigate = useNavigate();
    const isAdmin = user?.role === 'gestor';

    const [contracts, setContracts] = useState<Contract[]>([]);
    const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
    const [showSigning, setShowSigning] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [loanInstallments, setLoanInstallments] = useState(1);

    // Signature state
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [hasSignature, setHasSignature] = useState(false);
    const [signatureImage, setSignatureImage] = useState<string | null>(null);
    const [sigPos, setSigPos] = useState({ x: 50, y: 50 }); // Draggable position
    const [inkColor, setInkColor] = useState('#0000a0'); // Default to Bic Blue

    const [basePdfUrl, setBasePdfUrl] = useState<string>("/contrato-bochel.pdf");
    const [resolvingPdf, setResolvingPdf] = useState(false);

    useEffect(() => {
        const resolveBaseUrl = async () => {
            if (!selectedContract) return;
            setResolvingPdf(true);

            let url = "/contrato-bochel.pdf";
            const currentUrl = selectedContract.contract_url;

            if (currentUrl && !currentUrl.includes('/signatures/')) {
                url = currentUrl;
            } else {
                const customUrl = supabase.storage.from('contracts').getPublicUrl(`${selectedContract.id}.pdf`).data.publicUrl;
                try {
                    const res = await fetch(customUrl, { method: 'HEAD' });
                    if (res.ok) {
                        url = customUrl;
                    }
                } catch (e) { }
            }

            setBasePdfUrl(url);
            setResolvingPdf(false);
        };

        resolveBaseUrl();
    }, [selectedContract]);

    // PDF Viewer State
    const [numPages, setNumPages] = useState<number>(0);
    const [pageNumber, setPageNumber] = useState(1);
    const pdfWrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => { if (user) loadContracts(); }, [user]);

    const loadContracts = async () => {
        if (!user) return;
        setLoading(true);
        try {
            let query = supabase.from('contracts').select('*').order('created_at', { ascending: false });
            if (!isAdmin) query = query.eq('client_id', user.id);
            const { data } = await query;
            setContracts(data || []);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    // Canvas drawing
    const getPos = (e: React.MouseEvent | React.TouchEvent) => {
        const canvas = canvasRef.current!;
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        if ('touches' in e) {
            return {
                x: (e.touches[0].clientX - rect.left) * scaleX,
                y: (e.touches[0].clientY - rect.top) * scaleY,
            };
        }
        return {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY,
        };
    };

    const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
        e.preventDefault();
        const ctx = canvasRef.current?.getContext('2d');
        if (!ctx) return;
        const pos = getPos(e);
        ctx.beginPath();
        ctx.moveTo(pos.x, pos.y);
        setIsDrawing(true);
    };

    const draw = (e: React.MouseEvent | React.TouchEvent) => {
        e.preventDefault();
        if (!isDrawing) return;
        const ctx = canvasRef.current?.getContext('2d');
        if (!ctx) return;
        const pos = getPos(e);
        ctx.lineTo(pos.x, pos.y);
        ctx.strokeStyle = inkColor;
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();
        setHasSignature(true);
    };

    const stopDraw = () => setIsDrawing(false);

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        ctx?.clearRect(0, 0, canvas.width, canvas.height);
        setHasSignature(false);
    };

    const initCanvas = () => {
        setTimeout(() => {
            const canvas = canvasRef.current;
            if (!canvas) return;
            canvas.width = 600;
            canvas.height = 200;
            // Removed white background fill so the signature PNG is transparent
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
        }, 100);
    };

    const prepareDragSignature = () => {
        if (!canvasRef.current) return;
        const dataUrl = canvasRef.current.toDataURL('image/png');
        setSignatureImage(dataUrl);
        // We will now show the PDF with the signature on top instead of the canvas
    };

    const handleDrag = (e: DraggableEvent, data: DraggableData) => {
        setSigPos({ x: data.x, y: data.y });
    };

    const signContract = async () => {
        if (!selectedContract || !user || !signatureImage) return;
        setSaving(true);
        try {
            // Convert dataurl to blob to upload signature png to storage
            const resData = await fetch(signatureImage);
            const blob = await resData.blob();

            const timestamp = Date.now();
            const path = `${user.id}/${selectedContract.id}_${timestamp}.png`;
            const { error: uploadErr } = await supabase.storage.from('signatures').upload(path, blob, { upsert: true });
            if (uploadErr) throw uploadErr;

            const { data: urlData } = supabase.storage.from('signatures').getPublicUrl(path);

            // Fetch existing PDF (ALWAYS get the original unsigned blueprint, never a previously signed one)
            const pdfUrl = basePdfUrl;

            // Append timestamp to bypass browser cache
            const cacheBuster = `?t=${new Date().getTime()}`;
            const resUrl = pdfUrl.includes('?') ? `${pdfUrl}&t=${new Date().getTime()}` : `${pdfUrl}${cacheBuster}`;

            const existingPdfBytes = await fetch(resUrl).then(res => res.arrayBuffer());
            const pdfDoc = await PDFDocument.load(existingPdfBytes);

            const sigBytes = await blob.arrayBuffer();
            const pngImage = await pdfDoc.embedPng(sigBytes);
            // Default scale for signature, adjusted for realism
            const pngDims = pngImage.scale(0.20);

            const pages = pdfDoc.getPages();
            const targetPage = pages[pageNumber - 1] || pages[pages.length - 1]; // Embed onto the current viewed page

            // Calculate coordinates
            const { width: pdfWidth, height: pdfHeight } = targetPage.getSize();

            let pdfX = 50;
            let pdfY = 50;

            // Find actual rendered DOM elements to compute exact visual relative position
            const pageElement = document.querySelector('.react-pdf__Page') as HTMLElement;
            const sigElement = document.querySelector('.draggable-signature') as HTMLElement;

            if (pageElement && sigElement) {
                const pageRect = pageElement.getBoundingClientRect();
                const sigRect = sigElement.getBoundingClientRect();

                // Compute exact X/Y offset in pixels from top-left of the page
                const offsetX = sigRect.left - pageRect.left;
                const offsetY = sigRect.top - pageRect.top;

                // Compute scaling ratio from UI pixels to PDF points
                const scaleX = pdfWidth / pageRect.width;
                const scaleY = pdfHeight / pageRect.height;

                // Translate UI pixel offset to PDF points offset
                pdfX = offsetX * scaleX;

                // For Y: UI (0=top), PDF (0=bottom). 
                // We use sigRect.height to position the image so its top matches the dragged top.
                const pointOffsetY = (offsetY + sigRect.height) * scaleY;
                pdfY = pdfHeight - pointOffsetY;
            }

            targetPage.drawImage(pngImage, {
                x: pdfX,
                y: pdfY,
                width: pngDims.width,
                height: pngDims.height,
            });

            // Save PDF physically and upload
            // We upload to the "signatures" bucket because we know the user has RLS policies allowing inserts here under their user.id
            const finalPdfBytes = await pdfDoc.save();
            const pdfPath = `${user.id}/signed_${selectedContract.id}_${timestamp}.pdf`;

            const { error: pdfUploadErr } = await supabase.storage
                .from('signatures')
                .upload(pdfPath, finalPdfBytes, {
                    contentType: 'application/pdf',
                    upsert: true
                });

            if (pdfUploadErr) throw pdfUploadErr;

            const { data: pdfUrlData } = supabase.storage.from('signatures').getPublicUrl(pdfPath);

            // Update DB with both signature image URL and the new interactive final PDF
            const { error } = await supabase.from('contracts').update({
                signature_url: urlData.publicUrl,
                contract_url: pdfUrlData.publicUrl,
                status: 'signed',
                signed_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            }).eq('id', selectedContract.id);
            if (error) throw error;

            // Notify admins
            try {
                const { data: adminUsers } = await supabase.from('user_roles').select('user_id').eq('role', 'gestor');
                if (adminUsers && adminUsers.length > 0) {
                    const notifications = adminUsers.map((admin: any) => ({
                        user_id: admin.user_id,
                        type: 'contract_signed',
                        title: 'Contrato Assinado',
                        body: `O cliente ${selectedContract.client_name} acabou de assinar o contrato.`,
                        from_user_id: user?.id || selectedContract.client_id
                    }));
                    await supabase.from('notifications').insert(notifications);
                }
            } catch (notifyErr) {
                console.error("Erro ao notificar gestores:", notifyErr);
            }

            toast({ title: 'Contrato assinado!', description: 'A sua assinatura foi aplicada no documento com sucesso!' });
            setShowSigning(false);
            setSignatureImage(null);
            setAgreedToTerms(false);
            setSelectedContract({
                ...selectedContract,
                signature_url: urlData.publicUrl,
                contract_url: pdfUrlData.publicUrl,
                status: 'signed',
                signed_at: new Date().toISOString()
            });
            loadContracts();
        } catch (e: any) {
            toast({ title: 'Erro', description: e.message || 'Erro ao assinar.', variant: 'destructive' });
        } finally { setSaving(false); }
    };

    const handleDownloadPdf = async (contract: Contract | null) => {
        if (!contract) return;
        try {
            toast({ title: 'A preparar documento...' });
            const pdfUrl = contract.contract_url || "/contrato-bochel.pdf";

            // Add cache buster to fetch the latest signed doc from storage
            const cacheBuster = `?t=${new Date().getTime()}`;
            const res = await fetch(pdfUrl + cacheBuster);
            if (!res.ok) throw new Error("Erro ao transferir PDF original");
            const pdfBytes = await res.arrayBuffer();

            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            saveAs(blob, `Contrato_${contract.status === 'signed' ? 'Assinado' : 'Pendente'}_${contract.client_name.replace(/\s+/g, '_')}.pdf`);

            toast({ title: 'Download concluído!' });
        } catch (error: any) {
            console.error(error);
            toast({ title: 'Erro ao baixar documento', description: error.message, variant: 'destructive' });
        }
    };

    const getStatusInfo = (status: string) => {
        const map: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
            pending: { label: 'Aguarda Assinatura', color: 'bg-amber-100 text-amber-800', icon: <Clock className="h-3 w-3" /> },
            signed: { label: 'Assinado', color: 'bg-green-100 text-green-800', icon: <CheckCircle className="h-3 w-3" /> },
            completed: { label: 'Finalizado', color: 'bg-blue-100 text-blue-800', icon: <Check className="h-3 w-3" /> },
        };
        return map[status] || { label: status, color: 'bg-gray-100 text-gray-800', icon: <AlertTriangle className="h-3 w-3" /> };
    };

    const formatDate = (d: string) => new Date(d).toLocaleDateString('pt-MZ', { day: '2-digit', month: '2-digit', year: 'numeric' });

    // Signing view
    if (showSigning && selectedContract) {
        return (
            <div className="container mx-auto p-4 md:p-6 space-y-4 max-w-4xl">
                <Button variant="ghost" onClick={() => { setShowSigning(false); clearCanvas(); setSignatureImage(null); }} className="mb-2">
                    <ChevronLeft className="h-4 w-4 mr-1" /> Voltar
                </Button>

                <div className="text-center mb-6">
                    <h1 className="text-2xl font-bold text-[#1a3a5c]">Assinatura Digital</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        {!signatureImage
                            ? "Passo 1: Desenhe a sua assinatura abaixo."
                            : "Passo 2: Posicione a assinatura no documento."}
                    </p>
                </div>

                {!signatureImage ? (
                    <Card className="border-0 shadow-xl overflow-hidden">
                        <div className="bg-[#1a3a5c] p-4 text-white">
                            <h3 className="font-bold flex items-center gap-2"><PenLine className="h-5 w-5" /> Desenhar Assinatura</h3>
                            <p className="text-xs text-blue-100 mt-1">Desenhe com o dedo ou rato dentro do quadro branco.</p>
                        </div>
                        <CardContent className="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <div className="flex gap-2 items-center">
                                    <span className="text-sm font-medium text-gray-600">Cor:</span>
                                    <button onClick={() => setInkColor('#0000a0')} className={`w-8 h-8 rounded-full shadow-sm border-2 ${inkColor === '#0000a0' ? 'border-[#d37c22] ring-2 ring-[#d37c22]/30' : 'border-gray-200'}`} style={{ backgroundColor: '#0000a0' }} type="button" />
                                    <button onClick={() => setInkColor('#000000')} className={`w-8 h-8 rounded-full shadow-sm border-2 ${inkColor === '#000000' ? 'border-[#d37c22] ring-2 ring-[#d37c22]/30' : 'border-gray-200'}`} style={{ backgroundColor: '#000000' }} type="button" />
                                </div>
                                <Button variant="outline" onClick={clearCanvas} size="sm" className="text-gray-500">
                                    <Eraser className="h-4 w-4 mr-2" /> Limpar
                                </Button>
                            </div>

                            <div className="border-2 border-dashed border-gray-300 rounded-xl overflow-hidden bg-white relative touch-none shadow-inner">
                                <canvas
                                    ref={canvasRef}
                                    className="w-full cursor-crosshair touch-none"
                                    style={{ height: '250px', touchAction: 'none' }}
                                    onMouseDown={startDraw}
                                    onMouseMove={draw}
                                    onMouseUp={stopDraw}
                                    onMouseLeave={stopDraw}
                                    onTouchStart={startDraw}
                                    onTouchMove={draw}
                                    onTouchEnd={stopDraw}
                                />
                                {!hasSignature && (
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                        <p className="text-gray-300 text-lg font-medium flex flex-col items-center">
                                            <PenLine className="h-8 w-8 mb-2 opacity-50" /> Assine aqui
                                        </p>
                                    </div>
                                )}
                            </div>

                            <Button onClick={prepareDragSignature} disabled={!hasSignature} className="w-full mt-6 h-14 text-lg font-bold bg-[#d37c22] hover:bg-[#b0661a] text-white shadow-lg transition-transform active:scale-[0.98]">
                                Continuar para o Documento <ChevronRight className="h-5 w-5 ml-2" />
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        <Card className="border-0 shadow-xl overflow-hidden">
                            <div className="bg-[#1a3a5c] p-4 text-white flex justify-between items-center">
                                <div>
                                    <h3 className="font-bold flex items-center gap-2"><FileText className="h-5 w-5" /> Posicionar Assinatura</h3>
                                    <p className="text-xs text-blue-100 mt-1">Arraste a sua assinatura para o local correto.</p>
                                </div>
                            </div>

                            <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
                                <Button size="sm" variant="outline" onClick={() => setPageNumber(p => Math.max(p - 1, 1))} disabled={pageNumber <= 1}>
                                    <ChevronLeft className="h-4 w-4 mr-1" /> Anterior
                                </Button>
                                <span className="text-sm font-semibold text-gray-700 bg-white px-3 py-1 rounded-full shadow-sm">
                                    Página {pageNumber} de {numPages || '--'}
                                </span>
                                <Button size="sm" variant="outline" onClick={() => setPageNumber(p => Math.min(p + 1, numPages))} disabled={pageNumber >= numPages}>
                                    Próxima <ChevronRight className="h-4 w-4 ml-1" />
                                </Button>
                            </div>

                            <div className="relative bg-gray-200 p-2 md:p-6 flex justify-center overflow-auto" style={{ minHeight: '60vh' }}>
                                <div className="relative shadow-2xl bg-white" ref={pdfWrapperRef}>
                                    {resolvingPdf ? (
                                        <div className="p-12 text-center text-gray-500 h-[600px] flex flex-col justify-center items-center">
                                            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
                                            <span>A preparar documento original...</span>
                                        </div>
                                    ) : (
                                        <Document
                                            file={basePdfUrl}
                                            onLoadSuccess={({ numPages }) => { setNumPages(numPages); setPageNumber(numPages); }}
                                            loading={<div className="p-12 text-center text-gray-500"><RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" /> A carregar documento...</div>}
                                        >
                                            <Page
                                                pageNumber={pageNumber}
                                                renderTextLayer={false}
                                                renderAnnotationLayer={false}
                                                width={Math.min(window.innerWidth - 32, 800)}
                                                className="border border-gray-100"
                                            />
                                        </Document>
                                    )}

                                    {/* Draggable Signature */}
                                    <Draggable position={sigPos} onDrag={handleDrag} bounds="parent">
                                        <div className="draggable-signature absolute top-0 left-0 cursor-move border-2 border-dashed border-[#d37c22] bg-white/40 p-1 rounded z-50 shadow-sm touch-none transition-colors hover:bg-white/60">
                                            <div className="absolute -top-3 -right-3 bg-[#d37c22] text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold shadow">Arraste-me</div>
                                            <img src={signatureImage!} alt="Sua Assinatura" style={{ height: '60px', opacity: 0.95 }} draggable={false} className="touch-none pointer-events-none" />
                                        </div>
                                    </Draggable>
                                </div>
                            </div>
                        </Card>

                        <Card className="border-0 shadow-lg border-t-4 border-t-[#d37c22]">
                            <CardContent className="p-6">
                                <div className="flex items-start gap-3 bg-amber-50/50 rounded-xl p-4 border border-amber-100">
                                    <Checkbox
                                        id="terms_agree"
                                        checked={agreedToTerms}
                                        onCheckedChange={(v) => setAgreedToTerms(v === true)}
                                        className="mt-1 h-5 w-5 border-2 data-[state=checked]:bg-[#1a3a5c] data-[state=checked]:border-[#1a3a5c]"
                                    />
                                    <div>
                                        <label htmlFor="terms_agree" className="text-base font-bold cursor-pointer text-[#1a3a5c]">
                                            Li e concordo com os termos do contrato *
                                        </label>
                                        <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                                            Declaro que li atentamente todas as cláusulas deste contrato e aceito as condições de forma livre e esclarecida. A minha assinatura digital aposta acima tem validade legal.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row items-center gap-3 mt-6">
                                    <Button variant="outline" onClick={() => { setSignatureImage(null); setAgreedToTerms(false); }} className="w-full sm:w-1/3 h-14 text-gray-600 border-gray-300">
                                        Limpar e Redesenhar
                                    </Button>
                                    <Button onClick={signContract} disabled={saving || !agreedToTerms} className="w-full sm:w-2/3 h-14 text-white font-bold text-lg shadow-lg bg-[#1a3a5c] hover:bg-[#122a44] transition-all">
                                        {saving ? <RefreshCw className="h-5 w-5 animate-spin mr-2" /> : <CheckCircle className="h-5 w-5 mr-2" />}
                                        {saving ? 'A Guardar Documento...' : 'Finalizar Assinatura'}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        );
    }

    // Contract detail view
    if (selectedContract) {
        const st = getStatusInfo(selectedContract.status);
        return (
            <div className="container mx-auto p-4 md:p-6 space-y-4 max-w-5xl">
                <Button variant="ghost" onClick={() => setSelectedContract(null)} className="mb-2 hover:bg-white text-gray-600">
                    <ChevronLeft className="h-4 w-4 mr-1" /> Voltar aos Contratos
                </Button>

                <Card className="border-0 shadow-xl overflow-hidden rounded-2xl">
                    <div className="bg-[#1a3a5c] p-6 md:p-8 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <Badge className={`${st.color.replace('bg-', 'bg-white/20 text-white border-0 ')} mb-3 shadow-none backdrop-blur-sm`}><span className="flex items-center gap-1">{st.icon}{st.label}</span></Badge>
                            <h2 className="text-2xl md:text-3xl font-bold">Contrato de Crédito</h2>
                            <p className="text-blue-100 mt-1 flex items-center gap-2"><User className="h-4 w-4" /> Cliente: {selectedContract.client_name}</p>
                        </div>
                        <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/10 text-right">
                            <p className="text-xs text-blue-200 uppercase tracking-widest font-semibold mb-1">Data de Emissão</p>
                            <p className="font-bold text-lg flex items-center justify-end gap-2"><Clock className="h-4 w-4" /> {formatDate(selectedContract.created_at)}</p>
                        </div>
                    </div>

                    <CardContent className="p-0">
                        {/* PDF Reader replacing iframe */}
                        <div className="bg-gray-100 border-b">
                            <div className="bg-white p-4 flex flex-wrap items-center justify-between border-b gap-4">
                                <div className="flex items-center gap-4">
                                    <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2"><FileText className="h-4 w-4 text-[#d37c22]" /> Documento Original</h3>
                                    <div className="flex items-center bg-gray-100 rounded-lg p-1">
                                        <Button size="sm" variant="ghost" className="h-8 px-2" onClick={() => setPageNumber(p => Math.max(p - 1, 1))} disabled={pageNumber <= 1}>
                                            <ChevronLeft className="h-4 w-4" />
                                        </Button>
                                        <span className="text-xs font-medium px-3 text-gray-600">Pág. {pageNumber} de {numPages || '--'}</span>
                                        <Button size="sm" variant="ghost" className="h-8 px-2" onClick={() => setPageNumber(p => Math.min(p + 1, numPages))} disabled={pageNumber >= numPages}>
                                            <ChevronRight className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                                <Button variant="outline" size="sm" onClick={() => handleDownloadPdf(selectedContract)} className="h-9 text-sm font-semibold border-gray-300 shadow-sm hover:bg-gray-50">
                                    <Download className="h-4 w-4 mr-2 text-[#1a3a5c]" /> Descarregar PDF
                                </Button>
                            </div>

                            <div className="flex justify-center bg-gray-200 p-4 md:p-8 overflow-auto" style={{ maxHeight: '60vh' }}>
                                <div className="shadow-2xl bg-white">
                                    <Document
                                        file={selectedContract.contract_url || "/contrato-bochel.pdf"}
                                        onLoadSuccess={({ numPages }) => { setNumPages(numPages); setPageNumber(1); }}
                                        loading={<div className="p-12 text-center text-gray-500"><RefreshCw className="h-6 w-6 animate-spin mx-auto mb-3" /> A carregar contrato...</div>}
                                    >
                                        <Page
                                            pageNumber={pageNumber}
                                            renderTextLayer={false}
                                            renderAnnotationLayer={false}
                                            width={Math.min(window.innerWidth - 32, 800)}
                                            className="border border-gray-100"
                                        />
                                    </Document>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 md:p-8 space-y-6 bg-white">
                            {/* Actions */}
                            {selectedContract.status === 'pending' && (
                                <div className="bg-amber-50 border border-amber-200 p-6 rounded-2xl text-center space-y-4">
                                    <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-2">
                                        <PenLine className="h-6 w-6" />
                                    </div>
                                    <h3 className="text-lg font-bold text-amber-900">Assinatura Pendente</h3>
                                    <p className="text-amber-700 text-sm max-w-md mx-auto">Leia atentamente o documento acima. Se concordar com todas as cláusulas, proceda para a assinatura digital.</p>
                                    <Button
                                        onClick={() => { setShowSigning(true); initCanvas(); }}
                                        className="w-full md:w-auto px-8 h-14 text-white font-bold shadow-xl transition-transform hover:scale-105"
                                        style={{ backgroundColor: '#d37c22' }}
                                    >
                                        <PenLine className="h-5 w-5 mr-3" /> Iniciar Assinatura Digital
                                    </Button>
                                </div>
                            )}

                            {/* Client Success Feedback */}
                            {!isAdmin && selectedContract.status === 'signed' && (
                                <div className="border-2 border-green-100 rounded-2xl p-6 bg-green-50/50 text-center space-y-4">
                                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-2 animate-in zoom-in duration-300">
                                        <CheckCircle className="h-8 w-8" />
                                    </div>
                                    <h3 className="text-xl font-bold text-green-900">Contrato Assinado com Sucesso!</h3>
                                    <p className="text-sm text-green-800 max-w-md mx-auto">
                                        A sua assinatura legal foi aplicada. O documento foi guardado e a nossa equipa já foi notificada para confirmar o processo.
                                    </p>
                                    <Button onClick={() => handleDownloadPdf(selectedContract)} className="bg-green-700 hover:bg-green-800 text-white font-bold h-12 px-8 shadow-md mt-4">
                                        <Download className="h-5 w-5 mr-2" /> Baixar Cópia do Contrato
                                    </Button>
                                    <div className="flex flex-col gap-2 pt-2">
                                        <Button variant="outline" onClick={() => { setShowSigning(true); initCanvas(); setAgreedToTerms(false); }} className="border-green-200 text-green-700 hover:bg-green-50">
                                            <PenLine className="h-4 w-4 mr-2" /> Refazer Assinatura (Teste de Posição)
                                        </Button>
                                        <Button variant="ghost" onClick={() => setSelectedContract(null)} className="text-gray-600 hover:bg-green-100">
                                            Voltar à Minha Conta
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* Admin Actions */}
                            {isAdmin && selectedContract.status === 'pending' && (
                                <div className="border border-gray-200 rounded-2xl p-6 bg-gray-50 flex flex-col gap-3">
                                    <h3 className="text-base font-bold text-[#1a3a5c] flex items-center gap-2"><FileText className="h-5 w-5" /> Substituir PDF do Contrato</h3>
                                    <p className="text-sm text-gray-500">Se precisar de um contrato personalizado para este cliente específico, faça o upload do novo PDF aqui. O cliente assinará este novo documento.</p>
                                    <div className="mt-2">
                                        <Input
                                            type="file"
                                            accept=".pdf"
                                            className="bg-white border-gray-300 h-12 cursor-pointer shadow-sm"
                                            onChange={async (e) => {
                                                const file = e.target.files?.[0];
                                                if (!file) return;
                                                setSaving(true);
                                                toast({ title: 'A fazer upload...', description: 'A transferir documento para o servidor.' });
                                                try {
                                                    const path = `${selectedContract.id}.pdf`;
                                                    const { error: uploadErr } = await supabase.storage.from('contracts').upload(path, file, { upsert: true });
                                                    if (uploadErr) throw uploadErr;

                                                    const { data } = supabase.storage.from('contracts').getPublicUrl(path);
                                                    await supabase.from('contracts').update({ contract_url: data.publicUrl }).eq('id', selectedContract.id);

                                                    setSelectedContract({ ...selectedContract, contract_url: data.publicUrl });
                                                    toast({ title: 'PDF Atualizado', description: 'O novo documento foi guardado com sucesso!' });
                                                    loadContracts();
                                                } catch (err: any) {
                                                    toast({ title: 'Erro', description: err.message, variant: 'destructive' });
                                                } finally {
                                                    setSaving(false);
                                                }
                                            }}
                                        />
                                    </div>
                                </div>
                            )}

                            {isAdmin && selectedContract.status === 'signed' && (
                                <div className="border-2 border-green-100 rounded-2xl p-6 bg-green-50/50 space-y-4">
                                    <h3 className="text-lg font-bold text-green-900 flex items-center gap-2"><CheckCircle className="h-6 w-6 text-green-600" /> Contrato Assinado!</h3>
                                    <p className="text-sm text-green-800">O cliente assinou o documento em {formatDate(selectedContract.signed_at || '')}. Para aprovar definitivamente o crédito e injetar o saldo na conta corrente do cliente, complete a operação abaixo.</p>

                                    <div className="bg-white p-5 rounded-xl border border-green-100 shadow-sm mt-4">
                                        <p className="text-sm font-bold text-gray-700 mb-3">Definir Número de Parcelas para o Empréstimo</p>
                                        <div className="flex flex-wrap gap-2">
                                            {[1, 2, 3, 4, 6, 12].map(n => (
                                                <button
                                                    key={n}
                                                    onClick={() => setLoanInstallments(n)}
                                                    className={`flex-1 min-w-[60px] py-3 rounded-lg text-sm font-bold transition-all ${loanInstallments === n
                                                        ? 'bg-[#1b5e20] text-white shadow-md ring-2 ring-[#1b5e20] ring-offset-2'
                                                        : 'bg-gray-50 border border-gray-200 text-gray-600 hover:bg-gray-100'
                                                        }`}
                                                >
                                                    {n}x
                                                </button>
                                            ))}
                                        </div>
                                        {loanInstallments > 1 && (
                                            <p className="text-xs text-center font-medium text-green-800 bg-green-100 px-3 py-1.5 rounded-full inline-block mt-4">
                                                Duração do Crédito: {loanInstallments * 30} dias ({loanInstallments} meses)
                                            </p>
                                        )}
                                    </div>

                                    <Button
                                        onClick={async () => {
                                            setSaving(true);
                                            try {
                                                // 1. Obter os dados do pedido de crédito para saber o valor
                                                let loanAmount = 0;
                                                if (selectedContract.credit_request_id) {
                                                    const { data: requestData } = await supabase
                                                        .from('credit_requests')
                                                        .select('amount')
                                                        .eq('id', selectedContract.credit_request_id)
                                                        .single();
                                                    if (requestData?.amount) {
                                                        loanAmount = Number(requestData.amount);
                                                    }
                                                }

                                                if (loanAmount <= 0) {
                                                    toast({ title: 'Aviso', description: 'Não foi possível determinar o valor do empréstimo a partir do pedido associado.', variant: 'destructive' });
                                                    setSaving(false);
                                                    return;
                                                }

                                                // 2. Buscar o ID do Client associado a este user_id
                                                const { data: clientRecord } = await supabase
                                                    .from('clients')
                                                    .select('id')
                                                    .eq('user_id', selectedContract.client_id)
                                                    .single();

                                                if (!clientRecord) {
                                                    toast({ title: 'Aviso', description: 'Registo de Cliente não encontrado para este utilizador. Crie um perfil de cliente primeiro.', variant: 'destructive' });
                                                    setSaving(false);
                                                    return;
                                                }

                                                // 3. Criar Empréstimo Ativo (30 Dias, 30% Juros Fixos)
                                                const interestRate = 30;
                                                const interestValue = loanAmount * (interestRate / 100);
                                                const totalAmount = loanAmount + interestValue;

                                                const startDate = new Date();
                                                const endDate = new Date();
                                                endDate.setDate(startDate.getDate() + (30 * loanInstallments));

                                                const { error: loanError } = await supabase.from('loans').insert({
                                                    client_id: clientRecord.id,
                                                    amount: loanAmount,
                                                    interest_rate: interestRate,
                                                    total_amount: totalAmount,
                                                    remaining_amount: totalAmount,
                                                    installments: loanInstallments,
                                                    status: 'active',
                                                    start_date: startDate.toISOString().split('T')[0],
                                                    end_date: endDate.toISOString().split('T')[0],
                                                });

                                                if (loanError) throw loanError;

                                                // 4. Finalizar Contrato
                                                await supabase.from('contracts').update({ status: 'completed', updated_at: new Date().toISOString() }).eq('id', selectedContract.id);

                                                toast({ title: 'Sucesso Absoluto!', description: 'O saldo foi injetado na conta do cliente e o contrato arquivado.' });
                                                setSelectedContract(null);
                                                loadContracts();
                                            } catch (err: any) {
                                                toast({ title: 'Erro de Processamento', description: err.message, variant: 'destructive' });
                                            } finally {
                                                setSaving(false);
                                            }
                                        }}
                                        className="w-full h-14 text-white font-bold text-lg shadow-xl mt-6 transition-all hover:bg-[#124215]"
                                        style={{ backgroundColor: '#1b5e20' }}
                                        disabled={saving}
                                    >
                                        {saving ? <RefreshCw className="h-5 w-5 animate-spin mr-2" /> : <CheckCircle className="h-5 w-5 mr-2" />}
                                        {saving ? 'A Processar Injeção...' : 'Aprovar Final e Injetar Saldo'}
                                    </Button>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }


    // Contract list view
    return (
        <div className="container mx-auto p-4 md:p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Contratos</h1>
                    <p className="text-sm text-muted-foreground">
                        {isAdmin ? 'Gerencie contratos de crédito' : 'Seus contratos de crédito'}
                    </p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
                <Card className="border-0 shadow-sm">
                    <CardContent className="p-4 text-center">
                        <p className="text-xs text-amber-600">Pendentes</p>
                        <p className="text-2xl font-bold text-amber-600">{contracts.filter(c => c.status === 'pending').length}</p>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm">
                    <CardContent className="p-4 text-center">
                        <p className="text-xs text-green-600">Assinados</p>
                        <p className="text-2xl font-bold text-green-600">{contracts.filter(c => c.status === 'signed').length}</p>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm">
                    <CardContent className="p-4 text-center">
                        <p className="text-xs text-blue-600">Finalizados</p>
                        <p className="text-2xl font-bold text-blue-600">{contracts.filter(c => c.status === 'completed').length}</p>
                    </CardContent>
                </Card>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
                </div>
            ) : contracts.length === 0 ? (
                <Card className="border-0 shadow-md">
                    <CardContent className="py-12 text-center text-muted-foreground">
                        <FileText className="h-12 w-12 mx-auto mb-3 opacity-40" />
                        <p>Nenhum contrato encontrado</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-3">
                    {contracts.map(contract => {
                        const st = getStatusInfo(contract.status);
                        return (
                            <Card key={contract.id} className="border-0 shadow-md cursor-pointer hover:shadow-lg transition-shadow"
                                onClick={() => setSelectedContract(contract)}>
                                <CardContent className="p-4 md:p-5">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-[#1a3a5c] text-white flex items-center justify-center font-bold">
                                                {contract.client_name[0]?.toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-semibold">{contract.client_name}</p>
                                                <p className="text-xs text-gray-500">{formatDate(contract.created_at)}</p>
                                            </div>
                                        </div>
                                        <Badge className={st.color}>
                                            <span className="flex items-center gap-1">{st.icon}{st.label}</span>
                                        </Badge>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default ContractModule;
