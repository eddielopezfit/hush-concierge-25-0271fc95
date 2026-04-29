## Why simplify the hero

The hero currently shows **four** competing actions stacked vertically:

```text
[ FIND YOUR EXPERIENCE ]   ← primary gold button (the real conversion path)
[ Try Your New Look    ]   ← novelty/discovery feature
  or talk to our AI concierge   ← redundant with floating Luna + nav "Start Luna"
  Resume my plan              ← shown to everyone, even first-time visitors with no plan
```

This breaks our **single-decision principle** for the hero. Each extra option:
- Dilutes "Find Your Experience" (the conversion north star)
- Pushes the Open Today badge further down on mobile
- Creates choice paralysis in the first 5 seconds

"Try Your New Look" especially doesn't belong here — it's a **mid-funnel discovery moment** ("I'm curious what I'd look like with…"), not a top-of-funnel intent signal. A guest who hasn't even decided on a service shouldn't be invited to virtually try one on yet.

## Proposed hero (final state)

```text
[ FIND YOUR EXPERIENCE ]      ← single primary CTA
or talk to our AI concierge    ← kept as one quiet secondary text link
Resume my plan                  ← ONLY shown if a saved plan exists
[ Open Today · 9 AM – 7 PM ]
```

Three reasons to keep "talk to our AI concierge" (and drop the others):
1. It's the **alternative path** for guests who don't know what they want — complements the quiz
2. The floating bottom-right Luna button is easy to miss on first paint
3. The "Start Luna" nav button is small and lives among nav items — not a clear hero alternative

## Where "Try Your New Look" goes instead

It already lives in two strong contextual spots:
- **ServicesSection** — guests browsing services see it inline ✓
- **FooterSection** — final-scroll catch-all ✓

I'll add **one more high-intent placement**:
- **ExperienceCategoriesSection** — right when a guest is picking a hair/color category, "Try Your New Look" becomes a natural companion CTA ("Not sure? See it on you first"). This is where curiosity peaks.

If the existing two placements feel sufficient after testing, we can skip the third — but adding it where intent is highest is the right move.

## Conditional "Resume my plan"

Wrap the Resume link in a check:

```tsx
const [hasPlan, setHasPlan] = useState(false);
useEffect(() => { setHasPlan(!!getConciergeContext()); }, []);
// ...render Resume link only when hasPlan
```

First-time visitors get a cleaner 2-CTA hero. Returning visitors with a saved plan still get the fast-path link.

## Files changed

1. **`src/components/HeroSection.tsx`**
   - Remove `<TryOnEntryButton>` from hero CTA stack (and unused import)
   - Gate "Resume my plan" behind `getConciergeContext()` check
   - Result: 1 primary button + 1-2 secondary text links (vs 4 stacked CTAs)

2. **`src/components/ExperienceCategoriesSection.tsx`** *(if it makes sense after viewing — confirming during implementation)*
   - Add a single `<TryOnEntryButton variant="ghost" source="ExperienceCategories" />` at the section footer with copy like "Curious how it would look? Try it on first."

## Out of scope (leaving alone)

- Floating bottom-right Luna guide button (different surface, doesn't compete with hero stack)
- "Start Luna" nav button (small, lives in nav, not a hero CTA)
- TryOn placements in ServicesSection and FooterSection (already optimal)
