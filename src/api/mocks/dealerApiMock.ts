import { Dealer } from '../types';

// Mocked getAllDealers function for development
export async function getAllDealers(token: string): Promise<Dealer[]> {
  return new Promise<Dealer[]>((resolve) => {
    setTimeout(() => {
      resolve([
        { id: 1, name: 'TechSolutions Inc.' },
        { id: 2, name: 'Global Trackers LLC' },
        { id: 3, name: 'SmartTrack Solutions' },
        { id: 4, name: 'EcoTrack Systems' },
        { id: 5, name: 'SafeGuard Monitoring' },
      ]);
    }, 500); // Simulate network delay
  });
}
