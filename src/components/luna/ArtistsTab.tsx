import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { ArrowLeft, Sparkles, Phone, MessageSquare } from "lucide-react";
import { teamMembers, photoMap, getBookableArtists, departmentLabels, TeamMember } from "@/data/teamData";
import { useLuna } from "@/contexts/LunaContext";
import { trackArtistClick } from "@/lib/journeyTracker";

const departments = ["All", "Hair", "Nails", "Skincare", "Lashes", "Massage"];

const departmentFilterMap: Record<string, string> = {
  "All": "All",
  "Hair": "hair",
  "Nails": "nails",
  "Skincare": "skincare",
  "Lashes": "lashes",
  "Massage": "massage",
};

interface ArtistsTabProps {
  onSwitchTab: (tab: string) => void;
  onClosePanel?: () => void;
}

export const ArtistsTab = ({ onSwitchTab, onClosePanel }: ArtistsTabProps) => {
  const [filter, setFilter] = useState("All");
  const [selectedArtist, setSelectedArtist] = useState<TeamMember | null>(null);
  const { mergeConcierge } = useLuna();

  const bookable = getBookableArtists();
  const filtered = filter === "All"
    ? bookable
    : bookable.filter(a => a.department === departmentFilterMap[filter]);

  const handleSelectArtist = (artist: TeamMember) => {
    setSelectedArtist(artist);
    mergeConcierge({
      preferredArtist: artist.name,
      preferredArtistId: artist.id,
    });
    trackArtistClick(artist.name);
  };

  const handleBookArtist = (artist: TeamMember) => {
    mergeConcierge({
      preferredArtist: artist.name,
      preferredArtistId: artist.id,
    });
    trackArtistClick(artist.name);
    // Close panel then scroll to booking
    onClosePanel?.();
    setTimeout(() => {
      const el = document.getElementById("callback");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }, 300);
  };

  const handleAskLuna = (artist: TeamMember) => {
    mergeConcierge({
      preferredArtist: artist.name,
      preferredArtistId: artist.id,
    });
    onSwitchTab("chat");
  };

  // Inline detail view
  if (selectedArtist) {
    const deptLabel = selectedArtist.serviceCategories?.length
      ? selectedArtist.serviceCategories.map(c => c.charAt(0).toUpperCase() + c.slice(1)).join(" · ")
      : departmentLabels[selectedArtist.department] || selectedArtist.department;
    return (
      <div className="flex flex-col h-full">
        <button
          onClick={() => setSelectedArtist(null)}
          className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-body text-muted-foreground hover:text-foreground transition-colors border-b border-border"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to artists
        </button>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center text-center space-y-3"
          >
            <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-primary/30 flex-shrink-0">
              {photoMap[selectedArtist.id] ? (
                <img src={photoMap[selectedArtist.id]} alt={selectedArtist.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-secondary flex items-center justify-center">
                  <span className="font-display text-2xl text-primary">{selectedArtist.name.charAt(0)}</span>
                </div>
              )}
            </div>

            <div>
              <h3 className="font-display text-lg text-foreground">{selectedArtist.name}</h3>
              <p className="text-[11px] font-body text-primary">{selectedArtist.specialty}</p>
              <span className="text-[10px] font-body text-muted-foreground">{deptLabel}</span>
            </div>

            {selectedArtist.legacyBio && (
              <p className="text-xs font-body text-foreground/70 italic leading-relaxed border-l-2 border-primary/30 pl-3 text-left">
                {selectedArtist.legacyBio}
              </p>
            )}

            {!selectedArtist.legacyBio && (
              <p className="text-xs font-body text-muted-foreground">{selectedArtist.description}</p>
            )}

            {selectedArtist.knownFor.length > 0 && (
              <div className="w-full bg-primary/5 border border-primary/10 rounded-lg p-2.5">
                <p className="text-[9px] font-body text-primary uppercase tracking-wider mb-1.5">Known for</p>
                <div className="flex flex-wrap justify-center gap-1">
                  {selectedArtist.knownFor.map(tag => (
                    <span key={tag} className="text-[10px] font-body text-primary/80 bg-primary/8 border border-primary/15 px-2 py-0.5 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {selectedArtist.fitStatement && (
              <p className="text-[11px] font-body text-muted-foreground italic">
                {selectedArtist.fitStatement}
              </p>
            )}

            <div className="w-full space-y-2 pt-1">
              <button
                onClick={() => handleBookArtist(selectedArtist)}
                className="w-full flex items-center justify-center gap-2 text-xs font-body py-2.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Book with {selectedArtist.name.split(" ")[0]}
              </button>
              <button
                onClick={() => handleAskLuna(selectedArtist)}
                className="w-full flex items-center justify-center gap-1.5 text-[11px] font-body text-primary hover:text-primary/80 transition-colors py-1.5 border border-primary/20 rounded-lg"
              >
                <MessageSquare className="w-3 h-3" />
                Ask Luna about {selectedArtist.name.split(" ")[0]}
              </button>
              <a
                href="tel:+15203276753"
                className="w-full flex items-center justify-center gap-1.5 text-[11px] font-body text-muted-foreground hover:text-foreground transition-colors py-1.5"
              >
                <Phone className="w-3 h-3" />
                Call front desk for matching
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 pt-3 pb-2 overflow-x-auto">
        <div className="flex gap-1.5 min-w-max">
          {departments.map(d => (
            <button
              key={d}
              onClick={() => setFilter(d)}
              className={`px-3 py-1.5 rounded-full text-xs font-body transition-all ${
                filter === d
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2">
        {filtered.map((artist, i) => {
          const deptLabel = departmentLabels[artist.department] || artist.department;
          return (
            <motion.div
              key={artist.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="rounded-lg border border-border bg-card p-3 space-y-2"
            >
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 border border-border">
                  {photoMap[artist.id] ? (
                    <img src={photoMap[artist.id]} alt={artist.name} className="w-full h-full object-cover" loading="lazy" />
                  ) : (
                    <div className="w-full h-full bg-secondary flex items-center justify-center">
                      <span className="font-display text-lg text-primary">{artist.name.charAt(0)}</span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-display text-sm text-foreground">{artist.name}</p>
                      <p className="text-[10px] font-body text-primary">{artist.specialty}</p>
                    </div>
                    <span className="text-[10px] font-body text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{deptLabel}</span>
                  </div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground font-body">Best for: {artist.bestFor}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => handleBookArtist(artist)}
                  className="flex-1 text-xs font-body py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                >
                  Book
                </button>
                <button
                  onClick={() => handleSelectArtist(artist)}
                  className="flex-1 text-xs font-body py-2 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors"
                >
                  Full Profile
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
