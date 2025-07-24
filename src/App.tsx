
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { InstallPWA } from "@/components/pwa/InstallPWA";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import PublicCreditForm from "./pages/PublicCreditForm";

const queryClient = new QueryClient();

const App = () => (
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/formulario-credito" element={<PublicCreditForm />} />
          <Route path="/*" element={<Index />} />
          <Route path="/404" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      <Toaster />
      <Sonner />
      <InstallPWA />
    </QueryClientProvider>
  </React.StrictMode>
);

export default App;
