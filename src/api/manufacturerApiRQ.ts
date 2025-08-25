import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest, API_BASE } from './apiHelpers';

// Default error messages
const MANUFACTURERS_FETCH_ERROR = 'Failed to fetch manufacturers';
const CREATE_MANUFACTURER_ERROR = 'Failed to create manufacturer';
const UPDATE_MANUFACTURER_ERROR = 'Failed to update manufacturer';
const DELETE_MANUFACTURER_ERROR = 'Failed to delete manufacturer';

export interface Manufacturer {
  manufacturerId: number;
  name: string;
}

/**
 * GET /api/v1/device-types/manufacturers
 * Retrieve all manufacturers (requires token).
 */
export function useGetManufacturers(token?: string) {
  return useQuery<Manufacturer[], any>({
    queryKey: ['manufacturers', token ?? null],
    queryFn: () =>
      apiRequest<Manufacturer[]>(
        `${API_BASE}/api/v1/device-types/manufacturers`,
        'GET',
        MANUFACTURERS_FETCH_ERROR,
        token,
      ),
    enabled: Boolean(token),
  });
}

/**
 * POST /api/v1/device-types/manufacturers
 * Create a new manufacturer.
 * Variables: { data: { name: string }, token?: string }
 */
export function useCreateManufacturer() {
  const queryClient = useQueryClient();
  return useMutation<Manufacturer, any, { data: { name: string }; token?: string }>({
    mutationFn: ({ data, token }) =>
      apiRequest<Manufacturer>(
        `${API_BASE}/api/v1/device-types/manufacturers`,
        'POST',
        CREATE_MANUFACTURER_ERROR,
        token,
        data,
      ),
    onSuccess: () => {
      // Use the object form of invalidateQueries to match React Query's strong types.
      // Passing an array directly can cause the "type 'string[]' has no properties in common with type 'InvalidateQueryFilters<readonly unknown[]>'"
      // TypeScript error in some setups. The object form with queryKey avoids that.
      queryClient.invalidateQueries({ queryKey: ['manufacturers'] });
    },
  });
}

/**
 * PUT /api/v1/device-types/manufacturers/{id}
 * Update an existing manufacturer.
 * Variables: { id: number; data: { name: string }; token?: string }
 */
export function useUpdateManufacturer() {
  const queryClient = useQueryClient();
  return useMutation<Manufacturer, any, { id: number; data: { name: string }; token?: string }>({
    mutationFn: ({ id, data, token }) =>
      apiRequest<Manufacturer>(
        `${API_BASE}/api/v1/device-types/manufacturers/${id}`,
        'PUT',
        UPDATE_MANUFACTURER_ERROR,
        token,
        data,
      ),
    onSuccess: () => {
      // Invalidate the manufacturers list so UIs refetch fresh data.
      queryClient.invalidateQueries({ queryKey: ['manufacturers'] });
    },
  });
}

/**
 * DELETE /api/v1/device-types/manufacturers/{id}
 * Delete a manufacturer.
 * Variables: { id: number; token?: string }
 *
 * The API returns 204 No Content on success; apiRequest returns null for empty body.
 */
export function useDeleteManufacturer() {
  const queryClient = useQueryClient();
  return useMutation<null, any, { id: number; token?: string }>({
    mutationFn: ({ id, token }) =>
      apiRequest<null>(
        `${API_BASE}/api/v1/device-types/manufacturers/${id}`,
        'DELETE',
        DELETE_MANUFACTURER_ERROR,
        token,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['manufacturers'] });
    },
  });
}