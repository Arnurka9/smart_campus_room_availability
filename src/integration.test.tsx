import { test, expect, describe } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { renderHook } from '@testing-library/react';
import { RoomList } from '@/components/RoomList';
import App from '@/App';
import { useAvailabilitySession } from '@/hooks/useAvailabilitySession';
import { ROOMS } from '@/data';

describe('F4: empty state', () => {
  test('F4: no rooms match filters → empty state shown with Reset button', () => {
    render(
      <RoomList rooms={[]} selectedRoomId="" onSelect={() => {}} onResetFilters={() => {}} />,
    );
    expect(screen.getByText('No rooms match your filters')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Reset filters/i })).toBeInTheDocument();
  });

  test('F4: rooms present → no empty-state text shown', () => {
    render(
      <RoomList
        rooms={ROOMS}
        selectedRoomId=""
        onSelect={() => {}}
        onResetFilters={() => {}}
      />,
    );
    expect(screen.queryByText('No rooms match your filters')).not.toBeInTheDocument();
  });
});

describe('F5: room switching clears result (useAvailabilitySession hook)', () => {
  test('F5: selecting a room after a check → result resets to null', () => {
    const { result } = renderHook(() => useAvailabilitySession(540));

    act(() => {
      result.current.selectRoom(ROOMS[0].id);
    });
    expect(result.current.result).toBeNull();

    act(() => {
      result.current.check();
    });
    expect(result.current.result).not.toBeNull();

    act(() => {
      result.current.selectRoom(ROOMS[3].id);
    });
    expect(result.current.result).toBeNull();
  });

  test('F5: changing start time → result resets', () => {
    const { result } = renderHook(() => useAvailabilitySession(540));

    act(() => {
      result.current.check();
    });
    expect(result.current.result).not.toBeNull();

    act(() => {
      result.current.setStart('12:00');
    });
    expect(result.current.result).toBeNull();
  });

  test('F5: changing filters → result resets', () => {
    const { result } = renderHook(() => useAvailabilitySession(540));

    act(() => {
      result.current.check();
    });
    expect(result.current.result).not.toBeNull();

    act(() => {
      result.current.updateCriteria({ attendees: 50, equipment: [] });
    });
    expect(result.current.result).toBeNull();
  });

  test('F5: hiding the selected room via filter → effective room becomes null', () => {
    const { result } = renderHook(() => useAvailabilitySession(540));

    act(() => {
      result.current.selectRoom(ROOMS[4].id);
    });
    expect(result.current.selectedRoom).not.toBeNull();

    act(() => {
      result.current.updateCriteria({ attendees: 100, equipment: [] });
    });
    expect(result.current.selectedRoom).toBeNull();
  });
});

describe('Integration: select room → check availability → result', () => {
  test('Integration: select a free room and valid future interval → Available result', () => {
    render(<App />);

    const engRoom = ROOMS.find((r) => r.id === 'eng-101')!;
    fireEvent.click(screen.getByText(engRoom.name));

    fireEvent.click(screen.getByRole('button', { name: /Check Availability/i }));

    expect(screen.getByText('Available')).toBeInTheDocument();
  });

  test('Integration: select a blocked room → Unavailable result', () => {
    render(<App />);

    const blockedRoom = ROOMS.find((r) => r.blocked)!;
    fireEvent.click(screen.getByText(blockedRoom.name));

    fireEvent.click(screen.getByRole('button', { name: /Check Availability/i }));

    expect(screen.getByText('Unavailable')).toBeInTheDocument();
  });

  test('Integration: switching rooms clears the previous result', () => {
    render(<App />);

    const engRoom = ROOMS.find((r) => r.id === 'eng-101')!;
    fireEvent.click(screen.getByText(engRoom.name));
    fireEvent.click(screen.getByRole('button', { name: /Check Availability/i }));
    expect(screen.getByText('Available')).toBeInTheDocument();

    const busRoom = ROOMS.find((r) => r.id === 'bus-310')!;
    fireEvent.click(screen.getByText(busRoom.name));

    expect(screen.queryByText('Available')).not.toBeInTheDocument();
    expect(screen.queryByText('Unavailable')).not.toBeInTheDocument();
  });

  test('Integration: filter with no matches → empty state with Reset button', () => {
    render(<App />);

    const attendeesInput = screen.getByLabelText(/Minimum attendees/i);
    fireEvent.change(attendeesInput, { target: { value: '999' } });

    expect(screen.getByText('No rooms match your filters')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Reset filters/i })).toBeInTheDocument();
  });

  test('Integration: Reset button restores all rooms and clears result', () => {
    render(<App />);

    fireEvent.change(screen.getByLabelText(/Minimum attendees/i), { target: { value: '999' } });
    expect(screen.getByText('No rooms match your filters')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Reset filters/i }));
    expect(screen.queryByText('No rooms match your filters')).not.toBeInTheDocument();
  });
});
