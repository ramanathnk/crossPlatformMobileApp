/* DeviceRequestsScreen.tsx
   Updated:
   - Badge background now reflects status: green for Approved, red for Rejected, accent for Pending.
   - Approve/Deny buttons show a clear visual disabled cue (reduced opacity + muted text color).
   - Buttons remain functionally disabled when no dealer is selected or when submitting.
*/
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import DropDownPicker from 'react-native-dropdown-picker';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import * as SecureStore from 'expo-secure-store';

import { colors, spacing, fontSizes, borderRadius, fontWeights } from '../styles/theme';
import { cardStyles, textStyles } from '../styles/commonStyles';

import { DeviceRegistrationRequest } from '../api/deviceRegistrationApi';
import { getAllDeviceTypes, DeviceType } from '../api/deviceTypeApi';

// Redux slice thunks & selectors - update path if your slice is located elsewhere
import {
  fetchPendingRequests,
  approveRequest,
  rejectRequest,
  selectPendingRequests,
  selectDeviceRequestsLoading,
  selectDeviceRequestsError,
} from '../store/deviceRequestsSlice';

type RootStackParamList = {
  MainTabs: undefined;
};
type NavProp = StackNavigationProp<RootStackParamList, 'MainTabs'>;

interface DeviceDealer {
  dealerName: string;
  requestId: string;
}

