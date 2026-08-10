const express = require("express");
const { Mrrowisp } = require("mrrowisp");
const path = require("path");
const http = require("http");

const app = express();
const PORT = process.env.PORT || 3000;

// ---- Wisp Server (replaces old TOMP bare server) ----
const wisp = new Mrrowisp({
  port: 6001,
  logLevel: "none",
  allowTCP: true,
  allowUDP: false,
  enableV2: true,
  websocketPermessageDeflate: false,
  allowDirectIP: true,
  allowPrivateIPs: false,
  allowLoopbackIPs: true,
  parseRealIP: true,
  trustedHeaders: ["CF-Connecting-IP", "X-Forwarded-For"],
  whitelist: { ports: [80, 443] },
  connectionsLimitPerIP: 64,
  connectionWindowSeconds: 10,
  tcpBufferSize: 458752,
  bufferRemainingLength: 458752,
  tcpNoDelay: true,
  maxMessageSize: 28 * 1024 * 1024,
  passwordAuth: false,
  floodProtection: {
    enabled: true,
    maxConnectsPerSourceIPPerSecond: 60,
    maxConnectsPerDestPerSecond: 150,
    maxConnectsPerDestPerMinute: 3000,
    maxInFlightSyns: 768,
    maxConcurrentStreamsPerConnection: 1024,
    maxConcurrentConnections: 6144,
  },
});

wisp.start(1);

// ---- Resolve package directories (exports restrict direct subpath requires) ----
const bareMuxDir = path.dirname(require.resolve("@mercuryworkshop/bare-mux"));
const epoxyDir = path.dirname(require.resolve("@mercuryworkshop/epoxy-transport"));

// ---- Serve bare-mux dist (worker.js, index.mjs, etc.) ----
app.use("/baremux", express.static(bareMuxDir, {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith(".mjs")) {
      res.setHeader("Content-Type", "text/javascript");
    }
  },
}));

// ---- Serve epoxy transport dist ----
app.use("/epoxy", express.static(epoxyDir, {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith(".mjs")) {
      res.setHeader("Content-Type", "text/javascript");
    }
  },
}));

// ---- Serve ALL static files from public/ (including UV files) ----
// UV files (sw.js, uv.bundle.js, uv.config.js, uv.sw.js, uv.handler.js, uv.client.js)
// are committed to public/ from the v3.2.10-headers GitHub release.
// Do NOT use express.static(uvPath) — that would serve from node_modules which
// may be cached as the old npm version on Render.
const publicDir = path.join(__dirname, "..", "..", "public");
app.use(express.static(publicDir));

// ---- Fallback: serve index.html ----
app.get("*", (req, res) => {
  res.sendFile(path.join(publicDir, "index.html"));
});

// ---- HTTP server with Wisp WebSocket upgrade handling ----
const server = http.createServer((req, res) => {
  app(req, res);
});

server.on("upgrade", (req, socket, head) => {
  const url = req.url || "";
  if (url.startsWith("/wisp/")) {
    wisp.route(req, socket, head);
    return;
  }
  socket.end();
});

server.listen(PORT, () => {
  console.log(`🍂 The Void Proxy is running on port ${PORT}`);
  console.log(`🌑 Wisp server mounted at /wisp/`);
  console.log(`📦 UV + bare-mux + epoxy served from public/ and node_modules`);
});
