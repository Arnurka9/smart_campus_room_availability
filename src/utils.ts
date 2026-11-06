import type { Booking, Room, ValidationIssue } from './types';

export const MINUTES_PER_DAY = 1440;
export const MAX_BOOKING_MINUTES = 120;

export function minutesToLabel(min: number): string {
  if (min <= 0) return '12:00 AM';
  if (min >= MINUTES_PER_DAY) return '12:00 AM (next day)';
  const h = Math.floor(min / 60);
  const m = min % 60;
  const period = h < 12 ? 'AM' : 'PM';
  const displayH = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${displayH}:${m.toString().padStart(2, '0')} ${period}`;
}

export function timeToMinutes(time: string): number | null {
  if (!time) return null;
  const [h, m] = time.split(':').map((n) => parseInt(n, 10));
  if (isNaN(h) || isNaN(m)) return null;
  return h * 60 + m;
}

export function minutesToTime(min: number): string {
  const clamped = Math.max(0, Math.min(MINUTES_PER_DAY, min));
  const h = Math.floor(clamped / 60) % 24;
  const m = clamped % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

// Single source of truth for converting a time input field to minutes.
// Empty/invalid input collapses to 0 so live feedback never sees NaN.
export function parseTimeField(time: string): number {
  return timeToMinutes(time) ?? 0;
}

export function overlaps(a: { start: number; end: number }, b: { start: number; end: number }): boolean {
  return a.start < b.end && b.start < a.end;
}

export function pastStartIssue(start: number, currentTime: number): ValidationIssue | undefined {
  if (start > currentTime) return undefined;
  return {
    code: 'past-start',
    message: `Start must be after ${minutesToLabel(currentTime)} (current campus time).`,
  };
}

// AC1 (interval validity + start after current time) and AC2 (max 120 minutes).
export function validateInterval(start: number, end: number, currentTime: number): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (start < 0 || end > MINUTES_PER_DAY || !(start < end)) {
    issues.push({
      code: 'invalid-interval',
      message: 'Start must be earlier than end, and both must be within 00:00–24:00.',
    });
  }
  const pastStart = pastStartIssue(start, currentTime);
  if (pastStart) issues.push(pastStart);

  if (end - start > MAX_BOOKING_MINUTES) {
    issues.push({
      code: 'too-long',
      message: `Bookings cannot exceed ${MAX_BOOKING_MINUTES} minutes. This interval is ${end - start} minutes.`,
    });
  }

  return issues;
}

// AC4: overlap with existing bookings (touching endpoints allowed).
export function hasOverlap(bookings: Booking[], start: number, end: number): Booking | undefined {
  for (const b of bookings) {
    if (overlaps({ start, end }, b)) return b;
  }
  return undefined;
}

export interface CheckResult {
  available: boolean;
  issues: ValidationIssue[];
  conflict?: Booking;
}

// Composition layer: null-room guard, AC1/AC2 via validateInterval,
// AC3 blocked check, AC4 via hasOverlap against the selected room's bookings.
export function checkAvailability(
  room: Room | null,
  start: number,
  end: number,
  currentTime: number,
): CheckResult {
  const issues: ValidationIssue[] = [];

  if (!room) {
    issues.push({ code: 'no-room', message: 'Please select a room to check.' });
    return { available: false, issues };
  }

  issues.push(...validateInterval(start, end, currentTime));

  // AC3: room blocked
  if (room.blocked) {
    issues.push({
      code: 'room-blocked',
      message: room.blockedReason
        ? `${room.name} is unavailable: ${room.blockedReason}`
        : `${room.name} is currently blocked.`,
    });
  }

  // AC4: overlap with the selected room's bookings
  const conflict = hasOverlap(room.bookings, start, end);
  if (conflict) {
    issues.push({
      code: 'overlap',
      message: `Overlaps with "${conflict.title}" (${minutesToLabel(conflict.start)}–${minutesToLabel(conflict.end)}).`,
    });
  }

  return { available: issues.length === 0, issues, conflict };
}
