import { apiRequest, API_BASE } from './apiHelpers';

const DEVICE_TYPES_ERROR = 'Failed to fetch device types';
const DEVICE_TYPE_CREATE_ERROR = 'Failed to create device type';
const DEVICE_TYPE_UPDATE_ERROR = 'Failed to update device type';
const DEVICE_TYPE_DELETE_ERROR = 'Failed to delete device type';

export interface DeviceType {
  deviceTypeId: number;
  name: string;
  manufacturerId: number;
  manufacturerName: string;
  modelNumber: string;
  deviceTypeCount: number;
  totalDevices: number;
}

export interface DeviceTypeRequestPayload {
  name: string;
  manufacturerId: number;
  modelNumber: string;
}

/**
 * Retrieve all device types
 */
export async function getAllDeviceTypes(token: string): Promise<DeviceType[]> {
  return apiRequest<DeviceType[]>(
    `${API_BASE}/api/v1/device-types`,
    'GET',
    DEVICE_TYPES_ERROR,
    token
  );
}

/**
 * Create a new device type
 */
export async function createDeviceType(
  token: string,
  deviceType: DeviceTypeRequestPayload
): Promise<DeviceType> {
  return apiRequest<DeviceType>(
    `${API_BASE}/api/v1/device-types`,
    'POST',
    DEVICE_TYPE_CREATE_ERROR,
    token,
    deviceType
  );
}

/**
 * Update an existing device type
 */
export async function updateDeviceType(
  token: string,
  deviceTypeId: number,
  deviceType: DeviceTypeRequestPayload
): Promise<DeviceType> {
  return apiRequest<DeviceType>(
    `${API_BASE}/api/v1/device-types/${deviceTypeId}`,
    'PUT',
    DEVICE_TYPE_UPDATE_ERROR,
    token,
    deviceType
  );
}

/**
 * Delete a device type
 */
export async function deleteDeviceType(
  token: string,
  deviceTypeId: number
): Promise<void> {
  await apiRequest<void>(
    `${API_BASE}/api/v1/device-types/${deviceTypeId}`,
    'DELETE',
    DEVICE_TYPE_DELETE_ERROR,
    token
  );
}
