import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useState } from "react";

interface ArtistCard {
  id: string;
  name: string;
  specialty: string;
  bestFor: string;
  department: string;
}

const artistData: ArtistCard[] = [
  { id: "h2", name: "Michelle Yrigolla", specialty: "Master Stylist & Color Educator", bestFor: "Complex color and extensions", department: "Hair" },
  { id: "h3", name: "Silviya Warren", specialty: "High Fashion Color", bestFor: "Bold transformations and vivid color", department: "Hair" },
  { id: "h4", name: "Whitney Hernandez", specialty: "Dimensional Blondes & Updos", bestFor: "Blonding, events, and bridal", department: "Hair" },
  { id: "h1", name: "Charly Camano", specialty: "Color & Waves", bestFor: "Lived-in color and beachy texture", department: "Hair" },
  { id: "h7", name: "Melissa Brunty", specialty: "Extensions & Long Hair", bestFor: "Length, volume, and extensions", department: "Hair" },
  { id: "h8", name: "Ana Moreno", specialty: "Color, Cuts & Styling", bestFor: "Versatile everyday looks", department: "Hair" },
  { id: "n1", name: "Anita Apodaca", specialty: "Nail Tech & Educator", bestFor: "Creative nail designs", department: "Nails" },
  { id: "e1", name: "Patty", specialty: "Facials & Skincare", bestFor: "Clear skin and custom facials", department: "Skincare" },
  { id: "m1", name: "Tammy", specialty: "Massage Therapist", bestFor: "Deep relaxation and recovery", department: "Massage" },
  { id: "l1", name: "Allison", specialty: "Lash Specialist", bestFor: "Natural to dramatic lash looks", department: "Lashes" },
];

const departments = ["All", "Hair", "Nails", "Skincare", "Lashes", "Massage"];

interface ArtistsTabProps {
  onSwitchTab: (tab: string) => void;
}

export const ArtistsTab = ({ onSwitchTab }: ArtistsTabProps) => {
  const [filter, setFilter] = useState("All");

  const filtered = filter === "All" ? artistData : artistData.filter(a => a.department === filter);

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
        {filtered.map((artist, i) => (
          <motion.div
            key={artist.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className="rounded-lg border border-border bg-card p-3 space-y-2"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="font-display text-sm text-foreground">{artist.name}</p>
                <p className="text-[10px] font-body text-primary">{artist.specialty}</p>
              </div>
              <span className="text-[10px] font-body text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{artist.department}</span>
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
        ))}
      </div>
    </div>
  );
};
