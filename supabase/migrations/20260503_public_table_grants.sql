grant usage on schema public to anon, authenticated;

grant select on public.profiles to authenticated;
grant update (display_name, updated_at) on public.profiles to authenticated;

grant select, insert, update on public.uploader_applications to authenticated;

grant select on public.clubs to anon, authenticated;
grant insert, update, delete on public.clubs to authenticated;

grant select on public.teams to anon, authenticated;
grant insert, update, delete on public.teams to authenticated;

grant select on public.highlights to anon, authenticated;
grant insert, update on public.highlights to authenticated;
