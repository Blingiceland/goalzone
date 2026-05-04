export type ExternalVideoProvider = "youtube" | "vimeo" | "tiktok";

export type ExternalVideo = {
  embedUrl: string;
  provider: ExternalVideoProvider;
};

export function getExternalVideo(input: string | null | undefined): ExternalVideo | null {
  if (!input) return null;

  let url: URL;

  try {
    url = new URL(input.trim());
  } catch {
    return null;
  }

  const host = url.hostname.replace(/^www\./, "").replace(/^m\./, "");

  if (host === "youtu.be") {
    const id = url.pathname.split("/").filter(Boolean)[0];
    return id ? { provider: "youtube", embedUrl: `https://www.youtube.com/embed/${id}` } : null;
  }

  if (host === "youtube.com" || host === "youtube-nocookie.com" || host.endsWith(".youtube.com")) {
    const watchId = url.searchParams.get("v");
    const pathParts = url.pathname.split("/").filter(Boolean);
    const embeddedId =
      pathParts[0] === "embed" || pathParts[0] === "shorts" ? pathParts[1] : null;
    const id = watchId || embeddedId;

    return id ? { provider: "youtube", embedUrl: `https://www.youtube.com/embed/${id}` } : null;
  }

  if (host === "vimeo.com") {
    const id = url.pathname.split("/").filter(Boolean)[0];
    return id ? { provider: "vimeo", embedUrl: `https://player.vimeo.com/video/${id}` } : null;
  }

  if (host === "player.vimeo.com") {
    const pathParts = url.pathname.split("/").filter(Boolean);
    const id = pathParts[0] === "video" ? pathParts[1] : null;
    return id ? { provider: "vimeo", embedUrl: `https://player.vimeo.com/video/${id}` } : null;
  }

  if (host === "tiktok.com" || host.endsWith(".tiktok.com")) {
    const pathParts = url.pathname.split("/").filter(Boolean);
    const videoIndex = pathParts.indexOf("video");
    const id = videoIndex >= 0 ? pathParts[videoIndex + 1] : null;

    return id ? { provider: "tiktok", embedUrl: `https://www.tiktok.com/embed/v2/${id}` } : null;
  }

  return null;
}
