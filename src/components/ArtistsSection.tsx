import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { X, Sparkles } from "lucide-react";
import { LunaModal, useLunaModal, LunaContext } from "./LunaModal";

interface Artist {
  id: string;
  name: string;
  specialty: string;
  description: string;
  specialties: string[];
  badge?: string;
  department: string;
}

const artists: Artist[] = [
  // Founders
  { id: "f1", name: "Sheri Turner", specialty: "Co-Founder", description: "Visionary co-founder leading Hush since 2002.", specialties: ["Leadership", "Vision"], badge: "Founding", department: "Founders" },
  { id: "f2", name: "Danielle Colucci", specialty: "Co-Founder", description: "Co-founder passionate about beauty and community.", specialties: ["Leadership", "Community"], badge: "Founding", department: "Founders" },
  { id: "f3", name: "Kathy Crawford", specialty: "Co-Founder", description: "Co-founder dedicated to client care and excellence.", specialties: ["Leadership", "Client Care"], badge: "Founding", department: "Founders" },
  // Hair Stylists
  { id: "h1", name: "Charly Camano", specialty: "Color & Waves", description: "Expert in color techniques and textured waves.", specialties: ["Color", "Waves", "Styling"], department: "Hair" },
  { id: "h2", name: "Michelle Yrigolla", specialty: "Master Stylist & Color Educator", description: "Master stylist, color educator, and extensions specialist.", specialties: ["Color Education", "Extensions", "Master Styling"], department: "Hair" },
  { id: "h3", name: "Silviya Warren", specialty: "High Fashion Color", description: "Specializing in bold, editorial color work.", specialties: ["Fashion Color", "Artistic Color"], department: "Hair" },
  { id: "h4", name: "Whitney Hernandez", specialty: "Dimensional Blondes & Updos", description: "Creating luminous blondes and stunning updo artistry.", specialties: ["Blondes", "Updos", "Dimensional Color"], department: "Hair" },
  { id: "h5", name: "Kathy Charette", specialty: "Cuts & Color", description: "Precision cuts paired with beautiful color.", specialties: ["Haircuts", "Color"], department: "Hair" },
  { id: "h6", name: "Allison Griessel", specialty: "Creative Color", description: "Pushing boundaries with creative color techniques.", specialties: ["Creative Color", "Esthetics"], department: "Hair" },
  { id: "h7", name: "Melissa Brunty", specialty: "Extensions & Long Hair", description: "Seamless extensions and long hair transformations.", specialties: ["Extensions", "Long Hair"], department: "Hair" },
  { id: "h8", name: "Ana Moreno", specialty: "Color, Cuts & Styling", description: "Versatile stylist skilled in color, cuts, and finishing.", specialties: ["Color", "Cuts", "Styling"], department: "Hair" },
  { id: "h9", name: "Priscilla", specialty: "Color & Cuts", description: "Reliable artistry in color and precision cutting.", specialties: ["Color", "Cuts"], department: "Hair" },
  { id: "h10", name: "Zaida Delgado", specialty: "Bold Transformations", description: "Fearless approach to dramatic hair transformations.", specialties: ["Transformations", "Bold Color"], department: "Hair" },
  // Front Desk
  { id: "fd1", name: "Kendell Barraza", specialty: "Guest Experience", description: "Your first point of contact and concierge guide.", specialties: ["Guest Services", "Scheduling"], department: "Front Desk" },
  // Esthetics
  { id: "e1", name: "Patty", specialty: "Facials & Skincare", description: "Results-driven skincare and facial treatments.", specialties: ["Facials", "Skincare", "Spray Tan"], department: "Esthetics" },
  { id: "e2", name: "Lori", specialty: "Facials & Skincare", description: "Dedicated to healthy, glowing skin.", specialties: ["Facials", "Skincare"], department: "Esthetics" },
  // Nail Technicians
  { id: "n1", name: "Anita Apodaca", specialty: "Nail Tech & Educator", description: "Nail artistry educator with a passion for nail art.", specialties: ["Nail Art", "Education", "Extensions"], department: "Nails" },
  { id: "n2", name: "Kelly Vishnevetsky", specialty: "Pedicures & Extensions", description: "Expert in pedicures and nail extensions.", specialties: ["Pedicures", "Extensions"], department: "Nails" },
  { id: "n3", name: "Jackie", specialty: "Nail Art & Extensions", description: "Creative nail art and extension specialist.", specialties: ["Nail Art", "Extensions"], department: "Nails" },
  // Massage
  { id: "m1", name: "Tammy", specialty: "Massage Therapist", description: "Therapeutic touch that restores balance and renews spirit.", specialties: ["Massage", "Relaxation", "Therapeutic"], department: "Massage" },
  // Lashes
  { id: "l1", name: "Allison", specialty: "Lash Specialist", description: "Bespoke lash design enhancing natural eye shape.", specialties: ["Classic Lashes", "Volume Lashes", "Lash Lifts"], department: "Lashes" },
];

