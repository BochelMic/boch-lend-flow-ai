import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
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

    // Signature canvas
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [hasSignature, setHasSignature] = useState(false);

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
        ctx.strokeStyle = '#000';
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
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.fillStyle = '#fff';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }
        }, 100);
    };

    const signContract = async () => {
        if (!selectedContract || !user || !hasSignature || !canvasRef.current) return;
        setSaving(true);
        try {
            // Upload signature
            const blob = await new Promise<Blob>((resolve) => {
                canvasRef.current!.toBlob(b => resolve(b!), 'image/png');
            });
            const path = `${user.id}/${selectedContract.id}.png`;
            const { error: uploadErr } = await supabase.storage.from('signatures').upload(path, blob, { upsert: true });
            if (uploadErr) throw uploadErr;

            const { data: urlData } = supabase.storage.from('signatures').getPublicUrl(path);

            // Update contract
            const { error } = await supabase.from('contracts').update({
                signature_url: urlData.publicUrl,
                status: 'signed',
                signed_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            }).eq('id', selectedContract.id);

            if (error) throw error;

            toast({ title: 'Contrato assinado!', description: 'A sua assinatura foi registada com sucesso.' });
            setShowSigning(false);
            setSelectedContract(null);
            loadContracts();
        } catch (e: any) {
            toast({ title: 'Erro', description: e.message || 'Erro ao assinar.', variant: 'destructive' });
        } finally { setSaving(false); }
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
                <Button variant="ghost" onClick={() => { setShowSigning(false); clearCanvas(); }} className="mb-2">
                    <ChevronLeft className="h-4 w-4 mr-1" /> Voltar
                </Button>

                <div className="text-center mb-4">
                    <h1 className="text-2xl font-bold text-gray-900">Assinar Contrato</h1>
                    <p className="text-sm text-gray-500">Leia o contrato abaixo e assine no campo indicado</p>
                </div>

                {/* PDF Viewer */}
                <Card className="border-0 shadow-lg overflow-hidden">
                    <CardContent className="p-0">
                        <div className="bg-gray-100 p-2 flex items-center justify-between border-b">
                            <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-gray-600" />
                                <span className="text-sm font-medium text-gray-700">Contrato Bochel Microcrédito</span>
                            </div>
                            <a href="/contrato-bochel.pdf" download className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                                <Download className="h-3 w-3" /> Baixar PDF
                            </a>
                        </div>
                        <iframe
                            src="/contrato-bochel.pdf"
                            className="w-full border-0"
                            style={{ height: '60vh', minHeight: '400px' }}
                            title="Contrato"
                        />
                    </CardContent>
                </Card>

                {/* Signature Pad */}
                <Card className="border-0 shadow-lg">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <PenLine className="h-5 w-5 text-[#1a3a5c]" />
                                <h3 className="font-bold text-gray-900">Assinatura Digital</h3>
                            </div>
                            <Button variant="outline" size="sm" onClick={clearCanvas} disabled={!hasSignature}>
                                <Eraser className="h-3.5 w-3.5 mr-1" /> Limpar
                            </Button>
                        </div>

                        <p className="text-xs text-gray-500 mb-3">Desenhe a sua assinatura no campo abaixo usando o rato ou o dedo</p>

                        <div className="border-2 border-dashed border-gray-300 rounded-xl overflow-hidden bg-white relative">
                            <canvas
                                ref={canvasRef}
                                className="w-full cursor-crosshair touch-none"
                                style={{ height: '150px' }}
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

                        <div className="flex items-center gap-3 mt-5">
                            <Button
                                onClick={signContract}
                                disabled={!hasSignature || saving}
                                className="flex-1 h-12 text-white font-bold text-base shadow-lg"
                                style={{ backgroundColor: '#1a3a5c' }}
                            >
                                {saving ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <Check className="h-4 w-4 mr-2" />}
                                {saving ? 'A assinar...' : 'Confirmar Assinatura'}
                            </Button>
                        </div>

                        <p className="text-[10px] text-gray-400 mt-3 text-center">
                            Ao assinar, declara ter lido e aceite os termos do contrato de microcrédito da Bochel.
                        </p>
                    </CardContent>
                </Card>
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
                            <div className="bg-gray-100 p-2 flex items-center justify-between border-b">
                                <span className="text-sm text-gray-600 flex items-center gap-1"><FileText className="h-4 w-4" /> Contrato</span>
                                <a href="/contrato-bochel.pdf" download className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                                    <Download className="h-3 w-3" /> Baixar
                                </a>
                            </div>
                            <iframe src="/contrato-bochel.pdf" className="w-full border-0" style={{ height: '50vh' }} title="Contrato" />
                        </div>

                        {/* Signature */}
                        {selectedContract.signature_url && (
                            <div>
                                <p className="text-xs text-gray-500 mb-2">Assinatura do cliente</p>
                                <div className="border rounded-xl p-4 bg-gray-50">
                                    <img src={selectedContract.signature_url} alt="Assinatura" className="max-h-[100px] mx-auto" />
                                </div>
                            </div>
                        )}

                        {/* Actions */}
                        {selectedContract.status === 'pending' && !isAdmin && (
                            <Button
                                onClick={() => { setShowSigning(true); initCanvas(); }}
                                className="w-full h-12 text-white font-bold shadow-lg"
                                style={{ backgroundColor: '#d37c22' }}
                            >
                                <PenLine className="h-4 w-4 mr-2" /> Assinar Contrato
                            </Button>
                        )}

                        {isAdmin && selectedContract.status === 'signed' && (
                            <Button
                                onClick={async () => {
                                    await supabase.from('contracts').update({ status: 'completed', updated_at: new Date().toISOString() }).eq('id', selectedContract.id);
                                    toast({ title: 'Contrato finalizado' });
                                    setSelectedContract(null);
                                    loadContracts();
                                }}
                                className="w-full h-12 text-white font-bold shadow-lg"
                                style={{ backgroundColor: '#1b5e20' }}
                            >
                                <CheckCircle className="h-4 w-4 mr-2" /> Marcar como Finalizado
                            </Button>
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
