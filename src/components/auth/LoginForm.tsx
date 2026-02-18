import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/use-toast';
import { Shield, UserCheck, User, Lock, Mail, ArrowRight } from 'lucide-react';

const demoCredentials = [
  { label: 'Gestor', email: 'admin@bochel.com', password: 'admin123', icon: Shield, color: 'text-primary', bg: 'bg-primary/10 border-primary/20 hover:bg-primary/20 hover:border-primary/40' },
  { label: 'Agente', email: 'agente@bochel.com', password: 'agente123', icon: UserCheck, color: 'text-accent', bg: 'bg-accent/10 border-accent/20 hover:bg-accent/20 hover:border-accent/40' },
  { label: 'Cliente', email: 'cliente@bochel.com', password: 'cliente123', icon: User, color: 'text-secondary', bg: 'bg-secondary/10 border-secondary/20 hover:bg-secondary/20 hover:border-secondary/40' },
];

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = login(email, password);
    if (!result.success) {
      toast({ title: "Erro de autenticação", description: result.message, variant: "destructive" });
    }
  };

  const handleQuickLogin = (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    const result = login(demoEmail, demoPassword);
    if (!result.success) {
      toast({ title: "Erro", description: result.message, variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left panel - branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-card via-background to-muted flex-col items-center justify-center p-12 relative overflow-hidden border-r border-border">
        {/* Decorative circles */}
        <div className="absolute top-[-80px] left-[-80px] w-64 h-64 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-[-60px] right-[-60px] w-80 h-80 rounded-full bg-secondary/5 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-accent/3 blur-3xl" />

        <div className="relative z-10 max-w-sm text-center">
          {/* Logo */}
          <div className="mx-auto w-20 h-20 rounded-2xl flex items-center justify-center mb-8 shadow-large"
            style={{ background: 'var(--gradient-primary)' }}>
            <span className="text-4xl font-black text-white tracking-tight">B</span>
          </div>

          <h1 className="text-4xl font-black text-foreground tracking-tight mb-2">
            BOCHEL
          </h1>
          <p className="text-lg font-semibold text-primary mb-1">Microcrédito</p>
          <p className="text-sm text-muted-foreground mb-10 leading-relaxed">
            Plataforma integrada de gestão financeira para concessão e acompanhamento de microcrédito.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Clientes', value: '1.200+' },
              { label: 'Empréstimos', value: '850+' },
              { label: 'Recuperação', value: '94%' },
            ].map((stat) => (
              <div key={stat.label} className="bg-card/60 border border-border/50 rounded-xl p-3">
                <p className="text-lg font-bold text-primary">{stat.value}</p>
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
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-medium"
              style={{ background: 'var(--gradient-primary)' }}>
              <span className="text-lg font-black text-white">B</span>
            </div>
            <div>
              <h1 className="text-lg font-black text-foreground tracking-tight">BOCHEL</h1>
              <p className="text-xs text-muted-foreground">Microcrédito</p>
            </div>
          </div>

          {/* Header */}
          <div className="space-y-1">
            <h2 className="text-2xl lg:text-3xl font-bold text-foreground">Bem-vindo de volta</h2>
            <p className="text-muted-foreground text-sm">Aceda à sua conta para continuar</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-medium">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11 pl-10 text-sm bg-input border-border/60 focus:border-primary"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm font-medium">Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-11 pl-10 text-sm bg-input border-border/60 focus:border-primary"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-11 font-semibold text-sm gap-2 group"
              style={{ background: 'var(--gradient-primary)' }}
            >
              Entrar na plataforma
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground uppercase tracking-wider">acesso demo</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Quick access */}
          <div className="grid grid-cols-3 gap-3">
            {demoCredentials.map((cred) => (
              <button
                key={cred.label}
                type="button"
                onClick={() => handleQuickLogin(cred.email, cred.password)}
                className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all duration-200 cursor-pointer ${cred.bg}`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-card`}>
                  <cred.icon className={`h-4 w-4 ${cred.color}`} />
                </div>
                <div className="text-center">
                  <p className="text-xs font-semibold text-foreground">{cred.label}</p>
                </div>
              </button>
            ))}
          </div>

          <p className="text-center text-xs text-muted-foreground">
            © 2025 Bochel Microcrédito · Todos os direitos reservados
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
