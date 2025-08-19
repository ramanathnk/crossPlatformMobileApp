import { DeviceType } from '../deviceTypeApi';

// Mocked getAllDeviceTypes function for development
export async function getAllDeviceTypes(_token: string): Promise<DeviceType[]> {
  return new Promise<DeviceType[]>((resolve) => {
    setTimeout(() => {
      resolve([
        {
          deviceTypeId: 2,
          modelNumber: 'Fleet Monitor',
          name: 'Fleet Monitor',
          deviceTypeCount: 1,
          manufacturerId: 1,
          manufacturerName: 'Honeywell',
          totalDevices: 10,
        },
        {
          deviceTypeId: 3,
          modelNumber: 'Asset Tracker',
          name: 'Asset Tracker',
          deviceTypeCount: 1,
          manufacturerId: 1,
          manufacturerName: 'Honeywell',
          totalDevices: 5,
        },
        {
          deviceTypeId: 4,
          modelNumber: 'Vehicle Tracker',
          name: 'Vehicle Tracker',
          deviceTypeCount: 1,
          manufacturerId: 1,
          manufacturerName: 'Honeywell',
          totalDevices: 8,
        },
      ]);
    }, 500); // Simulate network delay
  });
}
