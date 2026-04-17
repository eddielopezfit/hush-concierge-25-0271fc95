import { ServiceCategoryId } from "@/types/concierge";

// Artist photo imports (WebP — 57% smaller than originals)
import imgAllisonGriessel from "@/assets/artists/Allison_Griessel.webp";
import imgAnaMoreno from "@/assets/artists/Ana_Moreno.webp";
import imgAnitaApodaca from "@/assets/artists/Anita_Apodaca.webp";
import imgCharlyCamano from "@/assets/artists/Charly_Camano.webp";
import imgJackie from "@/assets/artists/Jackie.webp";
import imgKathyCharette from "@/assets/artists/Kathy_Charette.webp";
import imgKellyVishnevetsky from "@/assets/artists/Kelly_Vishnevetsky.webp";
import imgKendellBarraza from "@/assets/artists/Kendell_Barraza.webp";
import imgLori from "@/assets/artists/Lori.webp";
import imgMelissaBrunty from "@/assets/artists/Melissa_Brunty.webp";
import imgMichelleYrigolla from "@/assets/artists/Michelle_Yrigolla.webp";
import imgPatty from "@/assets/artists/Patty.webp";
import imgPriscilla from "@/assets/artists/Priscilla.webp";
import imgSilviyaWarren from "@/assets/artists/Silviya_Warren.webp";
import imgWhitneyHernandez from "@/assets/artists/Whitney_Hernandez.webp";
import imgZaidaDelgado from "@/assets/artists/Zaida_Delgado.webp";
import imgFounders from "@/assets/Founders_Hush.jpg";

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
  /** Short warm fit statement shown on filtered cards */
  fitStatement: string;
  /** "Known for" / "Guests often choose for" tags */
  knownFor: string[];
  badge?: string;
  /** Rich personality bio from legacy site */
  legacyBio?: string;
  /** Primary service category for concierge context */
  serviceCategory: ServiceCategoryId | null;
  /** Additional service categories this team member covers */
  serviceCategories?: ServiceCategoryId[];
  directPhone?: string;
  isPrimaryBooking: boolean;
  /** Instagram handle (without @) */
  instagram?: string;
  /** Featured client review attached to this artist */
  featuredReview?: { quote: string; author: string; source: string };
}

