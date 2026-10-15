import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import {
  generateComponent,
  iterateComponent,
  fixComponent,
  getStatus,
} from "./agent.js";

const app = express();
const PORT = process.env.PORT || 8787;

app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (req, res) => {
  res.json({ ok: true, ...getStatus() });
});

// Body: { prompt, previousCode? } — previousCode set => iterate, otherwise fresh generate
app.post("/api/generate", async (req, res) => {
  try {
    const { prompt, previousCode } = req.body || {};
    if (!prompt || !prompt.trim()) {
      return res.status(400).json({ error: "prompt is required" });
    }
    const result = previousCode
      ? await iterateComponent(previousCode, prompt)
      : await generateComponent(prompt);
    res.json(result);
  } catch (err) {
    console.error("[forge] /api/generate:", err.message);
    res.status(err.status || 500).json({ error: err.message });
  }
});

// Body: { code, error } — agent fixes code that crashed in the preview
app.post("/api/fix", async (req, res) => {
  try {
    const { code, error } = req.body || {};
    if (!code || !error) {
      return res.status(400).json({ error: "code and error are required" });
    }
    res.json(await fixComponent(code, error));
  } catch (err) {
    console.error("[forge] /api/fix:", err.message);
    res.status(err.status || 500).json({ error: err.message });
  }
});

// Serve the built client in production (single-origin deploy)
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(__dirname, "..", "..", "client", "dist");
// Vendored preview libs (React/Babel/Tailwind) so the live preview works offline.
app.use("/vendor", express.static(path.join(__dirname, "..", "vendor")));
app.use(express.static(distDir));
app.use((req, res, next) => {
  if (req.path.startsWith("/api")) return next();
  res.sendFile(path.join(distDir, "index.html"), (err) => {
    if (err) res.status(404).send("Client not built yet. Run `npm run build` in client/.");
  });
});

app.listen(PORT, () => {
  console.log(`[forge] listening on http://localhost:${PORT}`);
  const s = getStatus();
  console.log(`[forge] model=${s.model || "NOT SET"} key=${s.keyConfigured ? "ok" : "MISSING"}`);
});
