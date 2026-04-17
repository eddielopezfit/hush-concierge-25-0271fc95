export type ServiceCategoryId = "hair" | "nails" | "lashes" | "skincare" | "massage";

// Category-specific intent subtypes
export type HairIntentType    = "cut" | "color" | "both" | "unsure";
export type NailIntentType    = "manicure" | "pedicure" | "full_set" | "nail_art" | "unsure";
export type LashIntentType    = "full_set" | "fill" | "lift" | "unsure";
export type MassageIntentType = "relaxation" | "deep_tissue" | "pain_relief" | "unsure";
export type SkincareIntentType = "facial" | "acne" | "glow" | "unsure";

export type ServiceSubtype =
  | HairIntentType
  | NailIntentType
  | LashIntentType
  | MassageIntentType
  | SkincareIntentType;

export type MultiServiceMode = "primary_focus" | "bundle_guidance" | "unsure" | null;

export interface ConciergeContext {
  // Core flow
  source:     string;
  categories: ServiceCategoryId[];
  goal:       string | null;
  timing:     string | null;

  // Step 4 — category-specific qualifier (NEW)
  service_subtype?: ServiceSubtype | null;

  // Multi-service handling
  primary_category?: ServiceCategoryId | null;
  multi_service_mode?: MultiServiceMode;

  // Enrichment flags
  is_multi_service?:    boolean;
  is_new_client?:       boolean | null;
  budget_sensitivity?:  "flexible" | "moderate" | "value" | null;

  // Artist preference
  preferredArtist?:   string | null;
  preferredArtistId?: string | null;

  // Service-menu deep-link context
  category?: ServiceCategoryId | null;
  group?:    string | null;
  item?:     string | null;
  price?:    string | null;

  // Quiz freshness — set when user completes Find My Look this session
  quizCompletedAt?: number | null;
}
