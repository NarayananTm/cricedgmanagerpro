import "dotenv/config";
import express from "express";
import path from "node:path";
import { isServerless } from "./src/server/services/runtimeConfig";
import { setEventPublisher } from "./src/server/services/eventService";
import { initializeDatabase } from "./src/server/models/databaseModel";
import { registerApiRoutes } from "./src/server/routes";

export const app = express();
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});
if (isServerless) {
  app.use((req, _res, next) => {
    if (!req.url.startsWith("/api") && !req.url.startsWith("/assets")) req.url = "/api" + (req.url.startsWith("/") ? req.url : "/" + req.url);
    next();
  });
}
app.use((req, res, next) => {
  console.log("[REQUEST]", req.method, req.path);
  const originalJson = res.json;
  res.json = function(body) {
    console.log("[RESPONSE]", req.method, req.path, res.statusCode);
    return originalJson.call(this, body);
  };
  next();
});

const databaseReady = initializeDatabase().then(
  () => true,
  (error) => {
    console.error("Database initialization failed:", error?.code || "unexpected_error");
    return false;
  },
);
app.use("/api", (req, res, next) => {
  databaseReady.then((ready) => ready ? next() : res.status(503).json({ error: "Database unavailable" }));
});

registerApiRoutes(app);
app.use((err: any, _req: any, res: any, _next: any) => {
  console.error("API request failed:", err?.code || "unexpected_error");
  if (res.headersSent) return;
  res.status(err?.status === 400 ? 400 : 500).json({ error: err?.status === 400 ? "Invalid request" : "Internal server error" });
});

  async function startStandaloneServer() {
    const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

    const server = app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });

    server.on("error", (e: any) => {
      if (e.code === 'EADDRINUSE') {
        console.error(`[SERVER ERROR] Port ${PORT} is already in use. Set PORT=3001 or free up port ${PORT}.`);
      } else {
        console.error("[SERVER ERROR]", e);
      }
    });

    try {
      const { WebSocketServer } = await import("ws");
      const wss = new WebSocketServer({ server });
      const clients = new Set<any>();

      wss.on("connection", (ws) => {
        clients.add(ws);
        ws.on("close", () => clients.delete(ws));
      });

      setEventPublisher((data: unknown) => {
        const message = JSON.stringify(data);
        clients.forEach((client) => {
          if (client.readyState === 1) { // WebSocket.OPEN
            client.send(message);
          }
        });
      });
    } catch (wsErr) {
      console.warn("WebSocket initialization warning:", wsErr);
    }

    // Vite middleware for development
    if (process.env.NODE_ENV !== "production") {
      const { createServer: createViteServer } = await import("vite");
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.use(vite.middlewares);
    } else {
      const distPath = path.join(process.cwd(), "dist");
      app.use(express.static(distPath));
      app.get("*", (req, res) => {
        res.sendFile(path.join(distPath, "index.html"));
      });
    }
  }

  // Only start HTTP listener if not running in a serverless environment like Vercel
  if (!isServerless) {
    startStandaloneServer().catch(err => {
      console.error("Failed to start standalone server:", err);
    });
  }




export default app;
