import type { Room } from '@/types';
import { RoomCard } from '@/components/RoomCard';
import { EmptyState } from '@/components/EmptyState';

interface RoomListProps {
  rooms: Room[];
  selectedRoomId: string;
  onSelect: (id: string) => void;
  onResetFilters: () => void;
}

export function RoomList({ rooms, selectedRoomId, onSelect, onResetFilters }: RoomListProps) {
  if (rooms.length === 0) {
    return <EmptyState onReset={onResetFilters} />;
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {rooms.map((room) => (
        <RoomCard
          key={room.id}
          room={room}
          selected={room.id === selectedRoomId}
          onSelect={() => onSelect(room.id)}
        />
      ))}
    </div>
  );
}
