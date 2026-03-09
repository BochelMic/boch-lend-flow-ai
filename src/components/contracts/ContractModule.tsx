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
    ChevronLeft, Eraser, CheckCircle, Clock, AlertTriangle
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

            // Fetch existing PDF
            const pdfUrl = selectedContract.contract_url || "/contrato-bochel.pdf";
            const existingPdfBytes = await fetch(pdfUrl).then(res => res.arrayBuffer());
            const pdfDoc = await PDFDocument.load(existingPdfBytes);

            const sigBytes = await blob.arrayBuffer();
            const pngImage = await pdfDoc.embedPng(sigBytes);
            // Default scale for signature, adjusted for realism
            const pngDims = pngImage.scale(0.20);

            const pages = pdfDoc.getPages();
            const lastPage = pages[pages.length - 1]; // Embed onto the last page

            // Calculate coordinates
            // Assuming the PDF viewer renders at native react-pdf scale roughly equal to PDF points
            const { width, height } = lastPage.getSize();
            // Optional: ratio if we know the display rect width vs PDF rect width
            let scaleRatio = 1;
            if (pdfWrapperRef.current) {
                const uiWidth = pdfWrapperRef.current.getBoundingClientRect().width;
                scaleRatio = width / uiWidth;
            }

            // UI coordinates translation
            // pdf-lib Y starts differently from bottom-left (0,0)
            const pdfX = sigPos.x * scaleRatio;
            // pdfY must subtract the height of the signature so it doesn't draw above cursor
            const uiSigHeight = 60; // approximate signature div height in px
            const pdfY = height - ((sigPos.y + uiSigHeight) * scaleRatio);

            lastPage.drawImage(pngImage, {
                x: pdfX,
                y: pdfY,
                width: pngDims.width,
                height: pngDims.height,
            });

            // Save PDF physically and upload
            const finalPdfBytes = await pdfDoc.save();
            const signedPdfBlob = new Blob([finalPdfBytes], { type: 'application/pdf' });

            const pdfPath = `signed_${selectedContract.id}_${timestamp}.pdf`;
            const { error: pdfUploadErr } = await supabase.storage.from('contracts').upload(pdfPath, signedPdfBlob, { upsert: true });
            if (pdfUploadErr) throw pdfUploadErr;

            const { data: pdfUrlData } = supabase.storage.from('contracts').getPublicUrl(pdfPath);

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
            setSelectedContract(null);
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
            <div className="container mx-auto p-4 md:p-6 space-y-4">
                <Button variant="ghost" onClick={() => { setShowSigning(false); clearCanvas(); setSignatureImage(null); }} className="mb-2">
                    <ChevronLeft className="h-4 w-4 mr-1" /> Voltar
                </Button>

                <div className="text-center mb-4">
                    <h1 className="text-2xl font-bold text-gray-900">Assinar Contrato</h1>
                    <p className="text-sm text-gray-500">
                        {!signatureImage
                            ? "Primeiro, desenhe a sua assinatura no quadro."
                            : "Arraste a assinatura para o local desejado no documento e confirme."}
                    </p>
                </div>

                {!signatureImage ? (
                    <Card className="border-0 shadow-lg">
                        <CardContent className="p-6">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                                <div className="flex items-center gap-2">
                                    <PenLine className="h-5 w-5 text-[#1a3a5c]" />
                                    <h3 className="font-bold text-gray-900">Desenhar Assinatura</h3>
                                </div>
                                <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                                    <div className="flex gap-2 items-center">
                                        <span className="text-sm font-medium text-gray-600">Cor:</span>
                                        <button
                                            onClick={() => setInkColor('#0000a0')}
                                            className={`w-8 h-8 rounded-full shadow-sm border-2 ${inkColor === '#0000a0' ? 'border-[#d37c22] ring-2 ring-[#d37c22]/30' : 'border-gray-200'} transition-all`}
                                            style={{ backgroundColor: '#0000a0' }}
                                            title="Azul Bic"
                                            type="button"
                                        />
                                        <button
                                            onClick={() => setInkColor('#000000')}
                                            className={`w-8 h-8 rounded-full shadow-sm border-2 ${inkColor === '#000000' ? 'border-[#d37c22] ring-2 ring-[#d37c22]/30' : 'border-gray-200'} transition-all`}
                                            style={{ backgroundColor: '#000000' }}
                                            title="Preto"
                                            type="button"
                                        />
                                    </div>
                                    <Button variant="outline" onClick={clearCanvas} size="sm">
                                        <Eraser className="h-4 w-4 mr-2" /> Limpar
                                    </Button>
                                </div>
                            </div>

                            <div className="border-2 border-dashed border-gray-300 rounded-xl overflow-hidden bg-white relative">
                                <canvas
                                    ref={canvasRef}
                                    className="w-full cursor-crosshair touch-none"
                                    style={{ height: '200px', touchAction: 'none' }}
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
                                        <p className="text-gray-300 text-sm font-medium">Assine aqui</p>
                                    </div>
                                )}
                            </div>

                            <Button onClick={prepareDragSignature} disabled={!hasSignature} className="w-full mt-4 h-12">
                                Continuar
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <Card className="border-0 shadow-lg overflow-hidden flex flex-col items-center p-2 bg-gray-50">
                        {/* Interactive PDF Drag View */}
                        <div className="text-sm bg-blue-100 text-blue-800 p-2 rounded-md mb-2 w-full text-center">
                            <strong>Dica:</strong> Toque e segure a assinatura para arrastá-la para o espaço "Nome" na última página! Vá até a última página para assinar.
                        </div>

                        <div className="flex flex-col mb-4 bg-white p-2 rounded w-full">
                            <div className="flex justify-between items-center mb-2">
                                <Button size="sm" variant="outline" onClick={() => setPageNumber(p => Math.max(p - 1, 1))} disabled={pageNumber <= 1}>Página Anterior</Button>
                                <span className="text-sm text-gray-600">Página {pageNumber} de {numPages || '--'}</span>
                                <Button size="sm" variant="outline" onClick={() => setPageNumber(p => Math.min(p + 1, numPages))} disabled={pageNumber >= numPages}>Próxima Página</Button>
                            </div>
                        </div>

                        <div className="relative border shadow-sm select-none" ref={pdfWrapperRef} style={{ maxWidth: '100%', overflow: 'hidden' }}>
                            <Document
                                file={selectedContract?.contract_url || "/contrato-bochel.pdf"}
                                onLoadSuccess={({ numPages }) => { setNumPages(numPages); setPageNumber(numPages); }} /* Auto go to last page */
                                className="w-full"
                            >
                                <Page
                                    pageNumber={pageNumber}
                                    renderTextLayer={false}
                                    renderAnnotationLayer={false}
                                    width={Math.min(window.innerWidth - 60, 800)}
                                />
                            </Document>

                            {/* Only show signature if we are on the final page */}
                            {pageNumber === numPages && (
                                <Draggable position={sigPos} onDrag={handleDrag} bounds="parent">
                                    <div className="absolute top-0 left-0 cursor-move border-2 border-dashed border-blue-500 rounded p-1 bg-white/50 z-50">
                                        <img src={signatureImage} alt="Assinatura" style={{ height: '60px', opacity: 0.9 }} draggable={false} />
                                    </div>
                                </Draggable>
                            )}
                        </div>

                        <div className="w-full px-4 mt-6">
                            <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
                                <Checkbox
                                    id="terms_agree"
                                    checked={agreedToTerms}
                                    onCheckedChange={(v) => setAgreedToTerms(v === true)}
                                    className="mt-0.5"
                                />
                                <div>
                                    <label htmlFor="terms_agree" className="text-sm font-medium cursor-pointer text-gray-900">
                                        Li e concordo com os termos do contrato *
                                    </label>
                                    <p className="text-xs text-amber-700 mt-1 pb-1">
                                        Confirmo que li todas as páginas, compreendo as cláusulas apresentadas neste documento e aceito as condições firmadas de forma livre.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center w-full gap-3 mt-4 px-4 pb-4">
                            <Button variant="outline" onClick={() => { setSignatureImage(null); setAgreedToTerms(false); }} className="flex-1 h-12">
                                Redesenhar
                            </Button>
                            <Button onClick={signContract} disabled={saving || !agreedToTerms} className="flex-1 h-12 text-white font-bold text-base shadow-lg bg-[#1a3a5c]">
                                {saving ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <Check className="h-4 w-4 mr-2" />}
                                {saving ? 'A Guardar...' : 'Confirmar e Submeter'}
                            </Button>
                        </div>
                    </Card>
                )}
            </div>
        );
    }

    // Contract detail view
    if (selectedContract) {
        const st = getStatusInfo(selectedContract.status);
        return (
            <div className="container mx-auto p-4 md:p-6 space-y-4">
                <Button variant="ghost" onClick={() => setSelectedContract(null)} className="mb-2">
                    <ChevronLeft className="h-4 w-4 mr-1" /> Voltar
                </Button>

                <Card className="border-0 shadow-lg">
                    <CardContent className="p-6 space-y-5">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-900">Contrato</h2>
                            <Badge className={st.color}><span className="flex items-center gap-1">{st.icon}{st.label}</span></Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div><p className="text-xs text-gray-500">Cliente</p><p className="font-medium">{selectedContract.client_name}</p></div>
                            <div><p className="text-xs text-gray-500">Data</p><p className="font-medium">{formatDate(selectedContract.created_at)}</p></div>
                            {selectedContract.signed_at && (
                                <div><p className="text-xs text-gray-500">Assinado em</p><p className="font-medium">{formatDate(selectedContract.signed_at)}</p></div>
                            )}
                        </div>

                        {/* PDF */}
                        <div className="border rounded-xl overflow-hidden">
                            <div className="bg-gray-100 p-2 flex flex-wrap items-center justify-between border-b gap-2">
                                <span className="text-sm text-gray-600 flex items-center gap-1"><FileText className="h-4 w-4" /> Contrato</span>
                                <Button variant="default" size="sm" onClick={() => handleDownloadPdf(selectedContract)} className="h-8 text-xs bg-[#1a3a5c]">
                                    <Download className="h-3 w-3 mr-1" /> Baixar PDF
                                </Button>
                            </div>
                            <iframe src={`${selectedContract.contract_url || "/contrato-bochel.pdf"}#toolbar=0`} className="w-full border-0" style={{ height: '50vh' }} title="Contrato" />
                        </div>

                        {/* Actions */}
                        {selectedContract.status === 'pending' && (
                            <Button
                                onClick={() => { setShowSigning(true); initCanvas(); }}
                                className="w-full h-12 text-white font-bold shadow-lg"
                                style={{ backgroundColor: '#d37c22' }}
                            >
                                <PenLine className="h-4 w-4 mr-2" /> Assinar Contrato
                            </Button>
                        )}

                        {/* Admin Actions */}
                        {isAdmin && selectedContract.status === 'pending' && (
                            <div className="border rounded-xl p-4 bg-gray-50 flex flex-col gap-2 mt-4">
                                <p className="text-sm font-medium">Personalizar PDF do Contrato</p>
                                <p className="text-xs text-gray-500">Faça o upload de um PDF específico para este cliente. Caso contrário, será usado o contrato padronizado.</p>
                                <Input
                                    type="file"
                                    accept=".pdf"
                                    className="bg-white cursor-pointer"
                                    onChange={async (e) => {
                                        const file = e.target.files?.[0];
                                        if (!file) return;
                                        setSaving(true);
                                        toast({ title: 'A fazer upload...', description: 'Aguarde um momento.' });
                                        try {
                                            const path = `${selectedContract.id}.pdf`;
                                            const { error: uploadErr } = await supabase.storage.from('contracts').upload(path, file, { upsert: true });
                                            if (uploadErr) throw uploadErr;

                                            const { data } = supabase.storage.from('contracts').getPublicUrl(path);
                                            await supabase.from('contracts').update({ contract_url: data.publicUrl }).eq('id', selectedContract.id);

                                            setSelectedContract({ ...selectedContract, contract_url: data.publicUrl });
                                            toast({ title: 'PDF Atualizado com sucesso!' });
                                            loadContracts();
                                        } catch (err: any) {
                                            toast({ title: 'Erro', description: err.message, variant: 'destructive' });
                                        } finally {
                                            setSaving(false);
                                        }
                                    }}
                                />
                            </div>
                        )}

                        {isAdmin && selectedContract.status === 'signed' && (
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

                                        toast({ title: 'Saldo Injetado e Contrato Finalizado!' });
                                        setSelectedContract(null);
                                        loadContracts();
                                    } catch (err: any) {
                                        toast({ title: 'Erro', description: err.message, variant: 'destructive' });
                                    } finally {
                                        setSaving(false);
                                    }
                                }}
                                className="w-full h-12 text-white font-bold shadow-lg mt-4"
                                style={{ backgroundColor: '#1b5e20' }}
                                disabled={saving}
                            >
                                <CheckCircle className="h-4 w-4 mr-2" /> {saving ? 'A Processar...' : 'Injetar Saldo e Finalizar'}
                            </Button>
                        )}

                        {isAdmin && selectedContract.status === 'signed' && (
                            <div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-xl space-y-3">
                                <p className="text-sm font-semibold text-gray-700">Número de Parcelas</p>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 6].map(n => (
                                        <button
                                            key={n}
                                            onClick={() => setLoanInstallments(n)}
                                            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${loanInstallments === n
                                                ? 'bg-[#0b3a20] text-white shadow-md'
                                                : 'bg-white border border-gray-200 text-gray-600 hover:border-[#0b3a20]'
                                                }`}
                                        >
                                            {n}x
                                        </button>
                                    ))}
                                </div>
                                {loanInstallments > 1 && (
                                    <p className="text-xs text-gray-500">Prazo total: {loanInstallments * 30} dias ({loanInstallments} meses)</p>
                                )}
                            </div>
                        )}
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
