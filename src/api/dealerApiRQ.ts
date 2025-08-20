import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest, API_BASE } from './apiHelpers';
import { Dealer, DealerCreateRequest, DealerUpdateRequest } from './dealerApi';

const DEALERS_FETCH_ERROR = 'Failed to fetch dealers';
const DEALER_CREATE_ERROR = 'Failed to create dealer';
const DEALER_UPDATE_ERROR = 'Failed to update dealer';
const DEALER_DELETE_ERROR = 'Failed to delete dealer';

/**
 * Query: fetch all dealers
 * token is optional; the query is enabled only when a token is provided.
 */
export function useGetDealers(token?: string) {
  return useQuery<Dealer[], any>({
    queryKey: ['dealers', token ?? null],
    queryFn: () =>
      apiRequest<Dealer[]>(`${API_BASE}/api/v1/dealers`, 'GET', DEALERS_FETCH_ERROR, token),
    enabled: Boolean(token),
  });
}

/**
 * Mutation: create a dealer
 * Uses optimistic update and invalidation so callers don't need to refetch manually.
 */
export function useCreateDealer(token?: string) {
  const queryClient = useQueryClient();

  return useMutation<Dealer, any, { token: string; dealer: DealerCreateRequest }>({
    mutationFn: ({ token, dealer }) =>
      apiRequest<Dealer>(`${API_BASE}/api/v1/dealers`, 'POST', DEALER_CREATE_ERROR, token, dealer),
    onMutate: async ({ dealer }) => {
      // Cancel any outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: ['dealers', token ?? null] });

      // Snapshot previous value
      const previous = queryClient.getQueryData<Dealer[]>(['dealers', token ?? null]);

      // Create an optimistic dealer (temp id)
      const optimisticDealer: Dealer = {
        dealerId: -Date.now(), // negative temp id
        name: dealer.name,
        mobileWebAPIUrl: dealer.mobileWebAPIUrl,
        application: dealer.application,
        totalDevices: 0,
        activeDevices: 0,
        pendingRegistrations: 0,
      };

      // Optimistically update cache
      queryClient.setQueryData<Dealer[] | undefined>(['dealers', token ?? null], (old) => {
        return old ? [optimisticDealer, ...old] : [optimisticDealer];
      });

      // Return context for rollback
      return { previous };
    },
    onError: (_err, _vars, context: any) => {
      // Rollback
      if (context?.previous) {
        queryClient.setQueryData(['dealers', token ?? null], context.previous);
      }
    },
    onSettled: () => {
      // Invalidate so server data replaces optimistic values
      queryClient.invalidateQueries({ queryKey: ['dealers', token ?? null], exact: false });
    },
  });
}

/**
 * Mutation: update a dealer
 * Uses optimistic update then invalidates on settle.
 */
export function useUpdateDealer(token?: string) {
  const queryClient = useQueryClient();

  return useMutation<Dealer, any, { token: string; dealerId: number; dealer: DealerUpdateRequest }>(
    {
      mutationFn: ({ token, dealerId, dealer }) =>
        apiRequest<Dealer>(
          `${API_BASE}/api/v1/dealers/${dealerId}`,
          'PUT',
          DEALER_UPDATE_ERROR,
          token,
          dealer,
        ),
      onMutate: async ({ dealerId, dealer }) => {
        await queryClient.cancelQueries({ queryKey: ['dealers', token ?? null] });
        const previous = queryClient.getQueryData<Dealer[]>(['dealers', token ?? null]);

        // Optimistically update the specific dealer
        queryClient.setQueryData<Dealer[] | undefined>(['dealers', token ?? null], (old) => {
          if (!old) return old;
          return old.map((d) => (d.dealerId === dealerId ? { ...d, ...dealer } : d));
        });

        return { previous };
      },
      onError: (_err, _vars, context: any) => {
        if (context?.previous) {
          queryClient.setQueryData(['dealers', token ?? null], context.previous);
        }
      },
      onSettled: () => {
        queryClient.invalidateQueries({ queryKey: ['dealers', token ?? null], exact: false });
      },
    },
  );
}

/**
 * Mutation: delete a dealer
 * Uses optimistic removal and invalidation.
 */
export function useDeleteDealer(token?: string) {
  const queryClient = useQueryClient();

  return useMutation<void, any, { token: string; dealerId: number }>({
    mutationFn: ({ token, dealerId }) =>
      apiRequest<void>(
        `${API_BASE}/api/v1/dealers/${dealerId}`,
        'DELETE',
        DEALER_DELETE_ERROR,
        token,
      ),
    onMutate: async ({ dealerId }) => {
      await queryClient.cancelQueries({ queryKey: ['dealers', token ?? null] });
      const previous = queryClient.getQueryData<Dealer[]>(['dealers', token ?? null]);

      // Optimistically remove the dealer
      queryClient.setQueryData<Dealer[] | undefined>(['dealers', token ?? null], (old) => {
        return old ? old.filter((d) => d.dealerId !== dealerId) : old;
      });

      return { previous };
    },
    onError: (_err, _vars, context: any) => {
      if (context?.previous) {
        queryClient.setQueryData(['dealers', token ?? null], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['dealers', token ?? null], exact: false });
    },
  });
}
