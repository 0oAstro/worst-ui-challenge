-- Migrate submissions.id from uuid to text (CodePen pen hash)
-- and update dependent objects

begin;

-- 1) Drop dependent view and constraints that reference type
drop view if exists public.submission_vote_stats;

-- 2) Alter votes.submission_id to text temporarily by dropping FK
alter table public.votes drop constraint if exists votes_submission_id_fkey;

-- 3) Alter submissions.id to text
alter table public.submissions
  alter column id drop default,
  alter column id type text using id::text;

-- Ensure primary key remains
alter table public.submissions drop constraint if exists submissions_pkey;
alter table public.submissions add primary key (id);

-- 4) Recreate view with text submission_id
create or replace view public.submission_vote_stats as
select
  s.id as submission_id,
  count(v.id)::bigint as total_votes
from public.submissions s
left join public.votes v on v.submission_id = s.id
group by s.id;

-- 5) Alter votes.submission_id to text and restore FK
alter table public.votes
  alter column submission_id type text using submission_id::text;

alter table public.votes
  add constraint votes_submission_id_fkey
  foreign key (submission_id) references public.submissions(id) on delete cascade;

-- 6) Update RPC to use text id
create or replace function public.get_top_submissions(limit_count int default 10)
returns table (
  id text,
  user_id uuid,
  title text,
  codepen_url text,
  created_at timestamptz,
  total_votes bigint
) language sql stable as $$
  select s.id, s.user_id, s.title, s.codepen_url, s.created_at, coalesce(svs.total_votes, 0)
  from public.submissions s
  left join public.submission_vote_stats svs on svs.submission_id = s.id
  order by coalesce(svs.total_votes, 0) desc, s.created_at desc
  limit limit_count
$$;

-- Re-grant execute
revoke all on function public.get_top_submissions(int) from public;
grant execute on function public.get_top_submissions(int) to anon, authenticated;

commit;


