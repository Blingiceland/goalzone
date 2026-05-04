create extension if not exists pgcrypto;

create type public.app_role as enum ('viewer', 'pending_uploader', 'uploader', 'admin');
create type public.uploader_application_status as enum ('pending', 'approved', 'rejected');
create type public.highlight_type as enum (
  'goal',
  'save',
  'skill',
  'assist',
  'shot',
  'mistake',
  'funny',
  'celebration',
  'historic',
  'other'
);
create type public.highlight_status as enum ('pending', 'approved', 'rejected');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  role public.app_role not null default 'viewer',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.uploader_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  club_name text not null,
  team_name text,
  contact_email text not null,
  reason text not null,
  status public.uploader_application_status not null default 'pending',
  reviewed_by uuid references public.profiles(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.clubs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  city text,
  country text not null default 'Iceland',
  logo_url text,
  created_at timestamptz not null default now()
);

create table public.teams (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs(id) on delete cascade,
  name text not null,
  age_group text,
  gender text,
  season text,
  created_at timestamptz not null default now()
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name_en text not null,
  name_is text not null,
  short_description_is text,
  display_order integer not null default 100,
  created_at timestamptz not null default now()
);

create table public.highlights (
  id uuid primary key default gen_random_uuid(),
  uploader_id uuid not null references public.profiles(id) on delete cascade,
  category_id uuid references public.categories(id) on delete set null,
  club_id uuid references public.clubs(id) on delete set null,
  team_id uuid references public.teams(id) on delete set null,
  title text not null,
  description text,
  type public.highlight_type not null,
  status public.highlight_status not null default 'pending',
  player_name text,
  club_name text,
  team_name text,
  opponent_team_name text,
  competition text,
  season text,
  match_date date,
  location text,
  video_path text,
  video_url text,
  video_provider text,
  external_video_url text,
  external_video_provider text,
  thumbnail_path text,
  recorded_at timestamptz,
  reviewed_by uuid references public.profiles(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint highlights_has_video check (
    video_path is not null
    or video_url is not null
    or external_video_url is not null
  )
);

create index uploader_applications_user_id_idx on public.uploader_applications(user_id);
create index uploader_applications_status_idx on public.uploader_applications(status);
create index teams_club_id_idx on public.teams(club_id);
create index categories_display_order_idx on public.categories(display_order);
create index highlights_uploader_id_idx on public.highlights(uploader_id);
create index highlights_category_id_idx on public.highlights(category_id);
create index highlights_status_idx on public.highlights(status);
create index highlights_type_idx on public.highlights(type);
create index highlights_match_date_idx on public.highlights(match_date);
create unique index highlights_external_video_url_unique_idx
on public.highlights(external_video_url);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger uploader_applications_set_updated_at
before update on public.uploader_applications
for each row execute function public.set_updated_at();

create trigger highlights_set_updated_at
before update on public.highlights
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.handle_uploader_application_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.profiles
  set role = 'pending_uploader'
  where id = new.user_id
    and role = 'viewer';

  return new;
end;
$$;

create trigger uploader_application_insert_sets_pending_role
after insert on public.uploader_applications
for each row execute function public.handle_uploader_application_insert();

create or replace function public.handle_uploader_application_review()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'approved' then
    update public.profiles
    set role = 'uploader'
    where id = new.user_id
      and role <> 'admin';
  elsif new.status = 'rejected' then
    update public.profiles
    set role = 'viewer'
    where id = new.user_id
      and role = 'pending_uploader';
  end if;

  return new;
end;
$$;

create trigger uploader_application_review_updates_role
after update of status on public.uploader_applications
for each row
when (old.status is distinct from new.status)
execute function public.handle_uploader_application_review();

create or replace function public.current_profile_role()
returns public.app_role
language sql
stable
security definer
set search_path = public
set row_security = off
as $$
  select role from public.profiles where id = auth.uid()
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_profile_role() = 'admin', false)
$$;

