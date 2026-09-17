import http from "http";
import { InMemorySessionRegistry } from "../modules/session/infrastructure/registry/in-memory-session.registry";

export function createHttpHandler(sessionRegistry: InMemorySessionRegistry) {
  return (req: http.IncomingMessage, res: http.ServerResponse) => {
    // CORS headers
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, x-internal-secret");

    if (req.method === "OPTIONS") {
      res.writeHead(204);
      res.end();
      return;
    }

    // Health check endpoint
    if (req.url === "/health" || req.url === "/") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          status: "ok",
          service: "ai-interview-modular-monolith",
          architecture: "Clean Architecture / DDD with LangGraph Multi-Agent Reasoning",
          activeSessions: sessionRegistry.getActiveCount(),
          uptime: process.uptime(),
          timestamp: new Date().toISOString(),
        })
      );
      return;
    }

    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Not Found" }));
  };
}
