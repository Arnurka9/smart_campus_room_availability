export interface Booking {
  id: string;
  start: number; // minutes from midnight (0-1440)
  end: number; // minutes from midnight (0-1440)
  title: string;
  organizer: string;
}

export interface Room {
  id: string;
  name: string;
  building: string;
  capacity: number;
  equipment: string[];
  blocked: boolean;
  blockedReason?: string;
  bookings: Booking[];
}

export type Decision = 'available' | 'unavailable' | 'pending';

export interface ValidationIssue {
  code: string;
  message: string;
}

export interface FilterCriteria {
  attendees: number;
  equipment: string[];
}
