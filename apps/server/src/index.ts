import "./env"; // must be first — loads .env before any other module reads process.env
import express from "express";
import cors from "cors";
import { createServer } from "http";
import { WebSocketServer } from "ws";
import { setupWSConnection } from "y-websocket/bin/utils";
import inviteRouter from "./routes/invite";
import shareLinkRouter from "./routes/shareLinks";
import docsRouter from "./routes/docs";
import acceptInviteRouter from "./routes/acceptInvite";

const app = express();
app.use(cors({ origin: process.env.WEB_ORIGIN ?? "http://localhost:3000", credentials: true }));
app.use(express.json());

app.use("/api/invite", inviteRouter);
app.use("/api/invite/accept", acceptInviteRouter);
app.use("/api/share-links", shareLinkRouter);
app.use("/api/docs", docsRouter);

app.get("/health", (_req, res) => res.json({ ok: true }));

// Global error handler — the last stop for anything that reaches here via
// asyncHandler's next(err), or any synchronous throw in a non-async route.
// Without this, Express's default behavior for unhandled errors can still
// vary; being explicit means every failure becomes a clean 500 response
// instead of ever risking the process going down.
app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("[server] Unhandled route error:", err);
  if (res.headersSent) return;
  res.status(500).json({ error: "Something went wrong on our end." });
});

// Last-resort safety net: if something still throws or rejects outside of
// Express's request/response cycle entirely (a stray promise, a timer
// callback, etc.), log it instead of letting Node terminate the process —
// keeping the sync server and every other in-flight connection alive.
process.on("unhandledRejection", (reason) => {
  console.error("[server] Unhandled promise rejection:", reason);
});
process.on("uncaughtException", (err) => {
  console.error("[server] Uncaught exception:", err);
});

const httpServer = createServer(app);

// The Yjs sync layer rides on its own WebSocket server on the same port,
// upgrading only /sync requests so it doesn't clash with the REST API.
const wss = new WebSocketServer({ noServer: true });

wss.on("connection", (ws, req) => {
  // docId comes from the URL path, e.g. ws://host:port/my-doc-id
  setupWSConnection(ws, req);
});

httpServer.on("upgrade", (req, socket, head) => {
  wss.handleUpgrade(req, socket, head, (ws) => {
    wss.emit("connection", ws, req);
  });
});

const PORT = process.env.PORT ?? 4000;
httpServer.listen(PORT, () => {
  console.log(`Sync + API server listening on :${PORT}`);
});
