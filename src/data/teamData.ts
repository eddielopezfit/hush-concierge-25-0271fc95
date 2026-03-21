import { ServiceCategoryId } from "@/types/concierge";

// Artist photo imports
import imgAllisonGriessel from "@/assets/artists/Allison_Griessel.jpg";
import imgAnaMoreno from "@/assets/artists/Ana_Moreno.jpg";
import imgAnitaApodaca from "@/assets/artists/Anita_Apodaca.jpg";
import imgCharlyCamano from "@/assets/artists/Charly_Camano.png";
import imgJackie from "@/assets/artists/Jackie.jpg";
import imgKathyCharette from "@/assets/artists/Kathy_Charette.jpg";
import imgKellyVishnevetsky from "@/assets/artists/Kelly_Vishnevetsky.jpg";
import imgKendellBarraza from "@/assets/artists/Kendell_Barraza.jpg";
import imgLori from "@/assets/artists/Lori.jpg";
import imgMelissaBrunty from "@/assets/artists/Melissa_Brunty.jpg";
import imgMichelleYrigolla from "@/assets/artists/Michelle_Yrigolla.jpg";
import imgPatty from "@/assets/artists/Patty.jpg";
import imgPriscilla from "@/assets/artists/Priscilla.jpg";
import imgSilviyaWarren from "@/assets/artists/Silviya_Warren.jpg";
import imgWhitneyHernandez from "@/assets/artists/Whitney_Hernandez.jpg";
import imgZaidaDelgado from "@/assets/artists/Zaida_Delgado.jpg";

export type TeamDepartment = "hair" | "skincare" | "nails" | "massage" | "lashes" | "front-desk" | "founders";
export type TeamRole = "founder" | "senior-stylist" | "stylist" | "esthetician" | "nail-tech" | "massage-therapist" | "coordinator" | "lash-specialist";

export interface TeamMember {
  id: string;
  name: string;
  department: TeamDepartment;
  role: TeamRole;
  photo: string | null;
  specialty: string;
  specialties: string[];
  description: string;
  bestFor: string;
  badge?: string;
  /** Primary service category for concierge context */
  serviceCategory: ServiceCategoryId | null;
  /** Additional service categories this team member covers */
  serviceCategories?: ServiceCategoryId[];
  directPhone?: string;
  isPrimaryBooking: boolean;
}

/** Map from team member ID to imported photo */
export const photoMap: Record<string, string> = {
  h1: imgCharlyCamano,
  h2: imgMichelleYrigolla,
  h3: imgSilviyaWarren,
  h4: imgWhitneyHernandez,
  h5: imgKathyCharette,
  h6: imgAllisonGriessel,
  h7: imgMelissaBrunty,
  h8: imgAnaMoreno,
  h9: imgPriscilla,
  h10: imgZaidaDelgado,
  fd1: imgKendellBarraza,
  e1: imgPatty,
  e2: imgLori,
  n1: imgAnitaApodaca,
  n2: imgKellyVishnevetsky,
  n3: imgJackie,
};

