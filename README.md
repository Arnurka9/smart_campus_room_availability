# Smart Campus Room Availability Checker

Software Engineering, Assignment #04 (AI-assisted software evolution, refactoring and quality improvement).

A small React + TypeScript + Vite + Tailwind app that checks whether a campus room is free for a chosen time interval. All data is fictional and local: no login, payments, database or external APIs.

## Versions (Git commit references)

- **Initial version** (before equipment, filtering and refactoring; monolithic `checkAvailability` and `App.tsx`; 22 tests):
  https://github.com/Arnurka9/smart_campus_room_availability/commit/09b256f8862af94997430796c39f785c4c6dec1a
- **Final version** (room catalog with filters, refactored modules, 61 tests):
  https://github.com/Arnurka9/smart_campus_room_availability/commit/4154af7ee3e72688e831ecca56df99c7edb75a55

## Setup

Requires Node.js 18 or newer.

```bash
npm install
```

## Run

```bash
npm run dev        # start the dev server (Vite)
npm run build      # production build
npm run typecheck  # tsc --noEmit -p tsconfig.app.json
```

## Test

```bash
npx vitest run
```

Expected result on the final version: 4 test files passed, **61 tests passed (61)**.

| File | Tests | Covers |
|---|---|---|
| `src/booking.test.ts` | 22 | Original regression tests AC1–AC6 (including 120 vs 121 minutes, touching vs overlapping intervals) |
| `src/filter.test.ts` | 11 | F1 capacity filter (exact vs insufficient capacity), F2 equipment filter (AND), `collectEquipment` |
| `src/utils.test.ts` | 17 | `validateInterval`, `hasOverlap`, `overlaps`, `parseTimeField`, F3 blocked room |
| `src/integration.test.tsx` | 11 | F4 empty state, F5 room switching (hook), UI flow: select room, check availability, result |

The integration tests run in jsdom (`@testing-library/react`).

## Rules

Baseline (must keep working):

- AC1: reject start >= end and requests starting in the past (fixed campus time: 10:00 AM).
- AC2: reject durations longer than 120 minutes.
- AC3: a blocked room cannot be booked.
- AC4: reject overlaps; bookings that only touch at endpoints are allowed.
- AC5/AC6: booking data is never mutated; clear responsive feedback.

New in the final version:

- F1: capacity filter (room capacity >= requested attendees).
- F2: equipment filter (room must contain ALL selected items).
- F3: a blocked room is never reported as available.
- F4: clear empty state with a "Reset filters" button when no room matches.
- F5: changing the selected room (or time, or filters) clears the previous result; the check uses the selected room's own bookings.

## Project structure (final version)

```
src/
  data.ts                        fictional catalog: 5 rooms with equipment and bookings
  types.ts                       Room, Booking, FilterCriteria, ValidationIssue
  utils.ts                       time helpers, validateInterval (AC1, AC2), hasOverlap (AC4),
                                 checkAvailability (composition: AC3 + selected room's bookings)
  filter.ts                      filterRooms, matchesCriteria, collectEquipment (F1, F2)
  hooks/useAvailabilitySession.ts  session state and the single result-invalidation rule (F5)
  components/                    RoomFilterBar, RoomList, EmptyState, RoomCard,
                                 AvailabilityResult, TimeField
  App.tsx                        composes the components
```

## Known limitations

- The time-range label (`minutesToLabel(a)–minutesToLabel(b)`) is still formatted in three places (`utils.ts`, `AvailabilityResult.tsx`, `RoomCard.tsx`), and the duration (`end - start`) is computed in both `App.tsx` and `utils.ts`.
- `useAvailabilitySession` imports `ROOMS` directly from `@/data`, so the hook and the integration tests depend on the fixture data.
- The current campus time is hardcoded (`useState(600)` in `App.tsx`).
- Automated tests do not check the responsive layout; it was checked manually.

## AI use

Bolt was used to implement the changes; Claude was used to draft prompts and to compare the initial and final code. Selected prompts, outputs, decisions and verification are in the AI evidence appendix of the report.