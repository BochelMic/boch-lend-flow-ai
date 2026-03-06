import React, { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { InstallPWA } from "@/components/pwa/InstallPWA";
import { AuthProvider } from "./contexts/AuthContext";
import FloatingWhatsApp from "./components/common/FloatingWhatsApp";
import { Loader2 } from "lucide-react";

// Lazy Loaded Routes for better performance
const ClientApp = lazy(() => import("./pages/ClientApp"));
const AgentApp = lazy(() => import("./pages/AgentApp"));
const GestorApp = lazy(() => import("./pages/GestorApp"));
const NotFound = lazy(() => import("./pages/NotFound"));
const PublicCreditForm = lazy(() => import("./pages/PublicCreditForm"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<div className="flex h-screen w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-[#0b3a20]" /></div>}>
          <Routes>
            <Route path="/formulario-credito" element={<PublicCreditForm />} />
            <Route path="/gestor/*" element={<GestorApp />} />
            <Route path="/agente/*" element={<AgentApp />} />
            <Route path="/404" element={<NotFound />} />
            <Route path="/*" element={<ClientApp />} />
          </Routes>
        </Suspense>
        <FloatingWhatsApp />
      </BrowserRouter>
      <Toaster />
      <Sonner />
      <InstallPWA />
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
