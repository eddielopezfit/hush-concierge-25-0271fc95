import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import Index from "./pages/Index";
import { LunaProvider } from "./contexts/LunaContext";

// Route-level code-splitting — keep entry bundle minimal
const NotFound = lazy(() => import("./pages/NotFound"));
const Unsubscribe = lazy(() => import("./pages/Unsubscribe"));
const ServicesKnowledgeBase = lazy(() => import("./pages/ServicesKnowledgeBase"));

// LazyMotion is loaded on-demand from a child chunk, so framer-motion no longer
// ships in the eager bundle. The provider is mounted around all lazy children.
const MotionProvider = lazy(() =>
  import("./components/MotionProvider").then(m => ({ default: m.MotionProvider }))
);

// Code-split the chat widget — it's only needed after user interaction
const LunaChatWidget = lazy(() =>
  import("./components/LunaChatWidget").then(m => ({ default: m.LunaChatWidget }))
);

const RouteFallback = () => (
  <div
    className="min-h-screen flex items-center justify-center"
    style={{ background: "#0d0d0d" }}
    aria-hidden="true"
  >
    <div
      className="w-10 h-10 rounded-full flex items-center justify-center"
      style={{ background: "hsl(38 50% 55%)" }}
    >
      <span style={{ color: "#0d0d0d", fontFamily: "Playfair Display, serif", fontWeight: 600 }}>L</span>
    </div>
  </div>
);

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <LunaProvider>
        <Sonner />
        <BrowserRouter>
          <Suspense fallback={<RouteFallback />}>
            <MotionProvider>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/index" element={<Navigate to="/" replace />} />
                <Route path="/services" element={<Navigate to="/#services" replace />} />
                <Route path="/services-knowledge-base" element={<ServicesKnowledgeBase />} />
                <Route path="/knowledge-base" element={<Navigate to="/services-knowledge-base" replace />} />
                <Route path="/team" element={<Navigate to="/#artists" replace />} />
                <Route path="/about" element={<Navigate to="/#about" replace />} />
                <Route path="/contact" element={<Navigate to="/#contact" replace />} />
                <Route path="/unsubscribe" element={<Unsubscribe />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                {/* New pages should follow the lazy pattern: const Page = lazy(() => import("./pages/Page")) */}
                <Route path="*" element={<NotFound />} />
              </Routes>
              {/* LunaChatWidget MUST be inside MotionProvider — it uses framer-motion's
                  `m.*` components which silently render nothing without LazyMotion. */}
              <Suspense fallback={null}>
                <LunaChatWidget />
              </Suspense>
            </MotionProvider>
          </Suspense>
        </BrowserRouter>
      </LunaProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
