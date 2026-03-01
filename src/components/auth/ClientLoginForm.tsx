import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/use-toast';
import { Lock, Mail, ArrowRight, Loader2 } from 'lucide-react';

const ClientLoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { loginWithRoleValidation } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const result = await loginWithRoleValidation(email, password, 'cliente');
    setIsLoading(false);
    if (!result.success) {
      toast({ title: "Erro de autenticação", description: result.message, variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left panel - branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-card via-background to-muted flex-col items-center justify-center p-12 relative overflow-hidden border-r border-border">
        <div className="absolute top-[-80px] left-[-80px] w-64 h-64 rounded-full bg-secondary/10 blur-3xl" />
        <div className="absolute bottom-[-60px] right-[-60px] w-80 h-80 rounded-full bg-accent/8 blur-3xl" />

        <div className="relative z-10 max-w-sm text-center">
          <img src="/logo-bochel.png" alt="BOCHEL" className="h-24 object-contain mx-auto mb-4" />
          <p className="text-lg font-semibold mb-1" style={{ color: '#0b3a20' }}>Minha Conta</p>
          <p className="text-sm text-muted-foreground mb-10 leading-relaxed">
            Acompanhe o seu crédito, pagamentos e histórico de forma simples e segura.
          </p>

          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Seguro', value: '🔒' },
              { label: 'Rápido', value: '⚡' },
              { label: 'Simples', value: '✨' },
            ].map((stat) => (
              <div key={stat.label} className="bg-card/60 border border-border/50 rounded-xl p-3">
                <p className="text-2xl mb-1">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel - login form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-16">
        <div className="w-full max-w-md space-y-6">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-6">
            <img src="/logo-bochel.png" alt="BOCHEL" className="h-10 object-contain" />
            <div>
              <p className="text-xs text-muted-foreground mt-1">Minha Conta</p>
            </div>
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground">Bem-vindo</h2>
            <p className="text-muted-foreground text-sm">Aceda à sua conta para acompanhar o seu crédito</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-medium">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email" type="email" placeholder="seu@email.com"
                  value={email} onChange={(e) => setEmail(e.target.value)}
                  required disabled={isLoading}
                  className="h-11 pl-10 text-sm bg-input border-border/60"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm font-medium">Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password" type="password" placeholder="••••••••"
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  required disabled={isLoading}
                  className="h-11 pl-10 text-sm bg-input border-border/60"
                />
              </div>
            </div>

            <Button type="submit" className="w-full h-11 font-semibold text-sm gap-2 group"
              style={{ background: 'linear-gradient(135deg, hsl(270 60% 55%), hsl(280 70% 60%))' }}
              disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                <>Entrar<ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" /></>
              )}
            </Button>
          </form>

          <p className="text-center text-xs text-muted-foreground">
            © 2025 Bochel Microcrédito · Todos os direitos reservados
          </p>
        </div>
      </div>
    </div>
  );
};

export default ClientLoginForm;
