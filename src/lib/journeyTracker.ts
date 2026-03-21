/**
 * Journey Tracker — tracks user behavior across the hub
 * Feeds into Luna's AI context so she knows where the user is in their journey
 */

export interface JourneyEvent {
  type: string;
  data?: Record<string, string | number>;
  timestamp: number;
}

interface JourneyState {
  events: JourneyEvent[];
  sectionsViewed: Set<string>;
  artistsViewed: string[];
  servicesViewed: string[];
  timeOnPage: number;
  pageLoadTime: number;
}

const state: JourneyState = {
  events: [],
  sectionsViewed: new Set(),
  artistsViewed: [],
  servicesViewed: [],
  timeOnPage: 0,
  pageLoadTime: Date.now(),
};

// Track section views via IntersectionObserver
let observer: IntersectionObserver | null = null;

export function initJourneyTracking() {
  if (observer) return; // already initialized

  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          if (id && !state.sectionsViewed.has(id)) {
            state.sectionsViewed.add(id);
            trackEvent("section_viewed", { section: id });
          }
        }
      });
    },
    { threshold: 0.3 }
  );

  // Observe all major sections
  requestAnimationFrame(() => {
    const sections = document.querySelectorAll("section[id]");
    sections.forEach((section) => observer?.observe(section));
  });
}

export function trackEvent(type: string, data?: Record<string, string | number>) {
  state.events.push({ type, data, timestamp: Date.now() });
  
  // Track specific behaviors
  if (type === "artist_viewed" && data?.name) {
    const name = String(data.name);
    if (!state.artistsViewed.includes(name)) {
      state.artistsViewed.push(name);
    }
  }
  if (type === "service_viewed" && data?.service) {
    const service = String(data.service);
    if (!state.servicesViewed.includes(service)) {
      state.servicesViewed.push(service);
    }
  }
}

export function trackArtistClick(name: string) {
  trackEvent("artist_viewed", { name });
}

export function trackServiceClick(service: string, category: string) {
  trackEvent("service_viewed", { service, category });
}

export function trackExperienceFinderStep(step: number, selection: string) {
  trackEvent("finder_step", { step, selection });
}

/**
 * Build a natural-language journey summary for Luna's AI context
 */
export function getJourneyContextString(): string {
  const parts: string[] = [];
  const timeOnSite = Math.round((Date.now() - state.pageLoadTime) / 1000);

  if (timeOnSite > 10) {
    parts.push(`User has been browsing for ${Math.round(timeOnSite / 60)} minute(s).`);
  }

  if (state.sectionsViewed.size > 0) {
    const sectionNames: Record<string, string> = {
      "experience-finder": "Experience Finder",
      services: "Services Menu",
      artists: "Meet the Artists",
      portfolio: "Portfolio / Real Results",
      testimonials: "Testimonials",
      about: "About Hush",
      community: "Community / Inner Circle",
      booking: "Booking",
    };
    const viewed = Array.from(state.sectionsViewed)
      .map((id) => sectionNames[id] || id)
      .filter(Boolean);
    if (viewed.length > 0) {
      parts.push(`Sections browsed: ${viewed.join(", ")}.`);
    }
  }

  if (state.artistsViewed.length > 0) {
    parts.push(`Artists they clicked on: ${state.artistsViewed.join(", ")}.`);
  }

  if (state.servicesViewed.length > 0) {
    parts.push(`Services they explored: ${state.servicesViewed.join(", ")}.`);
  }

  // Check for concierge context in session storage
  try {
    const ctx = sessionStorage.getItem("hush_concierge_context");
    if (ctx) {
      const parsed = JSON.parse(ctx);
      if (parsed?.categories?.length) {
        parts.push(`They used the Experience Finder and selected: ${parsed.categories.join(", ")}.`);
      }
      if (parsed?.goal) parts.push(`Their goal: ${parsed.goal}.`);
      if (parsed?.timing) parts.push(`Timing preference: ${parsed.timing}.`);
      if (parsed?.preferredArtist) parts.push(`Preferred artist: ${parsed.preferredArtist}.`);
    }
  } catch { /* ignore */ }

  // Check for recommendation
  try {
    const rec = sessionStorage.getItem("hush_luna_recommendation");
    if (rec) {
      const parsed = JSON.parse(rec);
      if (parsed?.recommendedService) {
        parts.push(`Luna previously recommended: ${parsed.recommendedService}.`);
      }
    }
  } catch { /* ignore */ }

  // Behavioral signals
  const finderSteps = state.events.filter((e) => e.type === "finder_step");
  if (finderSteps.length > 0) {
    parts.push(`They completed ${finderSteps.length} step(s) in the Experience Finder.`);
  }

  const recentEvents = state.events.slice(-5);
  const hasBookingIntent = recentEvents.some(
    (e) => e.type === "section_viewed" && e.data?.section === "booking"
  );
  if (hasBookingIntent) {
    parts.push("They recently viewed the booking section — likely ready to take action.");
  }

  return parts.join(" ");
}

/**
 * Get proactive suggestion based on journey state
 * Returns null if no suggestion is warranted
 */
export function getProactiveSuggestion(): { message: string; type: "artist" | "service" | "booking" } | null {
  const timeOnSite = (Date.now() - state.pageLoadTime) / 1000;

  // If they've viewed 3+ artist cards without taking action
  if (state.artistsViewed.length >= 3 && timeOnSite > 30) {
    return {
      message: `I noticed you're checking out a few of our artists — want help choosing between ${state.artistsViewed.slice(0, 2).join(" and ")}? I can match you based on what you're looking for.`,
      type: "artist",
    };
  }

  // If they've browsed services + artists but haven't used the finder
  const usedFinder = state.events.some((e) => e.type === "finder_step");
  if (state.servicesViewed.length >= 2 && !usedFinder && timeOnSite > 45) {
    return {
      message: "Looks like you're exploring a few options — try our Experience Finder for a personalized recommendation, or just tell me what you're looking for!",
      type: "service",
    };
  }

  // If they've been on site for 2+ minutes and viewed booking section
  if (timeOnSite > 120 && state.sectionsViewed.has("booking")) {
    return {
      message: "Ready to book? I can help you find the right stylist and time, or connect you with our front desk at (520) 327-6753.",
      type: "booking",
    };
  }

  return null;
}
