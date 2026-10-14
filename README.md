# ComponentForge

**Prompt → React component, live.** A coding agent for the
[Nebius x NVIDIA Global AI Hackathon](https://nebiusglobalaihackathon.devpost.com/)
(Coding & Agentic Engineering track).

Describe a UI in plain English. An NVIDIA Nemotron model running on
**Nebius Token Factory** writes the React + Tailwind component, the app renders it
live in a sandboxed preview, and you iterate by chatting. If the preview crashes,
the agent reads the error and auto-fixes the code — a real write → run → test loop.

## How it works

```
you: "a dark pricing section with 3 tiers"
        │
        ▼
┌─ agent (Nemotron via Token Factory) ─┐
│ system prompt: strict JSON contract  │
│ { componentName, code, explanation }  │
│ handles reasoning_content fallback   │
└──────────────┬───────────────────────┘
               ▼
┌─ preview (sandboxed iframe) ─────────┐
│ Babel compiles JSX in-frame          │
│ React 18 UMD + Tailwind CDN render   │
│ runtime errors → postMessage → parent │
└──────────────┬───────────────────────┘
               ▼
   iterate ("make tier 2 lime") or auto-fix on error
```

## Tech

- **Client:** React 18 + Vite + Tailwind CSS v4
- **Server:** Node + Express, OpenAI-compatible client pointed at Token Factory
- **Model:** any `nvidia/nemotron-*` id from the Token Factory catalog (set via env)
- **Preview:** sandboxed iframe, Babel standalone, no build step for generated code

## Quickstart

```bash
# 1. server
cd server
cp .env.example .env
# edit .env → NEBIUS_API_KEY + NEBIUS_MODEL (exact id from the Token Factory playground)
npm install
npm run dev          # → http://localhost:8787

# 2. client (new terminal)
cd client
npm install
npm run dev          # → http://localhost:5173 (proxies /api to the server)
```

Open http://localhost:5173, type a component description, hit **Generate**.

## Env vars (server/.env)

| Var | Required | What |
|---|---|---|
| `NEBIUS_API_KEY` | yes | Token Factory API key |
| `NEBIUS_MODEL` | yes | Exact model id, e.g. `nvidia/nemotron-3-super-120b-a12b` — copy verbatim from the playground, don't guess |
| `NEBIUS_BASE_URL` | no | Defaults to `https://api.tokenfactory.nebius.com/v1` |
| `PORT` | no | Defaults to `8787` |

## API

- `GET /api/health` → `{ ok, model, keyConfigured }`
- `POST /api/generate` `{ prompt, previousCode? }` → `{ component, model, usage }`
- `POST /api/fix` `{ code, error }` → `{ component, model, usage }`
- In production the server also serves `client/dist` (single-origin deploy).

## Hackathon requirement mapping

- Runs on **Nebius Token Factory** (OpenAI-compatible inference, no GPU provisioning)
- Uses **≥1 NVIDIA open-source model** (Nemotron family) for every code-writing step
- Track fit: a coding agent that **writes, runs, and tests** code in the preview loop

## License

MIT — see [LICENSE](LICENSE).
