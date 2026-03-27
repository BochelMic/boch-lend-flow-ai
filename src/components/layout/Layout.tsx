import React, { useState, useEffect } from 'react';
import { AppSidebar } from './AppSidebar';
import Header from './Header';
import MobileHeader from './MobileHeader';
import MobileBottomNav from './MobileBottomNav';
import { SidebarProvider, SidebarInset } from '../ui/sidebar';
import { NotificationPrompt } from '../notifications/NotificationPrompt';
import { useAuth } from '@/hooks/useAuth';
import { WifiOff, RefreshCw } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const ConnectionBanner = () => {
  const { connectionError, refreshUser } = useAuth();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [retrying, setRetrying] = useState(false);

  useEffect(() => {
    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  const showBanner = connectionError || !isOnline;

  if (!showBanner) return null;

  const handleRetry = async () => {
    setRetrying(true);
    try {
      await refreshUser();
      window.location.reload();
    } catch {
      // ignore
    } finally {
      setRetrying(false);
    }
  };

  return (
    <div className="bg-destructive/10 border-b border-destructive/20 px-4 py-3 flex items-center justify-between gap-3 animate-in slide-in-from-top-2 duration-300">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-8 h-8 rounded-full bg-destructive/20 flex items-center justify-center flex-shrink-0">
          <WifiOff className="h-4 w-4 text-destructive" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-destructive">Sem conexão ao servidor</p>
          <p className="text-xs text-destructive/70 truncate">
            {!isOnline
              ? 'Sem acesso à internet. Verifique a sua ligação.'
              : 'O servidor Supabase está temporariamente inacessível. Os dados podem estar desatualizados.'}
          </p>
        </div>
      </div>
      <button
        onClick={handleRetry}
        disabled={retrying}
        className="flex-shrink-0 px-4 py-2 bg-destructive text-white text-xs font-bold rounded-lg hover:bg-destructive/90 disabled:opacity-50 flex items-center gap-2 transition-all active:scale-95"
      >
        <RefreshCw className={`h-3.5 w-3.5 ${retrying ? 'animate-spin' : ''}`} />
        {retrying ? 'A tentar...' : 'Tentar novamente'}
      </button>
    </div>
  );
};

const Layout = ({ children }: LayoutProps) => {
  const { user } = useAuth();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full" style={{ background: '#f5f6f8' }}>
        {/* Desktop sidebar - hidden on mobile */}
        <div className="hidden md:block">
          <AppSidebar />
        </div>

        <SidebarInset className="flex flex-col flex-1 min-w-0">
          {/* Mobile header - only on small screens */}
          <MobileHeader />

          {/* Desktop header - hidden on mobile */}
          <div className="hidden md:block">
            <Header />
          </div>

          {/* Connection error banner */}
          <ConnectionBanner />

          {/* Main content - add bottom padding on mobile for bottom nav */}
          <main className="flex-1 p-3 pb-24 md:p-6 md:pb-6 lg:p-8 lg:pb-8 overflow-auto">
            {children}
          </main>
        </SidebarInset>

        {/* Mobile bottom nav - only on small screens */}
        <MobileBottomNav />

        {/* Soft Prompt for Push Notifications */}
        <NotificationPrompt userId={user?.id} />
      </div>
    </SidebarProvider>
  );
};

export default Layout;
