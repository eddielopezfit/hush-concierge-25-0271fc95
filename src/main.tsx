import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);

// Fade out and remove the branded cold-load shell once React has mounted.
// The shell lives in index.html so it paints instantly without JS.
requestAnimationFrame(() => {
  const shell = document.getElementById("hush-shell");
  if (!shell) return;
  // Give the first frame a tick to paint hero structure under it.
  setTimeout(() => {
    shell.classList.add("is-hidden");
    setTimeout(() => shell.parentNode?.removeChild(shell), 700);
  }, 80);
});