/** Map from team member ID to imported photo */
export const photoMap: Record<string, string> = {
  f1: imgFounders,
  f2: imgFounders,
  f3: imgFounders,
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
  { id: "f1", name: "Sheri Turner", department: "founders", role: "founder", photo: imgFounders, specialty: "Lived-in Color & Transformations", specialties: ["Lived-in Color", "Blondes", "Transformations"], description: "Visionary co-founder leading Hush since 2002. Still behind the chair and deeply involved every day.", bestFor: "Lived-in color and full transformations", fitStatement: "The heart of Hush — 24 years of setting the standard.", knownFor: ["Lived-in color", "Blondes", "Transformations", "24 years behind the chair"], badge: "Founding", legacyBio: "For 24 years they have been \"living on a prayer\" building a salon where style, passion, and friendship take center stage. Like true \"free birds\", their salon has stood the test of time, turning every cut, color and style into a \"stairway to heaven\" for their clients. With the hearts of \"small-town girls\", they've built more than a business — they've created a community that stands by them, believing every day is a great day when you look your best.", serviceCategory: "hair", isPrimaryBooking: true },
  { id: "f2", name: "Danielle Colucci", department: "founders", role: "founder", photo: imgFounders, specialty: "Foundation Cuts & Color", specialties: ["Cuts", "Color", "Community"], description: "Co-founder driven by community and creativity. She set the standard for what Hush feels like.", bestFor: "Foundational cuts and reliable color", fitStatement: "Built the culture that makes Hush feel like home.", knownFor: ["Foundation cuts", "Reliable color", "24 years behind the chair"], badge: "Founding", legacyBio: "For 24 years they have been \"living on a prayer\" building a salon where style, passion, and friendship take center stage. With a deep love for their staff, craft and hometown, they are here to make sure every client leaves feeling like a rock star!", serviceCategory: "hair", isPrimaryBooking: true },
  { id: "f3", name: "Kathy Crawford", department: "founders", role: "founder", photo: imgFounders, specialty: "Hi-lites & Cool Tones", specialties: ["Hi-lites", "Cool Tones", "Blondes"], description: "Co-founder behind the chair daily — known for hi-lites and cool blondes.", bestFor: "Hi-lites, blondes, and cool tones", fitStatement: "Active behind the chair — the go-to for cool, dimensional blondes.", knownFor: ["Hi-lites", "Cool blondes", "Dimensional color", "24 years behind the chair"], badge: "Founding", legacyBio: "Thanks to the love and support of their loyal clients, they're standing stronger than ever, proving great hair never goes out of style. With a deep love for their staff, craft and hometown, they are here to make sure every client leaves feeling like a rock star!", serviceCategory: "hair", isPrimaryBooking: true, instagram: "kcwiththecoolhair" },
  // Hair Stylists
  { id: "h1", name: "Charly Camano", department: "hair", role: "stylist", photo: imgCharlyCamano, specialty: "Waves & Texture", specialties: ["Waves", "Texture", "Dimensional Color"], description: "Niche specialist in waves, texture, and dimensional color.", bestFor: "Beachy waves, texture, and lived-in color", fitStatement: "The go-to for natural waves and textured looks.", knownFor: ["Beachy waves", "Texture work", "Dimensional color"], legacyBio: "This \"wild thing will make your hair sing\". A fashionista soul who cranks up the volume. Fueled by a \"spirit in the sky\", she crafts killer waves, rebellious hues and head-turning clips that own the spotlight. A true star who \"shines bright like a diamond\"!", serviceCategory: "hair", isPrimaryBooking: true },
  { id: "h2", name: "Michelle Yrigolla", department: "hair", role: "senior-stylist", photo: imgMichelleYrigolla, specialty: "Master Stylist & Color Educator", specialties: ["Color Education", "Extensions", "Master Styling"], description: "Master stylist, color educator, and extensions specialist.", bestFor: "Complex color, extensions, and color correction", fitStatement: "Guests often choose her for major color changes and transformations.", knownFor: ["Dimensional color", "Blonding transformations", "Extensions", "Color correction"], badge: "Educator", legacyBio: "She's a \"master of puppets\" when it comes to color, cutting, and extensions, turning every look into a work of art. As a color educator and master stylist she's got the skills to transform hair with precision and flair. Sit in her chair, and get ready to \"shine bright like a diamond\" with a style that's nothing short of perfection.", serviceCategory: "hair", isPrimaryBooking: true, instagram: "hairby_michelley", featuredReview: { quote: "Once Michelle took me back to her station we started talking about it and she reassured me it would look great… I highly recommend this hair salon!", author: "Cara B Foster", source: "Facebook" } },
  { id: "h3", name: "Silviya Warren", department: "hair", role: "stylist", photo: imgSilviyaWarren, specialty: "European Color & Extensions", specialties: ["European Balayage", "Extensions", "Fashion Color"], description: "European-trained color specialist — 10+ years at Hush. Known for balayage, melting, and dream catchers extensions.", bestFor: "European balayage, extensions, and editorial color", fitStatement: "European touch — 10+ years at Hush. Strong option for balayage and extensions.", knownFor: ["European balayage", "Dream catchers extensions", "Color melting", "10+ years at Hush"], legacyBio: "Meet Silviya, where high fashion meets high voltage. With a passion for runway-worthy looks, bold colors and flawless finishes, she turns every client into a chart-topping masterpiece. With a heart of gold and extra-care customer service, she pampers, perfects and delivers a look that's simply the best — \"better than all the rest!\"", serviceCategory: "hair", isPrimaryBooking: true, instagram: "hairdesignsbysilviya" },
  { id: "h4", name: "Whitney Hernandez", department: "hair", role: "stylist", photo: imgWhitneyHernandez, specialty: "Dimensional Blondes, Bridal & Updos", specialties: ["Blondes", "Bridal", "Updos", "Extensions"], description: "Luminous blondes, bridal hair, and event-ready updos. Co-runs @dreambridesaz.", bestFor: "Blonding, bridal, events, and extensions", fitStatement: "Great for dimensional blondes, bridal hair, and event styling.", knownFor: ["Luminous blondes", "Bridal hair", "Updos", "Extensions"], legacyBio: "Whitney is a \"Blonde Ambition\" hairstylist who rocks at creating dimensional blondes and romantic updos that leave clients feeling like \"Sweet Child O' Mine.\" A proud mom of two, she knows how to balance \"Livin' on a Prayer\" with her passion for hair. Whether she's teasing out volume or fine-tuning the perfect tone, she believes every style should make you feel like a \"Rockstar.\"", serviceCategory: "hair", isPrimaryBooking: true, instagram: "prettyhairandpositivity", featuredReview: { quote: "Whitney is the best with blondes!! I asked for 'beige' hair, not golden, not ashy. And she nailed it!!!", author: "Andrea Mitchell", source: "Facebook" } },
  { id: "h5", name: "Kathy Charette", department: "hair", role: "stylist", photo: imgKathyCharette, specialty: "Precision Cuts for Difficult Hair", specialties: ["Precision Cuts", "Color"], description: "Precision cutting for thick, fine, and hard-to-cut hair — paired with reliable color.", bestFor: "Difficult hair textures and precision cuts", fitStatement: "Specializes in precision cuts for difficult hair textures.", knownFor: ["Precision cuts", "Thick & fine hair", "Reliable color"], legacyBio: "With experienced hands and a rebel's touch, Kathy makes sure every client feels good in their skin. From head-banging cuts to cool colors, she knows what tunes you crave. You'll \"cry for more, more, more\".", serviceCategory: "hair", isPrimaryBooking: true, featuredReview: { quote: "FINALLY! I have found a great stylist in Arizona! Kathy is AMAZING! She is very skilled and knew exactly how to cut my thick, but fine hair.", author: "Alicia Robinson", source: "Facebook" } },
  { id: "h6", name: "Allison Griessel", department: "hair", role: "stylist", photo: imgAllisonGriessel, specialty: "Vivids, Esthetics & Lashes", specialties: ["Vivids", "Creative Color", "Esthetics", "Facials", "Skincare", "Classic Lashes", "Volume Lashes", "Lash Lifts"], description: "Triple-licensed in vivid color, esthetics, and lash artistry — one of the few artists at Hush who can do all three.", bestFor: "Vivid color + skincare + lashes in one visit", fitStatement: "Vivid Specialist + Lash Slayer — great for multi-service visits.", knownFor: ["Vivids", "Multi-service visits", "Creative color + lashes", "Skincare crossover"], legacyBio: "Dreaming of \"purple rain\" or \"cherry bomb\" reds? Let Allison \"rock you down the electric avenue\" of full-spectrum colors. She's ready to make your color vision a reality. Get ready to kiss boring hair goodbye and walk out like a living, breathing encore!", serviceCategory: "hair", serviceCategories: ["hair", "skincare", "lashes"], directPhone: "(520) 250-6606", isPrimaryBooking: true, instagram: "allieglam", featuredReview: { quote: "Allison G is magical. I've gotten nonstop compliments on my hair since seeing her.", author: "Megan Petersen", source: "Google Review" } },
  { id: "h7", name: "Melissa Brunty", department: "hair", role: "stylist", photo: imgMelissaBrunty, specialty: "Extensions & Long Hair", specialties: ["Extensions", "Long Hair"], description: "Seamless extensions and long hair transformations.", bestFor: "Length, volume, and extensions", fitStatement: "A great fit for guests wanting length, volume, or seamless extensions.", knownFor: ["Seamless extensions", "Long hair transformations", "Volume adds"], legacyBio: "\"She's got a ticket to ride\" when it comes to long hair, chemical romances, and making your dream look a reality. With a sharp eye and a listening ear, she ensures every client gets exactly what they want because \"nothing else matters\" but you. If you're craving sleek lengths, bombshell blonds or total reinvention, she's ready to \"pour some sugar on\" your hair and make it rock!", serviceCategory: "hair", isPrimaryBooking: true },
  { id: "h8", name: "Ana Moreno", department: "hair", role: "stylist", photo: imgAnaMoreno, specialty: "Color, Cuts & Styling", specialties: ["Color", "Cuts", "Styling"], description: "Versatile stylist skilled in color, cuts, and finishing.", bestFor: "Versatile everyday looks", fitStatement: "Great for versatile everyday looks and low-maintenance styling.", knownFor: ["Everyday styling", "Versatile cuts", "Low-maintenance color"], legacyBio: "She's \"breaking the law\" of boring hair with expert color, cutting and styling that turns heads. With a passion for creativity and a respectful touch, she listens to your vision and makes it a reality. Sit in her chair, and get ready to \"rock and roll all night\" with a style that's as bold or classic as you want!", serviceCategory: "hair", isPrimaryBooking: true },
  { id: "h9", name: "Priscilla", department: "hair", role: "stylist", photo: imgPriscilla, specialty: "Color & Cuts", specialties: ["Color", "Cuts"], description: "Reliable artistry in color and precision cutting.", bestFor: "Dependable quality every visit", fitStatement: "Known for dependable quality and precision — visit after visit.", knownFor: ["Consistent quality", "Precision cutting", "Reliable color"], legacyBio: "Priscilla's a \"dancing queen\" with a gentle touch, turning every color and cut into a work of art. With her peaceful nature, she makes you feel like you're the only person in the room, fully seen and heard. Sit back, relax, and let her \"paint your hair like a rockstar\" while you enjoy the calm and creativity she brings.", serviceCategory: "hair", isPrimaryBooking: true },
  { id: "h10", name: "Zaida Delgado", department: "hair", role: "stylist", photo: imgZaidaDelgado, specialty: "Bold Transformations", specialties: ["Transformations", "Bold Color"], description: "Fearless approach to dramatic hair transformations.", bestFor: "Dramatic makeovers", fitStatement: "A strong option for guests ready for a dramatic change.", knownFor: ["Dramatic makeovers", "Bold color shifts", "Total transformations"], legacyBio: "Zaida's a \"wild thing\" who lives for hair, color, and bold transformations. Her creativity and passion make every client feel like the only person in the room. Sit in her chair and get ready to \"let your hair down\" and rock a look that turns heads!", serviceCategory: "hair", isPrimaryBooking: true },
  // Front Desk
  { id: "fd1", name: "Kendell Barraza", department: "front-desk", role: "coordinator", photo: imgKendellBarraza, specialty: "Guest Experience", specialties: ["Guest Services", "Scheduling"], description: "Your first point of contact and concierge guide.", bestFor: "Booking help and questions", fitStatement: "Your first point of contact — she can help with any question.", knownFor: ["Scheduling", "Guest coordination"], legacyBio: "Kendell is the \"heart of rock 'n' roll\" at the front desk, welcoming every guest with a smile. She keeps the salon running smooth by greeting clients, booking appointments, and making sure everything stays on track. Smart, quick, and always on it, she helps the whole place \"rock and roll all night.\"", serviceCategory: null, isPrimaryBooking: false },
  // Esthetics
  { id: "e1", name: "Patty", department: "skincare", role: "esthetician", photo: imgPatty, specialty: "Facials & Skincare", specialties: ["Facials", "Skincare", "Spray Tan"], description: "Results-driven skincare and facial treatments.", bestFor: "Clear skin and custom facials", fitStatement: "A strong option for results-driven facials and skin-focused self-care.", knownFor: ["Custom facials", "Clear skin results", "Spray tans"], legacyBio: "Patty's touch is like \"a stairway to heaven\" — smooth, gentle, and guiding your skin to radiant perfection. With a blend of skilled techniques, she customizes every facial to \"keep on shining\" and bring out your natural beauty. Whether you want to \"rock and roll all night\" or simply relax and rejuvenate, Patty's care hits every note just right.", serviceCategory: "skincare", isPrimaryBooking: true },
  { id: "e2", name: "Lori", department: "skincare", role: "esthetician", photo: imgLori, specialty: "Facials & Skincare", specialties: ["Facials", "Skincare"], description: "Dedicated to healthy, glowing skin.", bestFor: "Gentle, nurturing skin care", fitStatement: "Great for gentle, nurturing skincare and glow treatments.", knownFor: ["Gentle approach", "Nurturing treatments", "Healthy glow"], legacyBio: "Lori's touch is \"like a prayer,\" smooth and soft but packed with power to make your skin \"dance with an angel\" — glowing and flawless every time. She customizes every facial to \"rock you like a hurricane\" while keeping it \"easy like Sunday morning.\" With Lori, your skin won't just shine, it'll \"light up the night\" like a true glam queen.", serviceCategory: "skincare", isPrimaryBooking: true },
  // Nail Technicians
  { id: "n1", name: "Anita Apodaca", department: "nails", role: "nail-tech", photo: imgAnitaApodaca, specialty: "Nail Tech & Educator", specialties: ["Nail Art", "Education", "Extensions"], description: "Nail artistry educator with a passion for nail art.", bestFor: "Creative nail designs", fitStatement: "Guests often choose her for creative designs and nail artistry.", knownFor: ["Creative nail art", "Nail education", "Custom designs"], legacyBio: "With a passion for nail extensions and jaw-dropping nail art, Anita's work will have you feeling like you've got \"the look that kills.\" A seasoned pro and former educator, she's taught countless techs how to \"shine on, you crazy diamond.\" Whether you're after glam, edge, or full-on rockstar nails, Anita brings the stage presence every time.", serviceCategory: "nails", isPrimaryBooking: true },
  { id: "n2", name: "Kelli", department: "nails", role: "nail-tech", photo: imgKellyVishnevetsky, specialty: "Pedicures & Extensions", specialties: ["Pedicures", "Extensions"], description: "Expert in pedicures and nail extensions.", bestFor: "Pedicures and nail extensions", fitStatement: "Specializes in pedicures and extensions — a great fit for full nail care.", knownFor: ["Pedicures", "Nail extensions", "Full nail care"], legacyBio: "Kelli creates pedicures and nail extensions that \"shine like a diamond in the sky\" — bold, beautiful, and built to last. Her style is calm, confident, and free-spirited. She believes every set of nails tells a story, and she's here to make yours \"a whole lotta love.\"", serviceCategory: "nails", isPrimaryBooking: true },
  { id: "n3", name: "Jacky", department: "nails", role: "nail-tech", photo: imgJackie, specialty: "Nail Art & Extensions", specialties: ["Nail Art", "Extensions"], description: "Creative nail art and extension specialist.", bestFor: "Trendy nail art", fitStatement: "A great fit for trendy designs and statement nails.", knownFor: ["Trendy nail art", "Statement designs", "Extensions"], legacyBio: "Jacky's got \"the glam, the glitter, and the gallop\" — turning every nail set into a power ballad for your hands. She works like \"she was born to be wild\" with a brush in one hand and reins in the other. With Jacky, it's all sparkle, style, and \"a whole lotta love.\"", serviceCategory: "nails", isPrimaryBooking: true },
  // Massage
  { id: "m1", name: "Tammi", department: "massage", role: "massage-therapist", photo: null, specialty: "Massage Therapist", specialties: ["Massage", "Relaxation", "Therapeutic"], description: "Therapeutic touch that restores balance and renews spirit.", bestFor: "Deep relaxation and recovery", fitStatement: "Specializes in customized pressure — great for stress relief and recovery.", knownFor: ["Stress relief", "Deep tissue support", "Customized pressure", "Therapeutic recovery"], legacyBio: "Tammi hits all the right notes — from deep tissue to soothing Swedish, she customizes every session like a personal encore. With hands that \"roll like thunder\" and a rhythm all her own, she melts tension and leaves stress in the dust. Whether you need to \"break on through\" tight muscles or just want to \"take it easy,\" Tammi tunes into your body's needs like a true headliner.", serviceCategory: "massage", directPhone: "(520) 370-3018", isPrimaryBooking: true },
  // Lashes — Allison Griessel (h6) covers lashes via serviceCategories; no separate record needed
];

/** Get founders only */
export const getFounders = () => teamMembers.filter(m => m.department === "founders");

/** Get non-founder team members */
export const getTeam = () => teamMembers.filter(m => m.department !== "founders");

/** Get bookable artists (for Luna matching) */
export const getBookableArtists = () => teamMembers.filter(m => m.isPrimaryBooking);

/** Get artists by service category (includes multi-category members) */
export const getArtistsByCategory = (category: ServiceCategoryId) =>
  teamMembers.filter(m =>
    m.isPrimaryBooking &&
    (m.serviceCategory === category || (m.serviceCategories?.includes(category) ?? false))
  );

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
