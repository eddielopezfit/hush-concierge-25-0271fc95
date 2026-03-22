

# Audit Response — Implementation Plan

This plan addresses the 10 high-impact fixes from the audit, organized by what can be changed in code (chat brain, edge functions, frontend) vs. what requires ElevenLabs dashboard changes (voice-only items documented as action items).

---

## What We Can Fix in Code (This Pass)

### 1. Fix Founder Privacy Bug in Shared Brain
**File:** `supabase/functions/_shared/luna-brain.ts`

Add explicit exception to the STAFF SAFETY section (after line 72):

```
EXCEPTION — Public figures: The three founders (Sheri Turner, Danielle Colucci, Kathy Crawford) are publicly named on the H