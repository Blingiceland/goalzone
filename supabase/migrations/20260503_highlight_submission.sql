alter table public.highlights
  add column if not exists player_name text,
  add column if not exists club_name text,
  add column if not exists team_name text,
  add column if not exists opponent_team_name text,
  add column if not exists competition text,
  add column if not exists season text,
  add column if not exists match_date date,
  add column if not exists location text,
  add column if not exists reviewed_by uuid references public.profiles(id),
  add column if not exists reviewed_at timestamptz;

create index if not exists highlights_match_date_idx on public.highlights(match_date);

drop policy if exists "Public can read approved highlight videos" on storage.objects;
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

drop policy if exists "Uploaders can delete their own highlight videos" on storage.objects;
create policy "Uploaders can delete their own highlight videos"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'highlight-videos'
  and public.can_upload_highlights()
  and (storage.foldername(name))[1] = auth.uid()::text
);
