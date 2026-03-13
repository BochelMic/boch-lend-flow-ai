import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Wallet, Loader2, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface WalletInjectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const WalletInjectionModal = ({ isOpen, onClose, onSuccess }: WalletInjectionModalProps) => {
    const { toast } = useToast();
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('Injeção de capital operacional');
    const [loading, setLoading] = useState(false);

    const handleInject = async () => {
        if (!amount || parseFloat(amount) <= 0) {
            toast({ title: 'Erro', description: 'Por favor, insira um valor válido.', variant: 'destructive' });
            return;
        }

        setLoading(true);
        try {
            const { data, error } = await supabase.rpc('inject_wallet_funds', {
                p_amount: parseFloat(amount),
                p_description: description
            });

            if (error) throw error;

            toast({
                title: 'Capital Injectado!',
                description: `MZN ${parseFloat(amount).toLocaleString()} adicionados ao saldo operacional.`
            });

            setAmount('');
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error('Error injecting funds:', error);
            toast({ title: 'Erro na Injeção', description: error.message, variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px] rounded-2xl">
                <DialogHeader>
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-2">
                        <Wallet className="h-6 w-6 text-green-600" />
                    </div>
                    <DialogTitle className="text-xl font-bold">Injectar Capital de Giro</DialogTitle>
                    <DialogDescription>
                        Adicione fundos à carteira do sistema para novos empréstimos.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="amount">Valor a Injectar (MZN)</Label>
                        <Input
                            id="amount"
                            type="number"
                            placeholder="0.00"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="text-lg font-bold h-12"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="description">Descrição / Origem</Label>
                        <Input
                            id="description"
                            placeholder="Ex: Reforço de capital mensal"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>
                </div>

                <DialogFooter className="flex-col sm:flex-row gap-2">
                    <Button variant="outline" onClick={onClose} className="w-full sm:w-auto rounded-xl">
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleInject}
                        disabled={loading}
                        className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl gap-2 shadow-md h-12 sm:h-auto"
                    >
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                        Confirmar Injeção
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default WalletInjectionModal;
