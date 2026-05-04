import { existsSync, readFileSync } from "node:fs";
import { createServer, request } from "node:http";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const shouldHideBlocked = process.argv.includes("--hide-blocked");
const chromePort = Number(process.env.GOALZONE_EMBED_CHECK_CHROME_PORT ?? 9227);
const localPort = Number(process.env.GOALZONE_EMBED_CHECK_LOCAL_PORT ?? 4187);
const checkTimeoutMs = Number(process.env.GOALZONE_EMBED_CHECK_TIMEOUT_MS ?? 9000);
const chromePath =
  process.env.GOALZONE_CHROME_PATH ??
  [
    "C:/Program Files/Google/Chrome/Application/chrome.exe",
    "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
    "C:/Program Files/Microsoft/Edge/Application/msedge.exe",
    "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"
  ].find((candidate) => existsSync(candidate));

loadEnvFile(path.join(rootDir, ".env"));
loadEnvFile(path.join(rootDir, ".env.local"));

class CdpClient {
  constructor(webSocketUrl) {
    this.id = 0;
    this.pending = new Map();
    this.ws = new WebSocket(webSocketUrl);
    this.ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (!message.id || !this.pending.has(message.id)) return;

      const pending = this.pending.get(message.id);
      this.pending.delete(message.id);

      if (message.error) {
        pending.reject(new Error(JSON.stringify(message.error)));
      } else {
        pending.resolve(message.result);
      }
    };
  }

  async ready() {
    if (this.ws.readyState === 1) return;

    await new Promise((resolve, reject) => {
      this.ws.onopen = resolve;
      this.ws.onerror = reject;
    });
  }

  send(method, params = {}) {
    const id = this.id + 1;
    this.id = id;
    this.ws.send(JSON.stringify({ id, method, params }));
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
    });
  }

  close() {
    this.ws.close();
  }
}

if (!chromePath) {
  throw new Error("Chrome or Edge was not found. Set GOALZONE_CHROME_PATH to run embed checks.");
}

const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("Missing Supabase URL or service role key.");
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

const { rows, error } = await loadApprovedYouTubeHighlights();
if (error) throw error;

if (rows.length === 0) {
  console.log("No approved YouTube highlights to check.");
  process.exit(0);
}

const chrome = spawn(
  chromePath,
  [
    "--headless=new",
    `--remote-debugging-port=${chromePort}`,
    `--user-data-dir=${path.join(rootDir, ".tmp-chrome-embed-check")}`,
    "--no-first-run",
    "--disable-gpu",
    "about:blank"
  ],
  { stdio: "ignore" }
);

const server = createServer((_req, res) => {
  res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
  res.end("<!doctype html><html><body></body></html>");
});

const results = [];

try {
  await waitForChrome();
  await new Promise((resolve) => server.listen(localPort, "127.0.0.1", resolve));

  let nextIndex = 0;
  const workers = Array.from({ length: Math.min(4, rows.length) }, async () => {
    while (nextIndex < rows.length) {
      const row = rows[nextIndex];
      nextIndex += 1;

      const result = await checkHighlight(row).catch((checkError) => ({
        ...row,
        embedStatus: "check-error",
        embedError: checkError instanceof Error ? checkError.message : String(checkError)
      }));

      results.push(result);
      console.log(`${result.youtubeId} ${result.embedStatus} ${result.title}`);
    }
  });

  await Promise.all(workers);
} finally {
  server.close();
  chrome.kill();
}

const blocked = results.filter((result) => result.embedStatus === "blocked");
const uncertain = results.filter((result) =>
  ["check-error", "timeout", "loading"].includes(result.embedStatus)
);

if (shouldHideBlocked && blocked.length > 0) {
  const blockedIds = blocked.map((result) => result.id);
  const { error: updateError } = await supabase
    .from("highlights")
    .update({
      status: "rejected",
      reviewed_at: new Date().toISOString()
    })
    .in("id", blockedIds);

  if (updateError) throw updateError;
}

console.log(
  JSON.stringify(
    {
      checked: results.length,
      playable: results.filter((result) => result.embedStatus === "playable").length,
      hidden: shouldHideBlocked ? blocked.length : 0,
      blocked: blocked.map(({ id, title, url, errorCode }) => ({ id, title, url, errorCode })),
      uncertain: uncertain.map(({ id, title, url, embedStatus, embedError }) => ({
        id,
        title,
        url,
        embedStatus,
        embedError
      }))
    },
    null,
    2
  )
);

