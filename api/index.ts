import app from "../server";

export default function handler(req: any, res: any) {
  // On Vercel, when rewriting /api/(.*) -> /api, the actual request path is sent in x-matched-path or x-forwarded-uri
  const matchedPath =
    (req.headers["x-matched-path"] as string) ||
    (req.headers["x-forwarded-uri"] as string) ||
    (req.headers["x-original-url"] as string);

  if (matchedPath && matchedPath.startsWith("/api") && req.url !== matchedPath) {
    req.url = matchedPath;
  } else if (req.url && !req.url.startsWith("/api") && !req.url.startsWith("/assets")) {
    req.url = "/api" + (req.url.startsWith("/") ? req.url : "/" + req.url);
  }

  return app(req, res);
}
