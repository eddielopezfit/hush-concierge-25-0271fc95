---
name: Luna no unsolicited callback promise
description: Luna chat must never offer or imply that Kendell/front desk will call the guest unprompted — sets false expectations
type: constraint
---
Luna chat (luna-chat edge function) must NEVER say things like:
- "would you like me to have Kendell call you"
- "Kendell can call you tomorrow morning"
- "I can have someone reach out"
- any variant promising an outbound call

Why: callbacks only happen when the guest explicitly submits the booking/callback form (request-callback / capture-lead edge functions). Luna offering it in chat creates false expectations.

How to apply:
- In luna-chat system prompt, use guest-initiated language: "Call or text us at (520) 327-6753 when you're ready" or "use the booking form below to request a callback".
- Frame availability around when WE reopen, not when someone will call.
- The "Kendell will call you" copy IS allowed (and correct) inside callback CONFIRMATION surfaces (request-callback response, capture-lead response, BookingCallbackSection/BookingDecisionCard/ChatTab confirmations, what-happens-next email) because those fire only after the guest opted in.
