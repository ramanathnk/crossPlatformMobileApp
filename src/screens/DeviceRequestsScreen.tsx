import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import DropDownPicker from 'react-native-dropdown-picker';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as SecureStore from 'expo-secure-store';

import { colors, spacing, fontSizes, borderRadius, fontWeights } from '../styles/theme';
import { cardStyles, textStyles } from '../styles/commonStyles';

// ===================================================================================
// --- MOCK API IMPLEMENTATION ---
// The following section contains mock data and functions to simulate API calls.
// This allows the UI to be developed and tested without a live backend.
// ===================================================================================

// --- Type definitions (normally imported from API files) ---
export interface DeviceRegistrationRequest {
  requestId: number;
  serialNo: string;
  deviceTypeName: string;
  osVersion: string | null;
  buildNumber: string | null;
  requestedAt: string;
  notes: string | null;
}

export interface DeviceType {
  id: number;
  name: string;
}

// --- Helper to simulate network delay ---
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// --- Mock Data Store ---
const mockPendingRequests: DeviceRegistrationRequest[] = [
  {
    requestId: 101,
    serialNo: 'SN-MOCK-12345',
    deviceTypeName: 'Scanner X1',
    osVersion: 'Android 11',
    buildNumber: 'B-XYZ-001',
    requestedAt: new Date().toISOString(),
    notes: 'Device for warehouse inventory.',
  },
  {
    requestId: 102,
    serialNo: 'SN-MOCK-67890',
    deviceTypeName: 'Tablet T2',
    osVersion: 'iOS 15.2',
    buildNumber: 'B-ABC-002',
    requestedAt: new Date(Date.now() - 86400000).toISOString(), // Yesterday
    notes: 'Field agent tablet.',
  },
  {
    requestId: 103,
    serialNo: 'SN-MOCK-ABCDE',
    deviceTypeName: 'Scanner X1',
    osVersion: 'Android 10',
    buildNumber: 'B-PQR-003',
    requestedAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    notes: null, // Test case with no notes
  },
];

const mockDeviceTypes: DeviceType[] = [
  { id: 1, name: 'Scanner X1' },
  { id: 2, name: 'Tablet T2' },
  { id: 3, name: 'Handheld H3' },
];


// --- Mock API Function Stubs ---

/**
 * MOCK: Fetches a list of pending device registration requests.
 */
const getPendingRegistrationRequests = async (token: string): Promise<DeviceRegistrationRequest[]> => {
  console.log('--- MOCK: Fetching pending requests... ---');
  await sleep(1000); // Simulate 1-second network delay
  if (!token) {
    throw new Error('MOCK: Auth token is required.');
  }
  console.log('--- MOCK: Returning mock requests. ---');
  // Return a copy to prevent direct mutation of the mock data store
  return Promise.resolve([...mockPendingRequests]);
};

/**
 * MOCK: Fetches all available device types.
 */
const getAllDeviceTypes = async (token: string): Promise<DeviceType[]> => {
  console.log('--- MOCK: Fetching device types... ---');
  await sleep(500); // Simulate 0.5-second network delay
  if (!token) {
    throw new Error('MOCK: Auth token is required.');
  }
  console.log('--- MOCK: Returning mock device types. ---');
  return Promise.resolve([...mockDeviceTypes]);
};

/**
 * MOCK: Approves a device registration request.
 */
const approveRegistrationRequest = async (token: string, requestId: number): Promise<void> => {
  console.log(`--- MOCK: Approving request ID: ${requestId} ---`);
  await sleep(1500); // Simulate 1.5-second network delay
  if (!token) {
    throw new Error('MOCK: Auth token is required.');
  }
  // In a real mock, you might remove the item from the array.
  // Here, we just log it and let the component's `fetchData` call handle the "refresh".
  console.log(`--- MOCK: Request ${requestId} approved. Component will refetch data. ---`);
  return Promise.resolve();
};

/**
 * MOCK: Rejects a device registration request.
 */
const rejectRegistrationRequest = async (token: string, requestId: number, reason: string): Promise<void> => {
  console.log(`--- MOCK: Rejecting request ID: ${requestId} with reason: "${reason}" ---`);
  await sleep(1500); // Simulate 1.5-second network delay
  if (!token) {
    throw new Error('MOCK: Auth token is required.');
  }
  console.log(`--- MOCK: Request ${requestId} rejected. Component will refetch data. ---`);
  return Promise.resolve();
};

// ===================================================================================
// --- End of MOCK API IMPLEMENTATION ---
// ===================================================================================


// Import API functions and types
/* COMMENTED OUT - Using mock implementations above
import {
  getPendingRegistrationRequests,
  approveRegistrationRequest,
  rejectRegistrationRequest,
  DeviceRegistrationRequest,
} from '../api/deviceRegistrationApi';
import { getAllDeviceTypes, DeviceType } from '../api/deviceTypeApi';
*/

type RootStackParamList = {
  MainTabs: undefined;
};

type NavProp = StackNavigationProp<RootStackParamList, 'MainTabs'>;

