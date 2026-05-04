# Goalzone

Goalzone is an Iceland-first football highlight platform foundation built with Next.js, TypeScript, Tailwind CSS, Supabase Auth, Supabase Postgres, and Supabase Storage.

This MVP foundation includes:

- Dark sports-media app layout
- Supabase browser client setup
- Email/password sign in and sign up
- Uploader application flow
- Admin uploader application queue
- Video highlight submission flow for approved uploaders and admins
- YouTube/Vimeo/TikTok highlight link submission without uploading a file
- Admin highlight moderation queue
- Public highlight categories and category filtering on the home page
- Demo seed script for external video embeds
- Icelandic UI text by default with a small translation structure
- Postgres schema for profiles, uploader applications, clubs, teams, categories, and highlights
- Roles: `viewer`, `pending_uploader`, `uploader`, `admin`
- Highlight types: `goal`, `save`, `skill`, `assist`, `shot`, `mistake`, `funny`, `celebration`, `historic`, `other`
- RLS policies and private video bucket setup

## Local Setup

Install dependencies:

```bash
npm install
```

Create `.env.local`:

```bash
cp .env.example .env.local
```

Add your Supabase project values:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

For local demo seeding only, also add a service role key to `.env.local`:

```bash
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
GOALZONE_SEED_UPLOADER_EMAIL=admin@example.com
```

Keep the service role key local. It bypasses RLS and must never be exposed in browser code.

Run the app:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Supabase Setup

1. Create a Supabase project.
2. Enable Email authentication in Supabase Auth.
3. Run `supabase/schema.sql` in the Supabase SQL editor.
4. Sign up once through the app.
5. Promote the first admin:

```sql
update public.profiles
set role = 'admin'
where email = 'your-email@example.com';
```

If you already ran the earlier foundation schema before highlight submissions existed, run:

```sql
-- Use the SQL editor or Supabase CLI.
-- File: supabase/migrations/20260503_highlight_submission.sql
```

That migration adds highlight metadata fields and Storage policies for approved public playback.

For the category/feed demo layer on an existing database, also run:

```sql
-- File: supabase/migrations/20260503_categories_and_demo_embeds.sql
```

If that migration was run before the seed script needed service-role access, run these grants once:

```sql
grant select, insert, update, delete on public.categories to service_role;
grant select on public.profiles to service_role;
grant select, insert, update on public.highlights to service_role;
```

## MVP Permission Model

- Anyone can create an account.
- New users start as `viewer`.
- A signed-in user can apply to become an uploader.
- Applying changes a `viewer` to `pending_uploader`.
- Admins can approve or reject uploader applications.
- Approved applicants become `uploader`.
- Only `uploader` and `admin` users can insert highlights.
- New highlights must be inserted with `status = 'pending'`.
- Public users can only read approved highlights.
- Uploaders can see their own pending highlights.
- Admins can moderate applications, highlights, clubs, and teams.
- Admins approve or reject submitted highlights at `/admin/highlights`.
- Approved highlights appear on the public home page.

## Highlight Submission Flow

1. A user signs up or signs in.
2. The user applies to become an uploader at `/apply`.
3. An admin approves the uploader application at `/admin/applications`.
4. The approved uploader submits a video at `/submit`.
5. The submitter either adds a YouTube/Vimeo/TikTok link or uploads a video to Supabase Storage.
6. A `highlights` row is created with `status = 'pending'`.
7. An admin approves or rejects the highlight at `/admin/highlights`.
8. Approved highlights appear publicly on `/`.

The submit form stores:

- `title`
- `description`
- `type`
- `player_name`
- `club_name`
- `team_name`
- `opponent_team_name`
- `competition`
- `season`
- `match_date`
- `location`
- `video_path`
- `video_url`
- `video_provider`
- `external_video_url`
- `external_video_provider`
- `category_id`

## Demo Categories And External Embeds

The app can seed researched demo categories and approved demo highlights from a JSON file. The script stores only external URLs. It does not upload, download, or copy video files.

1. Run `supabase/migrations/20260503_categories_and_demo_embeds.sql` in Supabase.
2. Add the researched JSON at:

```text
supabase/seed/goalzone-demo-content.json
```

