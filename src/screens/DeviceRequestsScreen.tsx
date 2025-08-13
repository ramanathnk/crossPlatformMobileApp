import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import DropDownPicker from 'react-native-dropdown-picker';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
type RootStackParamList = {
  MainTabs: undefined;
};

type NavProp = StackNavigationProp<RootStackParamList, 'MainTabs'>;

interface Request {
  id: string;
  serial: string;
  type: string;
  os: string;
  build: string;
  date: string;
  notes: string;
  status: 'Pending' | 'Approved' | 'Denied';
}

const MOCK_REQUESTS: Request[] = [
  {
    id: '1',
    serial: 'ST-78901',
    type: 'ST-Pro 2023',
    os: 'v4.2.1',
    build: '2023.05.1',
    date: 'May 15, 2023',
    notes: 'New device for TechSolutions Inc.',
    status: 'Pending',
  },
  {
    id: '2',
    serial: 'ST-78845',
    type: 'ST-Mini 2023',
    os: 'v4.1.8',
    build: '2023.03.2',
    date: 'May 14, 2023',
    notes: 'For Global Trackers LLC',
    status: 'Pending',
  },
  // Add more mock requests as needed
];

const DeviceRequestsScreen: React.FC = () => {
  const navigation = useNavigation<NavProp>();
  const [requests] = useState<Request[]>(MOCK_REQUESTS);

  // Status filter
  const [statusFilterOpen, setStatusFilterOpen] = useState(false);
  const [statusFilterValue, setStatusFilterValue] = useState<string>('All');
  const [statusFilterItems, setStatusFilterItems] = useState([
    { label: 'All Status', value: 'All' },
    { label: 'Pending', value: 'Pending' },
    { label: 'Approved', value: 'Approved' },
    { label: 'Denied', value: 'Denied' },
  ]);

  // Type filter
  const [typeFilterOpen, setTypeFilterOpen] = useState(false);
  const [typeFilterValue, setTypeFilterValue] = useState<string>('All');
  const [typeFilterItems, setTypeFilterItems] = useState([
    { label: 'All Device Types', value: 'All' },
    { label: 'ST-Pro 2023', value: 'ST-Pro 2023' },
    { label: 'ST-Mini 2023', value: 'ST-Mini 2023' },
  ]);

  // Dealer selector (per card, so use local state for demo)
  const [dealerOpen, setDealerOpen] = useState(false);
  const [dealerValue, setDealerValue] = useState<string>('');
  const [dealerItems, setDealerItems] = useState([
    { label: '-- Select Dealer --', value: '' },
    { label: 'TechSolutions Inc.', value: 'TechSolutions Inc.' },
    { label: 'Global Trackers LLC', value: 'Global Trackers LLC' },
  ]);

  const filteredRequests = requests.filter(r =>
    (statusFilterValue === 'All' || r.status === statusFilterValue) &&
    (typeFilterValue === 'All' || r.type === typeFilterValue)
  );
  const pendingCount = filteredRequests.filter(r => r.status === 'Pending').length;

  const onRefresh = () => {
    // TODO: fetch fresh data
    console.log('refreshing…');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ flex: 1 }}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
          >
            <MaterialIcons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.title}>Device Requests</Text>
        </View>

        {/* Filters */}
        <View style={styles.filters}>
          <View
            style={[
              styles.pickerWrapper,
              {
                zIndex: statusFilterOpen ? 3000 : 2000,
                elevation: statusFilterOpen ? 10 : 1,
                position: 'relative',
              },
            ]}
          >
            <DropDownPicker<string>
              open={statusFilterOpen}
              value={statusFilterValue}
              items={statusFilterItems}
              setOpen={setStatusFilterOpen}
              setValue={setStatusFilterValue}
              setItems={setStatusFilterItems}
              style={styles.picker}
              dropDownContainerStyle={styles.pickerDropdown}
              placeholder="All Status"
              placeholderStyle={styles.pickerPlaceholder}
              textStyle={styles.pickerText}
              listItemLabelStyle={styles.pickerText}
              //arrowIconStyle={styles.pickerArrow}
              onOpen={() => {
                setStatusFilterOpen(true);
              }}
              onClose={() => setStatusFilterOpen(false)}
              zIndex={3000}
              zIndexInverse={2000}
            />
          </View>
          <View
            style={[
              styles.pickerWrapper,
              {
                marginLeft: 12,
                zIndex: typeFilterOpen ? 3000 : 1000,
                elevation: typeFilterOpen ? 10 : 1,
                position: 'relative',
              },
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
              placeholder="All Device Types"
              placeholderStyle={styles.pickerPlaceholder}
              textStyle={styles.pickerText}
              listItemLabelStyle={styles.pickerText}
              //arrowIconStyle={styles.pickerArrow}
              onOpen={() => {
                setTypeFilterOpen(true);
              }}
              onClose={() => setTypeFilterOpen(false)}
              zIndex={3000}
              zIndexInverse={1000}
            />
          </View>
        </View>

        {/* Pending count & refresh */}
        <View style={styles.countBar}>
          <Text style={styles.countText}>{pendingCount} Pending Requests</Text>
          <TouchableOpacity onPress={onRefresh}>
            <Text style={styles.refreshText}>Refresh</Text>
          </TouchableOpacity>
        </View>

        {/* Requests List */}
        <FlatList
          data={filteredRequests}
          keyExtractor={r => r.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardTop}>
                <MaterialIcons name="schedule" size={20} color="#FBBF24" />
                <Text style={styles.serial}>{item.serial}</Text>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{item.status}</Text>
                </View>
              </View>
              <Text style={styles.detail}>Device Type: {item.type}</Text>
              <Text style={styles.detail}>OS Version: {item.os}</Text>
              <Text style={styles.detail}>Build: {item.build}</Text>
              <Text style={styles.detail}>Request Date: {item.date}</Text>
              <Text style={styles.detail}>Notes: {item.notes}</Text>

              <Text style={styles.selectLabel}>Select Dealer</Text>
              <View style={[styles.pickerWrapper, { zIndex: 1000 }]}>
                <DropDownPicker<string>
                  open={dealerOpen}
                  value={dealerValue}
                  items={dealerItems}
                  setOpen={setDealerOpen}
                  setValue={setDealerValue}
                  setItems={setDealerItems}
                  style={styles.picker}
                  dropDownContainerStyle={styles.pickerDropdown}
                  //arrowIconStyle={styles.pickerArrow}
                />
              </View>

              <View style={styles.actions}>
                <TouchableOpacity style={[styles.actionBtn, styles.deny]}>
                  <Text style={styles.actionTextDeny}>Deny</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionBtn, styles.approve]}>
                  <Text style={styles.actionTextApprove}>Approve</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      </View>
    </SafeAreaView>
  );
};