const MonogramAvatar = ({ name, badge }: { name: string; badge?: string }) => {
  const initial = name.charAt(0).toUpperCase();
  return (
    <div className="w-full h-full bg-[#111] flex items-center justify-center relative">
      <span className="font-display text-5xl md:text-6xl text-gold select-none">{initial}</span>
      {badge && (
        <span className="absolute top-3 left-3 text-[10px] font-body uppercase tracking-wider bg-gold/20 text-gold border border-gold/30 px-2 py-0.5 rounded-full">
          {badge}
        </span>
      )}
    </div>
  );
};

export const ArtistsSection = () => {
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
  const { isOpen, context, openModal, closeModal } = useLunaModal();

  const handleBeginWithLuna = (artist: Artist) => {
    setSelectedArtist(null);
    const lunaContext: LunaContext = {
      source: "Meet the Artists",
      categories: [artist.department.toLowerCase() as any],
      goal: null,
      timing: null
    };
    sessionStorage.setItem("selectedArtist", artist.name);
    openModal(lunaContext);
  };

  // Group by department for display
  const founders = artists.filter(a => a.department === "Founders");
  const team = artists.filter(a => a.department !== "Founders");

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
              Meet the <span className="text-gold-gradient">Artists</span>
            </h2>
            <p className="font-body text-muted-foreground text-lg max-w-xl mx-auto">
              Each artist brings a signature style. Luna will help you find your perfect match.
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
                <div className="relative aspect-[3/4] rounded-lg overflow-hidden border border-gold/30 hover:border-gold/60 transition-all duration-500 group-hover:shadow-[0_0_30px_-5px_hsl(43_45%_58%/0.25)]">
                  <MonogramAvatar name={artist.name} badge={artist.badge} />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <h3 className="font-display text-lg md:text-xl text-cream mb-1 leading-tight">
                      {artist.name}
                    </h3>
                    <span className="inline-block text-[10px] font-body text-gold bg-gold/10 px-2 py-0.5 rounded-full">
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
                onClick={() => setSelectedArtist(artist)}
              >
                <div className="relative aspect-[3/4] rounded-lg overflow-hidden border border-border hover:border-gold/40 transition-all duration-500 group-hover:shadow-[0_0_30px_-5px_hsl(43_45%_58%/0.25)]">
                  <MonogramAvatar name={artist.name} />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <h3 className="font-display text-base md:text-lg text-cream mb-1 leading-tight">
                      {artist.name}
                    </h3>
                    <span className="inline-block text-[10px] font-body text-gold bg-gold/10 px-2 py-0.5 rounded-full">
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
              <button
                onClick={() => setSelectedArtist(null)}
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-charcoal flex items-center justify-center text-muted-foreground hover:text-cream hover:bg-gold/20 transition-all"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex flex-col items-center text-center">
                <div className="w-28 h-28 md:w-32 md:h-32 rounded-full overflow-hidden border-2 border-gold/40 mb-5 shadow-[0_0_30px_-5px_hsl(43_45%_58%/0.3)]">
                  <MonogramAvatar name={selectedArtist.name} badge={selectedArtist.badge} />
                </div>

                <h3 className="font-display text-3xl text-cream mb-1">
                  {selectedArtist.name}
                </h3>
                
                <p className="font-body text-gold text-sm mb-3">{selectedArtist.department}</p>

                <p className="font-body text-muted-foreground mb-5 max-w-xs">
                  {selectedArtist.description}
                </p>

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

                <motion.button
                  onClick={() => handleBeginWithLuna(selectedArtist)}
                  className="btn-gold py-3 px-5 flex items-center justify-center gap-2 w-full"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Begin with Luna</span>
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <LunaModal isOpen={isOpen} onClose={closeModal} context={context} />
    </>
  );
};
