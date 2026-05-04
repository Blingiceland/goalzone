alter table public.highlights
  alter column video_path drop not null,
  add column if not exists video_url text,
  add column if not exists video_provider text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'highlights_has_video'
      and conrelid = 'public.highlights'::regclass
  ) then
    alter table public.highlights
      add constraint highlights_has_video check (video_path is not null or video_url is not null);
  end if;
end;
$$;
