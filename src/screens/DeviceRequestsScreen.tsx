import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import DropDownPicker from 'react-native-dropdown-picker';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, spacing, fontSizes, borderRadius, fontWeights } from '../styles/theme';
import { cardStyles, textStyles, buttonStyles } from '../styles/commonStyles';

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
            <MaterialIcons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={textStyles.heading}>Device Requests</Text>
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
                marginLeft: spacing.md,
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
          <Text style={textStyles.subtitle}>{pendingCount} Pending Requests</Text>
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
                  placeholderStyle={styles.dealerPickerPlaceholder}
                  textStyle={styles.dealerPickerText}
                  listItemLabelStyle={styles.dealerPickerText}
                  placeholder="-- Select Dealer --"
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.lg },
  backBtn: { marginRight: spacing.md },
  filters: {
    flexDirection: 'row',
    marginBottom: spacing.md,
    zIndex: 3000,
    paddingHorizontal: spacing.sm,
  },
  pickerWrapper: {
    flex: 1,
    minWidth: 120,
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    zIndex: 3000,
    position: 'relative',
  },
  picker: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    color: colors.text,
    paddingHorizontal: spacing.md,
    fontSize: fontSizes.medium,
    minHeight: 44,
  },
  pickerDropdown: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    minWidth: 150,
    zIndex: 3000,
    position: 'absolute',
  },
  pickerPlaceholder: {
    color: colors.text,
    fontSize: fontSizes.medium,
  },
  pickerText: {
    color: colors.text,
    fontSize: fontSizes.medium,
  },
  pickerArrow: {
    tintColor: colors.text,
  },
  countBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
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
    color: colors.text, // Ensures input text is white
    paddingHorizontal: spacing.md,
    fontSize: fontSizes.medium,
    minHeight: 44,
  },
  dealerPickerDropdown: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    minWidth: 150,
    zIndex: 3000,
    position: 'absolute',
  },
  dealerPickerPlaceholder: {
    color: colors.text,
    fontSize: fontSizes.medium,
  },
  dealerPickerText: {
    color: colors.text,
    fontSize: fontSizes.medium,
  },
});

export default DeviceRequestsScreen;