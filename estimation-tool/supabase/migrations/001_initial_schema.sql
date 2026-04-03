-- ─────────────────────────────────────────────────────────────────────────────
-- 001_initial_schema.sql
-- Architectural Monolith — initial database schema
--
-- HOW TO RUN:
--   1. Go to your Supabase project → SQL Editor
--   2. Paste the entire contents of this file and click Run
--   3. Confirm all tables appear in the Table Editor
-- ─────────────────────────────────────────────────────────────────────────────

-- ── Extensions ────────────────────────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ── Enums ─────────────────────────────────────────────────────────────────────
create type resource_type     as enum ('consultant', 'full_time');
create type location_tier     as enum ('onshore', 'offshore', 'nearshore');
create type estimation_status as enum ('draft', 'under_review', 'approved', 'committed');
create type audit_event_kind  as enum (
  'estimation_created', 'estimation_updated',
  'workstream_added',   'workstream_updated',
  'resource_added',     'resource_removed',
  'geo_mix_changed',
  'scenario_created',
  'approval_requested', 'approval_granted',
  'comment_added',      'snapshot_committed'
);
create type user_role as enum ('architect', 'cio', 'viewer');

-- ── User Profiles ─────────────────────────────────────────────────────────────
-- Extends Supabase Auth's auth.users with app-level metadata.
create table public.profiles (
  id          uuid        primary key references auth.users(id) on delete cascade,
  full_name   text        not null default '',
  role        user_role   not null default 'viewer',
  avatar_url  text,
  created_at  timestamptz not null default now()
);
alter table public.profiles enable row level security;
create policy "Users can read their own profile"
  on public.profiles for select using (auth.uid() = id);
create policy "Users can update their own profile"
  on public.profiles for update using (auth.uid() = id);

