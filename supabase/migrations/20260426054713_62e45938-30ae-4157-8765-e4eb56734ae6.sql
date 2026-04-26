ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS slack_message_ts text;
ALTER TABLE public.callback_requests ADD COLUMN IF NOT EXISTS slack_message_ts text;