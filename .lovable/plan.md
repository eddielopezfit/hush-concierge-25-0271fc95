

# Use Both Uploaded Photos

## Changes

### 1. Hair service card — swap to real blonde photo
- **File:** `src/components/ServicesSection.tsx`
- Copy `user-uploads://image-25.png` → `src/assets/hair-hero.jpg` (replaces the current AI-generated image)
- The existing import `import hairHero from "@/assets/hair-hero.jpg"` already handles it — no code change needed beyond the file swap

### 2. Salon interior — use in About section
- **File:** `src/components/AboutSection.tsx`
- Copy `user-uploads://image-26.png` → `src/assets/salon-interior.jpg`
- Import and add as a visual element in the About/Hush Story section (e.g., alongside the founder narrative or as a secondary image showing the space)
- Display as a rounded image with subtle overlay, complementing the existing founders photo

### No backend or database changes.

