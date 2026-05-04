alter type public.highlight_type add value if not exists 'mistake';
alter type public.highlight_type add value if not exists 'funny';
alter type public.highlight_type add value if not exists 'celebration';
alter type public.highlight_type add value if not exists 'historic';

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name_en text not null,
  name_is text not null,
  short_description_is text,
  display_order integer not null default 100,
  created_at timestamptz not null default now()
);

alter table public.categories enable row level security;

grant select on public.categories to anon, authenticated;
grant insert, update, delete on public.categories to authenticated;
grant select, insert, update, delete on public.categories to service_role;
grant select on public.profiles to service_role;
grant select, insert, update on public.highlights to service_role;

drop policy if exists "Anyone can read categories" on public.categories;
create policy "Anyone can read categories"
on public.categories for select
to anon, authenticated
using (true);

drop policy if exists "Admins can manage categories" on public.categories;
create policy "Admins can manage categories"
on public.categories for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

alter table public.highlights
  add column if not exists category_id uuid references public.categories(id) on delete set null,
  add column if not exists external_video_url text,
  add column if not exists external_video_provider text;

update public.highlights
set external_video_url = coalesce(external_video_url, video_url),
    external_video_provider = coalesce(external_video_provider, video_provider)
where video_url is not null;

do $$
begin
  if exists (
    select 1
    from pg_constraint
    where conname = 'highlights_has_video'
      and conrelid = 'public.highlights'::regclass
  ) then
    alter table public.highlights drop constraint highlights_has_video;
  end if;

  alter table public.highlights
    add constraint highlights_has_video check (
      video_path is not null
      or video_url is not null
      or external_video_url is not null
    );
end;
$$;

create index if not exists categories_display_order_idx on public.categories(display_order);
create index if not exists highlights_category_id_idx on public.highlights(category_id);
drop index if exists public.highlights_external_video_url_unique_idx;
create unique index highlights_external_video_url_unique_idx
on public.highlights(external_video_url);
