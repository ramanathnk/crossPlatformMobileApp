export interface Manufacturer {
  manufacturerId: number;
  name: string;
}

// In a real app, this would be an API call
export async function getAllManufacturers(token: string): Promise<Manufacturer[]> {
  // Placeholder data for now
  return [
    { manufacturerId: 1, name: 'Manufacturer A' },
    { manufacturerId: 2, name: 'Manufacturer B' },
  ];
}
