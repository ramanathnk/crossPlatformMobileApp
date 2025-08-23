import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest, API_BASE } from './apiHelpers';
import {
  RegisterDeviceRequest,
  RegisterDeviceResponse,
  DeviceRegistrationRequest,
  RegisteredDevice,
} from './deviceRegistrationApi';

const REGISTER_DEVICE_ERROR = 'Failed to register device';
const FETCH_PENDING_REQUESTS_ERROR = 'Failed to fetch pending registration requests';
const APPROVE_REQUEST_ERROR = 'Failed to approve registration request';
const REJECT_REQUEST_ERROR = 'Failed to reject registration request';
const FETCH_REGISTERED_DEVICES_ERROR = 'Failed to fetch registered devices';

/**
 * Mutation: register a new device
 * payload: { token, data }
 * Invalidates registeredDevices and pendingRegistrationRequests on success.
 */
export function useRegisterDevice() {
  const queryClient = useQueryClient();

  return useMutation<RegisterDeviceResponse, any, { token: string; data: RegisterDeviceRequest }>({
    mutationFn: ({ token, data }) =>
      apiRequest<RegisterDeviceResponse>(
        `${API_BASE}/api/v1/devices/register`,
        'POST',
        REGISTER_DEVICE_ERROR,
        token,
        data,
      ),
    onSuccess: () => {
      // use the object form of invalidateQueries to satisfy TypeScript overloads
      // exact: false so that queries with additional key parts (e.g. token) are also matched
      queryClient.invalidateQueries({ queryKey: ['registeredDevices'], exact: false });
      queryClient.invalidateQueries({ queryKey: ['pendingRegistrationRequests'], exact: false });
    },
  });
}

/**
 * Query: fetch pending device registration requests
 */
export function useGetPendingRegistrationRequests(token?: string) {
  return useQuery<DeviceRegistrationRequest[], any>({
    queryKey: ['pendingRegistrationRequests', token ?? null],
    queryFn: () =>
      apiRequest<DeviceRegistrationRequest[]>(
        `${API_BASE}/api/v1/devices/register/requests`,
        'GET',
        FETCH_PENDING_REQUESTS_ERROR,
        token,
      ),
    enabled: Boolean(token),
  });
}

/**
 * Mutation: approve a device registration request
 * payload: { token, requestId, notes? }
 * Invalidates pending and registered lists on success.
 */
export function useApproveRegistrationRequest() {
  const queryClient = useQueryClient();

  return useMutation<
    DeviceRegistrationRequest,
    any,
    { token: string; requestId: number; notes?: string }
  >({
    mutationFn: ({ token, requestId, notes }) =>
      apiRequest<DeviceRegistrationRequest>(
        `${API_BASE}/api/v1/devices/register/requests/${requestId}/approve`,
        'PUT',
        APPROVE_REQUEST_ERROR,
        token,
        { notes },
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingRegistrationRequests'], exact: false });
      queryClient.invalidateQueries({ queryKey: ['registeredDevices'], exact: false });
    },
  });
}

/**
 * Mutation: reject a device registration request
 * payload: { token, requestId, rejectionReason, notes? }
 * Invalidates pending list on success.
 */
export function useRejectRegistrationRequest() {
  const queryClient = useQueryClient();

  return useMutation<
    DeviceRegistrationRequest,
    any,
    { token: string; requestId: number; rejectionReason: string; notes?: string }
  >({
    mutationFn: ({ token, requestId, rejectionReason, notes }) =>
      apiRequest<DeviceRegistrationRequest>(
        `${API_BASE}/api/v1/devices/register/requests/${requestId}/reject`,
        'PUT',
        REJECT_REQUEST_ERROR,
        token,
        { rejectionReason, notes },
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingRegistrationRequests'], exact: false });
    },
  });
}

/**
 * Query: fetch all registered devices
 */
export function useGetRegisteredDevices(token?: string) {
  return useQuery<RegisteredDevice[], any>({
    queryKey: ['registeredDevices', token ?? null],
    queryFn: () =>
      apiRequest<RegisteredDevice[]>(
        `${API_BASE}/api/v1/devices/register/requests`,
        'GET',
        FETCH_REGISTERED_DEVICES_ERROR,
        token,
      ),
    enabled: Boolean(token),
  });
}
