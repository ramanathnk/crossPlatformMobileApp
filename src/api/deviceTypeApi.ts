import { apiRequest, API_BASE } from './apiHelpers';

const DEVICE_TYPES_ERROR = 'Failed to fetch device types';

export interface DeviceType {
  deviceTypeId: number;
  modelNumber: string;
}

export async function getAllDeviceTypes(token: string): Promise<DeviceType[]> {
  return apiRequest<DeviceType[]>(
    `${API_BASE}/api/v1/device-types`,
    'GET',
    DEVICE_TYPES_ERROR,
    token
  );
}
