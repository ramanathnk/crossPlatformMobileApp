import { Dealer } from '../dealerApi';

// Mocked getAllDealers function for development
export async function getAllDealers(token: string): Promise<Dealer[]> {
  return new Promise<Dealer[]>((resolve) => {
    setTimeout(() => {
      resolve([
        {
          dealerId: 1,
          name: 'TechSolutions Inc.',
          mobileWebAPIUrl: 'https://api.techsolutions.com',
          application: 'SnapTracker',
          totalDevices: 120,
          activeDevices: 100,
          pendingRegistrations: 5,
        },
        {
          dealerId: 2,
          name: 'Global Trackers LLC',
          mobileWebAPIUrl: 'https://api.globaltrackers.com',
          application: 'SnapTracker',
          totalDevices: 80,
          activeDevices: 70,
          pendingRegistrations: 2,
        },
        {
          dealerId: 3,
          name: 'SmartTrack Solutions',
          mobileWebAPIUrl: 'https://api.smarttrack.com',
          application: 'SnapTracker',
          totalDevices: 60,
          activeDevices: 55,
          pendingRegistrations: 1,
        },
        {
          dealerId: 4,
          name: 'EcoTrack Systems',
          mobileWebAPIUrl: 'https://api.ecotrack.com',
          application: 'SnapTracker',
          totalDevices: 40,
          activeDevices: 35,
          pendingRegistrations: 0,
        },
        {
          dealerId: 5,
          name: 'SafeGuard Monitoring',
          mobileWebAPIUrl: 'https://api.safeguard.com',
          application: 'SnapTracker',
          totalDevices: 25,
          activeDevices: 20,
          pendingRegistrations: 3,
        },
      ]);
    }, 500); // Simulate network delay
  });
}
