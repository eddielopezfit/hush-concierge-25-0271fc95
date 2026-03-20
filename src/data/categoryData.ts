import { Scissors, Hand, Sparkles, Eye, Heart } from "lucide-react";
import { ServiceCategoryId } from "@/types/concierge";

export interface CategoryOption {
  id: ServiceCategoryId;
  label: string;
  icon: typeof Scissors;
}

export const serviceCategories: CategoryOption[] = [
  { id: "hair", label: "Hair", icon: Scissors },
  { id: "nails", label: "Nails", icon: Hand },
  { id: "skincare", label: "Skincare", icon: Sparkles },
  { id: "lashes", label: "Lashes", icon: Eye },
  { id: "massage", label: "Massage", icon: Heart },
];

export interface GoalOption {
  id: string;
  label: string;
}

export const goalOptions: GoalOption[] = [
  { id: "refresh", label: "Refresh" },
  { id: "relax", label: "Relax" },
  { id: "transform", label: "Transform" },
  { id: "event", label: "Event-ready" },
];

export interface TimingOption {
  id: string;
  label: string;
}

export const timingOptions: TimingOption[] = [
  { id: "today", label: "Today" },
  { id: "week", label: "This week" },
  { id: "planning", label: "Planning ahead" },
  { id: "browsing", label: "Just browsing" },
];

/** Callback form service options (includes UI-only extensions) */
export const callbackServiceOptions = [
  { value: "hair", label: "Hair" },
  { value: "nails", label: "Nails" },
  { value: "skincare", label: "Skincare" },
  { value: "lashes", label: "Lashes" },
  { value: "massage", label: "Massage" },
  { value: "multiple", label: "Multiple Services" },
];

/** Callback form timing options */
export const callbackTimingOptions = [
  { value: "today", label: "Today" },
  { value: "week", label: "This week" },
  { value: "planning", label: "Planning ahead" },
];
