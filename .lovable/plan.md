

# Video Background for Hero Section

## What This Does
Replace the static `hero-salon.jpg` background image with the uploaded Fashion Friday video, creating an immersive, luxury video backdrop behind the "Welcome to Hush" hero content.

## Strategic Placement

The hero section is the **only correct placement**. Here's why:

- **Hero is full-bleed, full-viewport** — the video fills the entire screen naturally
- **The existing dark overlay** (`.video-overlay`) already handles text readability over dynamic backgrounds
- **First impression impact** — visitors immediately see real stylists, real work, real energy
- **Brand proof** — Fashion Friday content shows the culture, not just the building
- The video loops silently behind the text, CTAs, and scroll indicator — all existing elements stay exactly where they are

## Technical Plan

### 1. Copy the video to `public/videos/`
The video must go in `public/` (not `src/assets/`) because:
- Video files are large and should NOT be bundled by Vite
- `public/` serves them as static files with no processing overhead
- Referenced via `/videos/fashion-friday-hero.mp4`

### 2. Update `HeroSection.tsx`
Replace the `<img>` tag with a `<video>` element:

```tsx
<video
  autoPlay
  muted
  loop
  playsInline
  poster={heroImage}          // keep the JPG as poster/fallback
  className="w-full h-full object-cover"
>
  <source src="/videos/fashion-friday-hero.mp4" type="video/mp4" />
</video>
```

Key attributes:
- **`autoPlay` + `muted`** — required for browsers to allow autoplay (Chrome blocks autoplay with audio)
- **`loop`** — seamless repeat
- **`playsInline`** — prevents iOS from hijacking into fullscreen
- **`poster={heroImage}`** — shows the current salon image while video loads (no blank flash)
- The existing `.video-overlay` gradient stays on top — ensures text remains readable

### 3. No other changes needed
- All CTAs, animations, scroll indicator, and overlay remain untouched
- Mobile: video plays inline and performs well; `object-cover` handles aspect ratio across all viewports
- The dark gradient overlay ensures the gold text and CTAs stay legible regardless of video content

## Files Changed
| File | Change |
|------|--------|
| `public/videos/fashion-friday-hero.mp4` | New — copied from upload |
| `src/components/HeroSection.tsx` | `<img>` → `<video>` with poster fallback |

## Performance Note
The video file size matters. If the uploaded clip is large (>10MB), we should consider compressing it for web delivery. The poster image ensures instant visual content while the video streams in.

