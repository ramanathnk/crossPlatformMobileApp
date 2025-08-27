/* eslint-disable react/prop-types */
import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  RefreshControl,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import type { Dealer as ApiDealer } from '../api/dealerApi';
import type { DeviceType as ApiDeviceType } from '../api/deviceTypeApi';
import type { Manufacturer } from '../api/manufacturerApi';

import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../store';

import {
  fetchDealers,
  createDealerRequest,
  updateDealerRequest,
  deleteDealerRequest,
  selectDealers,
  selectDealersLoading,
} from '../store/dealerSlice';

import {
  fetchDeviceTypes,
  createDeviceTypeRequest,
  updateDeviceTypeRequest,
  deleteDeviceTypeRequest,
  selectDeviceTypes,
  selectDeviceTypesLoading,
} from '../store/deviceTypeSlice';

import {
  fetchManufacturers,
  createManufacturerRequest,
  updateManufacturerRequest,
  deleteManufacturerRequest,
  selectManufacturers,
  selectManufacturersLoading,
} from '../store/manufacturerSliceMock';

import RecordManagementList from '../components/RecordManagementList';
import GenericModal from '../components/GenericModal';

type RecordItem = ApiDealer | ApiDeviceType | Manufacturer;

const TAB_LABELS = ['Dealers', 'Device Types', 'Manufacturers'];

interface FormField {
  label: string;
  placeholder: string;
  key: string;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad' | 'url';
}

/**
 * Generic FormContent component.
 *
 * Make the component generic (T) so onChange can accept a React setState dispatch for the matching state.
 * This resolves the type incompatibility when passing setDealerFormValues / setDeviceTypeFormValues / setManufacturerFormValues.
 */
const FormContent = <
  T extends Record<string, unknown> | ApiDealer | ApiDeviceType | Manufacturer | null,
>({
  initial,
  fields,
  onChange,
}: {
  initial?: T | null;
  fields: FormField[];
  // onChange is typed to accept a React state setter for T | null
  onChange: React.Dispatch<React.SetStateAction<T | null>>;
}) => {
  const [formValues, setFormValues] = useState<T | null>(initial ?? null);

  useEffect(() => {
    setFormValues(initial ?? null);
  }, [initial]);

  useEffect(() => {
    onChange(formValues);
  }, [formValues, onChange]);

  const handleChange = (key: string, value: string) => {
    setFormValues((prev) => {
      // Start from previous value if object-like, otherwise start with empty record
      const base = prev && typeof prev === 'object' ? { ...(prev as Record<string, unknown>) } : {};
      // assign new value (cast to any to mutate record)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (base as any)[key] = value;
      // cast back to T
      return base as unknown as T;
    });
  };

  return (
    <>
      {fields.map((field) => (
        <View key={field.key}>
          {field.label ? <Text style={styles.label}>{field.label}</Text> : null}
          <TextInput
            style={styles.input}
            placeholder={field.placeholder}
            placeholderTextColor={COLORS.muted}
            value={
              formValues &&
              typeof formValues === 'object' &&
              field.key in (formValues as Record<string, unknown>)
                ? String((formValues as Record<string, unknown>)[field.key])
                : ''
            }
            onChangeText={(text) => handleChange(field.key, text)}
            autoCapitalize={field.autoCapitalize || 'none'}
            keyboardType={field.keyboardType || 'default'}
            testID={`${field.key}-input`}
          />
        </View>
      ))}
    </>
  );
};

const dealerFormFields: FormField[] = [
  { label: '', placeholder: 'Dealer name', key: 'name', autoCapitalize: 'words' },
  { label: '', placeholder: 'Mobile Web API URL', key: 'mobileWebAPIUrl', keyboardType: 'url' },
  { label: '', placeholder: 'Application', key: 'application' },
];

const deviceTypeFormFields: FormField[] = [
  { label: '', placeholder: 'Device name', key: 'name', autoCapitalize: 'words' },
  { label: '', placeholder: 'Model number', key: 'modelNumber' },
  {
    label: 'Manufacturer',
    placeholder: 'Manufacturer ID',
    key: 'manufacturerId',
    keyboardType: 'numeric',
  },
];