export const teamMembers: TeamMember[] = [
  // Founders
  { id: "f1", name: "Sheri Turner", department: "founders", role: "founder", photo: null, specialty: "Co-Founder", specialties: ["Leadership", "Vision"], description: "Visionary co-founder leading Hush since 2002. Still behind the chair and deeply involved every day.", bestFor: "Guests who value the original Hush experience", badge: "Founding", serviceCategory: "hair", isPrimaryBooking: false },
  { id: "f2", name: "Danielle Colucci", department: "founders", role: "founder", photo: null, specialty: "Co-Founder", specialties: ["Leadership", "Community"], description: "Co-founder driven by community and creativity. She set the standard for what Hush feels like.", bestFor: "Guests looking for warmth and expertise", badge: "Founding", serviceCategory: "hair", isPrimaryBooking: false },
  { id: "f3", name: "Kathy Crawford", department: "founders", role: "founder", photo: null, specialty: "Co-Founder", specialties: ["Leadership", "Client Care"], description: "Co-founder dedicated to guest care. She ensures every visit meets the Hush standard.", bestFor: "Guests who want personalized attention", badge: "Founding", serviceCategory: "hair", isPrimaryBooking: false },
  // Hair Stylists
  { id: "h1", name: "Charly Camano", department: "hair", role: "stylist", photo: imgCharlyCamano, specialty: "Color & Waves", specialties: ["Color", "Waves", "Styling"], description: "Expert in color techniques and textured waves.", bestFor: "Lived-in color and beachy texture", serviceCategory: "hair", isPrimaryBooking: true },
  { id: "h2", name: "Michelle Yrigolla", department: "hair", role: "senior-stylist", photo: imgMichelleYrigolla, specialty: "Master Stylist & Color Educator", specialties: ["Color Education", "Extensions", "Master Styling"], description: "Master stylist, color educator, and extensions specialist.", bestFor: "Complex color and extensions", serviceCategory: "hair", isPrimaryBooking: true },
  { id: "h3", name: "Silviya Warren", department: "hair", role: "stylist", photo: imgSilviyaWarren, specialty: "High Fashion Color", specialties: ["Fashion Color", "Artistic Color"], description: "Specializing in bold, editorial color work.", bestFor: "Bold transformations and vivid color", serviceCategory: "hair", isPrimaryBooking: true },
  { id: "h4", name: "Whitney Hernandez", department: "hair", role: "stylist", photo: imgWhitneyHernandez, specialty: "Dimensional Blondes & Updos", specialties: ["Blondes", "Updos", "Dimensional Color"], description: "Creating luminous blondes and stunning updo artistry.", bestFor: "Blonding, events, and bridal", serviceCategory: "hair", isPrimaryBooking: true },
  { id: "h5", name: "Kathy Charette", department: "hair", role: "stylist", photo: imgKathyCharette, specialty: "Cuts & Color", specialties: ["Haircuts", "Color"], description: "Precision cuts paired with beautiful color.", bestFor: "Clean cuts and reliable color", serviceCategory: "hair", isPrimaryBooking: true },
  { id: "h6", name: "Allison Griessel", department: "hair", role: "stylist", photo: imgAllisonGriessel, specialty: "Creative Color & Esthetics", specialties: ["Creative Color", "Esthetics", "Facials", "Skincare"], description: "Dual-trained in creative color and esthetics — one of the few artists at Hush who can do both.", bestFor: "Creative color + skincare in one visit", serviceCategory: "hair", serviceCategories: ["hair", "skincare"], isPrimaryBooking: true },
  { id: "h7", name: "Melissa Brunty", department: "hair", role: "stylist", photo: imgMelissaBrunty, specialty: "Extensions & Long Hair", specialties: ["Extensions", "Long Hair"], description: "Seamless extensions and long hair transformations.", bestFor: "Length, volume, and extensions", serviceCategory: "hair", isPrimaryBooking: true },
  { id: "h8", name: "Ana Moreno", department: "hair", role: "stylist", photo: imgAnaMoreno, specialty: "Color, Cuts & Styling", specialties: ["Color", "Cuts", "Styling"], description: "Versatile stylist skilled in color, cuts, and finishing.", bestFor: "Versatile everyday looks", serviceCategory: "hair", isPrimaryBooking: true },
  { id: "h9", name: "Priscilla", department: "hair", role: "stylist", photo: imgPriscilla, specialty: "Color & Cuts", specialties: ["Color", "Cuts"], description: "Reliable artistry in color and precision cutting.", bestFor: "Dependable quality every visit", serviceCategory: "hair", isPrimaryBooking: true },
  { id: "h10", name: "Zaida Delgado", department: "hair", role: "stylist", photo: imgZaidaDelgado, specialty: "Bold Transformations", specialties: ["Transformations", "Bold Color"], description: "Fearless approach to dramatic hair transformations.", bestFor: "Dramatic makeovers", serviceCategory: "hair", isPrimaryBooking: true },
  // Front Desk
  { id: "fd1", name: "Kendell Barraza", department: "front-desk", role: "coordinator", photo: imgKendellBarraza, specialty: "Guest Experience", specialties: ["Guest Services", "Scheduling"], description: "Your first point of contact and concierge guide.", bestFor: "Booking help and questions", serviceCategory: null, isPrimaryBooking: false },
  // Esthetics
  { id: "e1", name: "Patty", department: "skincare", role: "esthetician", photo: imgPatty, specialty: "Facials & Skincare", specialties: ["Facials", "Skincare", "Spray Tan"], description: "Results-driven skincare and facial treatments.", bestFor: "Clear skin and custom facials", serviceCategory: "skincare", isPrimaryBooking: true },
  { id: "e2", name: "Lori", department: "skincare", role: "esthetician", photo: imgLori, specialty: "Facials & Skincare", specialties: ["Facials", "Skincare"], description: "Dedicated to healthy, glowing skin.", bestFor: "Gentle, nurturing skin care", serviceCategory: "skincare", isPrimaryBooking: true },
  // Nail Technicians
  { id: "n1", name: "Anita Apodaca", department: "nails", role: "nail-tech", photo: imgAnitaApodaca, specialty: "Nail Tech & Educator", specialties: ["Nail Art", "Education", "Extensions"], description: "Nail artistry educator with a passion for nail art.", bestFor: "Creative nail designs", serviceCategory: "nails", isPrimaryBooking: true },
  { id: "n2", name: "Kelly Vishnevetsky", department: "nails", role: "nail-tech", photo: imgKellyVishnevetsky, specialty: "Pedicures & Extensions", specialties: ["Pedicures", "Extensions"], description: "Expert in pedicures and nail extensions.", bestFor: "Pedicures and nail extensions", serviceCategory: "nails", isPrimaryBooking: true },
  { id: "n3", name: "Jackie", department: "nails", role: "nail-tech", photo: imgJackie, specialty: "Nail Art & Extensions", specialties: ["Nail Art", "Extensions"], description: "Creative nail art and extension specialist.", bestFor: "Trendy nail art", serviceCategory: "nails", isPrimaryBooking: true },
  // Massage
  { id: "m1", name: "Tammy", department: "massage", role: "massage-therapist", photo: null, specialty: "Massage Therapist", specialties: ["Massage", "Relaxation", "Therapeutic"], description: "Therapeutic touch that restores balance and renews spirit.", bestFor: "Deep relaxation and recovery", serviceCategory: "massage", directPhone: "(520) 370-3018", isPrimaryBooking: true },
  // Lashes
  { id: "l1", name: "Allison", department: "lashes", role: "lash-specialist", photo: null, specialty: "Lash Specialist", specialties: ["Classic Lashes", "Volume Lashes", "Lash Lifts"], description: "Custom lash design enhancing natural eye shape.", bestFor: "Natural to dramatic lash looks", serviceCategory: "lashes", directPhone: "(520) 250-6606", isPrimaryBooking: true },
];

/** Get founders only */
export const getFounders = () => teamMembers.filter(m => m.department === "founders");

/** Get non-founder team members */
export const getTeam = () => teamMembers.filter(m => m.department !== "founders");

/** Get bookable artists (for Luna matching) */
export const getBookableArtists = () => teamMembers.filter(m => m.isPrimaryBooking);

/** Get artists by service category */
export const getArtistsByCategory = (category: ServiceCategoryId) =>
  teamMembers.filter(m => m.serviceCategory === category && m.isPrimaryBooking);

/** Department label for display */
export const departmentLabels: Record<TeamDepartment, string> = {
  hair: "Hair",
  skincare: "Skincare",
  nails: "Nails",
  massage: "Massage",
  lashes: "Lashes",
  "front-desk": "Front Desk",
  founders: "Founders",
};