async function loadApprovedYouTubeHighlights() {
  const { data, error: queryError } = await supabase
    .from("highlights")
    .select("id,title,external_video_url,video_url,status")
    .eq("status", "approved");

  if (queryError) {
    return { rows: [], error: queryError };
  }

  const youtubeRows = (data ?? [])
    .map((row) => {
      const url = row.external_video_url ?? row.video_url;
      const youtubeId = getYouTubeId(url);
      return youtubeId ? { ...row, url, youtubeId } : null;
    })
    .filter(Boolean);

  return { rows: youtubeRows, error: null };
}

async function checkHighlight(row) {
  const target = await getJson("PUT", `http://127.0.0.1:${chromePort}/json/new`);
  const cdp = new CdpClient(target.webSocketDebuggerUrl);

  try {
    await cdp.ready();
    await cdp.send("Page.enable");
    await cdp.send("Runtime.enable");
    await cdp.send("Page.navigate", { url: `http://127.0.0.1:${localPort}/` });
    await sleep(200);

    const origin = `http://127.0.0.1:${localPort}`;
    const html = getCheckHtml(row.youtubeId, origin);

    await cdp.send("Runtime.evaluate", {
      expression: `document.open();document.write(${JSON.stringify(html)});document.close();`
    });
    await sleep(checkTimeoutMs + 500);

    const evaluation = await cdp.send("Runtime.evaluate", {
      expression: "window.embedResult",
      returnByValue: true
    });

    const value = evaluation.result.value ?? { status: "loading" };
    const errorCode = Number(value.code);
    const embedStatus =
      value.status === "ready" || value.status === "state"
        ? "playable"
        : value.status === "error" && [100, 101, 150].includes(errorCode)
          ? "blocked"
          : value.status ?? "loading";

    return {
      ...row,
      embedStatus,
      errorCode: Number.isFinite(errorCode) ? errorCode : null
    };
  } finally {
    cdp.close();
    await httpRequest("GET", `http://127.0.0.1:${chromePort}/json/close/${target.id}`).catch(() => {});
  }
}

function getCheckHtml(youtubeId, origin) {
  return `<!doctype html>
<html>
  <body>
    <div id="player"></div>
    <script>
      window.embedResult = { status: "loading" };
      var tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(tag);
      window.onYouTubeIframeAPIReady = function () {
        window.embedResult = { status: "api-ready" };
        new YT.Player("player", {
          height: "390",
          width: "640",
          videoId: "${youtubeId}",
          playerVars: { origin: "${origin}", enablejsapi: 1 },
          events: {
            onReady: function () {
              window.embedResult = { status: "ready" };
            },
            onError: function (event) {
              window.embedResult = { status: "error", code: event.data };
            },
            onStateChange: function (event) {
              if (event.data !== -1) {
                window.embedResult = { status: "state", state: event.data };
              }
            }
          }
        });
      };
      setTimeout(function () {
        if (window.embedResult.status === "loading" || window.embedResult.status === "api-ready") {
          window.embedResult = { status: "timeout" };
        }
      }, ${checkTimeoutMs});
    </script>
  </body>
</html>`;
}

function getYouTubeId(input) {
  if (!input) return null;

  try {
    const url = new URL(input);
    const host = url.hostname.replace(/^www\./, "").replace(/^m\./, "");

    if (host === "youtu.be") {
      return url.pathname.split("/").filter(Boolean)[0] ?? null;
    }

    if (host === "youtube.com" || host === "youtube-nocookie.com" || host.endsWith(".youtube.com")) {
      const watchId = url.searchParams.get("v");
      const pathParts = url.pathname.split("/").filter(Boolean);
      const embeddedId = pathParts[0] === "embed" || pathParts[0] === "shorts" ? pathParts[1] : null;
      return watchId ?? embeddedId;
    }
  } catch {
    return null;
  }

  return null;
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

async function waitForChrome() {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    try {
      return await getJson("GET", `http://127.0.0.1:${chromePort}/json/version`);
    } catch {
      await sleep(250);
    }
  }

  throw new Error("Chrome did not start.");
}

async function getJson(method, url) {
  const response = await httpRequest(method, url);
  return JSON.parse(response.body);
}

function httpRequest(method, input) {
  return new Promise((resolve, reject) => {
    const url = new URL(input);
    const req = request(
      {
        method,
        hostname: url.hostname,
        port: url.port,
        path: `${url.pathname}${url.search}`
      },
      (res) => {
        let body = "";
        res.on("data", (chunk) => {
          body += chunk;
        });
        res.on("end", () => {
          resolve({ status: res.statusCode, body });
        });
      }
    );

    req.on("error", reject);
    req.end();
  });
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
