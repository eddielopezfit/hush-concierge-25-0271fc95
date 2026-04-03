

# Fix "Full Profile" Button + Inject Legacy Bios

## Two Problems

1. **"Full Profile" button in Luna's Artists tab is broken** — it scrolls to the `#artists` section on the page instead of opening the artist's profile modal. Since the Luna panel is an overlay, scrolling the page behind it is useless.

2. **The profile modal is thin on content** — it shows a short `description` field (1 sentence) and some tags. The legacy site has rich, personality-filled bios for every team member that would make the modal feel complete and premium.

## Fix Plan

### File 1: `src/data/teamData.ts` — Add `legacyBio` field to each team member

Add a new optional `legacyBio: string` field to the `TeamMember` interface and populate it from the legacy site's who-we-are page for every team member. These are the fun, rock-themed bios that give each artist personality. Examples:

- **Charly Camano**: *"This 'wild thing will make your hair sing'. A fashionista soul who cranks up the volume..."*
- **Michelle Yrigolla**: *"She's a 'master of puppets' when it comes to color, cutting, and extensions..."*
- **Tammi**: *"Tammi hits all the right notes — from deep tissue to soothing Swedish..."*
- All 20+ team members get their legacy bio injected

The `description` field stays as-is (used for short cards). The `legacyBio` is used only in the full profile modal.

### File 2: `src/components/ArtistsSection.tsx` — Show `legacyBio` in the profile modal

In the artist profile modal (line ~407), replace or supplement the short `description` paragraph with the richer `legacyBio` when available. Display it in a styled paragraph below the existing description, with slightly different formatting to feel like a personal story.

### File 3: `src/components/luna/ArtistsTab.tsx` — Fix "Full Profile" button

The current "Full Profile" button (lines 92-100) does `document.getElementById("artists").scrollIntoView()` which is useless from inside the Luna panel.

**Two options:**

**Option A (recommended):** Add a `selectedArtist` state to `ArtistsTab` and render a mini profile modal inline within the Luna panel — reusing the same data (photo, legacyBio, knownFor, specialties, book CTA). This keeps the user inside Luna's panel.

**Option B:** Close the Luna panel, scroll to the artists section, and trigger the profile modal on the main page. This is more complex and breaks the user's flow.

Going with **Option A**: Add an inline artist detail view within the ArtistsTab that replaces the list when an artist is tapped. Shows the full profile with back button, photo, legacy bio, known-for tags, specialties, and Book CTA. The "Full Profile" button triggers this view.

### No database, backend, or edge function changes.

