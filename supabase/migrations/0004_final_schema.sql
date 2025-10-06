-- Final Schema - Complete setup for Worst UI Challenge

begin;

-- Drop existing objects in reverse order to ensure clean slate
drop function if exists public.get_latest_submissions(integer);
drop function if exists public.get_top_submissions(integer);
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();
drop view if exists public.user_profiles;
drop view if exists public.submission_vote_stats;
drop table if exists public.votes;
drop table if exists public.profiles;
drop table if exists public.submissions;

-- 1. Create submissions table
create table public.submissions (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(title) between 3 and 120),
  codepen_username text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Create public profiles table
create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  display_name text not null default 'Anonymous',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Add foreign key relationship between submissions and profiles
alter table public.submissions 
add constraint fk_submissions_profiles 
foreign key (user_id) references public.profiles(id) on delete cascade;

-- 3. Create votes table
create table public.votes (
  id uuid primary key default gen_random_uuid(),
  submission_id text not null references public.submissions(id) on delete cascade,
  voter_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (submission_id, voter_id)
);

-- 4. Create function and trigger to populate profiles table
create or replace function public.handle_new_user()
returns trigger as $$
declare
  display_name text;
begin
  -- Extract display name from Microsoft OAuth metadata
  display_name := coalesce(
    new.raw_user_meta_data->>'full_name',
    'Anonymous'
  );
  
  -- Clean up the display name (remove extra spaces, handle null concatenation)
  display_name := trim(regexp_replace(display_name, '\s+', ' ', 'g'));
  if display_name = '' or display_name is null then
    display_name := 'Anonymous';
  end if;
  
  insert into public.profiles (id, display_name)
  values (new.id, display_name);
  
  return new;
exception
  when others then
    -- If profile creation fails, still allow user creation but with default name
    insert into public.profiles (id, display_name)
    values (new.id, 'Anonymous');
    return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 5. Create aggregate view for vote stats
create or replace view public.submission_vote_stats as
select
  s.id as submission_id,
  count(v.id)::bigint as total_votes
from public.submissions s
left join public.votes v on v.submission_id = s.id
group by s.id;

-- 6. RLS Policies
alter table public.submissions enable row level security;
alter table public.votes enable row level security;
alter table public.profiles enable row level security;

-- Policies for submissions
create policy "Public submissions are viewable by everyone." on public.submissions for select using (true);
create policy "Users can insert their own submission." on public.submissions for insert with check (auth.uid() = user_id);
create policy "Users can update their own submission." on public.submissions for update using (auth.uid() = user_id);
create policy "Users can delete their own submission." on public.submissions for delete using (auth.uid() = user_id);

-- Policies for votes
create policy "Users can view their own votes." on public.votes for select using (auth.uid() = voter_id);
create policy "Users can insert their own vote." on public.votes for insert with check (auth.uid() = voter_id);
create policy "Users can delete their own vote." on public.votes for delete using (auth.uid() = voter_id);

-- Policies for profiles
create policy "Profiles are viewable by everyone." on public.profiles for select using (true);
create policy "Users can insert their own profile." on public.profiles for insert with check (auth.uid() = id);
create policy "Users can update their own profile." on public.profiles for update using (auth.uid() = id);

-- 7. Database Functions (RPCs)

-- get_top_submissions
create or replace function public.get_top_submissions(limit_count int default 10)
returns table (
  id text,
  user_id uuid,
  title text,
  created_at timestamptz,
  codepen_username text,
  total_votes bigint,
  author_name text
) language sql stable as $$
  select
    s.id,
    s.user_id,
    s.title,
    s.created_at,
    s.codepen_username,
    coalesce(svs.total_votes, 0),
    coalesce(p.display_name, 'Anonymous')
  from public.submissions s
  left join public.submission_vote_stats svs on svs.submission_id = s.id
  left join public.profiles p on s.user_id = p.id
  order by coalesce(svs.total_votes, 0) desc, s.created_at desc
  limit limit_count;
$$;

-- get_latest_submissions
create or replace function public.get_latest_submissions(limit_count int default 10)
returns table (
  id text,
  user_id uuid,
  title text,
  created_at timestamptz,
  codepen_username text,
  total_votes bigint,
  author_name text
) language sql stable as $$
  select
    s.id,
    s.user_id,
    s.title,
    s.created_at,
    s.codepen_username,
    coalesce(svs.total_votes, 0),
    coalesce(p.display_name, 'Anonymous')
  from public.submissions s
  left join public.submission_vote_stats svs on svs.submission_id = s.id
  left join public.profiles p on s.user_id = p.id
  order by s.created_at desc
  limit limit_count;
$$;

-- 8. Grant Permissions
grant select on public.profiles to anon, authenticated;
grant select on public.submission_vote_stats to anon, authenticated;
grant insert, update on public.profiles to authenticated;
grant execute on function public.get_top_submissions(int) to anon, authenticated;
grant execute on function public.get_latest_submissions(int) to anon, authenticated;

-- 9. Create indexes for performance
create index if not exists idx_submissions_user_id on public.submissions(user_id);
create index if not exists idx_submissions_created_at on public.submissions(created_at);
create index if not exists idx_votes_submission_id on public.votes(submission_id);
create index if not exists idx_votes_voter_id on public.votes(voter_id);
create index if not exists idx_profiles_id on public.profiles(id);

commit;