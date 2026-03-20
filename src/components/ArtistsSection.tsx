import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Instagram, X, Sparkles } from "lucide-react";
import { LunaModal, useLunaModal, LunaContext } from "./LunaModal";

interface Artist {
  id: string;
  name: string;
  fullName: string;
  photo: string;
  specialty: string;
  description: string;
  specialties: string[];
  instagram?: string;
  isFounding?: boolean;
}

const artists: Artist[] = [
  {
    id: "sheri",
    name: "Sheri",
    fullName: "Sheri Turner",
    photo: "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=400&h=500&fit=crop&crop=face",
    specialty: "Co-Founder · Color & Cuts",
    description: "23 years behind the chair at Hush. Guests say Sheri always knows exactly what to do — even when they can't describe it themselves.",
    specialties: ["Complex Color", "Precision Cuts", "Client Transformations"],
    isFounding: true,
  },
  {
    id: "danielle",
    name: "Danielle",
    fullName: "Danielle Colucci",
    photo: "https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=400&h=500&fit=crop&crop=face",
    specialty: "Co-Founder · Master Colorist",
    description: "One of the original three. Deep client relationships built over two decades. Danielle's color work is the standard Hush is built on.",
    specialties: ["Hair Color", "Cuts & Styling", "Color Education"],
    isFounding: true,
  },
  {
    id: "kathy",
    name: "Kathy",
    fullName: "Kathy Crawford",
    photo: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=400&h=500&fit=crop&crop=face",
    specialty: "Co-Founder · Precision Cuts",
    description: "\"Kathy knew exactly how to cut my thick, fine hair\" — that's the review that says it all. Precision, care, and 23 years of instinct.",
    specialties: ["Precision Cuts", "Color", "Thick & Fine Hair"],
    isFounding: true,
  },
  {
    id: "michelle",
    name: "Michelle",
    fullName: "Michelle Yrigolla",
    photo: "https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=400&h=500&fit=crop&crop=face",
    specialty: "Master Stylist & Color Educator",
    description: "The go-to for complex color corrections. \"I walked in anxious about a big change — Michelle reassured me the whole way. Beyond satisfied.\"",
    specialties: ["Corrective Color", "Extensions", "Color Education"],
  },
  {
    id: "silviya",
    name: "Silviya",
    fullName: "Silviya Warren",
    photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=500&fit=crop&crop=face",
    specialty: "High Fashion Color",
    description: "Runway-level blonde and dimensional color. Silviya brings high-fashion precision to every guest — clients simply don't go anywhere else.",
    specialties: ["Blonde Services", "Extensions", "Brazilian Blowout"],
    instagram: "https://instagram.com/hairdesignsbysilviya",
  },
  {
    id: "whitney",
    name: "Whitney",
    fullName: "Whitney Hernandez",
    photo: "https://images.unsplash.com/photo-1488716820095-cbe80883c496?w=400&h=500&fit=crop&crop=face",
    specialty: "Dimensional Blondes & Bridal",
    description: "\"Whitney nailed it — beige, not golden, not ashy. FINALLY found my stylist.\" Perfect for bridal and anyone serious about their blonde.",
    specialties: ["Dimensional Blondes", "Balayage", "Bridal Styling"],
  },
  {
    id: "melissa",
    name: "Melissa",
    fullName: "Melissa Brunty",
    photo: "https://images.unsplash.com/photo-1512361436605-a484bdb34b5f?w=400&h=500&fit=crop&crop=face",
    specialty: "Blonde & Long Hair Specialist",
    description: "Bombshell blondes, balayage, and root melts that grow out beautifully. Melissa's work is all about the lived-in, effortless look.",
    specialties: ["Blonde", "Balayage", "Root Melts"],
    instagram: "https://instagram.com/mbhaircreations",
  },
  {
    id: "allison",
    name: "Allison",
    fullName: "Allison Griessel",
    photo: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=500&fit=crop&crop=face",
    specialty: "Lashes · Fantasy Color · Esthetics",
    description: "\"Allison is magical — nonstop compliments since seeing her.\" Our only lash specialist and fantasy color artist. She thinks beyond the chair.",
    specialties: ["Lash Extensions", "Vivid Color", "Brow Services"],
    instagram: "https://instagram.com/allieglam",
  },
  {
    id: "patty",
    name: "Patty",
    fullName: "Patty",
    photo: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=400&h=500&fit=crop&crop=face",
    specialty: "Licensed Esthetician",
    description: "HydraFacials, microneedling, dermaplaning, spray tans — Patty is the skincare specialist who delivers real results, every time.",
    specialties: ["HydraFacial", "Microneedling", "Spray Tan"],
  },
  {
    id: "tammi",
    name: "Tammi",
    fullName: "Tammi",
    photo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=500&fit=crop&crop=face",
    specialty: "Licensed Massage Therapist",
    description: "People rebook with Tammi before they even leave the table. Swedish, deep tissue, therapeutic — she tailors every session to what your body actually needs.",
    specialties: ["Deep Tissue", "Swedish", "Therapeutic"],
  },
];

