import type { FilterCriteria, Room } from './types';

export const MIN_ATTENDEES = 0;

export function collectEquipment(rooms: Room[]): string[] {
  const seen = new Set<string>();
  for (const room of rooms) {
    for (const item of room.equipment) seen.add(item);
  }
  return Array.from(seen).sort();
}

export function matchesCriteria(room: Room, criteria: FilterCriteria): boolean {
  if (room.capacity < criteria.attendees) return false;
  if (criteria.equipment.length > 0 && !criteria.equipment.every((e) => room.equipment.includes(e))) {
    return false;
  }
  return true;
}

export function filterRooms(rooms: Room[], criteria: FilterCriteria): Room[] {
  return rooms.filter((room) => matchesCriteria(room, criteria));
}
