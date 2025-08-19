import { apiRequest, API_BASE } from './apiHelpers';

export interface RegisterDeviceRequest {
  dealerIds: number[];
  serialNo: string;
  deviceTypeId: number;
  status?: number; // 1 for Active, 0 for Inactive (default: 1)
  notes?: string;
}

export interface RegisterDeviceResponse {}

export interface DeviceRegisterErrorResponse {
  error: string;
  description: string;
  timestamp: string;
}

export interface DeviceRegistrationRequest {
  requestId: number;
  dealerId: number;
  dealerName: string;
  serialNo: string;
  deviceTypeId: number;
  deviceTypeName: string;
  manufacturerName: string;
  modelNumber: string;
  osVersion: string | null;
  buildNumber: string | null;
  appVersion: string | null;
  appVersionId: number | null;
  requestType: string;
  status: string;
  requestedBy: number;
  requestedByName?: string;
  requestedAt: string;
  approvedBy?: number | null;
  approvedByName?: string | null;
  approvedAt?: string | null;
  rejectedBy?: number | null;
  rejectedByName?: string | null;
  rejectedAt?: string | null;
  rejectionReason?: string | null;
  notes?: string | null;
  processedAt?: string | null;
}

export interface RegisteredDevice {
  dealerId: number;
  dealerName: string;
  serialNo: string;
  deviceTypeId: number;
  deviceTypeName: string;
  manufacturerName: string;
  modelNumber: string;
  osVersion: string | null;
  buildNumber: string | null;
  currentAppVersion: string | null;
  currentAppVersionId: number | null;
  lastAppVersionCheck: string | null;
  updateAvailable: boolean;
  updateRequired: boolean;
  status: string;
  registrationDate: string;
  lastUpdated: string;
  lastSeen: string | null;
  registeredBy: number;
  registeredByName: string;
  updatedBy: number | null;
  updatedByName: string | null;
  notes: string | null;
}

const REGISTER_DEVICE_ERROR = 'Failed to register device';
const FETCH_PENDING_REQUESTS_ERROR = 'Failed to fetch pending registration requests';
const APPROVE_REQUEST_ERROR = 'Failed to approve registration request';
const REJECT_REQUEST_ERROR = 'Failed to reject registration request';
const FETCH_REGISTERED_DEVICES_ERROR = 'Failed to fetch registered devices';

/**
 * Register a new device
 */
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

/**
 * Retrieve pending device registration requests
 */
export async function getPendingRegistrationRequests(
  token: string
): Promise<DeviceRegistrationRequest[]> {
  return apiRequest<DeviceRegistrationRequest[]>(
    `${API_BASE}/api/v1/register/requests`,
    'GET',
    FETCH_PENDING_REQUESTS_ERROR,
    token
  );
}

/**
 * Approve a device registration request
 */
export async function approveRegistrationRequest(
  token: string,
  requestId: number,
  notes?: string
): Promise<DeviceRegistrationRequest> {
  return apiRequest<DeviceRegistrationRequest>(
    `${API_BASE}/api/v1/devices/register/requests/${requestId}/approve`,
    'PUT',
    APPROVE_REQUEST_ERROR,
    token,
    { notes }
  );
}

/**
 * Reject a device registration request
 */
export async function rejectRegistrationRequest(
  token: string,
  requestId: number,
  rejectionReason: string,
  notes?: string
): Promise<DeviceRegistrationRequest> {
  return apiRequest<DeviceRegistrationRequest>(
    `${API_BASE}/api/v1/devices/register/${requestId}/reject`,
    'PUT',
    REJECT_REQUEST_ERROR,
    token,
    { rejectionReason, notes }
  );
}

/**
 * Retrieve all registered devices
 */
export async function getRegisteredDevices(
  token: string
): Promise<RegisteredDevice[]> {
  return apiRequest<RegisteredDevice[]>(
    `${API_BASE}/api/v1/devices`,
    'GET',
    FETCH_REGISTERED_DEVICES_ERROR,
    token
  );
}