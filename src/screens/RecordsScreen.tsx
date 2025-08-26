import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  RefreshControl,
  FlatList,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import type {
  Dealer as ApiDealer,
  DealerCreateRequest,
  DealerUpdateRequest,
} from '../api/dealerApi';
import type { DeviceType as ApiDeviceType, DeviceTypeRequestPayload } from '../api/deviceTypeApi';
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
  selectDealersError,
} from '../store/dealerSlice';

import {
  fetchDeviceTypes,
  createDeviceTypeRequest,
  updateDeviceTypeRequest,
  deleteDeviceTypeRequest,
  selectDeviceTypes,
  selectDeviceTypesLoading,
  selectDeviceTypesError,
} from '../store/deviceTypeSlice';

// Manufacturer slice imports (use Redux thunks/selectors instead of React Query)
import {
  fetchManufacturers,
  createManufacturerRequest,
  updateManufacturerRequest,
  deleteManufacturerRequest,
  selectManufacturers,
  selectManufacturersLoading,
  selectManufacturersError,
} from '../store/manufacturerSliceMock';

import RecordManagementList from '../components/RecordManagementList';
import GenericModal from '../components/GenericModal';

type DealerFormValues = DealerCreateRequest;
interface DeviceTypeFormValues {
  name: string;
  manufacturerId: number;
  modelNumber: string;
}

// Define a union type for all possible record items
type RecordItem = ApiDealer | ApiDeviceType | Manufacturer;

const TAB_LABELS = ['Dealers', 'Device Types', 'Manufacturers'];

// Define a common interface for form field configuration
interface FormField {
  label: string;
  placeholder: string;
  key: string;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad' | 'url';
}

