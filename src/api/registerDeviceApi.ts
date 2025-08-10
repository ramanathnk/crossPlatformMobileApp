import { apiRequest, API_BASE } from './apiHelpers';

export interface RegisterDeviceRequest {
  dealerIds: number[];
  serialNo: string;
  deviceTypeId: number;
  status?: number; // 1 for Active, 0 for Inactive (default: 1)
  notes?: string;
}

export interface RegisterDeviceResponse {

}

export interface DeviceRegisterErrorResponse {
  error: string;
  description: string;
  timestamp: string;
}

const REGISTER_DEVICE_ERROR = 'Failed to register device';

export async function registerDevice(
  data: RegisterDeviceRequest,
  token: string
): Promise<RegisterDeviceResponse> {
  return apiRequest<RegisterDeviceResponse>(
    `${API_BASE}/api/v1/devices/register`,
    'POST',
    REGISTER_DEVICE_ERROR,
    token,
    data
  );
}