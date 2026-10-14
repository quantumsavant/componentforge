// ComponentForge agent core
// Talks to NVIDIA open models (Nemotron family) through Nebius Token Factory.
// Token Factory is OpenAI-compatible: same chat-completions shape, different base URL.

import OpenAI from "openai";

const BASE_URL = process.env.NEBIUS_BASE_URL || "https://api.tokenfactory.nebius.com/v1";
const MODEL = process.env.NEBIUS_MODEL || "";

const client = new OpenAI({
  baseURL: BASE_URL,
  apiKey: process.env.NEBIUS_API_KEY || "missing",
});

const JSON_CONTRACT = `
OUTPUT CONTRACT (follow exactly):
- Respond with ONLY a single JSON object. No markdown fences, no commentary.
- Shape: {"componentName": "PascalCaseName", "code": "<complete component source>", "explanation": "<one short sentence>"}
- "code" rules:
  - A single self-contained React function component. NO import statements, NO export statements.
  - Use ONLY React and Tailwind CSS utility classes (Tailwind is loaded in the preview).
  - NO external images, fonts, or network calls. Use CSS gradients and shapes for visuals.
  - Must render meaningfully with zero props. Keep interactivity with useState where it helps.
  - Small helper sub-components inside the same code string are fine.`;

const SYSTEM_BASE = `You are ComponentForge, an expert front-end coding agent that turns plain-English descriptions into production-quality React components.
${JSON_CONTRACT}

QUALITY BAR:
- Modern, polished, responsive design with realistic placeholder content.
- Clean spacing, good typography, subtle shadows and rounded corners.
- Prefer a premium dark aesthetic unless the user asks otherwise.`;

const SYSTEM_ITERATE = `You are ComponentForge, an expert front-end coding agent.
You are given the CURRENT component code. Apply the user's change request precisely,
keep everything else identical, and return the FULL updated component.
${JSON_CONTRACT}`;

const SYSTEM_FIX = `You are ComponentForge, an expert front-end debugging agent.
You are given component code that crashed in the preview, plus the error message.
Fix the bug with the smallest change that makes it render, and return the FULL fixed component.
${JSON_CONTRACT}`;

/**
 * Call Token Factory. Nemotron reasoning models often put the answer in
 * `reasoning_content` while `content` comes back empty — handle both.
 * They also don't support tool/function calling, so we ask for raw JSON in the prompt.
 */
async function callForge(messages) {
  if (process.env.MOCK_MODE === "true") return mockComponent();
  if (!process.env.NEBIUS_API_KEY) {
    const err = new Error("NEBIUS_API_KEY is not set. Copy server/.env.example to server/.env and add your Token Factory key.");
    err.status = 503;
    throw err;
  }
  if (!MODEL) {
    const err = new Error("NEBIUS_MODEL is not set. Copy the exact model id (e.g. nvidia/nemotron-*) from the Token Factory playground into server/.env.");
    err.status = 503;
    throw err;
  }

  const res = await client.chat.completions.create({
    model: MODEL,
    messages,
    temperature: 0.6,
    max_tokens: 6000,
  });

  const msg = res?.choices?.[0]?.message || {};
  const raw =
    (msg.content && msg.content.trim()) ||
    (msg.reasoning_content && msg.reasoning_content.trim()) ||
    "";

  if (!raw) throw new Error("Model returned an empty response. Try again or switch model.");

  return {
    component: extractJSON(raw),
    model: MODEL,
    usage: res.usage || null,
  };
}

function extractJSON(raw) {
  let text = raw.trim().replace(/^```(?:json)?/i, "").replace(/```\s*$/, "").trim();
  try {
    return JSON.parse(text);
  } catch {
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start !== -1 && end > start) return JSON.parse(text.slice(start, end + 1));
    throw new Error("Model did not return valid JSON. Try rephrasing the prompt.");
  }
}

export function getStatus() {
  return {
    model: MODEL || null,
    keyConfigured: !!process.env.NEBIUS_API_KEY,
    mockMode: process.env.MOCK_MODE === "true",
    baseURL: BASE_URL,
  };
}

/**
 * MOCK_MODE=true → no API key, no credits spent. Returns a canned component so the
 * whole UI + preview + iterate + auto-fix loop can be built and tested for free.
 * Flip it off and add a real key when doing final integration and the demo video.
 */
function mockComponent() {
  const code = `function MockPricing() {
  const tiers = [
    { name: "Starter", price: "₹499", features: ["1 AI reel", "2 thumbnails", "Email support"] },
    { name: "Growth", price: "₹1,499", features: ["5 AI reels", "10 creatives", "Priority support"], hot: true },
    { name: "Scale", price: "₹4,999", features: ["Unlimited reels", "Brand kit", "Dedicated manager"] }
  ];
  return (
    <div className="min-h-screen bg-zinc-950 text-white p-8">
      <h1 className="text-3xl font-bold text-center mb-2">Simple pricing</h1>
      <p className="text-zinc-400 text-center mb-8">Mock output — connect a real API key for AI generation.</p>
      <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {tiers.map((t) => (
          <div key={t.name} className={"rounded-2xl p-6 border " + (t.hot ? "border-lime-400 bg-zinc-900 scale-105" : "border-zinc-800 bg-zinc-900/50")}>
            {t.hot && <span className="text-xs font-bold bg-lime-400 text-black px-2 py-1 rounded-full">POPULAR</span>}
            <h2 className="text-xl font-semibold mt-2">{t.name}</h2>
            <p className="text-3xl font-bold my-4">{t.price}<span className="text-sm text-zinc-500">/mo</span></p>
            <ul className="space-y-2 text-sm text-zinc-300">
              {t.features.map((f) => <li key={f}>✓ {f}</li>)}
            </ul>
            <button className={"w-full mt-6 py-2 rounded-xl font-semibold " + (t.hot ? "bg-lime-400 text-black" : "bg-zinc-800 text-white")}>Choose</button>
          </div>
        ))}
      </div>
    </div>
  );
}`;
  return {
    component: {
      componentName: "MockPricing",
      code,
      explanation: "Mock mode — connect a real API key for AI generation.",
    },
    model: "mock",
    usage: null,
  };
}

export function generateComponent(prompt) {
  return callForge([
    { role: "system", content: SYSTEM_BASE },
    { role: "user", content: `Build this component:\n\n${prompt}` },
  ]);
}

export function iterateComponent(previousCode, instruction) {
  return callForge([
    { role: "system", content: SYSTEM_ITERATE },
    {
      role: "user",
      content: `CURRENT CODE:\n${previousCode}\n\nCHANGE REQUEST:\n${instruction}`,
    },
  ]);
}

export function fixComponent(code, error) {
  return callForge([
    { role: "system", content: SYSTEM_FIX },
    {
      role: "user",
      content: `BROKEN CODE:\n${code}\n\nPREVIEW ERROR:\n${error}\n\nFix it and return the full working component.`,
    },
  ]);
}
