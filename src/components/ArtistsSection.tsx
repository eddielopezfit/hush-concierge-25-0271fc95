import { m, AnimatePresence } from "framer-motion";
import { useState, useMemo, useEffect } from "react";
import { X, Sparkles, Scissors, Hand, Eye, Heart, Phone, MessageSquare, Instagram } from "lucide-react";
import { useLuna } from "@/contexts/LunaContext";
import { ConciergeContext, ServiceCategoryId } from "@/types/concierge";
import { photoMap, getFounders, getTeam, TeamMember } from "@/data/teamData";
import { trackArtistClick } from "@/lib/journeyTracker";
import { getConciergeContext } from "@/lib/conciergeStore";

// ── Filter chip config ────────────────────────────────────────────────────────

const filterChips: { id: string; label: string; icon?: typeof Scissors }[] = [
  { id: "all", label: "All" },
  { id: "hair", label: "Hair", icon: Scissors },
  { id: "nails", label: "Nails", icon: Hand },
  { id: "lashes", label: "Lashes", icon: Eye },
  { id: "skincare", label: "Skincare", icon: Sparkles },
  { id: "massage", label: "Massage", icon: Heart },
];

const helperStrips: Record<string, string> = {
  all: "Tap any artist to learn more about their specialties and style.",
  hair: "Not sure who fits best for your hair goals? Our front desk can help match you.",
  nails: "Our nail artists each specialize in different techniques — call us for a recommendation.",
  lashes: "Whether it's your first set or a fill, our team can help match the right approach.",
  skincare: "Our estheticians each bring a different focus — the front desk can help you decide.",
  massage: "Our front desk can help you figure out the right pressure and approach for your visit.",
};

/** Check if a team member matches a category */
const matchesCategory = (member: TeamMember, category: string): boolean => {
  if (category === "all") return true;
  if (member.serviceCategory === category) return true;
  if (member.serviceCategories?.includes(category as ServiceCategoryId)) return true;
  return false;
};

// ── Artist Avatar ─────────────────────────────────────────────────────────────

const ArtistAvatar = ({ artist }: { artist: TeamMember }) => {
  const photo = photoMap[artist.id];
  if (photo) {
    return (
      <div className="w-full h-full relative">
        <img src={photo} alt={artist.name} className="w-full h-full object-cover" loading="lazy" />
        {artist.badge && (
          <span className="absolute top-3 left-3 text-[10px] font-body uppercase tracking-wider bg-gold/15 text-gold border border-gold/25 px-2 py-0.5 rounded-full backdrop-blur-sm">
            {artist.badge}
          </span>
        )}
      </div>
    );
  }
  const initial = artist.name.charAt(0).toUpperCase();
  return (
    <div className="w-full h-full bg-secondary flex items-center justify-center relative">
      <span className="font-display text-5xl md:text-6xl text-gold select-none">{initial}</span>
      {artist.badge && (
        <span className="absolute top-3 left-3 text-[10px] font-body uppercase tracking-wider bg-gold/15 text-gold border border-gold/25 px-2 py-0.5 rounded-full">
          {artist.badge}
        </span>
      )}
    </div>
  );
};

// ── Smart Matching Card ───────────────────────────────────────────────────────

interface SmartCardProps {
  artist: TeamMember;
  isFiltered: boolean;
  onClick: () => void;
}

