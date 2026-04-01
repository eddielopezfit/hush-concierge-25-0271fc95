
# Interior Vibe Video — About Section Background

## Strategic Decision

This interior walkthrough video belongs in the **About / "The Hush Story" section**. Here's why:

- **Hero already has a video** (Fashion Friday) — two video backgrounds compete and hurt performance
- **The About section is currently static** with just a founders photo and text — it's the weakest visual section on the page
- **This video IS the Hush story** — warm tones, the actual space, the energy. It literally illustrates what the copy describes
- **Conversion psychology**: by the time visitors reach "The Hush Story," they need an emotional anchor. This video delivers it

## Implementation

### 1. Save video to `public/videos/hush-interior.mp4`

### 2. Update `AboutSection.tsx`
- Add a **contained video background** behind the entire section (not full-bleed like hero — contained within the `max-w-5xl` wrapper)
- Video plays muted, autoplay, loop — same pattern as hero
- Dark overlay gradient ensures the text + founders photo remain fully readable
- `object-cover` with `object-center` since this is interior/environment footage (no face-framing needed)
- The video sits as an atmospheric backdrop, not a competing visual — think "living wallpaper" behind the existing content

### 3. Responsive handling
- On mobile: video hidden, replaced with a single poster frame (saves bandwidth, avoids performance issues with two autoplay videos)
- On tablet+: video plays as ambient background
- This keeps the page at exactly one autoplay video on mobile (hero) and two on desktop (hero + about)

## Files Changed
| File | Change |
|------|--------|
| `public/videos/hush-interior.mp4` | New asset — copied from upload |
| `src/components/AboutSection.tsx` | Add contained video background with overlay, hidden on mobile |