interface DeviceGroup {
  deviceKey: string;
  serial: string;
  type: string;
  os: string;
  build: string;
  date: string;
  notes: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  requestIds: string[]; // all requestIds in group
  dealers: DeviceDealer[]; // dealer + requestId pairs (deduplicated by requestId)
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

const normalizeStatus = (apiStatus?: any): DeviceGroup['status'] => {
  if (!apiStatus) return 'Pending';
  const s = String(apiStatus).toLowerCase();
  if (s === 'approved' || s === 'approve') return 'Approved';
  if (s === 'denied' || s === 'rejected' || s === 'reject') return 'Rejected';
  return 'Pending';
};

const formatDateFromApi = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'N/A';

const APPROVED_COLOR = '#10B981'; // green
const REJECTED_COLOR = '#EF4444'; // red

const DeviceRequestsScreen: React.FC = () => {
  const navigation = useNavigation<NavProp>();
  const dispatch = useDispatch<any>();

  // Redux-backed source data
  const allRequests = useSelector((state: any) => selectPendingRequests(state)) as
    | DeviceRegistrationRequest[]
    | undefined;
  const loading = useSelector((state: any) => selectDeviceRequestsLoading(state)) as boolean;
  const error = useSelector((state: any) => selectDeviceRequestsError(state)) as string | null;

  // Local UI state
  const [deviceGroups, setDeviceGroups] = useState<DeviceGroup[]>([]);
  const [statusFilterOpen, setStatusFilterOpen] = useState(false);
  const [statusFilterValue, setStatusFilterValue] = useState<'Pending' | 'Approved' | 'Rejected'>(
    'Pending',
  );
  const [statusFilterItems, setStatusFilterItems] = useState<
    Array<{ label: string; value: 'Pending' | 'Approved' | 'Rejected' }>
  >([
    { label: 'Pending', value: 'Pending' },
    { label: 'Approved', value: 'Approved' },
    { label: 'Rejected', value: 'Rejected' },
  ]);

  const [typeFilterOpen, setTypeFilterOpen] = useState(false);
  const [typeFilterValue, setTypeFilterValue] = useState<string>('All');
  const [typeFilterItems, setTypeFilterItems] = useState([
    { label: 'All Device Types', value: 'All' },
  ]);

  // Per-device dropdown state keyed by deviceKey
  const [dealerState, setDealerState] = useState<
    Record<
      string,
      {
        open: boolean;
        value: string; // selected requestId (empty string = none selected)
        items: Array<{ label: string; value: string }>;
      }
    >
  >({});

  // track submitting requestIds to disable buttons while in-flight
  const [submittingIds, setSubmittingIds] = useState<string[]>([]);

  // Deny modal
  const [denyModalVisible, setDenyModalVisible] = useState(false);
  const [denyModalReason, setDenyModalReason] = useState('');
  const [denyModalRequestId, setDenyModalRequestId] = useState<string | null>(null);

  // refresh
  const refresh = useCallback(() => dispatch(fetchPendingRequests()), [dispatch]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Fetch device types to populate the device-type dropdown
  const fetchDeviceTypes = useCallback(async () => {
    try {
      const token = (await SecureStore.getItemAsync('accessToken')) || '';
      if (!token) {
        console.warn(
          'DeviceRequestsScreen: no access token for device types. Device types not loaded.',
        );
        setTypeFilterItems([{ label: 'All Device Types', value: 'All' }]);
        return;
      }
      if (typeof getAllDeviceTypes !== 'function') {
        console.warn('DeviceRequestsScreen: getAllDeviceTypes not available.');
        setTypeFilterItems([{ label: 'All Device Types', value: 'All' }]);
        return;
      }
      const types: DeviceType[] = await getAllDeviceTypes(token);
      const formatted = types.map((t) => ({ label: t.name, value: t.name }));
      setTypeFilterItems([{ label: 'All Device Types', value: 'All' }, ...formatted]);
    } catch (err) {
      console.warn('DeviceRequestsScreen: fetchDeviceTypes failed:', err);
      setTypeFilterItems([{ label: 'All Device Types', value: 'All' }]);
    }
  }, []);

  // fetch device types on mount
  useEffect(() => {
    fetchDeviceTypes();
  }, [fetchDeviceTypes]);

  // Build consolidated groups when source requests or filters change
  useEffect(() => {
    const src = allRequests ?? [];

    const mapped = src.map((r) => {
      const dealerName =
        (r as any).dealerName ?? (r as any).dealer ?? (r as any).supplierName ?? '';
      return {
        raw: r,
        requestId: String(r.requestId),
        serial: (r as any).serialNo ?? '',
        deviceTypeName: (r as any).deviceTypeName ?? '',
        osVersion: (r as any).osVersion ?? 'N/A',
        buildNumber: (r as any).buildNumber ?? 'N/A',
        requestedAt: (r as any).requestedAt,
        notes: (r as any).notes ?? '',
        dealerName,
        status: normalizeStatus((r as any).status),
      };
    });

    // apply status filter
    const statusFiltered = mapped.filter((m) => m.status === statusFilterValue);

    // apply type filter
    const typeFiltered =
      typeFilterValue === 'All'
        ? statusFiltered
        : statusFiltered.filter((m) => m.deviceTypeName === typeFilterValue);

    // group by serial (fallback to requestId)
    const groups = new Map<string, DeviceGroup>();

    for (const m of typeFiltered) {
      const key = m.serial || m.requestId;
      if (!groups.has(key)) {
        groups.set(key, {
          deviceKey: key,
          serial: m.serial || `#${m.requestId}`,
          type: m.deviceTypeName || 'Unknown',
          os: m.osVersion,
          build: m.buildNumber,
          date: formatDateFromApi(m.requestedAt),
          notes: m.notes || 'No notes provided.',
          status: m.status,
          requestIds: [m.requestId],
          dealers: m.dealerName ? [{ dealerName: m.dealerName, requestId: m.requestId }] : [],
        });
      } else {
        const g = groups.get(key)!;
        if (!g.requestIds.includes(m.requestId)) g.requestIds.push(m.requestId);
        if (m.dealerName && !g.dealers.some((d) => d.requestId === m.requestId)) {
          g.dealers.push({ dealerName: m.dealerName, requestId: m.requestId });
        }
      }
    }

    const groupArray = Array.from(groups.values());
    setDeviceGroups(groupArray);

    // initialize or update dealerState for Pending groups: default selection is empty string
    setDealerState((prev) => {
      const next: typeof prev = {};
      for (const g of groupArray) {
        // compute items from dealers (label = dealerName, value = requestId)
        const items = g.dealers.map((d) => ({ label: d.dealerName, value: d.requestId }));
        const existing = prev[g.deviceKey];
        next[g.deviceKey] = {
          open: existing?.open ?? false,
          value: existing?.value ?? '', // ensure empty selection by default unless already set
          items,
        };
      }
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allRequests, statusFilterValue, typeFilterValue]);

  const setDeviceDealerState = (
    deviceKey: string,
    patch: Partial<{
      open: boolean;
      value: string;
      items: Array<{ label: string; value: string }>;
    }>,
  ) => {
    setDealerState((prev) => ({
      ...prev,
      [deviceKey]: {
        ...(prev[deviceKey] ?? { open: false, value: '', items: [] }),
        ...patch,
      },
    }));
  };

  // Approve a single requestId (selected dealer)
  const handleApproveRequestId = async (requestId: string) => {
    if (!requestId) return;
    setSubmittingIds((prev) => Array.from(new Set([...prev, requestId])));
    try {
      await dispatch(approveRequest({ requestId: parseInt(requestId, 10) })).unwrap();
      Alert.alert('Success', `Approved request ${requestId}.`);
      await refresh();
    } catch (err) {
      const msg = extractErrorMessage(err, 'Failed to approve request.');
      console.error('approve error:', err);
      Alert.alert('Error', msg);
    } finally {
      setSubmittingIds((prev) => prev.filter((id) => id !== requestId));
    }
  };

  // Open deny modal for a single requestId
  const openDenyModal = (requestId: string) => {
    setDenyModalRequestId(requestId);
    setDenyModalReason('');
    setDenyModalVisible(true);
  };

  const closeDenyModal = () => {
    setDenyModalVisible(false);
    setDenyModalReason('');
    setDenyModalRequestId(null);
  };

  const submitDenyFromModal = async () => {
    const requestId = denyModalRequestId;
    const reason = (denyModalReason || '').trim();
    if (!requestId) return;
    if (!reason) {
      Alert.alert('Validation', 'Please enter a reason for denying the request.');
      return;
    }

    setSubmittingIds((prev) => Array.from(new Set([...prev, requestId])));
    setDenyModalVisible(false);

    try {
      await dispatch(
        rejectRequest({ requestId: parseInt(requestId, 10), rejectionReason: reason }),
      ).unwrap();
      Alert.alert('Success', `Denied request ${requestId}.`);
      await refresh();
    } catch (err) {
      const msg = extractErrorMessage(err, 'Failed to deny request.');
      console.error('deny error:', err);
      Alert.alert('Error', msg);
    } finally {
      setSubmittingIds((prev) => prev.filter((id) => id !== requestId));
      setDenyModalRequestId(null);
      setDenyModalReason('');
    }
  };

  const filteredCount = deviceGroups.length;

  const renderContent = () => {
    if (loading) {
      return <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 50 }} />;
    }
    if (error) {
      return <Text style={styles.errorText}>{error}</Text>;
    }
    if (deviceGroups.length === 0) {
      return (
        <Text style={styles.emptyText}>No requests matching the selected status were found.</Text>
      );
    }

    return (
      <>
        <FlatList
          data={deviceGroups}
          keyExtractor={(g) => g.deviceKey}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshing={loading}
          onRefresh={refresh}
          renderItem={({ item }) => {
            const stateForDevice = dealerState[item.deviceKey] ?? {
              open: false,
              value: '',
              items: item.dealers.map((d) => ({ label: d.dealerName, value: d.requestId })),
            };
            const selectedRequestId = stateForDevice.value || '';
            const isSubmitting = selectedRequestId
              ? submittingIds.includes(selectedRequestId)
              : false;

            // Choose icon & color depending on status
            let iconName: React.ComponentProps<typeof MaterialIcons>['name'] = 'schedule';
            let iconColor = colors.accent;
            let badgeColor = colors.accent;
            if (item.status === 'Approved') {
              iconName = 'check-circle';
              iconColor = APPROVED_COLOR;
              badgeColor = APPROVED_COLOR;
            } else if (item.status === 'Rejected') {
              iconName = 'cancel';
              iconColor = REJECTED_COLOR;
              badgeColor = REJECTED_COLOR;
            }

            const disableActions = isSubmitting || !selectedRequestId;

            return (
              <View style={cardStyles.container}>
                <View style={styles.cardTop}>
                  <MaterialIcons name={iconName} size={20} color={iconColor} />
                  <Text style={cardStyles.title}>{item.serial}</Text>
                  <View style={[styles.badge, { backgroundColor: badgeColor }]}>
                    <Text style={styles.badgeText}>{item.status}</Text>
                  </View>
                </View>

                <Text style={cardStyles.detail}>Device Type: {item.type}</Text>
                <Text style={cardStyles.detail}>OS Version: {item.os}</Text>
                <Text style={cardStyles.detail}>Build: {item.build}</Text>
                <Text style={cardStyles.detail}>Request Date: {item.date}</Text>
                <Text style={cardStyles.detail}>Notes: {item.notes}</Text>

                {/* Dealers: dropdown only for Pending status */}
                <Text style={[styles.selectLabel, { marginTop: spacing.md }]}>Dealers</Text>

                {item.status === 'Pending' ? (
                  <View style={[styles.pickerWrapper, { zIndex: 1000 }]}>
                    <DropDownPicker<string>
                      open={stateForDevice.open}
                      value={stateForDevice.value}
                      items={[{ label: '-- Select Dealer --', value: '' }, ...stateForDevice.items]}
                      setOpen={(val: React.SetStateAction<boolean>) => {
                        const isOpen =
                          typeof val === 'function'
                            ? (val as (p: boolean) => boolean)(stateForDevice.open)
                            : val;
                        setDeviceDealerState(item.deviceKey, { open: isOpen as boolean });
                      }}
                      setValue={(cbOrVal: any) => {
                        const newVal =
                          typeof cbOrVal === 'function' ? cbOrVal(stateForDevice.value) : cbOrVal;
                        const v = newVal == null ? '' : String(newVal);
                        setDeviceDealerState(item.deviceKey, { value: v });
                      }}
                      setItems={(newItems: any) =>
                        setDeviceDealerState(item.deviceKey, { items: newItems })
                      }
                      style={styles.dealerPicker}
                      dropDownContainerStyle={styles.dealerPickerDropdown}
                      placeholder="-- Select Dealer --"
                    />
                  </View>
                ) : (
                  // For non-pending items, show dealers as text
                  <Text style={cardStyles.detail}>
                    {item.dealers.length > 0
                      ? item.dealers.map((d) => d.dealerName).join(', ')
                      : '—'}
                  </Text>
                )}

                {/* Actions: only when Pending. Buttons disabled unless a dealer (requestId) is selected. */}
                {item.status === 'Pending' ? (
                  <View style={styles.actions}>
                    <TouchableOpacity
                      style={[
                        styles.actionBtn,
                        styles.deny,
                        disableActions ? styles.actionBtnDisabled : null,
                      ]}
                      onPress={() => openDenyModal(selectedRequestId)}
                      disabled={disableActions}
                    >
                      <Text
                        style={disableActions ? styles.actionTextDisabled : styles.actionTextDeny}
                      >
                        Deny
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.actionBtn,
                        styles.approve,
                        disableActions ? styles.actionBtnDisabled : null,
                      ]}
                      onPress={() => handleApproveRequestId(selectedRequestId)}
                      disabled={disableActions}
                    >
                      {isSubmitting ? (
                        <ActivityIndicator size="small" color="#FFF" />
                      ) : (
                        <Text
                          style={
                            disableActions ? styles.actionTextDisabled : styles.actionTextApprove
                          }
                        >
                          Approve
                        </Text>
                      )}
                    </TouchableOpacity>
                  </View>
                ) : null}
              </View>
            );
          }}
        />

        {/* Deny Modal */}
        <Modal
          visible={denyModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => closeDenyModal()}
        >
          <View style={styles.modalBackdrop}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Deny Request</Text>
              <Text style={styles.modalSubtitle}>
                Please provide a reason for denying the selected request:
              </Text>
              <TextInput
                value={denyModalReason}
                onChangeText={setDenyModalReason}
                placeholder="Enter reason"
                multiline
                style={styles.modalInput}
                numberOfLines={4}
                editable={true}
                autoFocus={true}
              />
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.modalBtn, styles.modalCancel]}
                  onPress={closeDenyModal}
                >
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.modalBtn,
                    styles.modalSubmit,
                    { opacity: denyModalReason.trim() ? 1 : 0.5 },
                  ]}
                  onPress={submitDenyFromModal}
                  disabled={!denyModalReason.trim()}
                >
                  <Text style={styles.modalSubmitText}>Submit</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </>
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
          <DropDownPicker<'Pending' | 'Approved' | 'Rejected'>
            open={statusFilterOpen}
            value={statusFilterValue}
            items={statusFilterItems}
            setOpen={(val: React.SetStateAction<boolean>) => {
              const isOpen =
                typeof val === 'function'
                  ? (val as (p: boolean) => boolean)(statusFilterOpen)
                  : val;
              setStatusFilterOpen(isOpen as boolean);
            }}
            setValue={(cbOrVal: any) => {
              const newVal = typeof cbOrVal === 'function' ? cbOrVal(statusFilterValue) : cbOrVal;
              setStatusFilterValue(newVal as 'Pending' | 'Approved' | 'Rejected');
            }}
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
            setOpen={(val: React.SetStateAction<boolean>) => {
              const isOpen =
                typeof val === 'function' ? (val as (p: boolean) => boolean)(typeFilterOpen) : val;
              setTypeFilterOpen(isOpen as boolean);
            }}
            setValue={(cbOrVal: any) => {
              const newVal = typeof cbOrVal === 'function' ? cbOrVal(typeFilterValue) : cbOrVal;
              setTypeFilterValue(newVal as string);
            }}
            setItems={setTypeFilterItems}
            style={styles.picker}
            dropDownContainerStyle={styles.pickerDropdown}
          />
        </View>
      </View>

      <View style={styles.countBar}>
        <Text style={textStyles.subtitle}>{filteredCount} Requests</Text>
        <TouchableOpacity onPress={refresh}>
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
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    marginLeft: 'auto',
  },
  badgeText: { color: '#FFF', fontWeight: fontWeights.semibold },
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
    zIndex: 0,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginLeft: 8,
  },
  actionBtnDisabled: {
    opacity: 0.5,
  },
  deny: { backgroundColor: '#1F2937', borderWidth: 1, borderColor: '#6B7280' },
  approve: { backgroundColor: '#3B82F6' },
  actionTextDeny: { color: '#6B7280', fontWeight: '600' },
  actionTextApprove: { color: '#FFF', fontWeight: '600' },
  actionTextDisabled: { color: '#9CA3AF', fontWeight: '600' },
  dealerPicker: {
    backgroundColor: colors.card,
    borderColor: colors.border,
  },
  dealerPickerDropdown: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    position: 'absolute',
  },
  // modal styles
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  modalContainer: {
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 16,
    elevation: 6,
  },
  modalTitle: {
    fontSize: fontSizes.large,
    fontWeight: '700',
    marginBottom: 8,
    color: colors.text,
  },
  modalSubtitle: {
    color: colors.text,
    marginBottom: 8,
  },
  modalInput: {
    backgroundColor: '#fff',
    minHeight: 80,
    borderRadius: 6,
    padding: 8,
    marginBottom: 12,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  modalBtn: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 6,
    marginLeft: 8,
  },
  modalCancel: {
    backgroundColor: 'transparent',
  },
  modalCancelText: {
    color: colors.text,
  },
  modalSubmit: {
    backgroundColor: colors.primary,
  },
  modalSubmitText: {
    color: '#fff',
    fontWeight: '600',
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
