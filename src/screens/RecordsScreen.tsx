import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ScrollView,
  Modal,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import {
  getAllDealers,
  createDealer,
  updateDealer,
  deleteDealer,
  type Dealer as ApiDealer,
  type DealerCreateRequest,
  type DealerUpdateRequest,
} from '../api/dealerApi';
import * as SecureStore from 'expo-secure-store';

import {
  getAllDeviceTypes,
  createDeviceType,
  updateDeviceType,
  deleteDeviceType,
  type DeviceType as ApiDeviceType,
  type DeviceTypeRequestPayload,
} from '../api/deviceTypeApi';

import {
  Manufacturer,
  getAllManufacturers,
  // TODO: Add create, update, and delete manufacturer functions
} from '../api/manufacturerApi';

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
  // Updated type to accept null
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

// Define field configurations for each form type
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
  const [activeTab, setActiveTab] = useState(0);
  const [authToken, setAuthToken] = useState<string>('');

  // States for all record types
  const [dealers, setDealers] = useState<ApiDealer[]>([]);
  const [deviceTypes, setDeviceTypes] = useState<ApiDeviceType[]>([]);
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);

  // General states
  const [loading, setLoading] = useState(false);
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

  // Define canSave variables using useMemo
  const canSaveDealer = useMemo(() => {
    return !!dealerFormValues?.name;
  }, [dealerFormValues]);

  const canSaveDeviceType = useMemo(() => {
    return !!deviceTypeFormValues?.name && !!deviceTypeFormValues?.modelNumber;
  }, [deviceTypeFormValues]);

  const canSaveManufacturer = useMemo(() => {
    return !!manufacturerFormValues?.name;
  }, [manufacturerFormValues]);

  useEffect(() => {
    (async () => {
      try {
        const t = (await SecureStore.getItemAsync('accessToken')) || '';
        if (!t) console.warn('No access token found. Please log in.');
        setAuthToken(t);
      } catch (err) {
        console.error('Failed to retrieve access token:', err);
      }
    })();
  }, []);

  const loadData = async (tabIndex: number) => {
    try {
      setLoading(true);
      if (!authToken) throw new Error('Missing auth token');

      switch (tabIndex) {
        case 0:
          const dealersData = await getAllDealers(authToken);
          setDealers(dealersData);
          break;
        case 1:
          const deviceTypesData = await getAllDeviceTypes(authToken);
          setDeviceTypes(deviceTypesData);
          break;
        case 2:
          const manufacturersData = await getAllManufacturers(authToken);
          setManufacturers(manufacturersData);
          break;
        default:
          console.error('Invalid tab index:', tabIndex);
          break;
      }
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? `Failed to load data`);
    } finally {
      setLoading(false);
    }
  };

  // Load data based on active tab and auth token
  useEffect(() => {
    if (authToken) {
      loadData(activeTab);
    }
  }, [activeTab, authToken]);

  const handleRecordSubmit = async (
    recordType: 'dealer' | 'device type' | 'manufacturer',
    formValues: any,
    editingRecord: any,
    createFn: (token: string, data: any) => Promise<any>,
    updateFn: (token: string, id: number, data: any) => Promise<any>,
    recordIdKey: string,
    setModalVisible: React.Dispatch<React.SetStateAction<boolean>>,
    setEditingRecord: React.Dispatch<React.SetStateAction<any>>,
    tabIndex: number,
  ) => {
    try {
      if (!formValues) return;
      setSubmitting(true);
      if (!authToken) throw new Error('Missing auth token');

      if (editingRecord) {
        const recordId = editingRecord[recordIdKey];
        await updateFn(authToken, recordId, formValues);
      } else {
        await createFn(authToken, formValues);
      }

      setModalVisible(false);
      setEditingRecord(null);
      await loadData(tabIndex);
    } catch (e: any) {
      Alert.alert(
        'Error',
        e?.message ??
          (editingRecord ? `Failed to update ${recordType}` : `Failed to create ${recordType}`),
      );
    } finally {
      setSubmitting(false);
    }
  };

  // NEW GENERIC DELETE FUNCTION
  const confirmDeleteRecord = (
    item: RecordItem,
    recordType: string,
    recordIdKey: string,
    deleteFn: (token: string, id: number) => Promise<void>,
    tabIndex: number,
  ) => {
    Alert.alert(
      `Delete ${recordType}`,
      `Are you sure you want to delete "${item.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setSubmitting(true);
              if (!authToken) throw new Error('Missing auth token');
              // Use bracket notation to access the dynamic key
              const recordId = (item as any)[recordIdKey];
              await deleteFn(authToken, recordId);
              await loadData(tabIndex); // Reload data after deletion
              console.log(`Deleted ${recordType}:`, item.name);
            } catch (e: any) {
              Alert.alert('Error', e?.message ?? `Failed to delete ${recordType}`);
            } finally {
              setSubmitting(false);
            }
          },
        },
      ],
      { cancelable: true },
    );
  };

  // Handlers for Dealers
  const openAddDealer = () => {
    setEditingDealer(null);
    setDealerFormVisible(true);
  };

  const openEditDealer = (dealer: ApiDealer) => {
    setEditingDealer(dealer);
    setDealerFormVisible(true);
  };

  const handleDealerSubmit = () => {
    handleRecordSubmit(
      'dealer',
      dealerFormValues,
      editingDealer,
      createDealer,
      updateDealer,
      'dealerId',
      setDealerFormVisible,
      setEditingDealer,
      0,
    );
  };

  // Handlers for Device Types
  const openAddDeviceType = () => {
    setEditingDeviceType(null);
    setDeviceTypeFormVisible(true);
  };

  const openEditDeviceType = (deviceType: ApiDeviceType) => {
    setEditingDeviceType(deviceType);
    setDeviceTypeFormVisible(true);
  };

  const handleDeviceTypeSubmit = () => {
    handleRecordSubmit(
      'device type',
      deviceTypeFormValues,
      editingDeviceType,
      createDeviceType,
      updateDeviceType,
      'deviceTypeId',
      setDeviceTypeFormVisible,
      setEditingDeviceType,
      1,
    );
  };

  // Handlers for Manufacturers - TO BE IMPLEMENTED
  const openAddManufacturer = () => {
    setEditingManufacturer(null);
    setManufacturerFormVisible(true);
  };

  const openEditManufacturer = (manufacturer: Manufacturer) => {
    setEditingManufacturer(manufacturer);
    setManufacturerFormVisible(true);
  };

  const confirmDeleteManufacturer = (manufacturer: Manufacturer) => {
    // TODO: Implement manufacturer delete function
  };

  // Memoized filtered lists
  const filteredDealers = useMemo(
    () => dealers.filter((d) => d.name.toLowerCase().includes(search.toLowerCase())),
    [dealers, search],
  );

  const filteredDeviceTypes = useMemo(
    () => deviceTypes.filter((dt) => dt.name.toLowerCase().includes(search.toLowerCase())),
    [deviceTypes, search],
  );

  const filteredManufacturers = useMemo(
    () => manufacturers.filter((m) => m.name.toLowerCase().includes(search.toLowerCase())),
    [manufacturers, search],
  );

  // Generic render item function
  const renderItem = ({
    item,
    onEdit,
    onDelete,
    primaryText,
    secondaryText,
    testIDPrefix,
  }: {
    item: RecordItem;
    onEdit: (item: RecordItem) => void;
    onDelete: (item: RecordItem) => void;
    primaryText: string;
    secondaryText: string;
    testIDPrefix: string;
  }) => (
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

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
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
            loading={loading}
            search={search}
            itemLabel="Dealers"
            onSearchChange={setSearch}
            onAdd={openAddDealer}
            renderItem={({ item }) =>
              renderItem({
                item,
                onEdit: (item) => openEditDealer(item as ApiDealer),
                onDelete: (item) =>
                  confirmDeleteRecord(item, 'dealer', 'dealerId', deleteDealer, 0),
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
            loading={loading}
            search={search}
            itemLabel="Device Types"
            onSearchChange={setSearch}
            onAdd={openAddDeviceType}
            renderItem={({ item }) =>
              renderItem({
                item,
                onEdit: (item) => openEditDeviceType(item as ApiDeviceType),
                onDelete: (item) =>
                  confirmDeleteRecord(item, 'device type', 'deviceTypeId', deleteDeviceType, 1),
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
            loading={loading}
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
        onSave={() => {
          // TODO: Implement manufacturer submit handler
        }}
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
  container: {
    flex: 1,
    backgroundColor: '#10172A',
    paddingHorizontal: 20,
    paddingTop: 32,
  },
  scrollContent: {
    paddingBottom: 100, // Increased from 32 to 100
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
  },
  subtitle: {
    color: '#A3A3A3',
    fontSize: 14,
    marginBottom: 18,
  },
  tabsScrollContainer: {
    minHeight: 20,
    alignItems: 'center',
    paddingRight: 8,
  },
  tabsContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#232B3E',
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#3B82F6',
  },
  tabText: {
    color: '#A3A3A3',
    fontWeight: '600',
    fontSize: 15,
  },
  activeTabText: {
    color: '#FFF',
  },
  dealerCard: {
    backgroundColor: '#19213A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dealerName: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
    flex: 1,
  },
  dealerInfo: {
    color: '#A3A3A3',
    fontSize: 13,
    marginLeft: 12,
    flex: 1,
  },
  dealerActions: {
    flexDirection: 'row',
    marginLeft: 12,
  },
  iconBtn: {
    marginLeft: 8,
    padding: 4,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#23304D',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 18,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginLeft: 12,
  },
  cancelButton: {
    backgroundColor: '#23304D',
  },
  saveButton: {
    backgroundColor: '#3B82F6',
  },
  buttonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  input: {
    backgroundColor: '#19213A',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#FFF',
    marginBottom: 12,
    fontSize: 15,
  },
  label: {
    color: '#A3A3A3',
    marginBottom: 4,
    fontSize: 14,
    fontWeight: '600',
  },
  listContainer: {
    flex: 1,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#19213A',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    height: 40,
    color: '#FFF',
    marginLeft: 8,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  addButtonText: {
    color: '#FFF',
    marginLeft: 4,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  loadingText: {
    color: '#A3A3A3',
    marginTop: 8,
  },
  placeholderText: {
    color: '#A3A3A3',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 32,
  },
  listContent: {
    paddingBottom: 20,
  },
});

export default RecordsScreen;
