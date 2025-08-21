/* Full file with the zIndex fix for the action buttons */
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

// Real API imports
import {
  getPendingRegistrationRequests,
  approveRegistrationRequest,
  rejectRegistrationRequest,
  DeviceRegistrationRequest,
} from '../api/deviceRegistrationApi';
import { getAllDeviceTypes, DeviceType } from '../api/deviceTypeApi';

// Navigation types
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

function extractErrorMessage(err: any, fallback = 'An unknown error occurred.'): string {
  if (!err) return fallback;
  if (typeof err === 'string') return err;
  if (err instanceof Error && err.message) return err.message;
  if (err?.message) return String(err.message);
  if (err?.description) return String(err.description);
  if (err?.error) return String(err.error);
  try {
    return JSON.stringify(err);
  } catch {
    return fallback;
  }
}

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
  status: 'Pending',
});

const DeviceRequestsScreen: React.FC = () => {
  const navigation = useNavigation<NavProp>();

  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [submittingRequestId, setSubmittingRequestId] = useState<string | null>(null);

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

  const [dealerOpen, setDealerOpen] = useState(false);
  const [dealerValue, setDealerValue] = useState<string>('');
  const [dealerItems, setDealerItems] = useState([
    { label: '-- Select Dealer --', value: '' },
    { label: 'TechSolutions Inc.', value: 'TechSolutions Inc.' },
    { label: 'Global Trackers LLC', value: 'Global Trackers LLC' },
  ]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = (await SecureStore.getItemAsync('accessToken')) || '';
      console.log('DeviceRequestsScreen: token from SecureStore:', !!token);
      if (!token) {
        throw new Error('Authentication token not found.');
      }

      if (typeof getPendingRegistrationRequests !== 'function') {
        throw new Error(
          'getPendingRegistrationRequests is not a function / not correctly imported.',
        );
      }

      console.log('DeviceRequestsScreen: calling getPendingRegistrationRequests...');
      let pendingRequests: DeviceRegistrationRequest[] = [];
      try {
        pendingRequests = await getPendingRegistrationRequests(token);
        console.log(
          'DeviceRequestsScreen: getPendingRegistrationRequests succeeded, count=',
          pendingRequests?.length ?? 'unknown',
          
        );
        console.log('DeviceRequestsScreen: pendingRequests:', pendingRequests);
      } catch (reqErr) {
        console.error('DeviceRequestsScreen: getPendingRegistrationRequests failed:', reqErr);
        throw reqErr;
      }

      let deviceTypes: DeviceType[] = [];
      if (typeof getAllDeviceTypes === 'function') {
        try {
          console.log('DeviceRequestsScreen: calling getAllDeviceTypes...');
          deviceTypes = await getAllDeviceTypes(token);
          console.log(
            'DeviceRequestsScreen: getAllDeviceTypes succeeded, count=',
            deviceTypes?.length ?? 'unknown',
          );
        } catch (dtErr) {
          console.warn('DeviceRequestsScreen: getAllDeviceTypes failed (continuing):', dtErr);
          deviceTypes = [];
        }
      } else {
        console.warn('DeviceRequestsScreen: getAllDeviceTypes is not available.');
      }

      setRequests(pendingRequests.map(formatRequest));

      const formattedTypes = deviceTypes.map((type: DeviceType) => ({
        label: type.name,
        value: type.name,
      }));
      setTypeFilterItems([{ label: 'All Device Types', value: 'All' }, ...formattedTypes]);
    } catch (err) {
      const msg = extractErrorMessage(err, 'An unknown error occurred.');
      console.error('DeviceRequestsScreen: fetchData error (final):', err);
      setError(msg);
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
      const token = (await SecureStore.getItemAsync('accessToken')) || '';
      if (!token) throw new Error('Authentication token not found.');

      if (typeof approveRegistrationRequest !== 'function') {
        throw new Error('approveRegistrationRequest is not a function / not correctly imported.');
      }

      await approveRegistrationRequest(token, parseInt(requestId, 10));
      Alert.alert('Success', 'Device registration has been approved.');
      fetchData();
    } catch (err) {
      const msg = extractErrorMessage(err, 'Failed to approve request.');
      console.error('DeviceRequestsScreen approve error:', err);
      Alert.alert('Error', msg);
    } finally {
      setSubmittingRequestId(null);
    }
  };

  const handleDeny = (requestId: string) => {
    Alert.prompt(
      'Deny Request',
      'Please provide a reason for denying this request.',
      async (reason) => {
        if (!reason) return;

        setSubmittingRequestId(requestId);
        try {
          const token = (await SecureStore.getItemAsync('accessToken')) || '';
          if (!token) throw new Error('Authentication token not found.');

          if (typeof rejectRegistrationRequest !== 'function') {
            throw new Error(
              'rejectRegistrationRequest is not a function / not correctly imported.',
            );
          }

          await rejectRegistrationRequest(token, parseInt(requestId, 10), reason);
          Alert.alert('Success', 'Device registration has been denied.');
          fetchData();
        } catch (err) {
          const msg = extractErrorMessage(err, 'Failed to deny request.');
          console.error('DeviceRequestsScreen reject error:', err);
          Alert.alert('Error', msg);
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
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={textStyles.heading}>Device Requests</Text>
      </View>

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
            items={typeFilterItems}
            setOpen={setTypeFilterOpen}
            setValue={setTypeFilterValue}
            setItems={setTypeFilterItems}
            style={styles.picker}
            dropDownContainerStyle={styles.pickerDropdown}
          />
        </View>
      </View>

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
    // removed negative zIndex which hid the buttons; keep it at default (0)
    zIndex: 0,
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