// UI-specific interface for a request
interface Request {
  id: string; // Corresponds to requestId
  serial: string;
  type: string;
  os: string;
  build: string;
  date: string;
  notes: string;
  status: 'Pending' | 'Approved' | 'Denied';
}

// Helper to format API data for the UI
const formatRequest = (apiRequest: DeviceRegistrationRequest): Request => ({
  id: apiRequest.requestId.toString(),
  serial: apiRequest.serialNo,
  type: apiRequest.deviceTypeName,
  os: apiRequest.osVersion || 'N/A',
  build: apiRequest.buildNumber || 'N/A',
  date: new Date(apiRequest.requestedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }),
  notes: apiRequest.notes || 'No notes provided.',
  status: 'Pending', // All requests from this API are pending
});

const DeviceRequestsScreen: React.FC = () => {
  const navigation = useNavigation<NavProp>();

  // State for data, loading, and errors
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [submittingRequestId, setSubmittingRequestId] = useState<string | null>(null);

  // State for filters
  const [statusFilterOpen, setStatusFilterOpen] = useState(false);
  const [statusFilterValue, setStatusFilterValue] = useState<string>('Pending');
  const [statusFilterItems, setStatusFilterItems] = useState([
    { label: 'Pending', value: 'Pending' },
    { label: 'Approved', value: 'Approved' },
    { label: 'Denied', value: 'Denied' },
  ]);

  const [typeFilterOpen, setTypeFilterOpen] = useState(false);
  const [typeFilterValue, setTypeFilterValue] = useState<string>('All');
  const [typeFilterItems, setTypeFilterItems] = useState([
    { label: 'All Device Types', value: 'All' },
  ]);

  // TODO: Dealer dropdown state needs to be wired up if required
  const [dealerOpen, setDealerOpen] = useState(false);
  const [dealerValue, setDealerValue] = useState<string>('');
  const [dealerItems, setDealerItems] = useState([
    { label: '-- Select Dealer --', value: '' },
    { label: 'TechSolutions Inc.', value: 'TechSolutions Inc.' },
    { label: 'Global Trackers LLC', value: 'Global Trackers LLC' },
  ]);

  // Fetch data from API
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await SecureStore.getItemAsync('accessToken') || 'mock-token'; // Use a mock token
      if (!token) {
        throw new Error('Authentication token not found.');
      }
      console.log('Before call to getPendingRegistrationRequests');

      // Fetch requests and device types in parallel
      const [pendingRequests, deviceTypes] = await Promise.all([
        getPendingRegistrationRequests(token),
        getAllDeviceTypes(token),
      ]);
      console.log('The call for getPendingRegistrationRequests was successful');
      console.log('Pending Requests:', pendingRequests);
      console.log('Device Types:', deviceTypes);
      setRequests(pendingRequests.map(formatRequest));

      const formattedTypes = deviceTypes.map((type: DeviceType) => ({
        label: type.name,
        value: type.name,
      }));
      setTypeFilterItems([{ label: 'All Device Types', value: 'All' }, ...formattedTypes]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleApprove = async (requestId: string) => {
    setSubmittingRequestId(requestId);
    try {
      const token = await SecureStore.getItemAsync('accessToken') || 'mock-token';
      if (!token) throw new Error('Authentication token not found.');

      await approveRegistrationRequest(token, parseInt(requestId, 10));
      Alert.alert('Success (Mock)', 'Device registration has been approved.');
      fetchData(); // Refresh list
    } catch (err) {
      Alert.alert('Error (Mock)', err instanceof Error ? err.message : 'Failed to approve request.');
    } finally {
      setSubmittingRequestId(null);
    }
  };

  const handleDeny = (requestId: string) => {
    Alert.prompt(
      'Deny Request',
      'Please provide a reason for denying this request.',
      async (reason) => {
        if (!reason) return; // User cancelled or entered no reason

        setSubmittingRequestId(requestId);
        try {
          const token = await SecureStore.getItemAsync('accessToken') || 'mock-token';
          if (!token) throw new Error('Authentication token not found.');

          await rejectRegistrationRequest(token, parseInt(requestId, 10), reason);
          Alert.alert('Success (Mock)', 'Device registration has been denied.');
          fetchData(); // Refresh list
        } catch (err) {
          Alert.alert('Error (Mock)', err instanceof Error ? err.message : 'Failed to deny request.');
        } finally {
          setSubmittingRequestId(null);
        }
      },
    );
  };

  const filteredRequests = requests.filter(
    (r) =>
      (statusFilterValue === 'All' || r.status === statusFilterValue) &&
      (typeFilterValue === 'All' || r.type === typeFilterValue),
  );

  const renderContent = () => {
    if (loading) {
      return <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 50 }} />;
    }
    if (error) {
      return <Text style={styles.errorText}>{error}</Text>;
    }
    if (filteredRequests.length === 0) {
      return <Text style={styles.emptyText}>No pending requests found.</Text>;
    }
    return (
      <FlatList
        data={filteredRequests}
        keyExtractor={(r) => r.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshing={loading}
        onRefresh={fetchData}
        renderItem={({ item }) => {
          const isSubmitting = submittingRequestId === item.id;
          return (
            <View style={cardStyles.container}>
              <View style={styles.cardTop}>
                <MaterialIcons name="schedule" size={20} color={colors.accent} />
                <Text style={cardStyles.title}>{item.serial}</Text>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{item.status}</Text>
                </View>
              </View>
              <Text style={cardStyles.detail}>Device Type: {item.type}</Text>
              <Text style={cardStyles.detail}>OS Version: {item.os}</Text>
              <Text style={cardStyles.detail}>Build: {item.build}</Text>
              <Text style={cardStyles.detail}>Request Date: {item.date}</Text>
              <Text style={cardStyles.detail}>Notes: {item.notes}</Text>

              {/* This dealer selector is still using mock data as per original code */}
              <Text style={styles.selectLabel}>Select Dealer</Text>
              <View style={[styles.pickerWrapper, { zIndex: 1000 }]}>
                <DropDownPicker<string>
                  open={dealerOpen}
                  value={dealerValue}
                  items={dealerItems}
                  setOpen={setDealerOpen}
                  setValue={setDealerValue}
                  setItems={setDealerItems}
                  style={styles.dealerPicker}
                  dropDownContainerStyle={styles.dealerPickerDropdown}
                  placeholder="-- Select Dealer --"
                />
              </View>

              <View style={styles.actions}>
                <TouchableOpacity
                  style={[styles.actionBtn, styles.deny]}
                  onPress={() => handleDeny(item.id)}
                  disabled={isSubmitting}
                >
                  <Text style={styles.actionTextDeny}>Deny</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionBtn, styles.approve]}
                  onPress={() => handleApprove(item.id)}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <ActivityIndicator size="small" color="#FFF" />
                  ) : (
                    <Text style={styles.actionTextApprove}>Approve</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header and Filters are mostly unchanged, but now use state-driven items */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={textStyles.heading}>Device Requests</Text>
      </View>

      {/* Filters */}
      <View style={styles.filters}>
        <View style={[styles.pickerWrapper, { zIndex: statusFilterOpen ? 3000 : 2000 }]}>
          <DropDownPicker<string>
            open={statusFilterOpen}
            value={statusFilterValue}
            items={statusFilterItems}
            setOpen={setStatusFilterOpen}
            setValue={setStatusFilterValue}
            setItems={setStatusFilterItems}
            style={styles.picker}
            dropDownContainerStyle={styles.pickerDropdown}
          />
        </View>
        <View
          style={[
            styles.pickerWrapper,
            { marginLeft: spacing.md, zIndex: typeFilterOpen ? 3000 : 1000 },
          ]}
        >
          <DropDownPicker<string>
            open={typeFilterOpen}
            value={typeFilterValue}
            items={typeFilterItems} // Using state-driven items
            setOpen={setTypeFilterOpen}
            setValue={setTypeFilterValue}
            setItems={setTypeFilterItems}
            style={styles.picker}
            dropDownContainerStyle={styles.pickerDropdown}
          />
        </View>
      </View>

      {/* Count Bar */}
      <View style={styles.countBar}>
        <Text style={textStyles.subtitle}>{requests.length} Pending Requests</Text>
        <TouchableOpacity onPress={fetchData}>
          <Text style={styles.refreshText}>Refresh</Text>
        </TouchableOpacity>
      </View>

      {renderContent()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  // --- Keep all your original styles here ---
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    marginBottom: spacing.lg,
  },
  backBtn: { marginRight: spacing.md },
  filters: {
    flexDirection: 'row',
    marginBottom: spacing.md,
    zIndex: 3000,
    paddingHorizontal: spacing.lg,
  },
  pickerWrapper: {
    flex: 1,
  },
  picker: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    minHeight: 44,
  },
  pickerDropdown: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    position: 'absolute',
  },
  pickerText: {
    color: colors.text,
  },
  countBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  refreshText: { color: colors.primary, fontSize: fontSizes.medium },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  badge: {
    backgroundColor: colors.accent,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    marginLeft: 'auto',
  },
  badgeText: { color: colors.background, fontWeight: fontWeights.semibold },
  selectLabel: {
    color: colors.text,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
    fontSize: fontSizes.medium,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: spacing.md,
    zIndex: -1, // Ensure actions are below dealer dropdown
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginLeft: 8,
  },
  deny: { backgroundColor: '#1F2937', borderWidth: 1, borderColor: '#6B7280' },
  approve: { backgroundColor: '#3B82F6' },
  actionTextDeny: { color: '#6B7280', fontWeight: '600' },
  actionTextApprove: { color: '#FFF', fontWeight: '600' },
  dealerPicker: {
    backgroundColor: colors.card,
    borderColor: colors.border,
  },
  dealerPickerDropdown: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    position: 'absolute',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
    fontSize: fontSizes.large,
  },
  emptyText: {
    color: colors.text,
    textAlign: 'center',
    marginTop: 20,
    fontSize: fontSizes.large,
  },
});

export default DeviceRequestsScreen;
