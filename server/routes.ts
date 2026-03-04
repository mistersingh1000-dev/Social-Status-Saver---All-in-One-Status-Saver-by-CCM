import type { Express, Request, Response } from "express";
import { createServer, type Server } from "node:http";

const ALLOWED_HOSTS = new Set([
  "instagram.com",
  "www.instagram.com",
  "instagr.am",
  "facebook.com",
  "www.facebook.com",
  "m.facebook.com",
  "web.facebook.com",
  "fb.watch",
  "fb.com",
  "www.fb.com",
  "snapchat.com",
  "www.snapchat.com",
  "story.snapchat.com",
  "t.snapchat.com",
]);

const MAX_DOWNLOAD_SIZE = 50 * 1024 * 1024;
const FETCH_TIMEOUT = 15000;

function isAllowedUrl(urlStr: string): boolean {
  try {
    const parsed = new URL(urlStr);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
      return false;
    }
    const hostname = parsed.hostname.toLowerCase();
    if (ALLOWED_HOSTS.has(hostname)) return true;
    for (const allowed of ALLOWED_HOSTS) {
      if (hostname.endsWith("." + allowed)) return true;
    }
    return false;
  } catch {
    return false;
  }
}

function detectPlatform(urlStr: string): string {
  const lower = urlStr.toLowerCase();
  if (lower.includes("instagram.com") || lower.includes("instagr.am"))
    return "instagram";
  if (
    lower.includes("facebook.com") ||
    lower.includes("fb.watch") ||
    lower.includes("fb.com")
  )
    return "facebook";
  if (lower.includes("snapchat.com") || lower.includes("snap.com"))
    return "snapchat";
  return "unknown";
}

export async function registerRoutes(app: Express): Promise<Server> {
  app.post("/api/download", async (req: Request, res: Response) => {
    try {
      const { url } = req.body;

      if (!url || typeof url !== "string") {
        return res.status(400).json({ error: "URL is required" });
      }

      const trimmedUrl = url.trim();

      if (!isAllowedUrl(trimmedUrl)) {
        return res.status(400).json({
          error:
            "URL not supported. Only public Instagram, Facebook, and Snapchat links are allowed.",
        });
      }

      const platform = detectPlatform(trimmedUrl);

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

      let response: globalThis.Response;
      try {
        response = await fetch(trimmedUrl, {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            Accept:
              "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.5",
          },
          redirect: "follow",
          signal: controller.signal,
        });
      } finally {
        clearTimeout(timeout);
      }

      if (!response.ok) {
        return res.status(422).json({
          error: "Could not fetch content from the provided URL",
          status: response.status,
        });
      }

      const contentType = response.headers.get("content-type") || "";

      if (contentType.includes("image/") || contentType.includes("video/")) {
        const isVideo = contentType.includes("video/");
        const ext = isVideo ? "mp4" : "jpg";
        const buffer = await response.arrayBuffer();

        if (buffer.byteLength > MAX_DOWNLOAD_SIZE) {
          return res.status(413).json({ error: "File too large" });
        }

        const base64 = Buffer.from(buffer).toString("base64");
        return res.json({
          success: true,
          platform,
          type: isVideo ? "video" : "image",
          filename: `${platform}_${Date.now()}.${ext}`,
          data: base64,
          contentType,
        });
      }

      const html = await response.text();
      const mediaUrls: string[] = [];

      const ogVideoMatch = html.match(
        /property="og:video(?::secure_url)?"\s+content="([^"]+)"/,
      );
      if (ogVideoMatch) mediaUrls.push(ogVideoMatch[1]);

      const ogImageMatch = html.match(
        /property="og:image"\s+content="([^"]+)"/,
      );
      if (ogImageMatch) mediaUrls.push(ogImageMatch[1]);

      const videoSrcMatch = html.match(/<video[^>]*\ssrc="([^"]+)"/);
      if (videoSrcMatch) mediaUrls.push(videoSrcMatch[1]);

      const metaContentMatch = html.match(
        /content="(https?:\/\/[^"]*(?:\.mp4|\.jpg|\.jpeg|\.png|\.webp)[^"]*)"/gi,
      );
      if (metaContentMatch) {
        for (const m of metaContentMatch) {
          const urlMatch = m.match(/content="([^"]+)"/);
          if (urlMatch) mediaUrls.push(urlMatch[1]);
        }
      }

      const uniqueUrls = [...new Set(mediaUrls)].map((u) =>
        u.replace(/&amp;/g, "&"),
      );

      if (uniqueUrls.length === 0) {
        return res.status(422).json({
          error:
            "No downloadable media found. The content may be private or require authentication.",
          platform,
        });
      }

      const mediaUrl = uniqueUrls[0];

      try {
        const mediaController = new AbortController();
        const mediaTimeout = setTimeout(
          () => mediaController.abort(),
          FETCH_TIMEOUT,
        );

        let mediaResponse: globalThis.Response;
        try {
          mediaResponse = await fetch(mediaUrl, {
            headers: {
              "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
              Referer: trimmedUrl,
            },
            redirect: "follow",
            signal: mediaController.signal,
          });
        } finally {
          clearTimeout(mediaTimeout);
        }

        if (!mediaResponse.ok) {
          return res.json({
            success: true,
            platform,
            type:
              mediaUrl.includes(".mp4") || mediaUrl.includes("video")
                ? "video"
                : "image",
            directUrl: mediaUrl,
            filename: `${platform}_${Date.now()}.${mediaUrl.includes(".mp4") ? "mp4" : "jpg"}`,
          });
        }

        const mediaContentType =
          mediaResponse.headers.get("content-type") || "";
        const isVideo =
          mediaContentType.includes("video") || mediaUrl.includes(".mp4");
        const ext = isVideo ? "mp4" : "jpg";
        const buffer = await mediaResponse.arrayBuffer();

        if (buffer.byteLength > MAX_DOWNLOAD_SIZE) {
          return res.status(413).json({ error: "File too large" });
        }

        const base64 = Buffer.from(buffer).toString("base64");
        return res.json({
          success: true,
          platform,
          type: isVideo ? "video" : "image",
          filename: `${platform}_${Date.now()}.${ext}`,
          data: base64,
          contentType: mediaContentType,
        });
      } catch {
        return res.json({
          success: true,
          platform,
          type: mediaUrl.includes(".mp4") ? "video" : "image",
          directUrl: mediaUrl,
          filename: `${platform}_${Date.now()}.${mediaUrl.includes(".mp4") ? "mp4" : "jpg"}`,
        });
      }
    } catch (err) {
      console.error("Download error:", err);
      return res.status(500).json({
        error: "Failed to process download request",
      });
    }
  });

  app.get("/api/health", (_req: Request, res: Response) => {
    res.json({ status: "ok", timestamp: Date.now() });
  });

  const httpServer = createServer(app);
  return httpServer;
}
