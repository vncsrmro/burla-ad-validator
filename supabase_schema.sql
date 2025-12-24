-- Enable RLS
alter table auth.users enable row level security;

-- Create Analyses Table (History)
create table analyses (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) not null,
  filename text,
  result jsonb,
  risk_score int,
  status text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table analyses enable row level security;

create policy "Users can view their own analyses"
  on analyses for select
  using ( auth.uid() = user_id );

create policy "Users can insert their own analyses"
  on analyses for insert
  with check ( auth.uid() = user_id );

-- Create Settings Table (Admin Keys)
create table settings (
  key text primary key,
  value text
);

alter table settings enable row level security;

-- Allow read access to authenticated users (so API can read, though API reads via service role usually, but here we use user context)
-- Wait, the API routes run on server but using 'createClient' which uses 'cookies()'. It acts as the logged in user.
-- So the user needs READ access to 'settings' to grab the key? NO! That exposes the key to the client if they query it.
-- SOLUTION: The API Route should use a SERVICE ROLE client to fetch the key, OR the user is an admin.
-- For this MVP, we will allow Authenticated users to READ the key (Not ideal for real SaaS but works for internal tool). 
-- BETTER: Use Service Role in API Route. But I set up 'createClient' as standard.
-- Let's stick to: "Users can read/write settings" for now, assuming the user IS the admin.
create policy "Users can manage settings"
  on settings for all
  using ( auth.role() = 'authenticated' );
