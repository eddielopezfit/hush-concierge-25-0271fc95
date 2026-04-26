create table public.sms_send_log (
  id uuid primary key default gen_random_uuid(),
  phone text not null,
  body text not null,
  idempotency_key text not null,
  twilio_sid text,
  status text not null check (status in ('queued','sent','failed','suppressed')),
  error_message text,
  related_table text,
  related_id uuid,
  created_at timestamptz not null default now()
);
create index sms_send_log_idem_idx on public.sms_send_log (idempotency_key, created_at desc);
create index sms_send_log_phone_idx on public.sms_send_log (phone, created_at desc);
alter table public.sms_send_log enable row level security;

create policy "sms_send_log_service_role_all"
on public.sms_send_log
for all
to service_role
using (true)
with check (true);