# ComponentForge — build plan (Oct 15 → Oct 30)

Deadline: **Oct 30, 10:30 PM IST**. Judging Dec 1–15 (keep the demo live through it).
Budget: ~2–3 focused hours/day — assignments + NSP scholarship share the same week.

## Oct 15 (Thu) — Unblock
- [ ] Devpost account → register for the hackathon
- [ ] Token Factory account → API key → `server/.env` (+ exact `NEBIUS_MODEL` id from the playground)
- [ ] Claim participant credits from the hackathon's Resources tab (do this early)
- [ ] `npm run dev` in server + client → first real generation end-to-end

## Oct 16–17 — Agent hardening
- [ ] Tune system prompts; test 10+ varied prompts, note failure modes
- [ ] Compare models: Nano (fast/cheap) vs Super/Ultra (quality) — pick the demo default
- [ ] Verify `reasoning_content` fallback + JSON extraction against real responses
- [ ] Add per-request cost logging (usage → $) so the demo can show "this cost $0.002"

## Oct 18–19 — Preview & the fix loop
- [ ] Harden the iframe renderer: weird outputs (multiple components, hooks misuse, `export` leakage)
- [ ] Error capture → **Auto-fix** working smoothly end-to-end
- [ ] Loading skeletons + empty states polished

## Oct 20–21 — Iteration UX
- [ ] Multi-turn iteration quality ("make it darker" keeps everything else)
- [ ] Prompt examples that demo well; session history export
- [ ] Mobile responsiveness of the forge UI itself

## Oct 22–23 — Export & docs
- [ ] Copy / Download .jsx (done) → add "open in CodeSandbox" link if time permits
- [ ] README polished; screenshots/GIF for the Devpost page
- [ ] Buffer days for assignment handwriting — don't burn out

## Oct 24–25 — Deploy
- [ ] Deploy server + client (Vercel: client static + serverless, or single-origin Node)
- [ ] Env vars on the host; public demo URL live; test from phone + fresh browser
- [ ] Confirm no API key leaks to the client bundle

## Oct 26–27 — Demo video (≤3 min)
Script: the problem (UI takes too long) → type a prompt → code streams → **live preview**
→ iterate ("highlight tier 2") → break it → **auto-fix** → export .jsx.
- [ ] Record screen + voiceover, upload to YouTube (public or unlisted)

## Oct 28 — Submission writing
- [ ] Devpost write-up: what, why, how (Nemotron + Token Factory usage, concrete)
- [ ] **Feedback on Token Factory/NVIDIA tools** (required submission item — keep notes all along)
- [ ] License check: MIT LICENSE at repo root, README run instructions

## Oct 29 — Dress rehearsal
- [ ] Fresh-machine checklist: clone repo → follow README → working in <10 min
- [ ] Re-read the official rules once; confirm every submission field is filled

## Oct 30 — Ship
- [ ] Submit before **10:30 PM IST**. Then rest.
- [ ] Keep the demo URL + repo live through judging (Dec 1–15).
