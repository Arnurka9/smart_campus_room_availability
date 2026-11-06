import { test, expect, describe } from 'vitest';
import {
  checkAvailability,
  validateInterval,
  hasOverlap,
  parseTimeField,
  timeToMinutes,
  overlaps,
} from './utils';
import type { Booking, Room } from './types';

const booking = (start: number, end: number): Booking => ({
  id: 'b1',
  title: 'Existing',
  start,
  end,
  organizer: 'Prof. Smith',
});

describe('validateInterval — AC1 & AC2 (refactored pure function)', () => {
  test('AC1: start == now → past-start issue', () => {
    const issues = validateInterval(540, 570, 540);
    expect(issues.map((i) => i.code)).toContain('past-start');
  });

  test('AC1: start > end → invalid-interval issue', () => {
    const issues = validateInterval(750, 720, 540);
    expect(issues.map((i) => i.code)).toContain('invalid-interval');
  });

  test('AC2: exactly 120 min → no too-long issue', () => {
    const issues = validateInterval(720, 840, 540);
    expect(issues.map((i) => i.code)).not.toContain('too-long');
  });

  test('AC2: 121 min → too-long issue', () => {
    const issues = validateInterval(720, 841, 540);
    expect(issues.map((i) => i.code)).toContain('too-long');
  });

  test('AC1+AC2 combined: valid future 60-min interval → no issues', () => {
    expect(validateInterval(700, 760, 540)).toEqual([]);
  });
});

describe('hasOverlap — AC4 (refactored pure function)', () => {
  test('AC4: touching after existing booking → no overlap', () => {
    expect(hasOverlap([booking(600, 660)], 660, 720)).toBeUndefined();
  });

  test('AC4: touching before existing booking → no overlap', () => {
    expect(hasOverlap([booking(600, 660)], 570, 600)).toBeUndefined();
  });

  test('AC4: partial overlap → returns conflicting booking', () => {
    expect(hasOverlap([booking(600, 660)], 630, 690)?.id).toBe('b1');
  });

  test('AC4: empty bookings → no overlap', () => {
    expect(hasOverlap([], 630, 690)).toBeUndefined();
  });
});

describe('overlaps — primitive', () => {
  test('overlaps: identical intervals overlap', () => {
    expect(overlaps({ start: 600, end: 660 }, { start: 600, end: 660 })).toBe(true);
  });

  test('overlaps: endpoint-touching intervals do not overlap', () => {
    expect(overlaps({ start: 570, end: 600 }, { start: 600, end: 660 })).toBe(false);
  });
});

describe('parseTimeField — single source of truth', () => {
  test('parseTimeField: valid time → minutes', () => {
    expect(parseTimeField('11:00')).toBe(660);
  });

  test('parseTimeField: empty string → 0 (no NaN)', () => {
    expect(parseTimeField('')).toBe(0);
  });

  test('parseTimeField: invalid string → 0', () => {
    expect(parseTimeField('not-a-time')).toBe(0);
  });

  test('timeToMinutes: valid input returns minutes, invalid returns null', () => {
    expect(timeToMinutes('12:30')).toBe(750);
    expect(timeToMinutes('')).toBeNull();
  });
});

describe('F3: blocked room never shown as available', () => {
  test('F3: blocked room with otherwise-valid future interval → not available', () => {
    const blockedRoom: Room = {
      id: 'blk',
      name: 'Blocked Room',
      building: 'B',
      capacity: 30,
      equipment: [],
      blocked: true,
      blockedReason: 'Maintenance',
      bookings: [],
    };
    const result = checkAvailability(blockedRoom, 700, 760, 540);
    expect(result.available).toBe(false);
    expect(result.issues.map((i) => i.code)).toContain('room-blocked');
  });

  test('F3: blocked room produces room-blocked issue even when interval is invalid', () => {
    const blockedRoom: Room = {
      id: 'blk',
      name: 'Blocked Room',
      building: 'B',
      capacity: 30,
      equipment: [],
      blocked: true,
      bookings: [],
    };
    const result = checkAvailability(blockedRoom, 540, 570, 540);
    expect(result.available).toBe(false);
    expect(result.issues.map((i) => i.code)).toContain('room-blocked');
  });
});
