import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Key } from 'lucide-react';

interface ChangePasswordDialogProps {
    children?: React.ReactNode;
    isOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export function ChangePasswordDialog({ children, isOpen, onOpenChange }: ChangePasswordDialogProps) {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [internalOpen, setInternalOpen] = useState(false);

    const [passwords, setPasswords] = useState({
        newPassword: '',
        confirmPassword: ''
    });

    const isControlled = isOpen !== undefined && onOpenChange !== undefined;
    const open = isControlled ? isOpen : internalOpen;

    const handleOpenChange = (newOpen: boolean) => {
        if (!newOpen) {
            setPasswords({ newPassword: '', confirmPassword: '' });
        }
        if (isControlled) {
            onOpenChange(newOpen);
        } else {
            setInternalOpen(newOpen);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (passwords.newPassword.length < 6) {
            toast({
                title: "Erro",
                description: "A senha deve ter pelo menos 6 caracteres.",
                variant: "destructive"
            });
            return;
        }

        if (passwords.newPassword !== passwords.confirmPassword) {
            toast({
                title: "Erro",
                description: "As senhas não coincidem.",
                variant: "destructive"
            });
            return;
        }

        setLoading(true);
        try {
            const { error } = await supabase.auth.updateUser({
                password: passwords.newPassword
            });

            if (error) {
                throw error;
            }

            toast({
                title: "Sucesso",
                description: "Senha alterada com sucesso.",
            });
            handleOpenChange(false);
        } catch (error: any) {
            toast({
                title: "Erro ao alterar senha",
                description: error.message || "Ocorreu um erro ao tentar alterar a sua senha.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            {children && <DialogTrigger asChild>{children}</DialogTrigger>}
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Key className="w-5 h-5 text-blue-600" />
                        Alterar Senha
                    </DialogTitle>
                    <DialogDescription>
                        Insira a sua nova senha abaixo. Deve conter pelo menos 6 caracteres.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="newPassword">Nova Senha</Label>
                        <Input
                            id="newPassword"
                            type="password"
                            value={passwords.newPassword}
                            onChange={(e) => setPasswords(prev => ({ ...prev, newPassword: e.target.value }))}
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                        <Input
                            id="confirmPassword"
                            type="password"
                            value={passwords.confirmPassword}
                            onChange={(e) => setPasswords(prev => ({ ...prev, confirmPassword: e.target.value }))}
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <DialogFooter className="pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => handleOpenChange(false)}
                            disabled={loading}
                        >
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? "A guardar..." : "Guardar Senha"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