const manufacturerFormFields: FormField[] = [
  { label: '', placeholder: 'Manufacturer name', key: 'name', autoCapitalize: 'words' },
];

const RecordsScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  const [activeTab, setActiveTab] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  const [dealerFormVisible, setDealerFormVisible] = useState(false);
  const [deviceTypeFormVisible, setDeviceTypeFormVisible] = useState(false);
  const [manufacturerFormVisible, setManufacturerFormVisible] = useState(false);
  const [editingDealer, setEditingDealer] = useState<ApiDealer | null>(null);
  const [editingDeviceType, setEditingDeviceType] = useState<ApiDeviceType | null>(null);
  const [editingManufacturer, setEditingManufacturer] = useState<Manufacturer | null>(null);

  // State types now accept both the typed API model or a free-form record (so assigning editingX directly is allowed)
  const [dealerFormValues, setDealerFormValues] = useState<
    Record<string, unknown> | ApiDealer | null
  >(null);
  const [deviceTypeFormValues, setDeviceTypeFormValues] = useState<
    Record<string, unknown> | ApiDeviceType | null
  >(null);
  const [manufacturerFormValues, setManufacturerFormValues] = useState<
    Record<string, unknown> | Manufacturer | null
  >(null);

  const [refreshing, setRefreshing] = useState(false);

  const dealers = useSelector((s: RootState) => selectDealers(s));
  const dealersLoading = useSelector((s: RootState) => selectDealersLoading(s));

  const deviceTypes = useSelector((s: RootState) => selectDeviceTypes(s));
  const deviceTypesLoading = useSelector((s: RootState) => selectDeviceTypesLoading(s));

  const manufacturers = useSelector((s: RootState) => selectManufacturers(s));
  const manufacturersLoading = useSelector((s: RootState) => selectManufacturersLoading(s));

  const canSaveDealer =
    !!dealerFormValues &&
    typeof dealerFormValues === 'object' &&
    !!(dealerFormValues as Record<string, unknown>)['name'];

  const canSaveDeviceType =
    !!deviceTypeFormValues &&
    typeof deviceTypeFormValues === 'object' &&
    !!(deviceTypeFormValues as Record<string, unknown>)['name'] &&
    !!(deviceTypeFormValues as Record<string, unknown>)['modelNumber'];

  const canSaveManufacturer =
    !!manufacturerFormValues &&
    typeof manufacturerFormValues === 'object' &&
    !!(manufacturerFormValues as Record<string, unknown>)['name'];

  useEffect(() => {
    dispatch(fetchDealers());
    dispatch(fetchDeviceTypes());
    dispatch(fetchManufacturers());
  }, [dispatch]);

  const performThunk = async (
    thunkAction: unknown,
    arg: unknown,
    errorTitle = 'Error',
  ): Promise<boolean> => {
    try {
      setSubmitting(true);
      // Build the action by calling the thunk action creator with the argument,
      // then dispatch that action. This matches how createAsyncThunk / RTK thunks are used.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const action = (thunkAction as any)(arg);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const dispatched = (dispatch as any)(action);
      // If the dispatched value supports .unwrap() (createAsyncThunk), await it.
      if (dispatched && typeof dispatched.unwrap === 'function') {
        await dispatched.unwrap();
      } else {
        // Otherwise await the dispatched promise (if it is a promise)
         
        await dispatched;
      }
      return true;
    } catch (err: unknown) {
      let message = 'Operation failed';
      if (typeof err === 'string') {
        message = err;
      } else if (err instanceof Error && err.message) {
        message = err.message;
      } else if (err && typeof err === 'object') {
        const e = err as Record<string, unknown>;
         
        message =
          (typeof e.payload === 'string' && (e.payload as string)) ||
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ((e.response as any)?.data?.message as string) ||
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ((e.response as any)?.data?.error as string) ||
          JSON.stringify(err);
      }
      Alert.alert(errorTitle, message);
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      if (activeTab === 0) {
        await dispatch(fetchDealers()).unwrap();
      } else if (activeTab === 1) {
        await dispatch(fetchDeviceTypes()).unwrap();
      } else {
        await dispatch(fetchManufacturers()).unwrap();
      }
    } catch {
      // slice-level errors handled elsewhere
    } finally {
      setRefreshing(false);
    }
  };

  // Dealers handlers
  const openAddDealer = () => {
    setEditingDealer(null);
    setDealerFormValues(null);
    setDealerFormVisible(true);
  };
  const openEditDealer = (dealer: ApiDealer) => {
    setEditingDealer(dealer);
    // set typed model directly (allowed by the updated state type)
    setDealerFormValues(dealer);
    setDealerFormVisible(true);
  };
  const handleDealerSubmit = async () => {
    if (!dealerFormValues) return;
    if (editingDealer) {
      const recordId = editingDealer.dealerId;
      await performThunk(
        updateDealerRequest,
        { dealerId: recordId, dealer: dealerFormValues },
        'Failed to update dealer',
      );
    } else {
      await performThunk(createDealerRequest, dealerFormValues, 'Failed to create dealer');
    }
    setDealerFormVisible(false);
    setEditingDealer(null);
    setDealerFormValues(null);
  };
  const confirmDeleteDealer = (dealer: ApiDealer) => {
    Alert.alert(
      'Delete dealer',
      `Are you sure you want to delete "${dealer.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await performThunk(
              deleteDealerRequest,
              { dealerId: dealer.dealerId },
              'Failed to delete dealer',
            );
          },
        },
      ],
      { cancelable: true },
    );
  };

  // Device type handlers
  const openAddDeviceType = () => {
    setEditingDeviceType(null);
    setDeviceTypeFormValues(null);
    setDeviceTypeFormVisible(true);
  };
  const openEditDeviceType = (deviceType: ApiDeviceType) => {
    setEditingDeviceType(deviceType);
    setDeviceTypeFormValues(deviceType);
    setDeviceTypeFormVisible(true);
  };
  const handleDeviceTypeSubmit = async () => {
    if (!deviceTypeFormValues) return;
    if (editingDeviceType) {
      const recordId = editingDeviceType.deviceTypeId;
      await performThunk(
        updateDeviceTypeRequest,
        { deviceTypeId: recordId, deviceType: deviceTypeFormValues },
        'Failed to update device type',
      );
    } else {
      await performThunk(
        createDeviceTypeRequest,
        deviceTypeFormValues,
        'Failed to create device type',
      );
    }
    setDeviceTypeFormVisible(false);
    setEditingDeviceType(null);
    setDeviceTypeFormValues(null);
  };
  const confirmDeleteDeviceType = (deviceType: ApiDeviceType) => {
    Alert.alert(
      'Delete device type',
      `Are you sure you want to delete "${deviceType.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await performThunk(
              deleteDeviceTypeRequest,
              { deviceTypeId: deviceType.deviceTypeId },
              'Failed to delete device type',
            );
          },
        },
      ],
      { cancelable: true },
    );
  };

  // Manufacturer handlers
  const openAddManufacturer = () => {
    setEditingManufacturer(null);
    setManufacturerFormValues(null);
    setManufacturerFormVisible(true);
  };
  const openEditManufacturer = (manufacturer: Manufacturer) => {
    setEditingManufacturer(manufacturer);
    setManufacturerFormValues(manufacturer);
    setManufacturerFormVisible(true);
  };
  const handleManufacturerSubmit = async () => {
    if (!manufacturerFormValues) return;
    if (editingManufacturer) {
      const recordId = editingManufacturer.manufacturerId;
      await performThunk(
        updateManufacturerRequest,
        { manufacturerId: recordId, manufacturer: manufacturerFormValues },
        'Failed to update manufacturer',
      );
    } else {
      await performThunk(
        createManufacturerRequest,
        manufacturerFormValues,
        'Failed to create manufacturer',
      );
    }
    setManufacturerFormVisible(false);
    setEditingManufacturer(null);
    setManufacturerFormValues(null);
  };
  const confirmDeleteManufacturer = (manufacturer: Manufacturer) => {
    Alert.alert(
      'Delete manufacturer',
      `Are you sure you want to delete "${manufacturer.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await performThunk(
              deleteManufacturerRequest,
              { manufacturerId: manufacturer.manufacturerId },
              'Failed to delete manufacturer',
            );
          },
        },
      ],
      { cancelable: true },
    );
  };

  const dealersBusy = dealersLoading;
  const deviceTypesBusy = deviceTypesLoading;
  const manufacturersBusy = manufacturersLoading;

  const filteredDealers = useMemo(
    () => (dealers ?? []).filter((d) => d.name.toLowerCase().includes(search.toLowerCase())),
    [dealers, search],
  );

  const filteredDeviceTypes = useMemo(
    () => (deviceTypes ?? []).filter((dt) => dt.name.toLowerCase().includes(search.toLowerCase())),
    [deviceTypes, search],
  );

  const filteredManufacturers = useMemo(
    () => (manufacturers ?? []).filter((m) => m.name.toLowerCase().includes(search.toLowerCase())),
    [manufacturers, search],
  );

  const renderItem = (props: {
    item: RecordItem;
    onEdit: (item: RecordItem) => void;
    onDelete: (item: RecordItem) => void;
    primaryText: string;
    secondaryText: string;
    testIDPrefix: string;
  }) => {
    const { item, onEdit, onDelete, primaryText, secondaryText, testIDPrefix } = props;
    const id =
      (item as ApiDealer).dealerId ||
      (item as ApiDeviceType).deviceTypeId ||
      (item as Manufacturer).manufacturerId;
    return (
      <View style={styles.dealerCard}>
        <Text style={styles.dealerName}>{primaryText}</Text>
        <Text style={styles.dealerInfo}>{secondaryText}</Text>
        <View style={styles.dealerActions}>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => onEdit(item)}
            testID={`edit-${testIDPrefix}-${id}`}
          >
            <MaterialIcons name="edit" size={20} color={COLORS.muted} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => onDelete(item)}
            testID={`delete-${testIDPrefix}-${id}`}
          >
            <MaterialIcons name="delete" size={20} color={COLORS.muted} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.container}>
        <Text style={styles.title}>Manage Records</Text>
        <Text style={styles.subtitle}>Manage foundational data for the application</Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsScrollContainer}
        >
          <View style={styles.tabsContainer}>
            {TAB_LABELS.map((label, idx) => (
              <TouchableOpacity
                key={label}
                style={[styles.tab, activeTab === idx && styles.activeTab]}
                onPress={() => {
                  setActiveTab(idx);
                  setSearch('');
                }}
                testID={`tab-${label.replace(' ', '-').toLowerCase()}`}
              >
                <Text style={[styles.tabText, activeTab === idx && styles.activeTabText]}>
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {activeTab === 0 && (
          <RecordManagementList
            data={filteredDealers}
            loading={dealersBusy}
            search={search}
            itemLabel="Dealers"
            onSearchChange={setSearch}
            onAdd={openAddDealer}
            renderItem={({ item }) =>
              renderItem({
                item,
                onEdit: (i) => openEditDealer(i as ApiDealer),
                onDelete: (i) => confirmDeleteDealer(i as ApiDealer),
                primaryText: (item as ApiDealer).name,
                secondaryText: `ID: ${(item as ApiDealer).dealerId} • ${(item as ApiDealer).activeDevices ?? 0}/${(item as ApiDealer).totalDevices ?? 0} Active`,
                testIDPrefix: 'dealer',
              })
            }
          />
        )}

        {activeTab === 1 && (
          <RecordManagementList
            data={filteredDeviceTypes}
            loading={deviceTypesBusy}
            search={search}
            itemLabel="Device Types"
            onSearchChange={setSearch}
            onAdd={openAddDeviceType}
            renderItem={({ item }) =>
              renderItem({
                item,
                onEdit: (i) => openEditDeviceType(i as ApiDeviceType),
                onDelete: (i) => confirmDeleteDeviceType(i as ApiDeviceType),
                primaryText: (item as ApiDeviceType).name,
                secondaryText: `ID: ${(item as ApiDeviceType).deviceTypeId} • ${(item as ApiDeviceType).modelNumber}`,
                testIDPrefix: 'device-type',
              })
            }
          />
        )}

        {activeTab === 2 && (
          <RecordManagementList
            data={filteredManufacturers}
            loading={manufacturersBusy}
            search={search}
            itemLabel="Manufacturers"
            onSearchChange={setSearch}
            onAdd={openAddManufacturer}
            renderItem={({ item }) =>
              renderItem({
                item,
                onEdit: (i) => openEditManufacturer(i as Manufacturer),
                onDelete: (i) => confirmDeleteManufacturer(i as Manufacturer),
                primaryText: (item as Manufacturer).name,
                secondaryText: `ID: ${(item as Manufacturer).manufacturerId}`,
                testIDPrefix: 'manufacturer',
              })
            }
          />
        )}
      </View>

      <GenericModal
        visible={dealerFormVisible}
        title={editingDealer ? 'Edit Dealer' : 'Add Dealer'}
        submitting={submitting}
        canSave={canSaveDealer}
        onCancel={() => {
          setDealerFormVisible(false);
          setEditingDealer(null);
        }}
        onSave={handleDealerSubmit}
      >
        {/* explicitly pass the setter which matches the generic T for this usage */}
        <FormContent<Record<string, unknown> | ApiDealer | null>
          initial={editingDealer}
          fields={dealerFormFields}
          onChange={setDealerFormValues}
        />
      </GenericModal>

      <GenericModal
        visible={deviceTypeFormVisible}
        title={editingDeviceType ? 'Edit Device Type' : 'Add Device Type'}
        submitting={submitting}
        canSave={canSaveDeviceType}
        onCancel={() => {
          setDeviceTypeFormVisible(false);
          setEditingDeviceType(null);
        }}
        onSave={handleDeviceTypeSubmit}
      >
        <FormContent<Record<string, unknown> | ApiDeviceType | null>
          initial={editingDeviceType}
          fields={deviceTypeFormFields}
          onChange={setDeviceTypeFormValues}
        />
      </GenericModal>

      <GenericModal
        visible={manufacturerFormVisible}
        title={editingManufacturer ? 'Edit Manufacturer' : 'Add Manufacturer'}
        submitting={submitting}
        canSave={canSaveManufacturer}
        onCancel={() => {
          setManufacturerFormVisible(false);
          setEditingManufacturer(null);
        }}
        onSave={handleManufacturerSubmit}
      >
        <FormContent<Record<string, unknown> | Manufacturer | null>
          initial={editingManufacturer}
          fields={manufacturerFormFields}
          onChange={setManufacturerFormValues}
        />
      </GenericModal>
    </ScrollView>
  );
};

const COLORS = {
  bg: '#10172A',
  panel: '#19213A',
  muted: '#A3A3A3',
  text: '#FFFFFF',
  primary: '#3B82F6',
  border: '#232B3E',
  modalBg: '#0F172A',
  modalBorder: '#23304D',
  danger: '#FF3B30',
  transparent: 'transparent',
};

const styles = StyleSheet.create({
  activeTab: {
    borderBottomColor: COLORS.primary,
  },
  activeTabText: {
    color: COLORS.text,
  },
  container: {
    backgroundColor: COLORS.bg,
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 32,
  },
  dealerActions: {
    flexDirection: 'row',
    marginLeft: 12,
  },
  dealerCard: {
    alignItems: 'center',
    backgroundColor: COLORS.panel,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    padding: 16,
  },
  dealerInfo: {
    color: COLORS.muted,
    flex: 1,
    fontSize: 13,
    marginLeft: 12,
  },
  dealerName: {
    color: COLORS.text,
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
  },
  iconBtn: {
    marginLeft: 8,
    padding: 4,
  },
  input: {
    backgroundColor: COLORS.panel,
    borderRadius: 8,
    color: COLORS.text,
    fontSize: 15,
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  label: {
    color: COLORS.muted,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  subtitle: {
    color: COLORS.muted,
    fontSize: 14,
    marginBottom: 18,
  },
  tab: {
    borderBottomColor: COLORS.transparent,
    borderBottomWidth: 2,
    marginRight: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  tabText: {
    color: COLORS.muted,
    fontSize: 15,
    fontWeight: '600',
  },
  tabsContainer: {
    borderBottomColor: COLORS.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    marginBottom: 16,
  },
  tabsScrollContainer: {
    alignItems: 'center',
    minHeight: 20,
    paddingRight: 8,
  },
  title: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
  },
});

export default RecordsScreen;