const FormContent = ({
  initial,
  fields,
  onChange,
}: {
  initial?: { [key: string]: any } | null;
  fields: FormField[];
  onChange: (values: { [key: string]: any }) => void;
}) => {
  const [formValues, setFormValues] = useState(initial ?? {});

  useEffect(() => {
    setFormValues(initial ?? {});
  }, [initial]);

  useEffect(() => {
    onChange(formValues);
  }, [formValues, onChange]);

  const handleChange = (key: string, value: string) => {
    setFormValues((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <>
      {fields.map((field) => (
        <View key={field.key}>
          {field.label && <Text style={styles.label}>{field.label}</Text>}
          <TextInput
            style={styles.input}
            placeholder={field.placeholder}
            placeholderTextColor="#A3A3A3"
            value={formValues[field.key] ? String(formValues[field.key]) : ''}
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

  // General states
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  const [dealerFormVisible, setDealerFormVisible] = useState(false);
  const [deviceTypeFormVisible, setDeviceTypeFormVisible] = useState(false);
  const [manufacturerFormVisible, setManufacturerFormVisible] = useState(false);
  const [editingDealer, setEditingDealer] = useState<ApiDealer | null>(null);
  const [editingDeviceType, setEditingDeviceType] = useState<ApiDeviceType | null>(null);
  const [editingManufacturer, setEditingManufacturer] = useState<Manufacturer | null>(null);
  const [dealerFormValues, setDealerFormValues] = useState<any | null>(null);
  const [deviceTypeFormValues, setDeviceTypeFormValues] = useState<any | null>(null);
  const [manufacturerFormValues, setManufacturerFormValues] = useState<any | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Redux selectors for dealers/device types/manufacturers
  const dealers = useSelector((s: RootState) => selectDealers(s));
  const dealersLoading = useSelector((s: RootState) => selectDealersLoading(s));
  const dealersError = useSelector((s: RootState) => selectDealersError(s));

  const deviceTypes = useSelector((s: RootState) => selectDeviceTypes(s));
  const deviceTypesLoading = useSelector((s: RootState) => selectDeviceTypesLoading(s));
  const deviceTypesError = useSelector((s: RootState) => selectDeviceTypesError(s));

  const manufacturers = useSelector((s: RootState) => selectManufacturers(s));
  const manufacturersLoading = useSelector((s: RootState) => selectManufacturersLoading(s));
  const manufacturersError = useSelector((s: RootState) => selectManufacturersError(s));

  // Derived canSave flags
  const canSaveDealer = !!dealerFormValues?.name;
  const canSaveDeviceType = !!deviceTypeFormValues?.name && !!deviceTypeFormValues?.modelNumber;
  const canSaveManufacturer = !!manufacturerFormValues?.name;

  // Fetch lists on mount
  useEffect(() => {
    dispatch(fetchDealers());
    dispatch(fetchDeviceTypes());
    dispatch(fetchManufacturers());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  // Helper to run thunks with unified UI state + error handling
  const performThunk = async (thunkAction: any, arg: any, errorTitle = 'Error') => {
    try {
      setSubmitting(true);
      // dispatch(...).unwrap() to throw on rejection
      await dispatch(thunkAction(arg)).unwrap();
      return true;
    } catch (e: any) {
      let message = 'Operation failed';
      if (typeof e === 'string') {
        message = e;
      } else if (e && typeof e === 'object') {
        message =
          e.message ||
          e.payload ||
          e?.response?.data?.message ||
          e?.response?.data?.error ||
          JSON.stringify(e);
      }
      Alert.alert(errorTitle, message);
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  // Pull-to-refresh: trigger refetch for the active tab
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      if (activeTab === 0) {
        await dispatch(fetchDealers()).unwrap();
      } else if (activeTab === 1) {
        await dispatch(fetchDeviceTypes()).unwrap();
      } else if (activeTab === 2) {
        await dispatch(fetchManufacturers()).unwrap();
      }
    } catch (e) {
      // errors handled by slice; no-op here
    } finally {
      setRefreshing(false);
    }
  };

  // Handlers for Dealers
  const openAddDealer = () => {
    setEditingDealer(null);
    setDealerFormValues(null);
    setDealerFormVisible(true);
  };

  const openEditDealer = (dealer: ApiDealer) => {
    setEditingDealer(dealer);
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

  // Handlers for Device Types
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

  // Handlers for Manufacturers (now using Redux slice thunks)
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

  // Per-tab loading flags
  const dealersBusy = dealersLoading;
  const deviceTypesBusy = deviceTypesLoading;
  const manufacturersBusy = manufacturersLoading;

  // Filtered lists
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

  // Generic render item function
  const renderItem = (props: {
    item: RecordItem;
    onEdit: (item: RecordItem) => void;
    onDelete: (item: RecordItem) => void;
    primaryText: string;
    secondaryText: string;
    testIDPrefix: string;
  }) => {
    const { item, onEdit, onDelete, primaryText, secondaryText, testIDPrefix } = props;
    return (
      <View style={styles.dealerCard}>
        <Text style={styles.dealerName}>{primaryText}</Text>
        <Text style={styles.dealerInfo}>{secondaryText}</Text>
        <View style={styles.dealerActions}>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => onEdit(item)}
            testID={`edit-${testIDPrefix}-${
              (item as ApiDealer).dealerId ||
              (item as ApiDeviceType).deviceTypeId ||
              (item as Manufacturer).manufacturerId
            }`}
          >
            <MaterialIcons name="edit" size={20} color="#A3A3A3" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => onDelete(item)}
            testID={`delete-${testIDPrefix}-${
              (item as ApiDealer).dealerId ||
              (item as ApiDeviceType).deviceTypeId ||
              (item as Manufacturer).manufacturerId
            }`}
          >
            <MaterialIcons name="delete" size={20} color="#A3A3A3" />
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

        {/* Tabs */}
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

        {/* Dealers Tab */}
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
                onEdit: (item) => openEditDealer(item as ApiDealer),
                onDelete: (item) => confirmDeleteDealer(item as ApiDealer),
                primaryText: item.name,
                secondaryText: `ID: ${(item as ApiDealer).dealerId} • ${
                  (item as ApiDealer).activeDevices ?? 0
                }/${(item as ApiDealer).totalDevices ?? 0} Active`,
                testIDPrefix: 'dealer',
              })
            }
          />
        )}

        {/* Device Types Tab */}
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
                onEdit: (item) => openEditDeviceType(item as ApiDeviceType),
                onDelete: (item) => confirmDeleteDeviceType(item as ApiDeviceType),
                primaryText: (item as ApiDeviceType).name,
                secondaryText: `ID: ${(item as ApiDeviceType).deviceTypeId} • ${(item as ApiDeviceType).modelNumber}`,
                testIDPrefix: 'device-type',
              })
            }
          />
        )}

        {/* Manufacturers Tab */}
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
                onEdit: (item) => openEditManufacturer(item as Manufacturer),
                onDelete: (item) => confirmDeleteManufacturer(item as Manufacturer),
                primaryText: (item as Manufacturer).name,
                secondaryText: `ID: ${(item as Manufacturer).manufacturerId}`,
                testIDPrefix: 'manufacturer',
              })
            }
          />
        )}
      </View>

      {/* Generic Modal for Dealers */}
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
        <FormContent
          initial={editingDealer}
          fields={dealerFormFields}
          onChange={setDealerFormValues}
        />
      </GenericModal>

      {/* Generic Modal for Device Types */}
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
        <FormContent
          initial={editingDeviceType}
          fields={deviceTypeFormFields}
          onChange={setDeviceTypeFormValues}
        />
      </GenericModal>

      {/* Generic Modal for Manufacturers */}
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
        <FormContent
          initial={editingManufacturer}
          fields={manufacturerFormFields}
          onChange={setManufacturerFormValues}
        />
      </GenericModal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  activeTab: {
    borderBottomColor: '#3B82F6',
  },
  activeTabText: {
    color: '#FFF',
  },
  addButton: {
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  addButtonText: {
    color: '#FFF',
    fontWeight: '600',
    marginLeft: 4,
  },
  button: {
    borderRadius: 8,
    marginLeft: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#23304D',
  },
  container: {
    backgroundColor: '#10172A',
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
    backgroundColor: '#19213A',
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    padding: 16,
  },
  dealerInfo: {
    color: '#A3A3A3',
    flex: 1,
    fontSize: 13,
    marginLeft: 12,
  },
  dealerName: {
    color: '#FFF',
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
  },
  iconBtn: {
    marginLeft: 8,
    padding: 4,
  },
  input: {
    backgroundColor: '#19213A',
    borderRadius: 8,
    color: '#FFF',
    fontSize: 15,
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  label: {
    color: '#A3A3A3',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 20,
  },
  loadingContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    marginTop: 50,
  },
  loadingText: {
    color: '#A3A3A3',
    marginTop: 8,
  },
  modalBackdrop: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#0F172A',
    borderColor: '#23304D',
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
  },
  modalHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  modalTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  placeholderText: {
    color: '#A3A3A3',
    fontSize: 16,
    marginTop: 32,
    textAlign: 'center',
  },
  saveButton: {
    backgroundColor: '#3B82F6',
  },
  scrollContent: {
    paddingBottom: 100, // Increased from 32 to 100
  },
  searchBar: {
    alignItems: 'center',
    backgroundColor: '#19213A',
    borderRadius: 8,
    flexDirection: 'row',
    marginBottom: 16,
    paddingHorizontal: 12,
  },
  searchInput: {
    color: '#FFF',
    flex: 1,
    height: 40,
    marginLeft: 8,
  },
  subtitle: {
    color: '#A3A3A3',
    fontSize: 14,
    marginBottom: 18,
  },
  tab: {
    borderBottomColor: 'transparent',
    borderBottomWidth: 2,
    marginRight: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  tabText: {
    color: '#A3A3A3',
    fontSize: 15,
    fontWeight: '600',
  },
  tabsContainer: {
    borderBottomColor: '#232B3E',
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
    color: '#FFF',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
  },
});

export default RecordsScreen;
