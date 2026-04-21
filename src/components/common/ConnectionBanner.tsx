import React, { useState, useEffect } from 'react';
import { WifiOff, AlertTriangle, RefreshCw } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export function ConnectionBanner() {
  const { connectionError, refreshUser } = useAuth();
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleRetry = async () => {
    setIsRetrying(true);
    if (!navigator.onLine) {
      setIsOffline(true);
      setIsRetrying(false);
      return;
    }
    
    // Force a reload of the current window to bypass potential stale caches
    // if the SW has recently updated, or just try to refresh the user session.
    try {
      await refreshUser();
    } catch (e) {
      console.error(e);
    } finally {
      setIsRetrying(false);
    }
  };

  if (!isOffline && !connectionError) return null;

  return (
    <div className="w-full bg-background border-b border-warning/20">
      <Alert variant="destructive" className="rounded-none border-0 bg-warning/10 text-warning-foreground p-3 flex items-start gap-3 md:items-center">
        {isOffline ? <WifiOff className="h-5 w-5 shrink-0 mt-0.5 md:mt-0 text-orange-500" /> : <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5 md:mt-0 text-orange-500" />}
        <div className="flex-1 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <AlertTitle className="text-sm font-bold text-orange-600 mb-1">
              {isOffline ? 'Sem ligação à internet' : 'Falha na conexão com o servidor'}
            </AlertTitle>
            <AlertDescription className="text-xs text-orange-700/80">
              {isOffline 
                ? 'Verifique a sua ligação Wi-Fi ou dados móveis. O sistema pode apresentar dados desatualizados.' 
                : 'Não foi possível ligar ao banco de dados em tempo real. Os dados podem estar incompletos.'}
            </AlertDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRetry} 
            disabled={isRetrying}
            className="shrink-0 h-8 text-xs bg-white text-orange-600 border-orange-200 hover:bg-orange-50 hover:text-orange-700"
          >
            <RefreshCw className={`mr-2 h-3 w-3 ${isRetrying ? 'animate-spin' : ''}`} />
            Tentar Novamente
          </Button>
        </div>
      </Alert>
    </div>
  );
}
