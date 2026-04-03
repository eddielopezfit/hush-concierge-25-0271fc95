/** Goal-based emotional opening lines for the Personalized Plan */
const emotionalLines: Record<string, string> = {
  transform:
    "This is your moment to create something completely new — a look that turns heads and feels like you.",
  relax:
    "You deserve a moment of complete calm — this experience is designed to reset your body and mind.",
  refresh:
    "A refined reset to keep you looking and feeling your best.",
  event:
    "Get ready to show up at your best — polished, confident, and unforgettable.",
};

export function getEmotionalLine(goal: string | null | undefined): string | null {
  if (!goal) return emotionalLines.refresh;
  return emotionalLines[goal] || emotionalLines.refresh;
}
