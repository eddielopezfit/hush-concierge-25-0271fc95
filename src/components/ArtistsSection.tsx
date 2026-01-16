import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Instagram, X, Sparkles } from "lucide-react";
import { LunaModal, useLunaModal, LunaContext } from "./LunaModal";

interface Artist {
  id: string;
  name: string;
  photo: string;
  specialty: string;
  description: string;
  specialties: string[];
  instagram: string;
}

const artists: Artist[] = [
  {
    id: "1",
    name: "Sarah",
    photo: "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=400&h=500&fit=crop&crop=face",
    specialty: "Lived-in Color",
    description: "Creating effortless, sun-kissed dimension that grows out beautifully.",
    specialties: ["Balayage", "Dimensional Color", "Corrective Color"],
    instagram: "https://instagram.com"
  },
  {
    id: "2",
    name: "Michelle",
    photo: "https://images.unsplash.com/photo-1595959183082-7b570b7e1dfa?w=400&h=500&fit=crop&crop=face",
    specialty: "Blonde Specialist",
    description: "Signature luminous blondes with healthy, dimensional finishes.",
    specialties: ["Platinum Blonde", "Highlights", "Toning"],
    instagram: "https://instagram.com"
  },
  {
    id: "3",
    name: "Alex",
    photo: "https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=400&h=500&fit=crop&crop=face",
    specialty: "Extensions",
    description: "Seamless, natural-looking length and volume transformations.",
    specialties: ["Hand-tied Extensions", "Tape-ins", "Fusion"],
    instagram: "https://instagram.com"
  },
  {
    id: "4",
    name: "Jordan",
    photo: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&h=500&fit=crop&crop=face",
    specialty: "Precision Cuts",
    description: "Clean lines and movement for every texture and lifestyle.",
    specialties: ["Razor Cuts", "Textured Bobs", "Men's Grooming"],
    instagram: "https://instagram.com"
  },
  {
    id: "5",
    name: "Daniella",
    photo: "https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=400&h=500&fit=crop&crop=face",
    specialty: "Lash Artistry",
    description: "Bespoke lash design that enhances your natural eye shape.",
    specialties: ["Volume Lashes", "Classic Sets", "Lash Lifts"],
    instagram: "https://instagram.com"
  },
  {
    id: "6",
    name: "Natalie",
    photo: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=500&fit=crop&crop=face",
    specialty: "Skincare",
    description: "Results-driven treatments for luminous, healthy skin.",
    specialties: ["Facials", "Chemical Peels", "Dermaplaning"],
    instagram: "https://instagram.com"
  }
];

export const ArtistsSection = () => {
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
  const { isOpen, context, openModal, closeModal } = useLunaModal();

  const handleBeginWithLuna = (artist: Artist) => {
    setSelectedArtist(null);
    const lunaContext: LunaContext = {
      source: "Meet the Artists",
      services: [artist.specialty.toLowerCase()],
      goal: null,
      timing: null
    };
    // Add artist name to context via sessionStorage
    sessionStorage.setItem("selectedArtist", artist.name);
    openModal(lunaContext);
  };

  return (
    <>
      <section id="artists" className="py-20 md:py-28 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-14 md:mb-20"
          >
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl text-cream mb-4">
              Meet the Artists
            </h2>
            <p className="font-body text-muted-foreground text-lg max-w-xl mx-auto">
              Each artist brings a signature style. Luna will help you find your beautiful match.
            </p>
          </motion.div>

          {/* Artists Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
            {artists.map((artist, index) => (
              <motion.div
                key={artist.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group cursor-pointer"
                onClick={() => setSelectedArtist(artist)}
              >
                <div className="relative aspect-[3/4] rounded-lg overflow-hidden border border-border hover:border-gold/40 transition-all duration-500 group-hover:shadow-[0_0_30px_-5px_hsl(43_45%_58%/0.25)]">
                  <img
                    src={artist.photo}
                    alt={artist.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4">
                    <h3 className="font-display text-xl md:text-2xl text-cream mb-1">
                      {artist.name}
                    </h3>
                    <span className="inline-block text-xs font-body text-gold bg-gold/10 px-2 py-1 rounded-full">
                      {artist.specialty}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Artist Mini-Profile Modal */}
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
              className="relative w-full max-w-md p-6 md:p-8 rounded-xl border border-gold/30 bg-card shadow-[0_0_60px_-15px_hsl(43_45%_58%/0.3)]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedArtist(null)}
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-charcoal flex items-center justify-center text-muted-foreground hover:text-cream hover:bg-gold/20 transition-all"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Artist Photo */}
              <div className="flex flex-col items-center text-center">
                <div className="w-28 h-28 md:w-32 md:h-32 rounded-full overflow-hidden border-2 border-gold/40 mb-5 shadow-[0_0_30px_-5px_hsl(43_45%_58%/0.3)]">
                  <img
                    src={selectedArtist.photo}
                    alt={selectedArtist.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <h3 className="font-display text-3xl text-cream mb-2">
                  {selectedArtist.name}
                </h3>

                <p className="font-body text-muted-foreground mb-5 max-w-xs">
                  {selectedArtist.description}
                </p>

                {/* Specialty Chips */}
                <div className="flex flex-wrap justify-center gap-2 mb-6">
                  {selectedArtist.specialties.map((specialty) => (
                    <span
                      key={specialty}
                      className="text-xs font-body text-gold bg-gold/10 border border-gold/20 px-3 py-1.5 rounded-full"
                    >
                      {specialty}
                    </span>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 w-full">
                  <motion.a
                    href={selectedArtist.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-outline-gold py-3 px-5 flex items-center justify-center gap-2 flex-1"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Instagram className="w-4 h-4" />
                    <span>View Instagram</span>
                  </motion.a>

                  <motion.button
                    onClick={() => handleBeginWithLuna(selectedArtist)}
                    className="btn-gold py-3 px-5 flex items-center justify-center gap-2 flex-1"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Begin with Luna</span>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Luna Modal */}
      <LunaModal isOpen={isOpen} onClose={closeModal} context={context} />
    </>
  );
};