-- ── Projects ──────────────────────────────────────────────────────────────────
create table public.projects (
  id          uuid        primary key default uuid_generate_v4(),
  name        text        not null,
  description text,
  owner_id    uuid        not null references public.profiles(id),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
alter table public.projects enable row level security;
create policy "Project members can read projects"
  on public.projects for select using (auth.uid() = owner_id);
create policy "Owners can insert projects"
  on public.projects for insert with check (auth.uid() = owner_id);
create policy "Owners can update projects"
  on public.projects for update using (auth.uid() = owner_id);

-- ── Rate Cards ────────────────────────────────────────────────────────────────
create table public.rate_cards (
  id             uuid          primary key default uuid_generate_v4(),
  project_id     uuid          not null references public.projects(id) on delete cascade,
  role_title     text          not null,
  resource_type  resource_type not null,
  location_tier  location_tier not null,
  hourly_rate    numeric(10,2) not null check (hourly_rate >= 0),
  effective_from date          not null,
  effective_to   date,
  vendor_name    text,
  created_at     timestamptz   not null default now(),
  constraint no_overlapping_rate_period check (effective_to is null or effective_to > effective_from)
);
alter table public.rate_cards enable row level security;
create policy "Project members can read rate cards"
  on public.rate_cards for select
  using (project_id in (select id from public.projects where owner_id = auth.uid()));

-- ── Estimations ───────────────────────────────────────────────────────────────
create table public.estimations (
  id              uuid               primary key default uuid_generate_v4(),
  project_id      uuid               not null references public.projects(id) on delete cascade,
  version_label   text               not null,
  status          estimation_status  not null default 'draft',
  duration_weeks  integer            not null check (duration_weeks > 0),
  start_date      date               not null,
  baseline_cost   numeric(14,2),
  created_by      uuid               not null references public.profiles(id),
  created_at      timestamptz        not null default now(),
  updated_at      timestamptz        not null default now()
);
alter table public.estimations enable row level security;
create policy "Project members can read estimations"
  on public.estimations for select
  using (project_id in (select id from public.projects where owner_id = auth.uid()));
create policy "Project members can insert estimations"
  on public.estimations for insert
  with check (project_id in (select id from public.projects where owner_id = auth.uid()));
create policy "Project members can update estimations"
  on public.estimations for update
  using (project_id in (select id from public.projects where owner_id = auth.uid()));

-- ── Workstreams ───────────────────────────────────────────────────────────────
create table public.workstreams (
  id              uuid        primary key default uuid_generate_v4(),
  estimation_id   uuid        not null references public.estimations(id) on delete cascade,
  name            text        not null,
  description     text,
  sort_order      integer     not null default 0,
  budget_cap      numeric(14,2),
  created_at      timestamptz not null default now()
);
alter table public.workstreams enable row level security;
create policy "Estimation members can read workstreams"
  on public.workstreams for select
  using (estimation_id in (
    select id from public.estimations
    where project_id in (select id from public.projects where owner_id = auth.uid())
  ));
create policy "Estimation members can manage workstreams"
  on public.workstreams for all
  using (estimation_id in (
    select id from public.estimations
    where project_id in (select id from public.projects where owner_id = auth.uid())
  ));

-- ── Resources ─────────────────────────────────────────────────────────────────
create table public.resources (
  id              uuid          primary key default uuid_generate_v4(),
  workstream_id   uuid          not null references public.workstreams(id) on delete cascade,
  rate_card_id    uuid          references public.rate_cards(id) on delete set null,
  display_name    text          not null,
  resource_type   resource_type not null,
  location_tier   location_tier not null,
  weekly_hours    numeric(5,2)  not null default 40 check (weekly_hours > 0 and weekly_hours <= 168),
  utilization_pct numeric(5,2)  not null default 100 check (utilization_pct >= 0 and utilization_pct <= 100),
  start_week      integer       not null default 0 check (start_week >= 0),
  end_week        integer       not null check (end_week >= start_week),
  -- Denormalized from rate_card for query speed (updated by trigger or application layer)
  hourly_rate     numeric(10,2) not null check (hourly_rate >= 0),
  role_title      text          not null,
  created_at      timestamptz   not null default now()
);
alter table public.resources enable row level security;
create policy "Workstream members can read resources"
  on public.resources for select
  using (workstream_id in (
    select id from public.workstreams
    where estimation_id in (
      select id from public.estimations
      where project_id in (select id from public.projects where owner_id = auth.uid())
    )
  ));
create policy "Workstream members can manage resources"
  on public.resources for all
  using (workstream_id in (
    select id from public.workstreams
    where estimation_id in (
      select id from public.estimations
      where project_id in (select id from public.projects where owner_id = auth.uid())
    )
  ));

-- ── Geographic Mix ────────────────────────────────────────────────────────────
create table public.geo_locations (
  id              uuid          primary key default uuid_generate_v4(),
  estimation_id   uuid          not null references public.estimations(id) on delete cascade,
  location_name   text          not null,
  location_tier   location_tier not null,
  percentage      numeric(5,2)  not null check (percentage >= 0 and percentage <= 100),
  avg_hourly_rate numeric(10,2) not null check (avg_hourly_rate >= 0),
  created_at      timestamptz   not null default now()
);
alter table public.geo_locations enable row level security;
create policy "Estimation members can read geo_locations"
  on public.geo_locations for select
  using (estimation_id in (
    select id from public.estimations
    where project_id in (select id from public.projects where owner_id = auth.uid())
  ));
create policy "Estimation members can manage geo_locations"
  on public.geo_locations for all
  using (estimation_id in (
    select id from public.estimations
    where project_id in (select id from public.projects where owner_id = auth.uid())
  ));

-- ── Scenarios ─────────────────────────────────────────────────────────────────
create table public.scenarios (
  id                  uuid        primary key default uuid_generate_v4(),
  base_estimation_id  uuid        not null references public.estimations(id) on delete cascade,
  name                text        not null,
  description         text,
  overrides           jsonb       not null default '[]',
  computed_cost       numeric(14,2),
  created_by          uuid        not null references public.profiles(id),
  created_at          timestamptz not null default now()
);
alter table public.scenarios enable row level security;
create policy "Estimation members can read scenarios"
  on public.scenarios for select
  using (base_estimation_id in (
    select id from public.estimations
    where project_id in (select id from public.projects where owner_id = auth.uid())
  ));
create policy "Estimation members can manage scenarios"
  on public.scenarios for all
  using (base_estimation_id in (
    select id from public.estimations
    where project_id in (select id from public.projects where owner_id = auth.uid())
  ));

-- ── Audit Events ──────────────────────────────────────────────────────────────
create table public.audit_events (
  id              uuid             primary key default uuid_generate_v4(),
  estimation_id   uuid             not null references public.estimations(id) on delete cascade,
  event_kind      audit_event_kind not null,
  actor_id        uuid             not null references public.profiles(id),
  actor_name      text             not null,
  actor_role      text             not null,
  description     text             not null,
  metadata        jsonb,
  created_at      timestamptz      not null default now()
);
-- Audit log is append-only — no UPDATE or DELETE policies
alter table public.audit_events enable row level security;
create policy "Estimation members can read audit events"
  on public.audit_events for select
  using (estimation_id in (
    select id from public.estimations
    where project_id in (select id from public.projects where owner_id = auth.uid())
  ));
create policy "Estimation members can insert audit events"
  on public.audit_events for insert
  with check (estimation_id in (
    select id from public.estimations
    where project_id in (select id from public.projects where owner_id = auth.uid())
  ));

-- ── Review Comments ───────────────────────────────────────────────────────────
create table public.review_comments (
  id              uuid        primary key default uuid_generate_v4(),
  estimation_id   uuid        not null references public.estimations(id) on delete cascade,
  author_id       uuid        not null references public.profiles(id),
  author_name     text        not null,
  author_role     text        not null,
  body            text        not null,
  resolved        boolean     not null default false,
  created_at      timestamptz not null default now()
);
alter table public.review_comments enable row level security;
create policy "Estimation members can read comments"
  on public.review_comments for select
  using (estimation_id in (
    select id from public.estimations
    where project_id in (select id from public.projects where owner_id = auth.uid())
  ));
create policy "Authenticated users can insert comments"
  on public.review_comments for insert
  with check (auth.uid() = author_id);
create policy "Authors can update their own comments"
  on public.review_comments for update
  using (auth.uid() = author_id);

-- ── Indexes ───────────────────────────────────────────────────────────────────
create index idx_estimations_project_id    on public.estimations(project_id);
create index idx_workstreams_estimation_id on public.workstreams(estimation_id);
create index idx_resources_workstream_id   on public.resources(workstream_id);
create index idx_geo_locations_estimation  on public.geo_locations(estimation_id);
create index idx_audit_events_estimation   on public.audit_events(estimation_id, created_at desc);
create index idx_review_comments_estimation on public.review_comments(estimation_id, created_at desc);
create index idx_scenarios_base_estimation on public.scenarios(base_estimation_id);

-- ── Auto-update updated_at ────────────────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_projects_updated_at
  before update on public.projects
  for each row execute function public.set_updated_at();

create trigger trg_estimations_updated_at
  before update on public.estimations
  for each row execute function public.set_updated_at();

-- ── Profile auto-create on Auth signup ───────────────────────────────────────
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    'viewer'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
