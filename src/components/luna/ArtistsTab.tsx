import { motion } from "framer-motion";
import { useState } from "react";
import { teamMembers, photoMap, getBookableArtists, departmentLabels, TeamMember } from "@/data/teamData";

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
}

export const ArtistsTab = ({ onSwitchTab }: ArtistsTabProps) => {
  const [filter, setFilter] = useState("All");

  const bookable = getBookableArtists();
  const filtered = filter === "All"
    ? bookable
    : bookable.filter(a => a.department === departmentFilterMap[filter]);

  return (
    <div className="flex flex-col h-full">
      {/* Filter pills */}
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

      {/* Artist list */}
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
                      <span className="font-display text-lg text-gold">{artist.name.charAt(0)}</span>
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
                  onClick={() => {
                    const callbackSection = document.getElementById("callback");
                    if (callbackSection) callbackSection.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="flex-1 text-xs font-body py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                >
                  Book
                </button>
                <button
                  onClick={() => {
                    const artistsSection = document.getElementById("artists");
                    if (artistsSection) artistsSection.scrollIntoView({ behavior: "smooth" });
                  }}
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
