
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
  <QueryClientProvider client={queryClient}>
    <Toaster />
    <Sonner />
    <BrowserRouter>
      <Routes>
        <Route path="/formulario-credito" element={<PublicCreditForm />} />
        <Route path="/*" element={<Index />} />
        <Route path="/404" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
    <InstallPWA />
  </QueryClientProvider>
);

export default App;
