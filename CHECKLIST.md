# Signup checklist — do these first (all need your login, ~30 min)

- [ ] **Devpost account** → open https://nebiusglobalaihackathon.devpost.com/ → click Register / Join the hackathon.
- [ ] **Participant credits** → on the hackathon page, open the **Resources** tab and claim/request the Token Factory credits. Do this early — don't burn your own money testing.
- [ ] **Token Factory account** → create it from the link in Resources → generate an **API key**.
- [ ] **Pick your model** → open the Token Factory **playground**, run one test prompt, and copy the **exact** model id (something like `nvidia/nemotron-…`). Model ids change; never guess — copy verbatim.
- [ ] **Wire it up** → in `server/`: `cp .env.example .env`, paste `NEBIUS_API_KEY` and `NEBIUS_MODEL`.
- [ ] **First run** → terminal 1: `cd server && npm run dev`; terminal 2: `cd client && npm run dev` → open http://localhost:5173 → try *"a dark pricing section with 3 tiers"*.
- [ ] **GitHub** → when ready, push to a **public** repo (submission requires public + an open-source license — MIT is already included).

Gotchas already handled in the code, so you don't have to think about them:
- Nemotron reasoning models often return the answer in `reasoning_content` with empty `content` — `server/src/agent.js` reads both.
- No tool/function calling on these models — the agent contract asks for raw JSON in the prompt instead.
