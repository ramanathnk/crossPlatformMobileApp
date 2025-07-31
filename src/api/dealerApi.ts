import { apiRequest, API_BASE } from './apiHelpers';
import { Dealer } from './types';

const DEALERS_FETCH_ERROR = 'Failed to fetch dealers';

export async function getAllDealers(token: string): Promise<Dealer[]> {
  return apiRequest<Dealer[]>(
    `${API_BASE}/api/v1/dealers`,
    'GET',
    DEALERS_FETCH_ERROR,
    token
  );
}
