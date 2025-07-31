import { DeviceType } from './types';

// Mocked getAllDeviceTypes function for development
export async function getAllDeviceTypes(token: string): Promise<DeviceType[]> {
  return new Promise<DeviceType[]>((resolve) => {
    setTimeout(() => {
      resolve([
        { id: 1, name: 'GPS Tracker' },
        { id: 2, name: 'Fleet Monitor' },
        { id: 3, name: 'Asset Tracker' },
        { id: 4, name: 'Vehicle Tracker' },
      ]);
    }, 500); // Simulate network delay
  });
}
