import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '../../hooks/use-toast';
import { Lock, Mail, ArrowRight, Loader2, Shield } from 'lucide-react';

const AgentLoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { loginWithRoleValidation } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const result = await loginWithRoleValidation(email, password, 'agente');
    setIsLoading(false);
    if (!result.success) {
      toast({ title: "Erro de autenticação", description: result.message, variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'linear-gradient(135deg, hsl(222 35% 6%), hsl(217 40% 10%))' }}>
      <div className="w-full max-w-sm space-y-6">
        <div className="flex items-center gap-3 mb-2">
          <img src="/logo-bochel.png" alt="Bochel Microcrédito" className="h-10 bg-white p-1 rounded-md object-contain" />
          <div>
            <h1 className="text-lg font-bold text-foreground tracking-tight">Portal do Agente</h1>
          </div>
        </div>

        <div className="space-y-1">
          <h2 className="text-xl font-bold text-foreground">Acesso de Campo</h2>
          <p className="text-muted-foreground text-sm">Insira as suas credenciais para continuar</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-sm font-medium">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input id="email" type="email" placeholder="agente@bochel.com"
                value={email} onChange={(e) => setEmail(e.target.value)}
                required disabled={isLoading}
                className="h-11 pl-10 text-sm bg-input border-border/60" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-sm font-medium">Senha</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input id="password" type="password" placeholder="••••••••"
                value={password} onChange={(e) => setPassword(e.target.value)}
                required disabled={isLoading}
                className="h-11 pl-10 text-sm bg-input border-border/60" />
            </div>
          </div>

          <Button type="submit" className="w-full h-11 font-semibold text-sm gap-2 group"
            style={{ background: 'linear-gradient(135deg, hsl(217 91% 60%), hsl(210 85% 50%))' }}
            disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : (
              <>Entrar<ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" /></>
            )}
          </Button>
        </form>

        <p className="text-center text-[10px] text-muted-foreground/50">
          Acesso restrito a agentes autorizados
        </p>
      </div>
    </div>
  );
};

export default AgentLoginForm;

