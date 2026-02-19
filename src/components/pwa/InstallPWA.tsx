import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Download, X } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth';

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
    short: 'Sistema Principal',
    theme: '#22c55e',
    desc: 'Acesso rápido ao sistema principal de gestão.',
  },
  agente: {
    name: 'Bochel Agente',
    short: 'App de Campo',
    theme: '#3b82f6',
    desc: 'App de campo optimizado para agentes.',
  },
  cliente: {
    name: 'Bochel Cliente',
    short: 'Minha Conta',
    theme: '#a855f7',
    desc: 'Acompanhe o seu crédito e pagamentos.',
  },
};

export function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallButton, setShowInstallButton] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const appConfig = user?.role ? APP_CONFIG[user.role] : APP_CONFIG.gestor;

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
  }, [user?.role]);

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallButton(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowInstallButton(false);
      setDeferredPrompt(null);
      toast({
        title: `${appConfig.name} instalado!`,
        description: 'App instalado com sucesso no seu dispositivo.',
      });
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [toast, appConfig.name]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      toast({
        title: 'Instalação iniciada',
        description: `${appConfig.name} está a ser instalado...`,
      });
    }
    setDeferredPrompt(null);
    setShowInstallButton(false);
  };

  const handleDismiss = () => {
    setShowInstallButton(false);
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  if (isInstalled || !showInstallButton || localStorage.getItem('pwa-install-dismissed')) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm bg-card border border-border rounded-lg shadow-lg p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: appConfig.theme }}
          >
            <Download className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">{appConfig.name}</h3>
            <p className="text-xs text-muted-foreground">{appConfig.short}</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={handleDismiss} className="h-6 w-6 p-0">
          <X className="w-3 h-3" />
        </Button>
      </div>
      <p className="text-xs text-muted-foreground mb-3">{appConfig.desc}</p>
      <div className="flex gap-2">
        <Button onClick={handleInstallClick} size="sm" className="flex-1">
          <Download className="w-3 h-3 mr-1" />
          Instalar App
        </Button>
        <Button variant="ghost" size="sm" onClick={handleDismiss}>
          Agora não
        </Button>
      </div>
    </div>
  );
}
