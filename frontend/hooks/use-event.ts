import { fetchEvents } from '@/app/(dashboard)/admin/calendar/api';
import useSWR from 'swr';

export function useEvents() {
  const { data, error, mutate } = useSWR('/api/events', fetchEvents);

  return {
    events: data,
    isLoading: !error && !data,
    error: error,
    mutate,
  };
}
