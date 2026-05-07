import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// One-shot fresh-state reset.
// Append `?fresh=1` to the URL to wipe all Hush-related local/session storage
// (concierge context, chat history, journey tracking, fingerprints, etc.)
// before the app boots. Useful when sharing the demo with stakeholders so they
// land on a true first-time-visitor experience.
(() => {
  try {
    const params = new URLSearchParams(window.location.search);
    if (!params.has("fresh")) return;
    const wipe = (store: Storage) => {
      const keys: string[] = [];
      for (let i = 0; i < store.length; i++) {
        const k = store.key(i);
        if (k && k.startsWith("hush")) keys.push(k);
      }
      keys.forEach((k) => store.removeItem(k));
    };
    wipe(localStorage);
    wipe(sessionStorage);
    params.delete("fresh");
    const qs = params.toString();
    window.history.replaceState({}, "", window.location.pathname + (qs ? `?${qs}` : "") + window.location.hash);
  } catch {
    /* ignore */
  }
})();

createRoot(document.getElementById("root")!).render(<App />);

// Fade out and remove the branded cold-load shell once React has mounted.
// The shell lives in index.html so it paints instantly without JS.
// Hide on the very first paint to minimize perceived load time.
requestAnimationFrame(() => {
  const shell = document.getElementById("hush-shell");
  if (!shell) return;
  shell.classList.add("is-hidden");
  setTimeout(() => shell.parentNode?.removeChild(shell), 400);
});
