import { apiRequest, API_BASE } from './apiHelpers';

/**
 * Types for Manufacturer API
 * Adjust as needed to match any shared types in your repo.
 */
export interface Manufacturer {
  manufacturerId: number;
  name: string;
  deviceTypeCount: number;
}

export type ManufacturerCreateRequest = {
  name: string;
};

export type ManufacturerUpdateRequest = {
  name: string;
};

// Default error messages
const MANUFACTURERS_FETCH_ERROR = 'Failed to fetch manufacturers';
const CREATE_MANUFACTURER_ERROR = 'Failed to create manufacturer';
const UPDATE_MANUFACTURER_ERROR = 'Failed to update manufacturer';
const DELETE_MANUFACTURER_ERROR = 'Failed to delete manufacturer';

/**
 * GET /api/v1/device-types/manufacturers
 */
export async function getAllManufacturers(token: string): Promise<Manufacturer[]> {
  return apiRequest<Manufacturer[]>(
    `${API_BASE}/api/v1/device-types/manufacturers`,
    'GET',
    MANUFACTURERS_FETCH_ERROR,
    token,
  );
}

/**
 * POST /api/v1/device-types/manufacturers
 */
export async function createManufacturer(
  token: string,
  data: ManufacturerCreateRequest,
): Promise<Manufacturer> {
  return apiRequest<Manufacturer>(
    `${API_BASE}/api/v1/device-types/manufacturers`,
    'POST',
    CREATE_MANUFACTURER_ERROR,
    token,
    data,
  );
}

/**
 * PUT /api/v1/device-types/manufacturers/{id}
 */
export async function updateManufacturer(
  token: string,
  id: number,
  data: ManufacturerUpdateRequest,
): Promise<Manufacturer> {
  return apiRequest<Manufacturer>(
    `${API_BASE}/api/v1/device-types/manufacturers/${id}`,
    'PUT',
    UPDATE_MANUFACTURER_ERROR,
    token,
    data,
  );
}

/**
 * DELETE /api/v1/device-types/manufacturers/{id}
 * Returns null for 204 No Content responses.
 */
export async function deleteManufacturer(token: string, id: number): Promise<null> {
  return apiRequest<null>(
    `${API_BASE}/api/v1/device-types/manufacturers/${id}`,
    'DELETE',
    DELETE_MANUFACTURER_ERROR,
    token,
  );
}