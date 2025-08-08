import { apiRequest, API_BASE } from './apiHelpers';

const DEALERS_FETCH_ERROR = 'Failed to fetch dealers';

export interface Dealer {
  dealerId: number;
  name: string;
  mobileWebAPIUrl: string;
  application: string;
  totalDevices: number;
  activeDevices: number;
  pendingRegistrations: number;
}

export async function getAllDealers(token: string): Promise<Dealer[]> {
  return apiRequest<Dealer[]>(
    `${API_BASE}/api/v1/dealers`,
    'GET',
    DEALERS_FETCH_ERROR,
    token
  );
}