export default DeviceRequestsScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1F2937' },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  backBtn: { marginRight: 12 },
  title: { fontSize: 20, fontWeight: '600', color: '#FFF' },
  filters: {
    flexDirection: 'row',
    marginBottom: 16,
    zIndex: 3000, // Ensure filters are above cards
  },
  pickerWrapper: {
    flex: 1,
    minWidth: 150,
    backgroundColor: '#374151',
    borderRadius: 8,
    zIndex: 3000, // Highest zIndex for dropdown
    position: 'relative',
  },
  picker: {
    backgroundColor: '#374151',
    borderColor: '#4B5563',
    color: '#FFF',
    paddingHorizontal: 12,
    fontSize: 16,
    minHeight: 44,
  },
  pickerDropdown: {
    backgroundColor: '#374151',
    borderColor: '#4B5563',
    minWidth: 150,
    zIndex: 3000,
    position: 'absolute',
  },
  pickerPlaceholder: {
    color: '#FFF',
    fontSize: 16,
  },
  pickerText: {
    color: '#FFF',
    fontSize: 16,
  },
  pickerArrow: {
    tintColor: '#FFF',
  },
  countBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  countText: { color: '#9CA3AF', fontSize: 14 },
  refreshText: { color: '#3B82F6', fontSize: 14 },
  card: {
    backgroundColor: '#374151',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    zIndex: 1, // Cards should be below dropdowns
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  serial: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
    flex: 1,
  },
  badge: {
    backgroundColor: '#FBBF24',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgeText: { color: '#1F2937', fontWeight: '600' },
  detail: {
    color: '#D1D5DB',
    fontSize: 14,
    marginBottom: 4,
  },
  selectLabel: {
    color: '#9CA3AF',
    marginTop: 12,
    marginBottom: 4,
    fontSize: 14,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
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
});