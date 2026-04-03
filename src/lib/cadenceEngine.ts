import { ServiceCategoryId } from "@/types/concierge";
import { addWeeks, format } from "date-fns";

export interface CadenceRecommendation {
  category: ServiceCategoryId;
  label: string;
  intervalWeeks: [number, number];
  nextDateRange: string;
}

const cadenceMap: Record<ServiceCategoryId, { label: string; weeks: [number, number] }> = {
  hair:     { label: "Hair",     weeks: [6, 8] },
  lashes:   { label: "Lashes",   weeks: [2, 3] },
  nails:    { label: "Nails",    weeks: [2, 4] },
  skincare: { label: "Skincare", weeks: [4, 6] },
  massage:  { label: "Massage",  weeks: [2, 4] },
};

export function getCadenceRecommendations(categories: ServiceCategoryId[]): CadenceRecommendation[] {
  const now = new Date();
  return categories.map(cat => {
    const info = cadenceMap[cat];
    const [lo, hi] = info.weeks;
    const from = format(addWeeks(now, lo), "MMM d");
    const to = format(addWeeks(now, hi), "MMM d");
    return {
      category: cat,
      label: info.label,
      intervalWeeks: info.weeks,
      nextDateRange: `${from} – ${to}`,
    };
  });
}
