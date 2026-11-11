## Project
Smart Campus room availability checker. All data is fictional and local.
The five fictional rooms in src/data.ts are the source of truth.

## Constraints
- No login, no database, no backend, no external APIs, no booking creation.
  Persistence is out of scope unless the user explicitly requests it.
- Preserve AC1-AC6:
  - AC1: reject start >= end and past requests.
  - AC2: reject durations longer than 120 minutes.
  - AC3: reject a blocked room.
  - AC4: reject overlaps; allow bookings touching only at endpoints.
  - AC5-AC6: do not mutate booking data; keep clear desktop/mobile feedback.
- No secrets: never write keys, tokens, or .env values into code, docs, or output. Do not read .env.
- No deployments, publishing, or uploads to third-party services.

## Engineering rules
- Prefer pure functions and minimal changes.
- Do not mutate booking fixtures.
- Do not add, remove, or upgrade packages without asking first.
- Do not edit existing test files unless the task asks for it. Do not change expectations to make tests pass.

## Verification (required before proposing acceptance)
Run and record output for each, in this order:
1. npx vitest run (all tests must pass)
2. npm run typecheck
3. npm run lint
4. npm run build
Report exact pass/fail counts. Do not claim a check passed without its recorded output.
Add focused regression tests for every behavior change.

## Review gate
Propose changes with changed files, rationale, and test output. Wait for user approval before treating a change as accepted.