export const ArtistsSection = () => {
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
  const { isOpen, context, openModal, closeModal } = useLunaModal();

  const handleMatchWithLuna = (artist: Artist) => {
    setSelectedArtist(null);
    const lunaContext: LunaContext = {
      source: "Meet the Team",
      categories: [],
      goal: null,
      timing: null,
    };
    openModal(lunaContext);
  };

  return (
    <>
      <section id="team" className="py-32 px-6 bg-background">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-4xl md:text-6xl font-semibold text-cream mb-6">
              Meet the <span className="text-gold-gradient">Team</span>
            </h2>
            <p className="font-body text-lg text-muted-foreground max-w-2xl mx-auto">
              Real people with real talent. Not sure who's right for you?{" "}
              <button
                onClick={() => openModal({ source: "Team Section", categories: [], goal: null, timing: null })}
                className="text-gold underline underline-offset-4 hover:text-gold-glow transition-colors"
              >
                Luna can match you.
              </button>
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
            {artists.map((artist, index) => (
              <motion.div
                key={artist.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
              >
                <motion.button
                  onClick={() => setSelectedArtist(artist)}
                  className="group w-full text-left relative overflow-hidden rounded-xl border border-charcoal-light bg-card hover:border-gold/50 transition-all duration-300"
                  whileHover={{ y: -4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {artist.isFounding && (
                    <div className="absolute top-2 left-2 z-10 bg-gold/90 text-background text-xs font-display px-2 py-0.5 rounded-full">
                      Founding
                    </div>
                  )}
                  <div className="aspect-[3/4] overflow-hidden">
                    <img
                      src={artist.photo}
                      alt={artist.fullName}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-3 md:p-4">
                    <p className="font-display text-base md:text-lg text-cream">{artist.name}</p>
                    <p className="font-body text-xs text-gold/80 mt-0.5 line-clamp-1">{artist.specialty}</p>
                  </div>
                </motion.button>
              </motion.div>
            ))}
          </div>

          {/* Luna match CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-center mt-16"
          >
            <motion.button
              onClick={() => openModal({ source: "Team Section", categories: [], goal: null, timing: null })}
              className="btn-outline-gold py-4 px-10 flex items-center gap-3 mx-auto"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Sparkles className="w-5 h-5" />
              Let Luna Match You to the Right Person
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Artist Detail Modal */}
      <AnimatePresence>
        {selectedArtist && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
            onClick={() => setSelectedArtist(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 20 }}
              className="relative max-w-md w-full bg-card border border-charcoal-light rounded-2xl overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedArtist(null)}
                className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-background/80 flex items-center justify-center text-muted-foreground hover:text-cream transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={selectedArtist.photo}
                  alt={selectedArtist.fullName}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="p-6">
                {selectedArtist.isFounding && (
                  <span className="inline-block bg-gold/20 text-gold text-xs font-display px-3 py-1 rounded-full mb-3">
                    Founding Member · 23 Years
                  </span>
                )}
                <h3 className="font-display text-2xl text-cream mb-1">{selectedArtist.fullName}</h3>
                <p className="font-body text-sm text-gold/80 mb-4">{selectedArtist.specialty}</p>
                <p className="font-body text-muted-foreground text-sm leading-relaxed mb-6">
                  {selectedArtist.description}
                </p>

                <div className="flex flex-wrap gap-2 mb-6">
                  {selectedArtist.specialties.map((s) => (
                    <span key={s} className="text-xs font-body bg-charcoal-light text-cream px-3 py-1 rounded-full">
                      {s}
                    </span>
                  ))}
                </div>

                <div className="flex gap-3">
                  <motion.button
                    onClick={() => handleMatchWithLuna(selectedArtist)}
                    className="btn-gold py-3 px-6 flex-1 flex items-center justify-center gap-2 text-sm"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Sparkles className="w-4 h-4" />
                    Ask Luna About This
                  </motion.button>
                  {selectedArtist.instagram && (
                    <a
                      href={selectedArtist.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-outline-gold py-3 px-4 flex items-center justify-center"
                    >
                      <Instagram className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <LunaModal isOpen={isOpen} onClose={closeModal} context={context} />
    </>
  );
};
