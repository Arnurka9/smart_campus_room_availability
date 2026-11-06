import type { Room } from './types';

export const ROOMS: Room[] = [
  {
    id: 'eng-101',
    name: 'Engineering Hall 101',
    building: 'Engineering Block',
    capacity: 60,
    equipment: ['Projector', 'Whiteboard', 'Microphone', 'Lecture Capture'],
    blocked: false,
    bookings: [
      { id: 'b1', start: 540, end: 600, title: 'Calculus 101', organizer: 'Dr. Patel' },
      { id: 'b2', start: 780, end: 870, title: 'Physics Lab', organizer: 'Dr. Nguyen' },
      { id: 'b3', start: 1080, end: 1140, title: 'Robotics Seminar', organizer: 'Prof. Lee' },
    ],
  },
  {
    id: 'sci-204',
    name: 'Science Block 204',
    building: 'Science Tower',
    capacity: 40,
    equipment: ['Projector', 'Whiteboard', 'Lab Bench'],
    blocked: true,
    blockedReason: 'Under maintenance until further notice.',
    bookings: [],
  },
  {
    id: 'lib-a',
    name: 'Library Study Room A',
    building: 'Central Library',
    capacity: 12,
    equipment: ['Whiteboard', 'TV Screen'],
    blocked: false,
    bookings: [
      { id: 'b4', start: 600, end: 660, title: 'Study Group', organizer: 'Student Council' },
    ],
  },
  {
    id: 'bus-310',
    name: 'Business School 310',
    building: 'Kaplan Hall',
    capacity: 80,
    equipment: ['Projector', 'Microphone', 'Video Conferencing', 'Lecture Capture'],
    blocked: false,
    bookings: [
      { id: 'b5', start: 900, end: 960, title: 'Marketing Lecture', organizer: 'Prof. Adams' },
      { id: 'b6', start: 1020, end: 1080, title: 'Case Workshop', organizer: 'Dr. Rivera' },
    ],
  },
  {
    id: 'art-5',
    name: 'Arts Center Studio 5',
    building: 'Creative Arts Wing',
    capacity: 25,
    equipment: ['Projector', 'Sound System', 'Piano'],
    blocked: false,
    bookings: [],
  },
];
