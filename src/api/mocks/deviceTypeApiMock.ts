import { DeviceType } from '../types';

// Mocked getAllDeviceTypes function for development
export async function getAllDeviceTypes(token: string): Promise<DeviceType[]> {
  return new Promise<DeviceType[]>((resolve) => {
    setTimeout(() => {
      resolve([
        { deviceTypeId: 2, modelNumber: 'Fleet Monitor' },
        { deviceTypeId: 3, modelNumber: 'Asset Tracker' },
        { deviceTypeId: 4, modelNumber: 'Vehicle Tracker' },
      ]);
    }, 500); // Simulate network delay
  });
}
