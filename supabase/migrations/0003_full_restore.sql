-- Full restore: drop app objects and recreate without codepen_url
-- Keeps auth schema/users intact (managed by Supabase)

begin;

-- Drop dependent objects if they exist
drop view if exists public.submission_vote_stats;
drop function if exists public.get_top_submissions(int);

-- Drop tables in dependency order
drop table if exists public.votes;
drop table if exists public.submissions;

-- Recreate tables
create table public.submissions (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(title) between 3 and 120),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_submissions_user_id on public.submissions(user_id);
create index if not exists idx_submissions_created_at on public.submissions(created_at desc);

create table public.votes (
  id uuid primary key default gen_random_uuid(),
  submission_id text not null references public.submissions(id) on delete cascade,
  voter_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (submission_id, voter_id)
);

create index if not exists idx_votes_submission_id on public.votes(submission_id);
create index if not exists idx_votes_voter_id on public.votes(voter_id);

-- Aggregate view
create or replace view public.submission_vote_stats as
select
  s.id as submission_id,
  count(v.id)::bigint as total_votes
from public.submissions s
left join public.votes v on v.submission_id = s.id
group by s.id;

-- RLS
alter table public.submissions enable row level security;
alter table public.votes enable row level security;

-- Submissions policies
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'submissions' and policyname = 'submissions_select_all'
  ) then
    create policy submissions_select_all on public.submissions
      for select to authenticated, anon using (true);
  end if;
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'submissions' and policyname = 'submissions_insert_own'
  ) then
    create policy submissions_insert_own on public.submissions
      for insert to authenticated with check ((select auth.uid()) = user_id);
  end if;
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'submissions' and policyname = 'submissions_update_own'
  ) then
    create policy submissions_update_own on public.submissions
      for update to authenticated using ((select auth.uid()) = user_id);
  end if;
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'submissions' and policyname = 'submissions_delete_own'
  ) then
    create policy submissions_delete_own on public.submissions
      for delete to authenticated using ((select auth.uid()) = user_id);
  end if;
end $$;

-- Votes policies
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'votes' and policyname = 'votes_select_own'
  ) then
    create policy votes_select_own on public.votes
      for select to authenticated using ((select auth.uid()) = voter_id);
  end if;
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'votes' and policyname = 'votes_insert_own'
  ) then
    create policy votes_insert_own on public.votes
      for insert to authenticated with check ((select auth.uid()) = voter_id);
  end if;
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'votes' and policyname = 'votes_delete_own'
  ) then
    create policy votes_delete_own on public.votes
      for delete to authenticated using ((select auth.uid()) = voter_id);
  end if;
end $$;

-- RPC without codepen_url
create or replace function public.get_top_submissions(limit_count int default 10)
returns table (
  id text,
  user_id uuid,
  title text,
  created_at timestamptz,
  total_votes bigint
) language sql stable as $$
  select s.id, s.user_id, s.title, s.created_at, coalesce(svs.total_votes, 0)
  from public.submissions s
  left join public.submission_vote_stats svs on svs.submission_id = s.id
  order by coalesce(svs.total_votes, 0) desc, s.created_at desc
  limit limit_count
$$;

revoke all on function public.get_top_submissions(int) from public;
grant execute on function public.get_top_submissions(int) to anon, authenticated;

commit;


