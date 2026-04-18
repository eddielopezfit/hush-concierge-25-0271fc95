import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import Index from "./pages/Index";
import { LunaProvider } from "./contexts/LunaContext";

// Route-level code-splitting — keep entry bundle minimal
const NotFound = lazy(() => import("./pages/NotFound"));

// LazyMotion is loaded on-demand from a child chunk, so framer-motion no longer
// ships in the eager bundle. The provider is mounted around all lazy children.
const MotionProvider = lazy(() =>
  import("./components/MotionProvider").then(m => ({ default: m.MotionProvider }))
);

// Code-split the chat widget — it's only needed after user interaction
const LunaChatWidget = lazy(() =>
  import("./components/LunaChatWidget").then(m => ({ default: m.LunaChatWidget }))
);

// NOTE on Sonner: we tried lazy-loading it for a ~9 KB savings, but the toast
// queue only flushes once <Toaster /> has mounted. Because ChatTab can call
// toast() the same tick the lazy chunk resolves, toasts were lost in race
// conditions. Sonner is small and stays eager — correctness > 9 KB.

const RouteFallback = () => <div className="min-h-screen bg-background" aria-hidden="true" />;

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <LunaProvider>
        <BrowserRouter>
          <Suspense fallback={<RouteFallback />}>
            <MotionProvider>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/services" element={<Navigate to="/#services" replace />} />
                <Route path="/team" element={<Navigate to="/#artists" replace />} />
                <Route path="/about" element={<Navigate to="/#about" replace />} />
                <Route path="/contact" element={<Navigate to="/#contact" replace />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                {/* New pages should follow the lazy pattern: const Page = lazy(() => import("./pages/Page")) */}
                <Route path="*" element={<NotFound />} />
              </Routes>

              {/* LunaChatWidget uses framer-motion's `m.*` components, so it MUST
                  be rendered inside <LazyMotion> (provided by MotionProvider). */}
              <LunaChatWidget />
            </MotionProvider>
          </Suspense>
        </BrowserRouter>

        <Sonner />
      </LunaProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
