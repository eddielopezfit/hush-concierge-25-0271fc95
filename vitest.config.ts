import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json-summary", "json", "html"],
      reportsDirectory: "./coverage",
      reportOnFailure: true,
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "src/**/*.{test,spec}.{ts,tsx}",
        "src/test/**",
        "src/main.tsx",
        "src/vite-env.d.ts",
        "src/components/ui/**",          // shadcn primitives — vendored
        "src/integrations/supabase/**",  // auto-generated
        "src/lib/SYSTEM_PROMPT_*.md",
        "src/lib/KB*_*.md",
        "src/lib/SKILL.md",
      ],
      // Enforce thresholds only on the tested business-logic surface.
      // UI components / pages are intentionally out of scope for now.
      thresholds: {
        "src/lib/cadenceEngine.ts":       { lines: 80, functions: 80, branches: 70, statements: 80 },
        "src/lib/upsellEngine.ts":        { lines: 80, functions: 80, branches: 70, statements: 80 },
        "src/lib/lunaBrain.ts":           { lines: 80, functions: 80, branches: 70, statements: 80 },
        "src/lib/journeyTracker.ts":      { lines: 80, functions: 80, branches: 70, statements: 80 },
        "src/lib/experienceReveal.ts":    { lines: 80, functions: 80, branches: 80, statements: 80 },
        "src/hooks/luna/**":              { lines: 80, functions: 80, branches: 70, statements: 80 },
        "src/components/luna/chat/chatActionDetectors.ts": { lines: 75, functions: 80, branches: 65, statements: 75 },
        "src/components/luna/chat/useChatPersistence.ts":  { lines: 80, functions: 80, branches: 75, statements: 80 },
      },
    },
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
});
