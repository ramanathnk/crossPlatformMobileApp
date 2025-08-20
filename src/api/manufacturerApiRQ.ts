import { useQuery } from '@tanstack/react-query';
import { getAllManufacturers, Manufacturer } from './manufacturerApi';

const MANUFACTURERS_FETCH_ERROR = 'Failed to fetch manufacturers';

/**
 * Query: fetch manufacturers.
 * getAllManufacturers currently returns placeholder data; we wrap it in a useQuery.
 *
 * Uses the single-object form of useQuery to avoid the overload ambiguity.
 */
export function useGetManufacturers(token?: string) {
  return useQuery<Manufacturer[], any>({
    queryKey: ['manufacturers', token ?? null],
    queryFn: () => getAllManufacturers(token ?? ''),
    enabled: Boolean(token),
  });
}