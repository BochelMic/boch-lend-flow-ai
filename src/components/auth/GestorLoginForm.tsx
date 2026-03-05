import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/use-toast';
import { Lock, Mail, Loader2, Terminal } from 'lucide-react';

const GestorLoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const result = await login(email, password);
    setIsLoading(false);
    if (!result.success) {
      toast({ title: "Erro", description: result.message, variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'hsl(222 40% 5%)' }}>
      <div className="w-full max-w-xs space-y-5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center border border-border/40"
            style={{ background: 'linear-gradient(135deg, hsl(152 60% 40%), hsl(160 70% 35%))' }}>
            <Terminal className="h-4 w-4 text-white" />
          </div>
          <span className="text-xs font-mono text-muted-foreground/60 tracking-wider uppercase">Acesso Interno</span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3" autoComplete="off">
          <div className="space-y-1">
            <Label htmlFor="email" className="text-xs font-medium text-muted-foreground">ID</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/50" />
              <Input id="email" type="email" placeholder="id@sistema"
                value={email} onChange={(e) => setEmail(e.target.value)}
                required disabled={isLoading}
                autoComplete="username"
                className="h-10 pl-9 text-sm bg-input border-border/40 font-mono" />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="password" className="text-xs font-medium text-muted-foreground">Chave</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/50" />
              <Input id="password" type="password" placeholder="••••••••"
                value={password} onChange={(e) => setPassword(e.target.value)}
                required disabled={isLoading}
                autoComplete="current-password"
                className="h-10 pl-9 text-sm bg-input border-border/40 font-mono" />
            </div>
          </div>

          <Button type="submit" className="w-full h-10 font-medium text-sm"
            style={{ background: 'linear-gradient(135deg, hsl(152 60% 40%), hsl(160 70% 35%))' }}
            disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Autenticar'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default GestorLoginForm;
