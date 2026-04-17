import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { LunaProvider } from "./contexts/LunaContext";

// Code-split the chat widget — it's only needed after user interaction
const LunaChatWidget = lazy(() =>
  import("./components/LunaChatWidget").then(m => ({ default: m.LunaChatWidget }))
);

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <LunaProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/services" element={<Navigate to="/#services" replace />} />
            <Route path="/team" element={<Navigate to="/#artists" replace />} />
            <Route path="/about" element={<Navigate to="/#about" replace />} />
            <Route path="/contact" element={<Navigate to="/#contact" replace />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>

        <Suspense fallback={null}>
          <LunaChatWidget />
        </Suspense>
      </LunaProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
