
import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useAuth } from '../../hooks/useAuth';
import { toast } from '../ui/use-toast';
import { User, Mail, Lock, ArrowRight, Loader2, ShieldCheck, Zap, Clock } from 'lucide-react';

interface RegisterFormProps {
  onSwitchToLogin: () => void;
}

const RegisterForm = ({ onSwitchToLogin }: RegisterFormProps) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem.",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Erro",
        description: "A senha deve ter pelo menos 6 caracteres.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    const result = await register({ name, email, password, role: 'cliente' });
    setIsLoading(false);

    if (result.success) {
      toast({
        title: "Sucesso",
        description: result.message,
      });
      onSwitchToLogin();
    } else {
      toast({
        title: "Erro",
        description: result.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left panel - branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col items-center justify-center p-12"
        style={{ background: 'linear-gradient(135deg, #0b3a20 0%, #145a32 50%, #0b3a20 100%)' }}>
        {/* Decorative circles */}
        <div className="absolute top-[-100px] left-[-100px] w-80 h-80 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute bottom-[-80px] right-[-80px] w-96 h-96 rounded-full bg-[#d37c22]/10 blur-3xl" />
        <div className="absolute top-1/3 right-0 w-64 h-64 rounded-full bg-white/3 blur-2xl" />

        <div className="relative z-10 max-w-sm text-center">
          <div className="bg-white/95 rounded-2xl p-3 inline-block mb-8 shadow-xl">
            <img src="/logo-bochel.png?v=3" alt="BOCHEL" className="h-16 object-contain" />
          </div>

          <h1 className="text-3xl font-black text-white tracking-tight mb-3">
            Comece a sua jornada financeira
          </h1>
          <p className="text-white/70 text-sm mb-12 leading-relaxed">
            Crie a sua conta e tenha acesso a crédito rápido, seguro e 100% digital.
          </p>

          <div className="grid grid-cols-3 gap-4">
            {[
              { icon: <Zap className="h-5 w-5" />, label: 'Rápido', desc: 'Aprovação em 24h' },
              { icon: <ShieldCheck className="h-5 w-5" />, label: 'Seguro', desc: 'Dados protegidos' },
              { icon: <Clock className="h-5 w-5" />, label: 'Simples', desc: '100% digital' },
            ].map((item) => (
              <div key={item.label} className="bg-white/10 backdrop-blur-md border border-white/15 rounded-xl p-4 hover:bg-white/15 transition-colors">
                <div className="text-[#d37c22] mb-2 flex justify-center">{item.icon}</div>
                <p className="text-xs font-bold text-white">{item.label}</p>
                <p className="text-[10px] text-white/50 mt-0.5">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-16 bg-gray-50">
        <div className="w-full max-w-md space-y-6">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-4">
            <img src="/logo-bochel.png?v=3" alt="BOCHEL" className="h-12 object-contain" />
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">Criar Conta</h2>
            <p className="text-gray-500 text-sm">Preencha os seus dados para abrir uma conta de cliente</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-sm font-semibold text-gray-700">Nome Completo</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="name"
                  type="text"
                  placeholder="Seu nome completo"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={isLoading}
                  className="h-12 pl-10 text-sm bg-white border-gray-200 focus:border-[#0b3a20] focus:ring-[#0b3a20]/20 rounded-xl shadow-sm"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-semibold text-gray-700">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className="h-12 pl-10 text-sm bg-white border-gray-200 focus:border-[#0b3a20] focus:ring-[#0b3a20]/20 rounded-xl shadow-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-sm font-semibold text-gray-700">Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Mín. 6 caracteres"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    disabled={isLoading}
                    className="h-12 pl-10 text-sm bg-white border-gray-200 focus:border-[#0b3a20] focus:ring-[#0b3a20]/20 rounded-xl shadow-sm"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword" className="text-sm font-semibold text-gray-700">Confirmar</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Repita a senha"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                    disabled={isLoading}
                    className="h-12 pl-10 text-sm bg-white border-gray-200 focus:border-[#0b3a20] focus:ring-[#0b3a20]/20 rounded-xl shadow-sm"
                  />
                </div>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-sm font-bold gap-2 group rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all text-white"
              style={{ backgroundColor: '#d37c22' }}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  Criar Minha Conta
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-gray-50 px-3 text-gray-400 font-semibold">Ou</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full h-12 font-semibold text-sm border-gray-200 text-gray-700 hover:bg-white hover:border-[#0b3a20] hover:text-[#0b3a20] transition-all rounded-xl"
            onClick={onSwitchToLogin}
          >
            Já tem conta? Fazer login
          </Button>

          <p className="text-center text-[11px] text-gray-400">
            © {new Date().getFullYear()} Bochel Microcrédito, EI · Todos os direitos reservados
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;
