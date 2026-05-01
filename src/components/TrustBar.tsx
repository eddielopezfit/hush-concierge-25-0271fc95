import { Star } from "lucide-react";
import { useState, useEffect } from "react";

const miniReviews = [
  { text: "Once Michelle took me back, she reassured me it would look great. Found my new salon!", author: "Cara B Foster" },
  { text: "Whitney is the best with blondes!! She nailed it.", author: "Andrea Mitchell" },
  { text: "Allison G is magical. I've gotten nonstop compliments on my hair.", author: "Megan Petersen" },
  { text: "Kathy is AMAZING! She knew exactly how to cut my thick, but fine hair.", author: "Alicia Robinson" },
  { text: "Absolutely LOVE Hush Salon and my stylist Silviya!!!", author: "Amber Eghtesadi" },
];

/**
 * Compute current open/closed status from local time.
 * Hours: Tue/Thu 9–7, Wed/Fri 9–5, Sat 9–4, Closed Sun/Mon.
 */
function getLiveStatus(): { open: boolean; label: string } {
  const now = new Date();
  const day = now.getDay(); // 0=Sun ... 6=Sat
  const hour = now.getHours();
  const closeByDay: Record<number, number | null> = {
    0: null, // Sun
    1: null, // Mon
    2: 19,   // Tue
    3: 17,   // Wed
    4: 19,   // Thu
    5: 17,   // Fri
    6: 16,   // Sat
  };
  const close = closeByDay[day];
  if (close == null) {
    // Closed today — find next open day
    const nextOpen: Record<number, string> = {
      0: "Opens Tue 9 AM",
      1: "Opens Tue 9 AM",
    };
    return { open: false, label: `Closed · ${nextOpen[day] || "Opens soon"}` };
  }
  if (hour < 9) return { open: false, label: `Opens Today · 9 AM` };
  if (hour >= close) {
    // After close
    const nextDay = day === 6 ? "Tue" : day === 5 ? "Sat" : day === 4 ? "Fri" : day === 3 ? "Thu" : "Wed";
    return { open: false, label: `Closed · Opens ${nextDay} 9 AM` };
  }
  const closeLabel = close > 12 ? `${close - 12} PM` : `${close} ${close === 12 ? "PM" : "AM"}`;
  return { open: true, label: `Open Now · Closes ${closeLabel}` };
}

export const TrustBar = () => {
  const [index, setIndex] = useState(0);
  const [status, setStatus] = useState(() => getLiveStatus());
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(() => setIndex(i => (i + 1) % miniReviews.length), 5000);
    return () => clearInterval(timer);
  }, [paused]);

  useEffect(() => {
    const statusTimer = setInterval(() => setStatus(getLiveStatus()), 60000);
    return () => clearInterval(statusTimer);
  }, []);

  const review = miniReviews[index];

  return (
    <section
      className="py-6 px-6 bg-card/50 border-y border-border"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-5">
        {/* Rating badge */}
        <a
          href="https://www.google.com/maps/place/Hush+Salon+%26+Day+Spa/@32.2537155,-110.8837433,17z/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 shrink-0 hover:opacity-80 transition-opacity"
        >
          <Star className="w-4 h-4 text-gold fill-gold" aria-hidden="true" />
          <span className="font-body text-sm text-cream/80 font-medium">4.7★</span>
          <span className="text-border" aria-hidden="true">·</span>
          <span className="font-body text-sm text-muted-foreground">315+ reviews</span>
        </a>

        {/* Live open/closed badge */}
        <span
          className={`inline-flex items-center gap-1.5 shrink-0 px-3 py-1 rounded-full border ${
            status.open ? "border-emerald-500/40 bg-emerald-500/5" : "border-rose-500/30 bg-rose-500/5"
          }`}
          aria-live="polite"
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${status.open ? "bg-emerald-500" : "bg-rose-400"}`}
            aria-hidden="true"
          />
          <span className={`font-body text-xs tracking-wide ${status.open ? "text-emerald-400" : "text-rose-300/90"}`}>
            {status.label}
          </span>
        </span>

        {/* Rotating mini review — re-mounts via key for fresh CSS animation */}
        <p
          key={index}
          className="font-body text-sm text-cream/60 italic text-center sm:text-left opacity-0 animate-fade-up-mini"
          aria-live="polite"
        >
          "{review.text}" — <span className="text-gold/70 not-italic">{review.author}</span>
        </p>
      </div>
    </section>
  );
};
