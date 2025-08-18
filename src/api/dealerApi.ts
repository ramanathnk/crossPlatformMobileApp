import { apiRequest, API_BASE } from './apiHelpers';

const DEALERS_FETCH_ERROR = 'Failed to fetch dealers';
const DEALER_CREATE_ERROR = 'Failed to create dealer';
const DEALER_UPDATE_ERROR = 'Failed to update dealer';
const DEALER_DELETE_ERROR = 'Failed to delete dealer';


export interface Dealer {
  dealerId: number;
  name: string;
  mobileWebAPIUrl: string;
  application: string;
  totalDevices: number;
  activeDevices: number;
  pendingRegistrations: number;
}

export interface DealerCreateRequest {
  name: string;
  mobileWebAPIUrl: string;
  application: string;
}

export interface DealerUpdateRequest {
  name: string;
  mobileWebAPIUrl: string;
  application: string;
}

/**
 * Retrieve all dealers
 */
export async function getAllDealers(token: string): Promise<Dealer[]> {
  return apiRequest<Dealer[]>(
    `${API_BASE}/api/v1/dealers`,
    'GET',
    DEALERS_FETCH_ERROR,
    token
  );
}

/**
 * Create a new dealer
 */
export async function createDealer(
  token: string,
  dealer: DealerCreateRequest
): Promise<Dealer> {
  return apiRequest<Dealer>(
    `${API_BASE}/api/v1/dealers`,
    'POST',
    DEALER_CREATE_ERROR,
    token,
    dealer
  );
}

/**
 * Update an existing dealer
 */
export async function updateDealer(
  token: string,
  dealerId: number,
  dealer: DealerUpdateRequest
): Promise<Dealer> {
  return apiRequest<Dealer>(
    `${API_BASE}/api/v1/dealers/${dealerId}`,
    'PUT',
    DEALER_UPDATE_ERROR,
    token,
    dealer
  );
}

/**
 * Delete a dealer
 */
export async function deleteDealer(
  token: string,
  dealerId: number
): Promise<void> {
  await apiRequest<void>(
    `${API_BASE}/api/v1/dealers/${dealerId}`,
    'DELETE',
    DEALER_DELETE_ERROR,
    token
  );
}