create or replace function public.can_upload_highlights()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_profile_role() in ('uploader', 'admin'), false)
$$;

alter table public.profiles enable row level security;
alter table public.uploader_applications enable row level security;
alter table public.clubs enable row level security;
alter table public.teams enable row level security;
alter table public.categories enable row level security;
alter table public.highlights enable row level security;

grant usage on schema public to anon, authenticated;

grant select on public.profiles to authenticated;
grant update (display_name, updated_at) on public.profiles to authenticated;

grant select, insert, update on public.uploader_applications to authenticated;

grant select on public.clubs to anon, authenticated;
grant insert, update, delete on public.clubs to authenticated;

grant select on public.teams to anon, authenticated;
grant insert, update, delete on public.teams to authenticated;

grant select on public.categories to anon, authenticated;
grant insert, update, delete on public.categories to authenticated;
grant select, insert, update, delete on public.categories to service_role;
grant select on public.profiles to service_role;
grant select, insert, update on public.highlights to service_role;

grant select on public.highlights to anon, authenticated;
grant insert, update on public.highlights to authenticated;

create policy "Profiles can read their own profile"
on public.profiles for select
to authenticated
using (id = auth.uid() or public.is_admin());

create policy "Profiles can update their own display name"
on public.profiles for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid() and role = (select role from public.profiles where id = auth.uid()));

create policy "Admins can update profiles"
on public.profiles for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Users can read their own applications"
on public.uploader_applications for select
to authenticated
using (user_id = auth.uid() or public.is_admin());

create policy "Users can apply as themselves"
on public.uploader_applications for insert
to authenticated
with check (user_id = auth.uid() and status = 'pending');

create policy "Admins can review applications"
on public.uploader_applications for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Anyone can read clubs"
on public.clubs for select
to anon, authenticated
using (true);

create policy "Admins can manage clubs"
on public.clubs for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Anyone can read teams"
on public.teams for select
to anon, authenticated
using (true);

create policy "Admins can manage teams"
on public.teams for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Anyone can read categories"
on public.categories for select
to anon, authenticated
using (true);

create policy "Admins can manage categories"
on public.categories for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Public can read approved highlights"
on public.highlights for select
to anon, authenticated
using (status = 'approved' or uploader_id = auth.uid() or public.is_admin());

create policy "Approved uploaders can create pending highlights"
on public.highlights for insert
to authenticated
with check (
  uploader_id = auth.uid()
  and status = 'pending'
  and public.can_upload_highlights()
);

create policy "Uploaders can update their own pending highlights"
on public.highlights for update
to authenticated
using (uploader_id = auth.uid() and status = 'pending')
with check (uploader_id = auth.uid() and status = 'pending');

create policy "Admins can moderate highlights"
on public.highlights for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'highlight-videos',
  'highlight-videos',
  false,
  262144000,
  array['video/mp4', 'video/quicktime', 'video/webm']
)
on conflict (id) do nothing;

create policy "Approved uploaders can upload highlight videos"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'highlight-videos'
  and public.can_upload_highlights()
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Uploaders can read their own highlight videos"
on storage.objects for select
to authenticated
using (
  bucket_id = 'highlight-videos'
  and (
    (storage.foldername(name))[1] = auth.uid()::text
    or public.is_admin()
  )
);

create policy "Public can read approved highlight videos"
on storage.objects for select
to anon, authenticated
using (
  bucket_id = 'highlight-videos'
  and exists (
    select 1
    from public.highlights h
    where h.video_path = name
      and h.status = 'approved'
  )
);

create policy "Uploaders can delete their own highlight videos"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'highlight-videos'
  and public.can_upload_highlights()
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Admins can manage highlight videos"
on storage.objects for all
to authenticated
using (bucket_id = 'highlight-videos' and public.is_admin())
with check (bucket_id = 'highlight-videos' and public.is_admin());
