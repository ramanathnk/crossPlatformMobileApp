import { apiRequest, API_BASE } from './apiHelpers';
import { DeviceType } from './types';

const DEVICE_TYPES_ERROR = 'Failed to fetch device types';

export async function getAllDeviceTypes(token: string): Promise<DeviceType[]> {
  return apiRequest<DeviceType[]>(
    `${API_BASE}/api/v1/device-types`,
    'GET',
    DEVICE_TYPES_ERROR,
    token
  );
}
