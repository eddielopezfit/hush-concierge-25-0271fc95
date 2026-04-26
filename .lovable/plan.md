# Plan: Fix founder-presentation UX audit blockers

## Goal
Turn the audit into concrete fixes that protect the first impression, keep guests on-site, make Luna more operationally accurate, and clean up the presentation-risk items before showing the founders.

## Priority fixes

1. **Replace the cold-load black screen with a branded instant shell**
   - Add a static, no-JavaScript loading experience directly in `index.html` so first-time guests immediately see Hush branding instead of a blank black screen.
   - Include a small gold “H”/Luna-style mark, “Hush Salon & Day Spa”, and a short line such as “Preparing your Hush experience…” using inline CSS only.
   - Hide/remove the shell as soon as React mounts from `src/main.tsx`.
   - Add a document-level fallback that still looks polished if JS takes several seconds.

2. **Improve perceived first paint beyond the shell**
   - Keep the Hero’s above-the-fold copy lightweight and visible quickly.
   - Reduce early media contention: avoid forcing both desktop and mobile hero videos to load/play at the same time; only the matching viewport video should aggressively load.
   - Keep the Hero video requirement intact: autoplay, muted, loop, playsInline.
   - Keep the “Step Inside” section video as an actual `<video>` element, but prevent it from competing with first paint where possible.

3. **Keep Google/third-party links from taking guests away**
   - Re-audit all Google Maps/reviews/social/external links and ensure every external destination uses `target="_blank" rel="noopener noreferrer"`.
   - The code already shows the main TrustBar and Testimonials Google links have this, so I’ll verify the issue is not coming from another link path or stale deployed code.

4. **Fix Luna closed-day callback language**
   - Add a current-day/time context to the Luna chat system prompt.
   - Add an explicit scheduling rule: if the user asks for tomorrow and tomorrow is Sunday or Monday, Luna must say Hush is closed and offer the next open business day.
   - Preferred wording: “We’re closed Monday — the earliest callback is Tuesday morning when Kendell is back at 9 AM.”
   - Preserve the existing neutrality policy: Luna still does not make artist booking decisions.

5. **Clarify closed-day expectations in the Hero and callback form**
   - When Hush is closed, supplement the “Closed Today” badge with a small expectation-setting line, e.g. “We open Tuesday at 9 AM — your request will be ready for Kendell when the salon reopens.”
   - In the callback form, strengthen the response-time microcopy so Sunday/Monday submissions do not imply same-day or Monday callbacks.

6. **Strengthen the Privacy Policy modal for phone collection**
   - Replace the current one-paragraph policy with a more complete, presentation-ready modal:
     - Effective date
     - What information is collected
     - How Hush uses phone/email submissions
     - TCPA/contact consent language
     - Cookies/basic analytics disclosure
     - Data retention overview
     - Third-party/service-provider statement
     - How to contact Hush for privacy questions
   - Keep it readable and guest-friendly; not legalese-heavy.

7. **Fix nail artist card image reliability**
   - Remove lazy-loading from artist card images that are shown/filtered interactively, or switch to eager/async decoding for the visible team cards.
   - Add a graceful image fallback so a failed photo never renders as an empty dark card.
   - Keep real artist photos only; no AI/stock placeholders.

8. **Clarify Artist filter behavior**
   - The current code is single-select, but the audit observed apparent multi-select/confusing state. Add a visible result count and active-filter label like “Showing 3 nail specialists” or “Showing all Rockstars.”
   - Optionally reset `showAll` when a filter changes so the grid state feels deterministic.
   - Avoid introducing true multi-select unless explicitly desired.

9. **Founder photo risk item**
   - The code currently uses `Founders_Hush.jpg` with alt text naming all three founders. I’ll inspect available assets and only swap if there is already a genuine all-three-founders photo available, likely `founders-champagne.jpg`.
   - If no clear all-three image exists, I will not substitute a misleading image; instead I’ll adjust the caption/alt text to match the actual photo until a correct founder photo is provided.

## Validation

After implementation, I will run:
- TypeScript/build check.
- Browser performance profile to confirm first visible content is no longer a blank black screen.
- Network/resource check to confirm only the relevant hero video is prioritized on load.
- Desktop and mobile visual spot-checks for Hero, Step Inside, Artists/Nails filter, TrustBar/Testimonials links, Privacy modal, and callback microcopy.
- A Luna closed-day prompt test where “tomorrow” falls on a closed day, if the environment allows backend function testing.

## Notes
- The ideal architectural solution would be SSR/SSG, but this Vite SPA cannot be converted to another framework in this project. The zero-JS branded shell plus media-load tuning is the right fast fix for the founder presentation and guest perception.
- No database schema changes are expected.