const SmartCard = ({ artist, isFiltered, onClick }: SmartCardProps) => (
  <div className="group cursor-pointer flex flex-col">
    <div
      className="relative aspect-[3/4] rounded-t-lg overflow-hidden border border-b-0 border-border hover:border-primary/30 transition-all duration-500 group-hover:shadow-[0_0_25px_-5px_hsl(38_50%_55%/0.2)]"
      onClick={onClick}
    >
      <ArtistAvatar artist={artist} />
      <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-3">
        <h3 className="font-display text-base md:text-lg text-cream mb-1 leading-tight">
          {artist.name}
        </h3>
        <span className="inline-block text-[10px] font-body text-primary bg-primary/8 px-2 py-0.5 rounded-full">
          {artist.specialty}
        </span>
      </div>
    </div>

    {/* Smart matching info — only when a category filter is active */}
    {isFiltered && (
      <m.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ duration: 0.3 }}
        className="rounded-b-lg border border-t-0 border-border bg-card px-3 pt-2.5 pb-3 space-y-2"
      >
        {/* Fit statement */}
        <p className="font-body text-[11px] text-foreground/70 leading-relaxed italic">
          {artist.fitStatement}
        </p>

        {/* Known for tags */}
        {artist.knownFor.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {artist.knownFor.slice(0, 3).map(tag => (
              <span
                key={tag}
                className="text-[9px] font-body text-primary/80 bg-primary/6 border border-primary/12 px-1.5 py-0.5 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

      </m.div>
    )}
  </div>
);

// ── Main Section ──────────────────────────────────────────────────────────────

export const ArtistsSection = () => {
  const [selectedArtist, setSelectedArtist] = useState<TeamMember | null>(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const [showAll, setShowAll] = useState(false);
  const { openModal, mergeConcierge } = useLuna();

  // Auto-filter from concierge context
  useEffect(() => {
    const ctx = getConciergeContext();
    if (ctx?.categories?.length === 1) {
      const cat = ctx.categories[0];
      if (filterChips.some(c => c.id === cat)) {
        setActiveFilter(cat);
      }
    }
    // Only run once on mount
  }, []);

  // Esc to close artist modal
  useEffect(() => {
    if (!selectedArtist) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedArtist(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedArtist]);

  const handleBeginWithLuna = (artist: TeamMember) => {
    // Direct booking intent from artist profile → skip the reveal/personalize step
    // and go straight to the callback form. Artist context is merged so the form
    // shows the "Requesting [Artist]" pill and includes "Preferred artist: X" in
    // the submitted `interested_in` field. The reveal card stays reserved for
    // category-level entry points (Experience Finder).
    const categories: ServiceCategoryId[] = artist.serviceCategories?.length
      ? artist.serviceCategories
      : artist.serviceCategory ? [artist.serviceCategory] : [];
    mergeConcierge({
      source: "Meet the Team",
      categories,
      preferredArtist: artist.name,
      preferredArtistId: artist.id,
    });
    setSelectedArtist(null);
    // Wait for the modal close animation before scrolling so the user sees the form land
    setTimeout(() => {
      const el = document.getElementById("callback");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 250);
  };


  const founders = getFounders();
  const team = getTeam();
  const isFiltered = activeFilter !== "all";

  const filteredFounders = useMemo(
    () => isFiltered ? founders.filter(m => matchesCategory(m, activeFilter)) : founders,
    [activeFilter, isFiltered, founders]
  );
  const filteredTeam = useMemo(
    () => isFiltered ? team.filter(m => matchesCategory(m, activeFilter)) : team,
    [activeFilter, isFiltered, team]
  );

  const hasResults = filteredFounders.length > 0 || filteredTeam.length > 0;

  return (
    <>
      <section id="artists" className="py-20 md:py-28 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <m.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-10 md:mb-14"
          >
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl text-cream mb-4">
              Meet the <span className="text-gold-gradient">Rockstars</span>
            </h2>
            <p className="font-body text-muted-foreground text-base max-w-lg mx-auto">
              Real people with real talent. Not sure who's right for you? Our front desk can help match you.
            </p>
          </m.div>

          {/* Category Filter Chips */}
          <m.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex flex-wrap justify-center gap-2 mb-4"
          >
            {filterChips.map(chip => {
              const isActive = activeFilter === chip.id;
              const Icon = chip.icon;
              return (
                <button
                  key={chip.id}
                  onClick={() => setActiveFilter(chip.id)}
                  className={`
                    flex items-center gap-1.5 px-4 py-2 rounded-full font-body text-sm transition-all duration-300
                    ${isActive
                      ? "bg-primary text-primary-foreground shadow-[var(--shadow-gold)]"
                      : "bg-secondary text-muted-foreground border border-border hover:border-primary/40 hover:text-foreground"
                    }
                  `}
                >
                  {Icon && <Icon className="w-3.5 h-3.5" />}
                  {chip.label}
                </button>
              );
            })}
          </m.div>

          {/* Helper strip */}
          <AnimatePresence mode="wait">
            <m.p
              key={activeFilter}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.25 }}
              className="font-body text-xs text-muted-foreground text-center mb-12 md:mb-16 max-w-md mx-auto"
            >
              {helperStrips[activeFilter] || helperStrips.all}
            </m.p>
          </AnimatePresence>

          {/* No results */}
          <AnimatePresence mode="wait">
            {!hasResults && (
              <m.div
                key="no-results"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-center py-16"
              >
                <p className="font-body text-muted-foreground text-base mb-2">
                  No specialists available for this service right now.
                </p>
                <button
                  onClick={() => {
                    const lunaContext: ConciergeContext = {
                      source: "Meet the Team",
                      categories: activeFilter !== "all" ? [activeFilter as ServiceCategoryId] : [],
                      goal: null,
                      timing: null,
                    };
                    openModal(lunaContext);
                  }}
                  className="font-body text-sm text-primary hover:text-primary/80 transition-colors underline underline-offset-4"
                >
                  Luna can help you choose
                </button>
              </m.div>
            )}
          </AnimatePresence>

          {/* Founders Row */}
          <AnimatePresence mode="wait">
            {filteredFounders.length > 0 && (
              <m.div
                key={`founders-${activeFilter}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="flex justify-center gap-4 md:gap-6 mb-10"
              >
                {filteredFounders.map((artist, index) => (
                  <m.div
                    key={artist.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: index * 0.06 }}
                    className="group cursor-pointer w-40 md:w-48"
                    onClick={() => setSelectedArtist(artist)}
                  >
                    <div className="relative aspect-[3/4] rounded-lg overflow-hidden border border-gold/25 hover:border-gold/50 transition-all duration-500 group-hover:shadow-[0_0_25px_-5px_hsl(38_50%_55%/0.2)]">
                      <ArtistAvatar artist={artist} />
                      <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-3">
                        <h3 className="font-display text-lg md:text-xl text-cream mb-1 leading-tight">
                          {artist.name}
                        </h3>
                        <span className="inline-block text-[10px] font-body text-primary bg-primary/8 px-2 py-0.5 rounded-full">
                          {artist.specialty}
                        </span>
                      </div>
                    </div>
                  </m.div>
                ))}
              </m.div>
            )}
          </AnimatePresence>

          {/* Team Grid — Smart Matching Cards */}
          <AnimatePresence mode="wait">
            {filteredTeam.length > 0 && (
              <m.div
                key={`team-${activeFilter}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className={`grid gap-4 md:gap-5 ${
                  isFiltered
                    ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
                    : "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6"
                }`}>
                  {(showAll || isFiltered ? filteredTeam : filteredTeam.slice(0, 6)).map((artist, index) => (
                    <m.div
                      key={artist.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.35, delay: index * 0.04 }}
                    >
                      <SmartCard
                        artist={artist}
                        isFiltered={isFiltered}
                        onClick={() => { trackArtistClick(artist.name); setSelectedArtist(artist); }}
                      />
                    </m.div>
                  ))}
                </div>

                {/* Expand button — only when unfiltered and more than 6 */}
                {!isFiltered && filteredTeam.length > 6 && !showAll && (
                  <div className="text-center mt-8">
                    <button
                      onClick={() => setShowAll(true)}
                      className="font-body text-sm text-muted-foreground hover:text-gold transition-colors underline underline-offset-4"
                    >
                      View Full Team ({filteredTeam.length} artists)
                    </button>
                  </div>
                )}
              </m.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Artist Profile Modal */}
      <AnimatePresence>
        {selectedArtist && (
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/85 backdrop-blur-md"
            onClick={() => setSelectedArtist(null)}
            role="dialog"
            aria-modal="true"
          >
            <m.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3 }}
              className="relative w-full max-w-md p-6 md:p-8 rounded-xl border border-gold/25 bg-card shadow-[0_0_50px_-15px_hsl(38_50%_55%/0.25)] max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedArtist(null)}
                className="sticky top-0 float-right -mr-2 -mt-2 z-10 w-11 h-11 rounded-full bg-secondary/95 backdrop-blur-sm flex items-center justify-center text-cream hover:text-cream hover:bg-gold/25 border border-border/60 shadow-lg transition-all"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex flex-col items-center text-center">
                <div className="w-28 h-28 md:w-32 md:h-32 rounded-full overflow-hidden border-2 border-gold/30 mb-5 shadow-[0_0_25px_-5px_hsl(38_50%_55%/0.25)]">
                  <ArtistAvatar artist={selectedArtist} />
                </div>

                <h3 className="font-display text-3xl text-cream mb-1">
                  {selectedArtist.name}
                </h3>
                <p className="font-body text-primary text-sm mb-0.5">
                  {selectedArtist.department === "founders"
                    ? "Co-Founder"
                    : selectedArtist.department.charAt(0).toUpperCase() + selectedArtist.department.slice(1)}
                </p>
                {/* Multi-category subtitle */}
                <p className="font-body text-muted-foreground text-xs mb-3">
                  {(() => {
                    const cats = selectedArtist.serviceCategories?.length
                      ? selectedArtist.serviceCategories
                      : selectedArtist.serviceCategory
                        ? [selectedArtist.serviceCategory]
                        : [];
                    const prefix = selectedArtist.department === "founders" ? "Co-Founder" : "";
                    const catLabels = cats.map(c => c.charAt(0).toUpperCase() + c.slice(1));
                    return prefix
                      ? `${prefix} · ${catLabels.join(" · ")}`
                      : selectedArtist.specialty;
                  })()}
                </p>

                {selectedArtist.instagram && (
                  <a
                    href={`https://instagram.com/${selectedArtist.instagram}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-body text-gold hover:text-gold/80 transition-colors mb-3"
                  >
                    <Instagram className="w-3.5 h-3.5" />
                    @{selectedArtist.instagram}
                  </a>
                )}

                <p className="font-body text-muted-foreground mb-4 max-w-xs">
                  {selectedArtist.description}
                </p>

                {/* Rich legacy bio */}
                {selectedArtist.legacyBio && (
                  <p className="font-body text-sm text-foreground/70 italic leading-relaxed mb-4 max-w-xs border-l-2 border-primary/30 pl-3 text-left">
                    {selectedArtist.legacyBio}
                  </p>
                )}

                {/* Featured client review */}
                {selectedArtist.featuredReview && (
                  <div className="w-full max-w-xs border-l-2 border-gold/40 bg-gold/5 pl-3 pr-2 py-2 mb-4 text-left rounded-r">
                    <p className="font-body text-xs text-foreground/80 italic leading-relaxed">
                      "{selectedArtist.featuredReview.quote}"
                    </p>
                    <p className="font-body text-[10px] text-gold/80 mt-1.5">
                      — {selectedArtist.featuredReview.author}, {selectedArtist.featuredReview.source}
                    </p>
                  </div>
                )}

                {/* Fit statement */}
                {selectedArtist.fitStatement && (
                  <p className="font-body text-xs text-foreground/60 italic mb-4 max-w-xs">
                    {selectedArtist.fitStatement}
                  </p>
                )}

                {/* Known for / Best for */}
                {selectedArtist.knownFor.length > 0 && (
                  <div className="w-full bg-primary/6 border border-primary/12 rounded-lg p-3 mb-4">
                    <p className="font-body text-[10px] text-primary uppercase tracking-wider mb-2">Known for</p>
                    <div className="flex flex-wrap justify-center gap-1.5">
                      {selectedArtist.knownFor.map(tag => (
                        <span key={tag} className="text-xs font-body text-primary/80 bg-primary/8 border border-primary/15 px-2.5 py-1 rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap justify-center gap-2 mb-6">
                  {selectedArtist.specialties.map((s) => (
                    <span
                      key={s}
                      className="text-xs font-body text-primary bg-primary/8 border border-primary/15 px-3 py-1.5 rounded-full"
                    >
                      {s}
                    </span>
                  ))}
                </div>

                {/* Primary CTA — Book */}
                <m.button
                  onClick={() => handleBeginWithLuna(selectedArtist)}
                  className="btn-gold py-3 px-5 flex items-center justify-center gap-2 w-full mb-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Book with {selectedArtist.name.split(" ")[0]}</span>
                </m.button>

                {/* Ask Luna CTA */}
                <button
                  onClick={() => {
                    const categories: ServiceCategoryId[] = selectedArtist.serviceCategories?.length
                      ? selectedArtist.serviceCategories
                      : selectedArtist.serviceCategory ? [selectedArtist.serviceCategory] : [];
                    const lunaContext: ConciergeContext = {
                      source: "Meet the Team",
                      categories,
                      goal: null,
                      timing: null,
                      preferredArtist: selectedArtist.name,
                      preferredArtistId: selectedArtist.id,
                    };
                    setSelectedArtist(null);
                    openModal(lunaContext);
                    // Switch to chat tab
                    setTimeout(() => {
                      window.dispatchEvent(new CustomEvent("luna-switch-tab", { detail: "chat" }));
                    }, 200);
                  }}
                  className="flex items-center justify-center gap-2 text-xs font-body text-primary hover:text-primary/80 transition-colors py-2 w-full border border-primary/20 rounded-lg mb-2"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  Ask Luna about {selectedArtist.name.split(" ")[0]}
                </button>

                {/* Direct phone for specialists */}
                {selectedArtist.directPhone && (
                  <a
                    href={`tel:${selectedArtist.directPhone.replace(/[^0-9+]/g, "")}`}
                    className="flex items-center justify-center gap-2 text-xs font-body text-gold hover:text-gold/80 transition-colors py-2"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    Call {selectedArtist.name.split(" ")[0]} directly: {selectedArtist.directPhone}
                  </a>
                )}

                {/* Call + Text front desk CTAs */}
                <div className="grid grid-cols-2 gap-2">
                  <a
                    href="tel:+15203276753"
                    className="flex items-center justify-center gap-1.5 text-xs font-body text-muted-foreground hover:text-primary transition-colors py-2"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    Call front desk
                  </a>
                  <a
                    href="sms:+15203276753"
                    className="flex items-center justify-center gap-1.5 text-xs font-body text-muted-foreground hover:text-primary transition-colors py-2"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    Text us
                  </a>
                </div>
              </div>
            </m.div>
          </m.div>
        )}
      </AnimatePresence>
    </>
  );
};
