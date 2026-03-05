import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { InstallPWA } from "@/components/pwa/InstallPWA";
import ClientApp from "./pages/ClientApp";
import AgentApp from "./pages/AgentApp";
import GestorApp from "./pages/GestorApp";
import NotFound from "./pages/NotFound";
import PublicCreditForm from "./pages/PublicCreditForm";
import { AuthProvider } from "./contexts/AuthContext";
import FloatingWhatsApp from "./components/common/FloatingWhatsApp";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/formulario-credito" element={<PublicCreditForm />} />
          <Route path="/gestor/*" element={<GestorApp />} />
          <Route path="/agente/*" element={<AgentApp />} />
          <Route path="/404" element={<NotFound />} />
          <Route path="/*" element={<ClientApp />} />
        </Routes>
      </BrowserRouter>
      <Toaster />
      <Sonner />
      <InstallPWA />
      <FloatingWhatsApp />
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
