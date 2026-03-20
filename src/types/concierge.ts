export type ServiceCategoryId = "hair" | "nails" | "lashes" | "skincare" | "massage";

export interface ConciergeContext {
  source: string;
  categories: ServiceCategoryId[];
  goal: string | null;
  timing: string | null;
  category?: ServiceCategoryId | null;
  group?: string | null;
  item?: string | null;
  price?: string | null;
  preferredArtist?: string | null;
  preferredArtistId?: string | null;
}
