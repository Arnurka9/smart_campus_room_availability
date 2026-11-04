import { test, expect, describe } from 'vitest';
import { checkAvailability } from './utils';
import type { Booking, Room } from './types';

// Test Data Builder: a valid, free room by default; each test overrides only what it varies.
function buildRoom(overrides: Partial<Room> = {}): Room {
  return {
    id: 'test-room',
    name: 'Room 101',
    building: 'Test Building',
    capacity: 30,
    blocked: false,
    bookings: [
      { id: 'b1', title: 'Existing', start: 600, end: 660, organizer: 'Prof. Smith' },
    ],
    ...overrides,
  };
}

interface CanBookArgs extends Partial<Room> {
  start: number;
  end: number;
  now?: number;
}

function canBook({ start, end, now = 540, ...overrides }: CanBookArgs): boolean {
  return checkAvailability(buildRoom(overrides), start, end, now).available;
}

describe('checkAvailability — AC1: interval validity & start after now', () => {
  test('T02: start == now (540) is rejected', () => {
    expect(canBook({ start: 540, end: 570 })).toBe(false);
  });

  test('T03: zero-duration interval (start == end) is rejected', () => {
    expect(canBook({ start: 720, end: 720 })).toBe(false);
  });

  test('T04: reversed interval (start > end) is rejected', () => {
    expect(canBook({ start: 750, end: 720 })).toBe(false);
  });

  test('T05: end past day end (1441) is rejected', () => {
    expect(canBook({ start: 1380, end: 1441 })).toBe(false);
  });

  test('T17: negative start (-10) is rejected', () => {
    expect(canBook({ start: -10, end: 60 })).toBe(false);
  });

  test('T16: minimum valid 1-minute duration in the future is accepted', () => {
    expect(canBook({ start: 700, end: 701 })).toBe(true);
  });

  test('T18: booking ending exactly at day end (1440) is accepted', () => {
    expect(canBook({ start: 1320, end: 1440 })).toBe(true);
  });
});

describe('checkAvailability — AC2: max 120-minute duration', () => {
  test('T06: exactly 120 minutes is accepted', () => {
    expect(canBook({ start: 720, end: 840 })).toBe(true);
  });

  test('T07: 121 minutes is rejected', () => {
    expect(canBook({ start: 720, end: 841 })).toBe(false);
  });
});

describe('checkAvailability — AC3: blocked room', () => {
  test('T13: blocked room is rejected even with valid interval', () => {
    expect(canBook({ start: 660, end: 720, blocked: true })).toBe(false);
  });
});

describe('checkAvailability — AC4: overlap detection (touching allowed)', () => {
  test('T01: touching after existing booking (660-720) is accepted', () => {
    expect(canBook({ start: 660, end: 720 })).toBe(true);
  });

  test('T08: touching before existing booking (570-600) is accepted', () => {
    expect(canBook({ start: 570, end: 600 })).toBe(true);
  });

  test('T09: partial overlap (630-690 vs 600-660) is rejected', () => {
    expect(canBook({ start: 630, end: 690 })).toBe(false);
  });

  test('T10: completely contains existing booking (570-690) is rejected', () => {
    expect(canBook({ start: 570, end: 690 })).toBe(false);
  });

  test('T11: completely inside existing booking (615-645) is rejected', () => {
    expect(canBook({ start: 615, end: 645 })).toBe(false);
  });

  test('T12: identical interval to existing booking (600-660) is rejected', () => {
    expect(canBook({ start: 600, end: 660 })).toBe(false);
  });

  test('T14: valid future interval (630-690) is accepted when bookings list is empty', () => {
    expect(canBook({ start: 630, end: 690, bookings: [] })).toBe(true);
  });
});

describe('checkAvailability — AC5: no mutation of booking data', () => {
  test('T15: bookings array is unchanged after both valid and conflicting checks', () => {
    const bookings: Booking[] = [
      { id: 'b1', title: 'Existing', start: 600, end: 660, organizer: 'Prof. Smith' },
    ];
    const snapshot = JSON.parse(JSON.stringify(bookings));

    const room = buildRoom({ bookings });
    const validResult = checkAvailability(room, 660, 720, 540);
    const conflictResult = checkAvailability(room, 630, 690, 540);

    expect(validResult.available).toBe(true);
    expect(conflictResult.available).toBe(false);
    expect(bookings).toEqual(snapshot);
    expect(room.bookings).toEqual(snapshot);
  });
});

describe('checkAvailability — AC6: clear validation issues without crashing', () => {
  test('rejected interval produces exact past-start issue code and message', () => {
    const room = buildRoom();
    const result = checkAvailability(room, 540, 570, 540);
    expect(result.available).toBe(false);
    expect(result.issues.map((i) => i.code)).toContain('past-start');
    expect(result.issues[0].message.length).toBeGreaterThan(0);
  });

  test('null room does not crash and returns exact no-room issue code', () => {
    const result = checkAvailability(null, 660, 720, 540);
    expect(result.available).toBe(false);
    expect(result.issues.map((i) => i.code)).toEqual(['no-room']);
  });

  test('multiple violations produce exact distinct issue codes (past-start, too-long, overlap)', () => {
    const room = buildRoom();
    const result = checkAvailability(room, 540, 670, 540);
    expect(result.available).toBe(false);
    const codes = result.issues.map((i) => i.code);
    expect(codes).toEqual(['past-start', 'too-long', 'overlap']);
  });

  test('available result has zero issues', () => {
    const room = buildRoom();
    const result = checkAvailability(room, 660, 720, 540);
    expect(result.available).toBe(true);
    expect(result.issues).toEqual([]);
  });
});