You can copy the shape from:

```text
supabase/seed/goalzone-demo-content.example.json
```

3. Add `SUPABASE_SERVICE_ROLE_KEY` and `GOALZONE_SEED_UPLOADER_EMAIL` to `.env.local`.
4. Run:

```bash
npm run seed:demo
```

You can also pass a custom JSON path:

```bash
npm run seed:demo -- path/to/researched-goalzone-content.json
```

The JSON can be either a top-level category array or an object with `categories`. Each category should contain:

- `categorySlug`
- `categoryNameEnglish`
- `categoryNameIcelandic`
- `shortDescriptionIcelandic`
- `videos`

Each video should contain the researched metadata, especially:

- `title`
- `externalUrl`
- `provider`
- `suggestedDisplayTitleIcelandic`
- `playerName`
- `teamName`
- `opponentTeamName`
- `year`
- `highlightType`
- `tags`
- `whyThisFitsTheCategory`

Supported embeds in the app are YouTube, Vimeo, and TikTok. The seed script skips unsupported URLs and videos marked with `"embedLikely": false` unless `GOALZONE_INCLUDE_UNCERTAIN_EMBEDS=true` is set.

Seeded demo highlights are inserted as `approved`, so they appear on the public home page immediately under their category sections.

Before launch, check that approved YouTube videos are actually playable inside the site:

```bash
node scripts/check-youtube-embeds.mjs
```

To hide approved YouTube rows that return YouTube embed errors `100`, `101`, or `150`, run:

```bash
node scripts/check-youtube-embeds.mjs --hide-blocked
```

This marks blocked rows as `rejected`; it does not delete them. The home page only shows approved rows, so blocked embeds disappear from the public feed.

## Storage

The schema creates a private Supabase Storage bucket named `highlight-videos`.

Upload paths should start with the uploader user id:

```text
highlight-videos/{user_id}/{timestamp}-{filename}
```

The app uploads to the `highlight-videos` bucket using the object path:

```text
{user_id}/{timestamp}-{filename}
```

The included Storage RLS policies allow approved uploaders and admins to upload into their own user-id folder. Approved videos can be read publicly when a matching `highlights.video_path` row has `status = 'approved'`.

External videos use `external_video_url` and `external_video_provider`, with `video_url` and `video_provider` mirrored for compatibility. YouTube, Vimeo, and TikTok links are supported for now, and external-video rows do not need `video_path`.

## Upload Size

The MVP uses a 250 MB upload limit for the `highlight-videos` bucket. This requires a Supabase plan and Storage Settings global file size limit that allow at least 250 MB.

For larger videos, use YouTube or Vimeo links, or add resumable uploads later.

If this limit changes, update:

- the Supabase global Storage file size limit
- the `highlight-videos` bucket file size limit
- the client-side `maxUploadBytes` value in `app/submit/page.tsx`

## Localization

Visible app text defaults to Icelandic. Route names, database columns, and code identifiers stay in English.

The simple translation structure lives in:

```text
lib/i18n/translations.ts
```

## Key Files

- `app/login/page.tsx` - email/password auth
- `app/apply/page.tsx` - uploader application flow
- `app/submit/page.tsx` - highlight submission and video upload
- `app/admin/applications/page.tsx` - admin review queue
- `app/admin/highlights/page.tsx` - highlight moderation queue
- `components/highlight-feed.tsx` - approved public highlights
- `lib/i18n/translations.ts` - Icelandic-first UI labels
- `lib/supabase/client.ts` - Supabase browser client
- `lib/supabase/database.types.ts` - app-level Supabase types
- `scripts/seed-demo-content.mjs` - category and demo highlight seed script
- `scripts/check-youtube-embeds.mjs` - checks approved YouTube embeds and can hide blocked rows
- `supabase/schema.sql` - database, storage, and RLS setup
- `supabase/migrations/20260503_highlight_submission.sql` - migration for existing foundation databases
- `supabase/migrations/20260503_external_video_links.sql` - external YouTube/Vimeo video links
- `supabase/migrations/20260503_categories_and_demo_embeds.sql` - categories and external embed seed support
- `supabase/migrations/20260503_storage_250mb_limit.sql` - 250 MB upload size limit
