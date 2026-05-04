# Goalzone Supabase Notes

Run `supabase/schema.sql` in the Supabase SQL editor or through the Supabase CLI.

The schema creates:

- `profiles` with roles: `viewer`, `pending_uploader`, `uploader`, `admin`
- `uploader_applications` with statuses: `pending`, `approved`, `rejected`
- `clubs`
- `teams`
- `categories`
- `highlights` with types: `goal`, `save`, `skill`, `assist`, `shot`, `mistake`, `funny`, `celebration`, `historic`, `other`
- private Storage bucket: `highlight-videos`

Important behavior:

- New Auth users receive a `profiles` row through `handle_new_user()`.
- New uploader applications move `viewer` accounts to `pending_uploader`.
- Approved applications move users to `uploader`.
- Rejected pending applications move users back to `viewer`.
- Highlight inserts are only allowed for `uploader` and `admin` profiles.
- Highlight inserts must start with `status = 'pending'`.
- Video uploads must be stored under a folder named for the uploader user id.
- Highlights can also point at an external YouTube, Vimeo, or TikTok URL.
- Demo highlights can be grouped by category and shown as category sections on the home page.
- Approved highlights can be read publicly.
- Approved highlight videos can be read from the private bucket when a matching approved row exists.
- Pending highlights and their videos are not public.
- The default bucket upload limit is 250 MB. The Supabase global Storage limit must be at least 250 MB too.

Highlight submission metadata:

- `player_name`
- `club_name`
- `team_name`
- `opponent_team_name`
- `competition`
- `season`
- `match_date`
- `location`
- `reviewed_by`
- `reviewed_at`
- `video_url`
- `video_provider`
- `external_video_url`
- `external_video_provider`
- `category_id`

If an existing database already has the foundation schema, run `supabase/migrations/20260503_highlight_submission.sql`.
Then run `supabase/migrations/20260503_external_video_links.sql` to support YouTube/Vimeo links.
Run `supabase/migrations/20260503_categories_and_demo_embeds.sql` to add categories and external demo embed support.
Run `supabase/migrations/20260503_storage_250mb_limit.sql` to set the bucket upload limit to 250 MB.

If the category migration was already run before service-role seed grants were added, run:

```sql
grant select, insert, update, delete on public.categories to service_role;
grant select on public.profiles to service_role;
grant select, insert, update on public.highlights to service_role;
```

Demo content seeding:

1. Add researched category/video JSON to `supabase/seed/goalzone-demo-content.json`.
2. Add `SUPABASE_SERVICE_ROLE_KEY` and `GOALZONE_SEED_UPLOADER_EMAIL` to `.env.local`.
3. Run `npm run seed:demo`.

The seed script inserts categories and approved demo highlights using external URLs only. It does not store video files.

YouTube embed checks:

```bash
node scripts/check-youtube-embeds.mjs
node scripts/check-youtube-embeds.mjs --hide-blocked
```

The `--hide-blocked` mode marks approved YouTube rows as `rejected` when YouTube returns embed errors `100`, `101`, or `150`.

To create the first admin, run this after that user has signed up:

```sql
update public.profiles
set role = 'admin'
where email = 'admin@example.com';
```
