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

import { ConnectionBanner } from '../common/ConnectionBanner';

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
