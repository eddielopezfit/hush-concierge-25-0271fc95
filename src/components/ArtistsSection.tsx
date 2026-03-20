import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { X, Sparkles } from "lucide-react";
import { useLuna } from "@/contexts/LunaContext";
import { ConciergeContext, ServiceCategoryId } from "@/types/concierge";
import { teamMembers, photoMap, getFounders, getTeam, TeamMember } from "@/data/teamData";
import { trackArtistClick } from "@/lib/journeyTracker";

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

export const ArtistsSection = () => {
  const [selectedArtist, setSelectedArtist] = useState<TeamMember | null>(null);
  const { openModal } = useLuna();

  const handleBeginWithLuna = (artist: TeamMember) => {
    setSelectedArtist(null);
    const categories: ServiceCategoryId[] = artist.serviceCategory ? [artist.serviceCategory] : [];
    const lunaContext: ConciergeContext = {
      source: "Meet the Team",
      categories,
      goal: null,
      timing: null,
      preferredArtist: artist.name,
      preferredArtistId: artist.id,
    };
    openModal(lunaContext);
  };

  const founders = getFounders();
  const team = getTeam();

  return (
    <>
      <section id="artists" className="py-20 md:py-28 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-14 md:mb-20"
          >
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl text-cream mb-4">
              Meet the <span className="text-gold-gradient">Team</span>
            </h2>
            <p className="font-body text-muted-foreground text-base max-w-lg mx-auto">
              Real people with real talent. Not sure who's right for you? Luna can match you.
            </p>
          </motion.div>

          {/* Founders Row */}
          <div className="flex justify-center gap-4 md:gap-6 mb-10">
            {founders.map((artist, index) => (
              <motion.div
                key={artist.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
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
                    <span className="inline-block text-[10px] font-body text-gold bg-gold/8 px-2 py-0.5 rounded-full">
                      {artist.specialty}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Team Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-5">
            {team.map((artist, index) => (
              <motion.div
                key={artist.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                className="group cursor-pointer"
                onClick={() => { trackArtistClick(artist.name); setSelectedArtist(artist); }}
              >
                <div className="relative aspect-[3/4] rounded-lg overflow-hidden border border-border hover:border-gold/30 transition-all duration-500 group-hover:shadow-[0_0_25px_-5px_hsl(38_50%_55%/0.2)]">
                  <ArtistAvatar artist={artist} />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <h3 className="font-display text-base md:text-lg text-cream mb-1 leading-tight">
                      {artist.name}
                    </h3>
                    <span className="inline-block text-[10px] font-body text-gold bg-gold/8 px-2 py-0.5 rounded-full">
                      {artist.specialty}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Artist Profile Modal */}
      <AnimatePresence>
        {selectedArtist && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/85 backdrop-blur-md"
            onClick={() => setSelectedArtist(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3 }}
              className="relative w-full max-w-md p-6 md:p-8 rounded-xl border border-gold/25 bg-card shadow-[0_0_50px_-15px_hsl(38_50%_55%/0.25)]"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedArtist(null)}
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-cream hover:bg-gold/15 transition-all"
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
                <p className="font-body text-gold text-sm mb-3">{selectedArtist.department === "founders" ? "Co-Founder" : selectedArtist.department.charAt(0).toUpperCase() + selectedArtist.department.slice(1)}</p>

                <p className="font-body text-muted-foreground mb-4 max-w-xs">
                  {selectedArtist.description}
                </p>

                {selectedArtist.bestFor && (
                  <div className="w-full bg-gold/8 border border-gold/15 rounded-lg p-3 mb-4">
                    <p className="font-body text-xs text-gold uppercase tracking-wider mb-1">Best for</p>
                    <p className="font-body text-sm text-cream/80">{selectedArtist.bestFor}</p>
                  </div>
                )}

                <div className="flex flex-wrap justify-center gap-2 mb-6">
                  {selectedArtist.specialties.map((s) => (
                    <span
                      key={s}
                      className="text-xs font-body text-gold bg-gold/8 border border-gold/15 px-3 py-1.5 rounded-full"
                    >
                      {s}
                    </span>
                  ))}
                </div>

                <motion.button
                  onClick={() => handleBeginWithLuna(selectedArtist)}
                  className="btn-gold py-3 px-5 flex items-center justify-center gap-2 w-full"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Book with {selectedArtist.name.split(" ")[0]}</span>
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
