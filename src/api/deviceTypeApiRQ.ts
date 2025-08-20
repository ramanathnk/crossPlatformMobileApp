import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest, API_BASE } from './apiHelpers';
import { DeviceType, DeviceTypeRequestPayload } from './deviceTypeApi';

const DEVICE_TYPES_ERROR = 'Failed to fetch device types';
const DEVICE_TYPE_CREATE_ERROR = 'Failed to create device type';
const DEVICE_TYPE_UPDATE_ERROR = 'Failed to update device type';
const DEVICE_TYPE_DELETE_ERROR = 'Failed to delete device type';

/**
 * Query: fetch all device types
 */
export function useGetDeviceTypes(token?: string) {
  return useQuery<DeviceType[], any>({
    queryKey: ['deviceTypes', token ?? null],
    queryFn: () =>
      apiRequest<DeviceType[]>(`${API_BASE}/api/v1/device-types`, 'GET', DEVICE_TYPES_ERROR, token),
    enabled: Boolean(token),
  });
}

/**
 * Mutation: create a device type with optimistic update + invalidation
 */
export function useCreateDeviceType(token?: string) {
  const queryClient = useQueryClient();

  return useMutation<DeviceType, any, { token: string; deviceType: DeviceTypeRequestPayload }>({
    mutationFn: ({ token, deviceType }) =>
      apiRequest<DeviceType>(
        `${API_BASE}/api/v1/device-types`,
        'POST',
        DEVICE_TYPE_CREATE_ERROR,
        token,
        deviceType,
      ),
    onMutate: async ({ deviceType }) => {
      await queryClient.cancelQueries({ queryKey: ['deviceTypes', token ?? null] });
      const previous = queryClient.getQueryData<DeviceType[]>(['deviceTypes', token ?? null]);

      const optimistic: DeviceType = {
        deviceTypeId: -Date.now(),
        name: deviceType.name,
        manufacturerId: deviceType.manufacturerId,
        manufacturerName: '',
        modelNumber: deviceType.modelNumber,
        deviceTypeCount: 0,
        totalDevices: 0,
      };

      queryClient.setQueryData<DeviceType[] | undefined>(['deviceTypes', token ?? null], (old) =>
        old ? [optimistic, ...old] : [optimistic],
      );

      return { previous };
    },
    onError: (_err, _vars, context: any) => {
      if (context?.previous) {
        queryClient.setQueryData(['deviceTypes', token ?? null], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['deviceTypes', token ?? null], exact: false });
    },
  });
}

/**
 * Mutation: update a device type with optimistic update
 */
export function useUpdateDeviceType(token?: string) {
  const queryClient = useQueryClient();

  return useMutation<
    DeviceType,
    any,
    { token: string; deviceTypeId: number; deviceType: DeviceTypeRequestPayload }
  >({
    mutationFn: ({ token, deviceTypeId, deviceType }) =>
      apiRequest<DeviceType>(
        `${API_BASE}/api/v1/device-types/${deviceTypeId}`,
        'PUT',
        DEVICE_TYPE_UPDATE_ERROR,
        token,
        deviceType,
      ),
    onMutate: async ({ deviceTypeId, deviceType }) => {
      await queryClient.cancelQueries({ queryKey: ['deviceTypes', token ?? null] });
      const previous = queryClient.getQueryData<DeviceType[]>(['deviceTypes', token ?? null]);

      queryClient.setQueryData<DeviceType[] | undefined>(['deviceTypes', token ?? null], (old) => {
        if (!old) return old;
        return old.map((dt) => (dt.deviceTypeId === deviceTypeId ? { ...dt, ...deviceType } : dt));
      });

      return { previous };
    },
    onError: (_err, _vars, context: any) => {
      if (context?.previous) {
        queryClient.setQueryData(['deviceTypes', token ?? null], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['deviceTypes', token ?? null], exact: false });
    },
  });
}

/**
 * Mutation: delete a device type with optimistic removal
 */
export function useDeleteDeviceType(token?: string) {
  const queryClient = useQueryClient();

  return useMutation<void, any, { token: string; deviceTypeId: number }>({
    mutationFn: ({ token, deviceTypeId }) =>
      apiRequest<void>(
        `${API_BASE}/api/v1/device-types/${deviceTypeId}`,
        'DELETE',
        DEVICE_TYPE_DELETE_ERROR,
        token,
      ),
    onMutate: async ({ deviceTypeId }) => {
      await queryClient.cancelQueries({ queryKey: ['deviceTypes', token ?? null] });
      const previous = queryClient.getQueryData<DeviceType[]>(['deviceTypes', token ?? null]);

      queryClient.setQueryData<DeviceType[] | undefined>(['deviceTypes', token ?? null], (old) =>
        old ? old.filter((dt) => dt.deviceTypeId !== deviceTypeId) : old,
      );

      return { previous };
    },
    onError: (_err, _vars, context: any) => {
      if (context?.previous) {
        queryClient.setQueryData(['deviceTypes', token ?? null], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['deviceTypes', token ?? null], exact: false });
    },
  });
}
