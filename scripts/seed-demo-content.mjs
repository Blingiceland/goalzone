import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const allowedHighlightTypes = new Set([
  "goal",
  "save",
  "skill",
  "assist",
  "shot",
  "mistake",
  "funny",
  "celebration",
  "historic",
  "other"
]);

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const defaultInputPath = path.join(rootDir, "supabase", "seed", "goalzone-demo-content.json");

loadEnvFile(path.join(rootDir, ".env"));
loadEnvFile(path.join(rootDir, ".env.local"));

const includeUncertainEmbeds = process.env.GOALZONE_INCLUDE_UNCERTAIN_EMBEDS === "true";
const inputPath = path.resolve(rootDir, process.argv.slice(2).find((arg) => !arg.startsWith("--")) ?? defaultInputPath);
const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error(
    "Missing SUPABASE_URL/NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Add the service role key locally before seeding demo data."
  );
}

if (!existsSync(inputPath)) {
  throw new Error(
    `Could not find demo JSON at ${inputPath}. Add the researched JSON there, or pass a file path to npm run seed:demo -- path/to/file.json.`
  );
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

const rawInput = JSON.parse(readFileSync(inputPath, "utf8").replace(/^\uFEFF/, ""));
const categories = normalizeCategories(rawInput);

if (categories.length === 0) {
  throw new Error("The demo JSON did not contain any categories.");
}

const uploaderId = await resolveSeedUploaderId();
const categoryRows = categories.map((category, index) => ({
  slug: category.slug,
  name_en: category.nameEn,
  name_is: category.nameIs,
  short_description_is: category.descriptionIs,
  display_order: index + 1
}));

const { data: savedCategories, error: categoryError } = await supabase
  .from("categories")
  .upsert(categoryRows, { onConflict: "slug" })
  .select("id, slug");

if (categoryError) {
  throw categoryError;
}

const categoryIdBySlug = new Map((savedCategories ?? []).map((category) => [category.slug, category.id]));
const highlightBuild = buildHighlightRows(categories, categoryIdBySlug, uploaderId);
const highlightRows = highlightBuild.rows;

if (highlightRows.length > 0) {
  const { error: highlightError } = await supabase
    .from("highlights")
    .upsert(highlightRows, { onConflict: "external_video_url" });

  if (highlightError) {
    throw highlightError;
  }
}

console.log(`Seeded ${categoryRows.length} categories and ${highlightRows.length} approved demo highlights.`);

const skippedTotal = Object.values(highlightBuild.skipped).reduce((total, count) => total + count, 0);
if (skippedTotal > 0) {
  console.log(`Skipped ${skippedTotal} videos: ${JSON.stringify(highlightBuild.skipped)}.`);
}

function loadEnvFile(filePath) {
  if (!existsSync(filePath)) return;

  const lines = readFileSync(filePath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) continue;

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim().replace(/^['"]|['"]$/g, "");
    if (key && process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

async function resolveSeedUploaderId() {
  if (process.env.GOALZONE_SEED_UPLOADER_ID) {
    return process.env.GOALZONE_SEED_UPLOADER_ID;
  }

  if (process.env.GOALZONE_SEED_UPLOADER_EMAIL) {
    const { data, error } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", process.env.GOALZONE_SEED_UPLOADER_EMAIL)
      .single();

    if (error) throw error;
    return data.id;
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("id")
    .in("role", ["admin", "uploader"])
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  if (data?.id) return data.id;

  throw new Error(
    "No admin or uploader profile found. Sign in once, promote that user, or set GOALZONE_SEED_UPLOADER_ID."
  );
}

function normalizeCategories(input) {
  const rawCategories = Array.isArray(input) ? input : input.categories;
  if (!Array.isArray(rawCategories)) {
    throw new Error("Expected a top-level category array or an object with a categories array.");
  }

  return rawCategories.map((category, index) => {
    const nameEn = text(category.categoryNameEnglish ?? category.nameEn ?? category.name_en);
    const nameIs = text(category.categoryNameIcelandic ?? category.nameIs ?? category.name_is);
    const slug = text(category.categorySlug ?? category.slug) ?? slugify(nameEn ?? `category-${index + 1}`);

    if (!nameEn || !nameIs) {
      throw new Error(`Category ${slug} is missing English or Icelandic names.`);
    }

    return {
      slug,
      nameEn,
      nameIs,
      descriptionIs: text(category.shortDescriptionIcelandic ?? category.short_description_is),
      videos: Array.isArray(category.videos) ? category.videos : []
    };
  });
}

function buildHighlightRows(categoriesToSeed, categoryIdBySlug, uploaderId) {
  const now = new Date().toISOString();
  const rows = [];
  const seenUrls = new Set();
  const skipped = {
    duplicate: 0,
    missingTitle: 0,
    uncertainEmbed: 0,
    unsupportedUrl: 0
  };

  for (const category of categoriesToSeed) {
    const categoryId = categoryIdBySlug.get(category.slug);
    if (!categoryId) continue;

    for (const video of category.videos) {
      if (video.embedLikely === false && !includeUncertainEmbeds) {
        skipped.uncertainEmbed += 1;
        continue;
      }

      const externalUrl = text(video.externalUrl ?? video.external_url ?? video.url);
      const externalVideo = getExternalVideo(externalUrl);
      if (!externalUrl || !externalVideo) {
        skipped.unsupportedUrl += 1;
        continue;
      }

      if (seenUrls.has(externalUrl)) {
        skipped.duplicate += 1;
        continue;
      }

      seenUrls.add(externalUrl);

      const highlightType = allowedHighlightTypes.has(video.highlightType) ? video.highlightType : "other";
      const displayTitle = text(video.suggestedDisplayTitleIcelandic) ?? text(video.title);

      if (!displayTitle) {
        skipped.missingTitle += 1;
        continue;
      }

      rows.push({
        uploader_id: uploaderId,
        category_id: categoryId,
        title: displayTitle,
        description: text(video.whyThisFitsTheCategory),
        type: highlightType,
        status: "approved",
        player_name: text(video.playerName),
        club_name: text(video.clubName),
        team_name: text(video.teamName),
        opponent_team_name: text(video.opponentTeamName),
        competition: text(video.competition),
        season: text(video.season ?? video.year),
        match_date: normalizeDate(video.matchDate ?? video.match_date),
        location: text(video.location),
        video_path: null,
        video_url: externalUrl,
        video_provider: externalVideo.provider,
        external_video_url: externalUrl,
        external_video_provider: externalVideo.provider,
        reviewed_by: uploaderId,
        reviewed_at: now,
        updated_at: now
      });
    }
  }

  return { rows, skipped };
}

function getExternalVideo(input) {
  if (!input) return null;

  let url;
  try {
    url = new URL(input.trim());
  } catch {
    return null;
  }

  const host = url.hostname.replace(/^www\./, "").replace(/^m\./, "");

  if (host === "youtu.be") {
    const id = url.pathname.split("/").filter(Boolean)[0];
    return id ? { provider: "youtube" } : null;
  }

  if (host === "youtube.com" || host === "youtube-nocookie.com" || host.endsWith(".youtube.com")) {
    const watchId = url.searchParams.get("v");
    const pathParts = url.pathname.split("/").filter(Boolean);
    const embeddedId = pathParts[0] === "embed" || pathParts[0] === "shorts" ? pathParts[1] : null;
    return watchId || embeddedId ? { provider: "youtube" } : null;
  }

  if (host === "vimeo.com") {
    const id = url.pathname.split("/").filter(Boolean)[0];
    return id ? { provider: "vimeo" } : null;
  }

  if (host === "player.vimeo.com") {
    const pathParts = url.pathname.split("/").filter(Boolean);
    const id = pathParts[0] === "video" ? pathParts[1] : null;
    return id ? { provider: "vimeo" } : null;
  }

  if (host === "tiktok.com" || host.endsWith(".tiktok.com")) {
    const pathParts = url.pathname.split("/").filter(Boolean);
    const videoIndex = pathParts.indexOf("video");
    const id = videoIndex >= 0 ? pathParts[videoIndex + 1] : null;
    return id ? { provider: "tiktok" } : null;
  }

  return null;
}

function text(value) {
  if (typeof value !== "string" && typeof value !== "number") return null;
  const trimmed = String(value).trim();
  return trimmed.length > 0 ? trimmed : null;
}

function normalizeDate(value) {
  const raw = text(value);
  if (!raw) return null;

  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return null;

  return date.toISOString().slice(0, 10);
}

function slugify(value) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
