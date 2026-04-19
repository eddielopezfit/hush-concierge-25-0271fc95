
Build a daily Slack digest. Plan:

**1. New edge function: `daily-digest`**
- Queries yesterday's `callback_requests` + `leads` (00:00–23:59 local — use UTC for simplicity, can adjust).
- Aggregates by category (hair/nails/lashes/skin/massage/other), counts by priority (P1 = callbacks, P2/P3 = regular leads), and conversion status (`callback_requests.status`: new/contacted/converted/etc.).
- Posts a formatted summary to `SLACK_WEBHOOK_URL` (the `#hush-leads` fallback channel — most visible to whole team).
- Returns JSON summary so it's also testable via curl.

**2. Schedule it**
- Use `pg_cron` + `pg_net` to invoke daily at 8:00 AM Arizona time (15:00 UTC, no DST in AZ).
- Cron expression: `0 15 * * *`
- Insert via `supabase--insert` (not migration) since it contains the project URL + anon key.

**3. Slack message format**
```
📊 *Hush Daily Digest — Mon Apr 18*
_Yesterday's lead activity_

*Total:* 12 leads · 4 callbacks · 2 converted

*By Category*
• Hair — 5 (1 callback)
• Nails — 3 (2 callbacks)
• Lashes — 2
• Skin — 1 (1 callback)
• Massage — 1

*Status*
🆕 New: 8 · 📞 Contacted: 2 · ✅ Converted: 2

🔗 Full details in #hush-callbacks + dept channels
```

**4. No mentions** — digest is informational, not actionable, so no @ping.

After build → deploy + run a one-off curl to confirm format, then schedule.
