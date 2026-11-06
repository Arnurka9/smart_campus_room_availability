import { test, expect, describe } from 'vitest';
import { collectEquipment, filterRooms, matchesCriteria } from './filter';
import { ROOMS } from './data';
import type { FilterCriteria, Room } from './types';

function room(overrides: Partial<Room> = {}): Room {
  return {
    id: 'r',
    name: 'R',
    building: 'B',
    capacity: 30,
    equipment: ['Projector', 'Whiteboard'],
    blocked: false,
    bookings: [],
    ...overrides,
  };
}

const noFilters: FilterCriteria = { attendees: 0, equipment: [] };

describe('F1: capacity filter', () => {
  test('F1: capacity == attendees → room shown', () => {
    expect(matchesCriteria(room({ capacity: 30 }), { attendees: 30, equipment: [] })).toBe(true);
  });

  test('F1: capacity > attendees → room shown', () => {
    expect(matchesCriteria(room({ capacity: 40 }), { attendees: 30, equipment: [] })).toBe(true);
  });

  test('F1: capacity < attendees → room hidden', () => {
    expect(matchesCriteria(room({ capacity: 20 }), { attendees: 30, equipment: [] })).toBe(false);
  });

  test('F1: attendees 0 (default) → all rooms shown', () => {
    expect(filterRooms(ROOMS, noFilters)).toHaveLength(ROOMS.length);
  });

  test('F1: high attendee threshold filters out smaller rooms', () => {
    const result = filterRooms(ROOMS, { attendees: 60, equipment: [] });
    for (const r of result) {
      expect(r.capacity).toBeGreaterThanOrEqual(60);
    }
  });
});

describe('F2: equipment filter (strict AND via every)', () => {
  test('F2: room has ALL selected equipment → shown', () => {
    expect(
      matchesCriteria(
        room({ equipment: ['Projector', 'Whiteboard', 'Microphone'] }),
        { attendees: 0, equipment: ['Projector', 'Whiteboard'] },
      ),
    ).toBe(true);
  });

  test('F2: room missing one selected item → hidden', () => {
    expect(
      matchesCriteria(
        room({ equipment: ['Projector'] }),
        { attendees: 0, equipment: ['Projector', 'Whiteboard'] },
      ),
    ).toBe(false);
  });

  test('F2: no equipment selected → equipment does not filter', () => {
    expect(
      matchesCriteria(room({ equipment: [] }), { attendees: 0, equipment: [] }),
    ).toBe(true);
  });

  test('F2: selecting two items hides rooms that have only one', () => {
    const rooms: Room[] = [
      room({ id: 'a', equipment: ['Projector', 'Whiteboard'] }),
      room({ id: 'b', equipment: ['Projector'] }),
    ];
    const result = filterRooms(rooms, { attendees: 0, equipment: ['Projector', 'Whiteboard'] });
    expect(result.map((r) => r.id)).toEqual(['a']);
  });
});

describe('collectEquipment', () => {
  test('collectEquipment: returns sorted unique equipment across all rooms', () => {
    const rooms: Room[] = [
      room({ equipment: ['Whiteboard', 'Projector'] }),
      room({ equipment: ['Projector', 'Microphone'] }),
    ];
    expect(collectEquipment(rooms)).toEqual(['Microphone', 'Projector', 'Whiteboard']);
  });

  test('collectEquipment: matches the real catalog (non-empty, deduped)', () => {
    const all = collectEquipment(ROOMS);
    expect(all.length).toBeGreaterThan(0);
    expect(new Set(all).size).toBe(all.length);
  });
});
