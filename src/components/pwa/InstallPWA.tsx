import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Download, X, Smartphone, Sparkles } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }
}

const APP_CONFIG: Record<string, { name: string; short: string; theme: string; desc: string }> = {
  gestor: {
    name: 'Bochel Gestor',
    short: 'Painel Administrativo',
    theme: '#0b3a20',
    desc: 'Gestão completa na ponta dos seus dedos.',
  },
  agente: {
    name: 'Bochel Agente',
    short: 'App de Campo',
    theme: '#1b4d3e',
    desc: 'Leve o escritório para o terreno.',
  },
  cliente: {
    name: 'Bochel Cliente',
    short: 'Minha Conta',
    theme: '#d37c22',
    desc: 'O seu dinheiro sob controlo.',
  },
};

export function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallButton, setShowInstallButton] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const appConfig = user?.role && APP_CONFIG[user.role] ? APP_CONFIG[user.role] : APP_CONFIG.gestor;

  // Actualizar manifest conforme perfil do utilizador
  useEffect(() => {
    if (!user?.role) return;
    const manifests: Record<string, string> = {
      gestor: '/manifest-gestor.json',
      agente: '/manifest-agente.json',
      cliente: '/manifest-cliente.json',
    };
    const manifestEl = document.getElementById('pwa-manifest');
    if (manifestEl && manifests[user.role]) {
      manifestEl.setAttribute('href', manifests[user.role]);
    }
    const themeEl = document.getElementById('pwa-theme-color');
    if (themeEl) themeEl.setAttribute('content', appConfig.theme);
  }, [user?.role, appConfig.theme]);

  useEffect(() => {
    // Verificar se já está instalado ou em modo standalone
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
      setIsInstalled(true);
      return;
    }

    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowInstallButton(false);
      setDeferredPrompt(null);
      toast({
        title: `🚀 ${appConfig.name} instalado!`,
        description: 'Pode agora aceder ao sistema via ecrã principal.',
      });
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [toast, appConfig.name]);

  useEffect(() => {
    if (deferredPrompt && user && !localStorage.getItem('pwa-install-dismissed')) {
      const timer = setTimeout(() => {
        setShowInstallButton(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [deferredPrompt, user]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      toast({
        title: ' ✨ Instalação confirmada',
        description: `O ${appConfig.name} está a ser adicionado...`,
      });
    }
    setDeferredPrompt(null);
    setShowInstallButton(false);
  };

  const handleDismiss = () => {
    setShowInstallButton(false);
    // Guardar rejeição temporária (24h) em vez de eterna se possível, mas mantemos lógica original
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  if (isInstalled || !showInstallButton || !user) {
    return null;
  }

  return (
    <div className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 z-[60] animate-in fade-in slide-in-from-bottom-10 duration-500">
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-3xl shadow-2xl p-5 md:max-w-sm ring-1 ring-black/5 overflow-hidden group">
        {/* Shine effect */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent rotate-45 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 pointer-events-none" />

        <div className="flex items-start gap-4">
          <div className="relative">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transform group-hover:rotate-6 transition-transform relative z-10"
              style={{ backgroundColor: appConfig.theme }}
            >
              <img src="/icon favcon.png" alt="App Icon" className="w-10 h-10 object-contain" />
            </div>
            <div className="absolute -inset-1 bg-white/40 blur-md rounded-2xl animate-pulse" style={{ backgroundColor: `${appConfig.theme}40` }} />
          </div>

          <div className="flex-1 pt-1">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-gray-900 dark:text-white flex items-center gap-1.5">
                {appConfig.name}
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              </h3>
              <button
                onClick={handleDismiss}
                className="p-1 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-tighter mb-2">{appConfig.short}</p>
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-snug">
              {appConfig.desc}
            </p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <Button
            onClick={handleInstallClick}
            className="rounded-2xl font-black gap-2 h-11 shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform active:scale-95"
            style={{ backgroundColor: appConfig.theme }}
          >
            <Download className="w-4 h-4" />
            INSTALAR
          </Button>
          <Button
            variant="ghost"
            onClick={handleDismiss}
            className="rounded-2xl font-bold h-11 hover:bg-gray-100 dark:hover:bg-white/5 active:scale-95 transition-all"
          >
            AGORA NÃO
          </Button>
        </div>

        <div className="mt-3 flex items-center justify-center gap-1.5">
          <Smartphone className="w-3 h-3 text-gray-400" />
          <p className="text-[10px] text-gray-400 font-medium">Melhora o desempenho e notificações</p>
        </div>
      </div>
    </div>
  );
}
