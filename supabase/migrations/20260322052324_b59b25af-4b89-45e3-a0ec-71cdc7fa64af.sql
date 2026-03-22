-- Remove every policy currently attached to sessions
drop policy if exists "Allow anonymous inserts on sessions" on sessions;
drop policy if exists "Allow anonymous select on sessions" on sessions;
drop policy if exists "service_role only on sessions" on sessions;
drop policy if exists "Service role full access on sessions" on sessions;
drop policy if exists "anon_insert_sessions" on sessions;
drop policy if exists "anon_select_sessions" on sessions;
drop policy if exists "sessions_insert_anon" on sessions;
drop policy if exists "sessions_select_anon" on sessions;
drop policy if exists "sessions_service_role_all" on sessions;

-- Remove every likely legacy policy on callback_requests
drop policy if exists "Allow anonymous inserts on callback_requests" on callback_requests;
drop policy if exists "Allow authenticated select on callback_requests" on callback_requests;
drop policy if exists "Allow authenticated update on callback_requests" on callback_requests;
drop policy if exists "service_role only on callback_requests" on callback_requests;
drop policy if exists "Service role full access on callback_requests" on callback_requests;
drop policy if exists "anon_insert_callback_requests" on callback_requests;
drop policy if exists "callback_requests_insert_anon" on callback_requests;
drop policy if exists "callback_requests_authenticated_select" on callback_requests;
drop policy if exists "callback_requests_authenticated_update" on callback_requests;
drop policy if exists "authenticated users can view callback_requests" on callback_requests;
drop policy if exists "authenticated users can update callback_requests" on callback_requests;
drop policy if exists "callback_requests_service_role_all" on callback_requests;

-- Recreate strict service-role-only access
create policy "sessions_service_role_all"
on sessions
for all
to service_role
using (true)
with check (true);

create policy "callback_requests_service_role_all"
on callback_requests
for all
to service_role
using (true)
with check (true);